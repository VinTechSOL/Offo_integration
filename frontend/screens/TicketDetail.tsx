import React, {
  useEffect,
  useState,

} from "react";

import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import {
  getMyTicketApi,
  sendTicketMessageApi,
  type TicketMessage,
  type TicketResponse,
  type TicketStatus,
} from "@/api/support";



const TicketDetail: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const { ticketId } = useParams<{
    ticketId: string;
  }>();


  // =====================================================
  // STATE
  // =====================================================

  const [ticket, setTicket] =
    useState<TicketResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [replyMessage, setReplyMessage] =
    useState("");

  const [sendingReply, setSendingReply] =
    useState(false);


  // =====================================================
  // LOAD TICKET
  // =====================================================

  const loadTicket = async () => {

    if (!ticketId) {
      setError(
        "Invalid ticket."
      );

      setLoading(false);

      return;
    }

    try {

      setLoading(true);

      setError("");

      const data =
        await getMyTicketApi(
          Number(ticketId)
        );

      setTicket(data);

    } catch (err) {

      console.error(
        "Failed to load ticket:",
        err
      );

      setError(
        "Unable to load this ticket. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadTicket();

  }, [ticketId]);


  // =====================================================
  // SEND REPLY
  // =====================================================

  const sendReply = async () => {

    if (!ticket) {
      return;
    }

    const message =
      replyMessage.trim();

    if (!message) {
      return;
    }

    if (sendingReply) {
      return;
    }

    if (
      ticket.status === "closed"
    ) {
      return;
    }

    try {

      setSendingReply(true);

      const createdMessage =
        await sendTicketMessageApi(
          ticket.ticket_id,
          message
        );


      // -----------------------------------------------
      // Add new message immediately
      // -----------------------------------------------

      setTicket((current) => {

        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: [
            ...(current.messages ?? []),
            createdMessage,
          ],

          updated_at:
            createdMessage.created_at,
        };

      });


      setReplyMessage("");

    } catch (err) {

      console.error(
        "Failed to send reply:",
        err
      );

      alert(
        "Unable to send your message. Please try again."
      );

    } finally {

      setSendingReply(false);

    }
  };


  // =====================================================
  // STATUS
  // =====================================================

  const getStatusLabel = (
    status: TicketStatus
  ) => {

    switch (status) {

      case "open":
        return "Open";

      case "in-progress":
        return "In Progress";

      case "resolved":
        return "Resolved";

      case "closed":
        return "Closed";

      default:
        return status;
    }
  };


  const getStatusClass = (
    status: TicketStatus
  ) => {

    switch (status) {

      case "open":
        return "bg-red-100 text-red-700";

      case "in-progress":
        return "bg-yellow-100 text-yellow-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      case "closed":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (
    dateString: string
  ) => {

    if (!dateString) {
      return "-";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // =====================================================
  // ISSUE LABEL
  // =====================================================

  const getIssueLabel = (
    issueType: string
  ) => {

    switch (issueType) {

      case "missing_item":
        return "Missing Item";

      case "food_quality":
        return "Food Quality";

      case "pickup_issue":
        return "Pickup Issue";

      case "payment_billing":
        return "Payment / Billing";

      case "other":
        return "Other";

      default:
        return issueType;
    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-sm text-gray-500">
            Loading ticket...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error || !ticket) {

    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <button
          onClick={() => {
            navigate('/orders', {
              state: {
                ordersTab: location.state?.ordersTab ?? 'past',
              },
            });
          }}
          className="text-sm text-gray-600 mb-6"
        >
          ← Back
        </button>

        <div className="bg-white rounded-xl border p-6 text-center">
          <p className="text-red-600 font-semibold">
            {error || 'Ticket not found'}
          </p>

          <button
            onClick={loadTicket}
            className="mt-4 text-sm font-semibold text-orange-500 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button
            onClick={() => {
              navigate('/orders', {
                state: {
                  ordersTab: location.state?.ordersTab ?? 'past',
                },
              });
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* =================================================
            TICKET HEADER
        ================================================= */}

        <section className="bg-white rounded-xl border p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Support Ticket</p>

              <h1 className="text-xl font-bold text-gray-900 mt-1">
                TKT-
                {String(ticket.ticket_id).padStart(6, '0')}
              </h1>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                ticket.status,
              )}`}
            >
              {getStatusLabel(ticket.status)}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Order</p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                #{ticket.order_id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Issue</p>

              <p className="text-sm font-semibold text-gray-900 mt-1">
                {getIssueLabel(ticket.issue_type)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Created</p>

              <p className="text-sm text-gray-700 mt-1">
                {formatDate(ticket.created_at)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Last Updated</p>

              <p className="text-sm text-gray-700 mt-1">
                {formatDate(ticket.updated_at)}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            ORIGINAL ISSUE
        ================================================= */}

        <section className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900">Your Issue</h2>

          <div className="mt-3 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Attachment */}

          {ticket.image_url && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Attachment</p>

              <img
                src={ticket.image_url}
                alt="Ticket attachment"
                className="w-full max-h-80 object-contain rounded-lg border bg-gray-50"
              />
            </div>
          )}
        </section>

        {/* =================================================
            CONVERSATION
        ================================================= */}

        <section className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Conversation</h2>

              <p className="text-xs text-gray-500 mt-1">
                Messages from you and support
              </p>
            </div>

            <span className="text-xs text-gray-400">
              {(ticket.messages ?? []).length}{' '}
              {(ticket.messages ?? []).length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {(ticket.messages ?? []).length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-5 text-center">
                <p className="text-sm text-gray-500">No replies yet.</p>

                <p className="text-xs text-gray-400 mt-1">
                  Our support team will respond here.
                </p>
              </div>
            ) : (
              ticket.messages!.map((message: TicketMessage) => {
                const isUser = message.sender_type === 'USER';

                return (
                  <div
                    key={message.message_id}
                    className={`flex ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`text-xs font-semibold ${
                            isUser ? 'text-orange-100' : 'text-gray-500'
                          }`}
                        >
                          {isUser ? 'You' : 'Support'}
                        </span>

                        <span
                          className={`text-[10px] ${
                            isUser ? 'text-orange-100' : 'text-gray-400'
                          }`}
                        >
                          {formatDate(message.created_at)}
                        </span>
                      </div>

                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* =================================================
            REPLY
        ================================================= */}

        {ticket.status !== 'closed' && (
          <section className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900">Reply</h2>

            <p className="text-xs text-gray-500 mt-1">
              Send a message to our support team.
            </p>

            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              maxLength={5000}
              disabled={sendingReply}
              className="w-full mt-4 border border-gray-300 rounded-lg px-3 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-gray-100"
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {replyMessage.length}/5000
              </span>

              <button
                type="button"
                onClick={sendReply}
                disabled={sendingReply || !replyMessage.trim()}
                className="px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </section>
        )}

        {/* =================================================
            CLOSED TICKET
        ================================================= */}

        {ticket.status === 'closed' && (
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700">
              This ticket is closed.
            </p>

            <p className="text-xs text-gray-500 mt-1">
              This conversation is no longer accepting replies.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};


export default TicketDetail;