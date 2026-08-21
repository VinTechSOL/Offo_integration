import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import type { Order } from "../types";
import ScrollableContainer from "../components/ScrollableContainer";
import { createTicketApi, createFeedbackApi } from "@/api/support";
import { OrderTimeline } from "@/components/OrderTimeline";
import { getOrderApi, cancelOrderApi, getMyOrdersApi } from "@/api/order";
import { mapBackendOrder } from "@/utils/mapOrder";

interface OrderDetailItem {
  item_id: number;
  name: string;
  quantity: number;
  price_at_time: number;
  image_url?: string | null;
}

interface OrderDetail {
  order_id: number;

  cafe_id: number;
  branch_id: number;
  cafe_name?: string | null;

  order_type: "INSTANT" | "SCHEDULED";
  order_status: string;
  payment_status: string;

  scheduled_time?: string | null;
  created_at: string;
  updated_at?: string | null;

  bill: {
    subtotal: number;
    convenience_fee: number;
    total: number;
  };

  payment: {
    status: string;
    transaction_id?: string | null;
    paid_at?: string | null;
  };

  items: OrderDetailItem[];
  timeline: OrderTimelineItem[];
}
interface OrderTimelineItem {
  status: string;
  changed_by: string;
  changed_by_id?: number | null;
  created_at: string;
}

interface OrdersScreenProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onEditSchedule: (order: Order) => void;
  onEditOrderItems: (order: Order) => void;
}

