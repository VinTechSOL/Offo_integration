import logging

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.modules.orders.models import Order
from app.modules.orders.constants import PaymentStatus
from app.modules.payments.models import PaymentIntent, PaymentAttempt
from app.modules.payments.constants import (
    PaymentIntentStatus,
    PaymentAttemptStatus,
)
from app.modules.payments.service import PaymentService

logger = logging.getLogger(__name__)


def process_pending_refunds():
    """
    Process orders whose payment is waiting for refund.

    This job is intentionally small:
    - find REFUND_PENDING orders
    - lock one order
    - verify its payment state
    - initiate refund through PaymentService

    PhonePe communication happens outside the initial
    database selection transaction.
    """

    db: Session = SessionLocal()

    processed = 0
    skipped = 0
    failed = 0

    try:

        # --------------------------------------------------
        # Find refund-pending orders
        # --------------------------------------------------

        orders = (
            db.query(Order)
            .filter(
                Order.payment_status
                == PaymentStatus.REFUND_PENDING,
            )
            .order_by(
                Order.updated_at.asc()
            )
            .limit(20)
            .with_for_update(
                skip_locked=True,
            )
            .all()
        )

        logger.info(
            "Refund processor found %s pending refunds",
            len(orders),
        )

        for order in orders:

            try:

                # --------------------------------------------------
                # Re-check order state
                # --------------------------------------------------

                if (
                    order.payment_status
                    != PaymentStatus.REFUND_PENDING
                ):
                    skipped += 1
                    continue

                # --------------------------------------------------
                # Get payment intent
                # --------------------------------------------------

                intent = (
                    db.query(PaymentIntent)
                    .filter(
                        PaymentIntent.order_id
                        == order.order_id
                    )
                    .first()
                )

                if not intent:
                    logger.error(
                        "Refund pending order has no payment intent | "
                        "order=%s",
                        order.order_id,
                    )

                    skipped += 1
                    continue

                # --------------------------------------------------
                # Already refunded
                # --------------------------------------------------

                if (
                    intent.status
                    == PaymentIntentStatus.REFUNDED.value
                ):
                    logger.info(
                        "Refund already completed | order=%s",
                        order.order_id,
                    )

                    order.payment_status = (
                        PaymentStatus.REFUNDED
                    )

                    db.commit()

                    skipped += 1
                    continue

                # --------------------------------------------------
                # Already being processed
                # --------------------------------------------------

                if (
                    intent.status
                    == PaymentIntentStatus.REFUND_INITIATED.value
                ):
                    logger.info(
                        "Refund already initiated | order=%s",
                        order.order_id,
                    )

                    db.commit()

                    skipped += 1
                    continue

                # --------------------------------------------------
                # Payment must have succeeded
                # --------------------------------------------------

                if (
                    intent.status
                    != PaymentIntentStatus.SUCCEEDED.value
                ):
                    logger.error(
                        "Invalid refund state | "
                        "order=%s intent_status=%s",
                        order.order_id,
                        intent.status,
                    )

                    skipped += 1
                    continue

                # --------------------------------------------------
                # Commit the selection transaction
                # --------------------------------------------------

                db.commit()

                # --------------------------------------------------
                # Initiate refund
                # --------------------------------------------------

                logger.info(
                    "Starting refund processing | order=%s",
                    order.order_id,
                )

                PaymentService.initiate_refund_internal(
                    db=db,
                    order_id=order.order_id,
                )

                processed += 1

            except Exception:

                db.rollback()

                failed += 1

                logger.exception(
                    "Refund processing failed | order=%s",
                    order.order_id,
                )

        logger.info(
            "Refund processor finished | "
            "processed=%s skipped=%s failed=%s",
            processed,
            skipped,
            failed,
        )

    except Exception:

        db.rollback()

        logger.exception(
            "Refund processor crashed"
        )

    finally:
        db.close()