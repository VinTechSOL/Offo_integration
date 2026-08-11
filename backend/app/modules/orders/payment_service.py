from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.modules.orders.models import Order
from app.modules.orders.constants import PaymentStatus
from app.modules.orders.repository import OrderRepository
from app.modules.orders.payment_events import PaymentEventType

from app.modules.notifications.service import NotificationService
from app.modules.notifications.constants import (
    NotificationEvent,
    NotificationRecipient,
    NotificationPriority,
)

from app.core.time_utils import now_utc


class OrderPaymentService:

    # ============================================================
    # PAYMENT STATUS
    # ============================================================

    @staticmethod
    def sync_payment_status(
        db: Session,
        order_id: int,
        payment_status: PaymentStatus,
        provider_reference: str | None = None,
        provider_transaction_id: str | None = None,
        commit: bool = True,
    ):
        """
        Synchronize the Order payment status.

        This is the authoritative business layer for:

            Order.payment_status

        It also records the corresponding PaymentEvent.

        commit=True:
            Used when this method is called as a standalone operation.

        commit=False:
            Used when the caller is already inside a larger transaction.
        """

        order = db.get(Order, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found",
            )

        current = PaymentStatus(order.payment_status)

        # --------------------------------------------------------
        # IDEMPOTENCY
        # --------------------------------------------------------

        if current == payment_status:
            return {
                "order_id": order.order_id,
                "payment_status": current,
                "changed": False,
            }

        # ========================================================
        # PAYMENT SUCCESS
        # ========================================================

        if payment_status == PaymentStatus.PAID:

            if current in (
                PaymentStatus.REFUND_PENDING,
                PaymentStatus.REFUNDED,
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Refunded order cannot become PAID",
                )

            previous_status = current

            order.payment_status = PaymentStatus.PAID
            order.updated_at = now_utc()

            OrderRepository.add_payment_event(
                db,
                order_id=order.order_id,
                event_type=PaymentEventType.PAYMENT_SUCCESS,
                payment_status=PaymentStatus.PAID,
                amount=order.total_amount,
                provider_reference=provider_reference,
                provider_transaction_id=provider_transaction_id,
            )

            if commit:
                db.commit()
                db.refresh(order)

                # ------------------------------------------------
                # Vendor notification ONLY after successful payment
                # ------------------------------------------------

                NotificationService.trigger(
                    db=db,
                    event=NotificationEvent.ORDER_PLACED,
                    recipient_type=NotificationRecipient.STAFF,
                    recipient_id=order.branch_id,
                    title="New Order Placed",
                    message=(
                        f"Order "
                        f"{OrderRepository.build_display_order_id(order)} "
                        f"received"
                    ),
                    priority=NotificationPriority.MEDIUM,
                    order_id=order.order_id,
                )

                # NotificationService may create DB records.
                db.commit()

            return {
                "order_id": order.order_id,
                "payment_status": PaymentStatus.PAID,
                "previous_status": previous_status,
                "changed": True,
            }

        # ========================================================
        # PAYMENT FAILED
        # ========================================================

        if payment_status == PaymentStatus.FAILED:

            if current == PaymentStatus.PAID:
                raise HTTPException(
                    status_code=400,
                    detail="Paid order cannot become FAILED",
                )

            if current in (
                PaymentStatus.REFUND_PENDING,
                PaymentStatus.REFUNDED,
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Order is in refund state",
                )

            order.payment_status = PaymentStatus.FAILED
            order.updated_at = now_utc()

            OrderRepository.add_payment_event(
                db,
                order_id=order.order_id,
                event_type=PaymentEventType.PAYMENT_FAILED,
                payment_status=PaymentStatus.FAILED,
                amount=order.total_amount,
                provider_reference=provider_reference,
                provider_transaction_id=provider_transaction_id,
            )

            if commit:
                db.commit()
                db.refresh(order)

            return {
                "order_id": order.order_id,
                "payment_status": PaymentStatus.FAILED,
                "changed": True,
            }

        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported payment transition: "
                f"{current} → {payment_status}"
            ),
        )

    # ============================================================
    # REFUND PENDING
    # ============================================================

    @staticmethod
    def mark_refund_pending_in_transaction(
        db: Session,
        order: Order,
    ):
        """
        Mark a paid order as REFUND_PENDING.

        IMPORTANT:
        This method NEVER commits.

        It is intended for callers such as:

            - order rejection
            - automatic order cancellation
            - other multi-step transactions
        """

        current = PaymentStatus(order.payment_status)

        # --------------------------------------------------------
        # Already pending
        # --------------------------------------------------------

        if current == PaymentStatus.REFUND_PENDING:
            return False

        # --------------------------------------------------------
        # Already refunded
        # --------------------------------------------------------

        if current == PaymentStatus.REFUNDED:
            return False

        # --------------------------------------------------------
        # Only PAID orders can enter refund flow
        # --------------------------------------------------------

        if current != PaymentStatus.PAID:
            return False

        order.payment_status = PaymentStatus.REFUND_PENDING
        order.updated_at = now_utc()

        OrderRepository.add_payment_event(
            db,
            order_id=order.order_id,
            event_type=PaymentEventType.REFUND_REQUESTED,
            payment_status=PaymentStatus.REFUND_PENDING,
            amount=order.total_amount,
        )

        return True

    # ============================================================
    # REFUND PENDING - STANDALONE
    # ============================================================

    @staticmethod
    def mark_refund_pending(
        db: Session,
        order_id: int,
    ):
        """
        Standalone version of mark_refund_pending_in_transaction().
        """

        order = db.get(Order, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found",
            )

        current = PaymentStatus(order.payment_status)

        # --------------------------------------------------------
        # Idempotent
        # --------------------------------------------------------

        if current == PaymentStatus.REFUND_PENDING:
            return {
                "order_id": order.order_id,
                "payment_status": current,
                "changed": False,
            }

        # --------------------------------------------------------
        # Already refunded
        # --------------------------------------------------------

        if current == PaymentStatus.REFUNDED:
            return {
                "order_id": order.order_id,
                "payment_status": current,
                "changed": False,
            }

        # --------------------------------------------------------
        # Must be paid first
        # --------------------------------------------------------

        if current != PaymentStatus.PAID:
            raise HTTPException(
                status_code=400,
                detail="Only paid orders can be refunded",
            )

        changed = OrderPaymentService.mark_refund_pending_in_transaction(
            db=db,
            order=order,
        )

        if changed:
            db.commit()
            db.refresh(order)

        return {
            "order_id": order.order_id,
            "payment_status": PaymentStatus.REFUND_PENDING,
            "changed": changed,
        }

    # ============================================================
    # REFUND SUCCESS
    # ============================================================

    @staticmethod
    def mark_refunded(
        db: Session,
        order_id: int,
        provider_reference: str | None = None,
        provider_transaction_id: str | None = None,
        commit: bool = True,
    ):
        """
        Mark an order as successfully refunded.
        """

        order = db.get(Order, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found",
            )

        current = PaymentStatus(order.payment_status)

        # --------------------------------------------------------
        # Idempotency
        # --------------------------------------------------------

        if current == PaymentStatus.REFUNDED:
            return {
                "order_id": order.order_id,
                "payment_status": PaymentStatus.REFUNDED,
                "changed": False,
            }

        # --------------------------------------------------------
        # Refund must have been pending
        # --------------------------------------------------------

        if current != PaymentStatus.REFUND_PENDING:
            raise HTTPException(
                status_code=400,
                detail="Order is not awaiting refund",
            )

        order.payment_status = PaymentStatus.REFUNDED
        order.updated_at = now_utc()

        OrderRepository.add_payment_event(
            db,
            order_id=order.order_id,
            event_type=PaymentEventType.REFUND_SUCCESS,
            payment_status=PaymentStatus.REFUNDED,
            amount=order.total_amount,
            provider_reference=provider_reference,
            provider_transaction_id=provider_transaction_id,
        )

        if commit:
            db.commit()
            db.refresh(order)

        return {
            "order_id": order.order_id,
            "payment_status": PaymentStatus.REFUNDED,
            "changed": True,
        }

    # ============================================================
    # REFUND FAILED
    # ============================================================

    @staticmethod
    def mark_refund_failed(
        db: Session,
        order_id: int,
        provider_reference: str | None = None,
        provider_transaction_id: str | None = None,
        commit: bool = True,
    ):
        """
        Record a failed refund attempt.

        IMPORTANT:

        A failed refund does NOT mean the money was refunded.

        Therefore:

            Order.payment_status remains REFUND_PENDING

        This allows the refund operation to be retried later.
        """

        order = db.get(Order, order_id)

        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found",
            )

        current = PaymentStatus(order.payment_status)

        # --------------------------------------------------------
        # Already refunded
        # --------------------------------------------------------

        if current == PaymentStatus.REFUNDED:
            return {
                "order_id": order.order_id,
                "payment_status": PaymentStatus.REFUNDED,
                "changed": False,
            }

        # --------------------------------------------------------
        # Refund must be pending
        # --------------------------------------------------------

        if current != PaymentStatus.REFUND_PENDING:
            raise HTTPException(
                status_code=400,
                detail="Order is not awaiting refund",
            )

        OrderRepository.add_payment_event(
            db,
            order_id=order.order_id,
            event_type=PaymentEventType.REFUND_FAILED,
            payment_status=PaymentStatus.REFUND_PENDING,
            amount=order.total_amount,
            provider_reference=provider_reference,
            provider_transaction_id=provider_transaction_id,
        )

        if commit:
            db.commit()

        return {
            "order_id": order.order_id,
            "payment_status": PaymentStatus.REFUND_PENDING,
            "changed": False,
        }