/* ============================
   STATUS PILL
============================ */
const OrderStatusPill: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const base = "text-xs font-semibold px-2.5 py-1 rounded-full";

  switch (status) {
    case "Pending":
      return <span className={`${base} bg-gray-200 text-gray-800`}>Pending</span>;
    case "Accepted":
      return <span className={`${base} bg-orange-100 text-orange-800 animate-pulse`}>Accepted</span>;
    case "Preparing":
      return <span className={`${base} bg-yellow-100 text-yellow-800 animate-pulse`}>Preparing</span>;
    case "Ready for Pickup":
      return (
        <span className={`${base} bg-orange-100 text-orange-800 relative flex items-center`}>
          <span className="absolute -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
          <span className="ml-3">Ready</span>
        </span>
      );
    case "Out for Delivery":
      return <span className={`${base} bg-indigo-100 text-indigo-800 animate-pulse`}>Out</span>;
    case "Completed":
      return <span className={`${base} bg-green-100 text-green-800`}>Completed</span>;
    case "Cancelled":
    case "Rejected":
      return <span className={`${base} bg-red-100 text-red-800`}>{status}</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

/* ============================
   ORDER DETAILS PAGE
============================ */
interface OrderDetailsPageProps {
  order: Order;
  onBack: () => void;
  onReportIssue: (order: Order) => void;
  onGiveFeedback: (order: Order) => void;
  onReorder: (order: Order) => void;
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  order,
  onBack,
  onReportIssue,
  onGiveFeedback,
  onReorder,
}) => {
  const [details, setDetails] = useState<OrderDetail | null>(null);
  const [timeline, setTimeline] = useState<OrderTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  React.useEffect(() => {
    let cancelled = false;

    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const orderData = await getOrderApi(order.id);


        if (cancelled) return;

        setDetails(orderData);
        setTimeline(orderData.timeline || []);
      } catch (err) {
        console.error(
          "Failed to load order details:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load order details. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [order.id]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="p-4 flex items-center border-b bg-white">
          <button onClick={onBack} className="w-1/5">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="w-3/5 text-center text-xl font-bold text-gray-800">
            Order Details
          </h1>

          <div className="w-1/5" />
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">
            Loading order details...
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="p-4 flex items-center border-b bg-white">
          <button onClick={onBack} className="w-1/5">
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="w-3/5 text-center text-xl font-bold text-gray-800">
            Order Details
          </h1>

          <div className="w-1/5" />
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-red-500 font-medium">
            {error || "Order details not found"}
          </p>

          <button
            onClick={onBack}
            className="mt-4 px-5 py-2 bg-orange-500 text-white rounded-lg font-semibold"
          >
            Go Back
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  const status = details.order_status;

  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* HEADER */}

      <header className="p-4 flex items-center border-b bg-white sticky top-0 z-10">
        <button
          onClick={onBack}
          className="w-1/5"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="w-3/5 text-center text-xl font-bold text-gray-800">
          Order Details
        </h1>

        <div className="w-1/5" />
      </header>

      <ScrollableContainer className="p-4 space-y-4 pb-24">

        {/* STATUS */}

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

          <span className="text-green-700 font-semibold">
            {status === "COMPLETED"
              ? "Order was Completed"
              : `Order is ${status}`}
          </span>
        </div>

        {/* RESTAURANT */}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          <h3 className="font-bold text-gray-800 text-lg">
            {details.cafe_name || "Cafe"}
          </h3>

          <p className="text-sm text-gray-500">
            Branch #{details.branch_id}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Order ID: #{details.order_id}
          </p>

          <p className="text-sm text-gray-400">
            {details.order_type === "SCHEDULED"
              ? "Scheduled Order"
              : "Instant Order"}
          </p>

          {details.scheduled_time && (
            <p className="text-sm text-orange-600 mt-1">
              Scheduled for{" "}
              {new Date(
                details.scheduled_time
              ).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}

        </div>

        {/* ORDER ITEMS */}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          <h4 className="font-semibold text-gray-700 mb-3">
            Order Items
          </h4>

          <div className="space-y-3">

            {details.items.map((item) => (
              <div
                key={item.item_id}
                className="flex justify-between items-start"
              >

                <div className="flex items-start gap-2">

                  <div className="w-4 h-4 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0" />

                  <div>
                    <p className="font-medium text-gray-800">
                      {item.quantity} × {item.name}
                    </p>

                    <p className="text-xs text-gray-400">
                      ₹{item.price_at_time.toFixed(2)} each
                    </p>
                  </div>

                </div>

                <span className="font-medium text-gray-700">
                  ₹
                  {(
                    item.price_at_time *
                    item.quantity
                  ).toFixed(2)}
                </span>

              </div>
            ))}

          </div>
        </div>

        {/* BILL */}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          <h4 className="font-semibold text-gray-700 mb-3">
            Bill Summary
          </h4>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-600">
                Item total
              </span>

              <span className="font-medium text-gray-800">
                ₹{details.bill.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">
                (Platform Fee + GST)
              </span>

              <span className="font-medium text-gray-800">
                ₹{details.bill.convenience_fee.toFixed(2)}
              </span>
            </div>

            <div className="border-t pt-2 flex justify-between">

              <span className="font-bold text-gray-800">
                Total Paid
              </span>

              <span className="font-bold text-orange-500 text-lg">
                ₹{details.bill.total.toFixed(2)}
              </span>

            </div>

          </div>
        </div>

        {/* PAYMENT */}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          <h4 className="font-semibold text-gray-700 mb-3">
            Payment Details
          </h4>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">

              <span className="text-gray-600">
                Payment Status
              </span>

              <span
                className={`font-semibold ${
                  details.payment_status === "PAID"
                    ? "text-green-600"
                    : details.payment_status === "REFUNDED"
                    ? "text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {details.payment_status}
              </span>

            </div>

          </div>
        </div>

        {/* TIMELINE */}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          <h4 className="font-semibold text-gray-700 mb-4">
            Order Timeline
          </h4>

          {timeline.length === 0 ? (

            <p className="text-sm text-gray-400">
              No timeline information available.
            </p>

          ) : (

            <div className="space-y-4">

              {timeline.map((event, index) => (

                <div
                  key={`${event.status}-${event.created_at}-${index}`}
                  className="flex gap-3"
                >

                  <div className="flex flex-col items-center">

                    <div className="w-3 h-3 rounded-full bg-orange-500 mt-1" />

                    {index <
                      timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    )}

                  </div>

                  <div className="pb-3">

                    <p className="font-semibold text-gray-800">
                      {event.status}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(
                        event.created_at
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* FSSAI */}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">

          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">

            <div className="flex justify-between items-center">

              <div className="flex items-center gap-2">

                <img
                  src="/assets/icons/fssai-logo.png"
                  alt="FSSAI Logo"
                  className="h-6 w-auto object-contain"
                />

                <span className="text-gray-500 font-medium">
                  License No.
                </span>

              </div>

              <span className="font-semibold text-gray-700 tracking-wider">
                12345678901234
              </span>

            </div>

          </div>

        </div>

      </ScrollableContainer>

      <BottomNav />

    </div>
  );
};

/* ============================
   TICKET FORM MODAL
============================ */
interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  items: Order["items"];
  onSubmit: (data: TicketData) => Promise<void>;
}

interface TicketData {
  issueType: string;
  selectedOrderItemId?: string;
  description: string;
  imageFile?: File | null;
  imagePreview?: string | null;
}

const TicketFormModal: React.FC<TicketFormProps> = ({
  isOpen,
  onClose,
  order,
  items,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [selectedOrderItemId, setselectedOrderItemId] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const issueTypes = [
    { value: "missing_item", label: "Missing/Incorrect Item" },
    { value: "food_quality", label: "Food Quality" },
    { value: "pickup_issue", label: "Pickup Issue" },
    { value: "payment_billing", label: "Payment/Billing Issue" },
    { value: "other", label: "Other" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!issueType) {
      setError('Please select an issue type');
      return;
    }

    if (!description || description.trim().length < 10) {
      setError('Please provide a detailed description (min 10 characters)');
      return;
    }

    if (!order) {
      setError('Order information is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await onSubmit({
        issueType,
        selectedOrderItemId: selectedOrderItemId || undefined,
        description: description.trim(),
        imageFile,
        imagePreview,
      });

      setIssueType('');
      setselectedOrderItemId('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setError('');

      onClose();
    } catch (error) {
      console.error('Failed to submit ticket:', error);

      setError('Unable to submit your ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Report Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {order && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-semibold text-gray-700">Order #{order.id}</p>
              <p className="text-gray-500">{order.cafe}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select issue type</option>
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Item (Optional)
            </label>
            <select
              value={selectedOrderItemId}
              onChange={(e) => setselectedOrderItemId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select an item</option>
              {items.map(({ orderItemId, item, quantity }) => (
                <option key={orderItemId} value={orderItemId}>
                  {quantity}x {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">Min 10 characters</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Image (Optional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <span className="text-sm text-gray-600">Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-gray-400">Max 5MB</p>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================
   FEEDBACK FORM MODAL
============================ */
interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmit: (data: FeedbackData) => Promise<void>;
}

interface FeedbackData {
  foodRating: number;
  appRating: number;
  comments: string;
}

const FeedbackFormModal: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  order,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foodRating, setFoodRating] = useState(0);
  const [appRating, setAppRating] = useState(0);
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (foodRating === 0) {
      setError('Please rate the food');
      return;
    }

    if (appRating === 0) {
      setError('Please rate your app experience');
      return;
    }

    if (!order) {
      setError('Order information is missing');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await onSubmit({
        foodRating,
        appRating,
        comments: comments.trim(),
      });

      setFoodRating(0);
      setAppRating(0);
      setComments('');
      setError('');

      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);

      setError('Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Rate Your Experience
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {order && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-semibold text-gray-700">Order #{order.id}</p>
              <p className="text-gray-500">{order.cafe}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How was the food? <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFoodRating(star)}
                  className="text-3xl transition-transform hover:scale-125"
                >
                  <span
                    className={
                      star <= foodRating ? 'text-yellow-400' : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rate your app experience <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setAppRating(star)}
                  className="text-3xl transition-transform hover:scale-125"
                >
                  <span
                    className={
                      star <= appRating ? 'text-yellow-400' : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Additional Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your experience with us..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================
   ORDER CARD COMPONENT
============================ */
interface OrderCardProps {
  order: Order;
  onPress: (order: Order) => void;
  onCancel: (orderId: string) => void;
  onEditSchedule: (order: Order) => void;
  onEditOrderItems: (order: Order) => void;
  onReportIssue: (order: Order) => void;
  onRateOrder: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onCancel,
  onEditSchedule,
  onEditOrderItems,
  onReportIssue,
  onRateOrder,
}) => {
  const isCancellable = order.backendStatus === "CREATED";
  const isCompleted =  order.backendStatus === "COMPLETED" ;

  return (
    <div
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onPress(order)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{order.cafe || 'Cafe'}</h3>
          <p className="text-xs text-gray-500">
            #{order.id} · {order.date.toLocaleString('en-GB')}
          </p>
        </div>
        <OrderStatusPill status={order.status} />
      </div>

      <div className="mt-3 border-t pt-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            {order.items.length} item
            {order.items.length > 1 ? 's' : ''}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPress(order);
            }}
            className="
        flex items-center gap-1.5
        px-3 py-2
        bg-green-100
        text-green-700
        border border-green-200
        rounded-lg
        text-xs font-semibold
        whitespace-nowrap
        hover:bg-green-200
        transition-colors
      "
          >
            <span>View All</span>

            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <ul className="mt-2 space-y-1 text-sm text-gray-600">
          {order.items.slice(0, 2).map(({ item, quantity }) => (
            <li key={item.id}>
              {quantity} × {item.name}
            </li>
          ))}

          {order.items.length > 2 && (
            <li className="text-gray-400 text-xs">
              +{order.items.length - 2} more items
            </li>
          )}
        </ul>
      </div>

      <div
        className="mt-3 pt-3 border-t flex justify-between items-center hover:bg-orange-50/50 -mx-4 px-4 py-2 transition-colors rounded-b-lg"
        onClick={(e) => {
          e.stopPropagation();
          onPress(order);
        }}
      >
        <span className="font-semibold text-gray-700">Total Paid</span>
        <span className="font-bold text-orange-600 text-lg">
          ₹{order.total.toFixed(2)}
        </span>
      </div>

      <div className="border-t mt-3 pt-3 flex gap-2 flex-wrap">
        {order.status === 'Pending' && order.orderType === 'SCHEDULED' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSchedule(order);
              }}
              className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-200 transition-colors"
            >
              Edit Schedule
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditOrderItems(order);
              }}
              className="px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-semibold hover:bg-green-200 transition-colors"
            >
              Edit Items
            </button>
          </>
        )}

        {isCancellable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(order.id);
            }}
            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
          >
            Cancel Order
          </button>
        )}

        {isCompleted && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReportIssue(order);
              }}
              className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-semibold hover:bg-yellow-200 transition-colors"
            >
              Report Issue
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRateOrder(order);
              }}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              Rate Order
            </button>
          </>
        )}
      </div>
    </div>
  );
};



/* ============================
   SUCCESS CONFIRMATION MODAL
============================ */

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">

        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          {message}
        </p>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
        >
          OK
        </button>

      </div>
    </div>
  );
};



/* ============================
   MAIN ORDERS SCREEN
============================ */
const OrdersScreen: React.FC<OrdersScreenProps> = ({
  orders,
  setOrders,
  onEditSchedule,
  onEditOrderItems,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"scheduled" | "ongoing" | "past">("ongoing");
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [successModal, setSuccessModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSameDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isFutureDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime();
  };

  const TERMINAL_BACKEND_STATUSES = ['COMPLETED', 'CANCELLED', 'REJECTED'];

  const scheduledOrders = orders.filter(
    (o) =>
      o.orderType === 'SCHEDULED' &&
      isFutureDay(o.date) &&
      o.backendStatus === 'CREATED',
  );

  const ongoingOrders = orders.filter(
    (o) =>
      isSameDay(o.date) &&
      !TERMINAL_BACKEND_STATUSES.includes(
        String(o.backendStatus ?? '').toUpperCase(),
      ),
  );

  const pastOrders = orders.filter((o) =>
    TERMINAL_BACKEND_STATUSES.includes(
      String(o.backendStatus ?? '').toUpperCase(),
    ),
  );

  const ordersToDisplay =
    activeTab === "scheduled"
      ? scheduledOrders
      : activeTab === "ongoing"
      ? ongoingOrders
      : pastOrders;

  const [isCancelling, setIsCancelling] = useState(false);

  const confirmCancel = async () => {
    if (!orderToCancel || isCancelling) return;

    try {
      setIsCancelling(true);

      await cancelOrderApi(orderToCancel);

      const updatedOrders = await getMyOrdersApi();

      const mappedOrders = updatedOrders.map(mapBackendOrder);

      setOrders(mappedOrders);

      setOrderToCancel(null);
    } catch (error: any) {
      console.error('Failed to cancel order:', error.response?.data || error);

      alert(
        error.response?.data?.detail ||
          'Unable to cancel order. Please try again.',
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleTicketSubmit = async (data: TicketData) => {
    if (!selectedOrder) {
      throw new Error('No order selected');
    }

    const orderItemId = data.selectedOrderItemId
      ? Number(data.selectedOrderItemId)
      : undefined;

    try {
      await createTicketApi({
        order_id: selectedOrder.id,
        order_item_id: orderItemId !== undefined && Number.isInteger(orderItemId) ? orderItemId : undefined,
        issue_type: data.issueType as
          | 'missing_item'
          | 'food_quality'
          | 'pickup_issue'
          | 'payment_billing'
          | 'other',
        description: data.description,
        image: data.imageFile,
      });

      setShowTicketForm(false);
      setSelectedOrder(null);
      setSuccessModal({
        title: 'Ticket Raised Successfully',
        message:
          'Your support ticket has been raised successfully. Our team will review it and get back to you.',
      });
    } catch (error: any) {
      console.error('Ticket API error:', error.response?.data);
      console.error('Ticket API status:', error.response?.status);
      throw error;
    }
  };

  const handleFeedbackSubmit = async (data: FeedbackData) => {
    if (!selectedOrder) {
      throw new Error('No order selected');
    }

    await createFeedbackApi({
      order_id: selectedOrder.id,
      food_rating: data.foodRating,
      app_rating: data.appRating,
      comments: data.comments.trim() || undefined,
    });

    setShowFeedbackForm(false);
    setSelectedOrder(null);
    setSuccessModal({
      title: 'Feedback Submitted Successfully',
      message:
        'Thank you for your feedback. Your response has been recorded successfully.',
    });

    console.log('Feedback submitted successfully');
  };

  const handleOrderPress = (order: Order) => {
    setViewingOrder(order);
  };

  const handleBackFromDetails = () => {
    setViewingOrder(null);
  };

  const handleReportIssue = (order: Order) => {
    setSelectedOrder(order);
    setShowTicketForm(true);
  };

  const handleGiveFeedback = (order: Order) => {
    setSelectedOrder(order);
    setShowFeedbackForm(true);
  };

  const handleReorder = (order: Order) => {
    console.log("Reorder order:", order.id);
    // Navigate to cart with order items
    // navigate("/cart", { state: { reorderItems: order.items } });
  };

  // If viewing order details, render the details page
  if (viewingOrder) {
    return (
      <OrderDetailsPage
        order={viewingOrder}
        onBack={handleBackFromDetails}
        onReportIssue={handleReportIssue}
        onGiveFeedback={handleGiveFeedback}
        onReorder={handleReorder}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      {/* CANCEL MODAL */}
      {orderToCancel && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-4/5 text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Cancel Order?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setOrderToCancel(null)}
                className="px-6 py-2 border rounded-lg font-semibold"
              >
                No
              </button>
              <button
                onClick={confirmCancel}
                disabled={isCancelling}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET FORM */}
      <TicketFormModal
        isOpen={showTicketForm}
        onClose={() => {
          setShowTicketForm(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        items={selectedOrder?.items || []}
        onSubmit={handleTicketSubmit}
      />

      {/* FEEDBACK FORM */}
      <FeedbackFormModal
        isOpen={showFeedbackForm}
        onClose={() => {
          setShowFeedbackForm(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onSubmit={handleFeedbackSubmit}
      />

      {/* SUCCESS CONFIRMATION */}
      <SuccessModal
        isOpen={successModal !== null}
        title={successModal?.title ?? ''}
        message={successModal?.message ?? ''}
        onClose={() => setSuccessModal(null)}
      />

      {/* HEADER */}
      <header className="p-4 flex items-center border-b bg-white sticky top-0 z-10">
        <button onClick={() => navigate('/home', {replace: true})} className="w-1/5">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="w-3/5 text-center text-xl font-bold text-gray-800">
          My Orders
        </h1>
        <div className="w-1/5" />
      </header>

      {/* TABS */}
      <div className="flex border-b bg-white">
        {['scheduled', 'ongoing', 'past'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`w-1/3 py-3 font-semibold transition-colors ${
              activeTab === tab
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500'
            }`}
          >
            {tab === 'scheduled'
              ? 'Scheduled'
              : tab === 'ongoing'
              ? 'Ongoing'
              : 'Past Orders'}
          </button>
        ))}
      </div>

      {/* ORDER LIST */}
      <ScrollableContainer className="p-4 space-y-4 pb-24">
        {ordersToDisplay.length === 0 ? (
          <div className="text-center pt-20 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="font-medium">No orders found</p>
            <p className="text-sm">Your orders will appear here</p>
          </div>
        ) : (
          ordersToDisplay.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={handleOrderPress}
              onCancel={setOrderToCancel}
              onEditSchedule={onEditSchedule}
              onEditOrderItems={onEditOrderItems}
              onReportIssue={handleReportIssue}
              onRateOrder={handleGiveFeedback}
            />
          ))
        )}
      </ScrollableContainer>

      <BottomNav />
    </div>
  );
};

export default OrdersScreen;