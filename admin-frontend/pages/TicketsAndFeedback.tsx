import React, { useEffect, useMemo, useState } from "react";
import Drawer from "../components/common/Drawer";

import {
  getAdminTicketsApi,
  getAdminTicketApi,
  getAdminFeedbackApi,
  updateTicketStatusApi,
  sendAdminTicketMessageApi,
  type TicketStatus,
  type TicketMessage,
} from "@/apis/support";



/* =========================================================
   TYPES
========================================================= */

interface Ticket {
  id: string;
  ticketId: number;

  orderId: string;
  orderNumericId: number;

  cafe: string;
  customerName: string;

  issueType: string;
  description: string;

  itemName?: string;

  status: TicketStatus;

  createdAt: string;
  updatedAt: string;

  imageUrl?: string | null;

  messages: TicketMessage[];
}

interface Feedback {
  id: string;
  feedbackId: number;

  orderId: string;
  orderNumericId: number;

  cafe: string;
  customerName: string;

  foodRating: number;
  appRating: number;

  comments: string;

  createdAt: string;
}

/* =========================================================
   COMPONENT
========================================================= */

export const TicketsAndFeedback: React.FC = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [activeTab, setActiveTab] = useState<
    "tickets" | "feedback"
  >("tickets");

  const [selectedTicket, setSelectedTicket] =
    useState<Ticket | null>(null);

  const [selectedFeedback, setSelectedFeedback] =
    useState<Feedback | null>(null);

  const [replyMessage, setReplyMessage] =
  useState("");

  const [sendingReply, setSendingReply] =
  useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState<"all" | TicketStatus>("all");

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [feedbacks, setFeedbacks] =
    useState<Feedback[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingTicketId, setUpdatingTicketId] =
    useState<number | null>(null);

  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadSupportData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        ticketsResponse,
        feedbackResponse,
      ] = await Promise.all([
        getAdminTicketsApi(),
        getAdminFeedbackApi(),
      ]);

      /* -----------------------------------------------
         MAP TICKETS
      ------------------------------------------------ */

      const mappedTickets: Ticket[] =
        ticketsResponse.map((ticket) => ({
          id:
            ticket.display_ticket_id ??
            `TKT-${ticket.ticket_id}`,

          ticketId: ticket.ticket_id,

          orderId:
            ticket.display_order_id ??
            String(ticket.order_id),

          orderNumericId: ticket.order_id,

          cafe:
            ticket.cafe_name ??
            "Cafe",

          customerName:
            ticket.customer_name ??
            "Customer",

          issueType:
            ticket.issue_type,

          description:
            ticket.description,

          itemName:
            ticket.item_name ??
            undefined,

          status:
            ticket.status,

          createdAt:
            ticket.created_at,

          updatedAt:
            ticket.updated_at,

          imageUrl:
            ticket.image_url ?? null,

          messages: ticket.messages ?? [],
        }));

      /* -----------------------------------------------
         MAP FEEDBACK
      ------------------------------------------------ */

      const mappedFeedbacks: Feedback[] =
        feedbackResponse.map((feedback) => ({
          id:
            feedback.display_feedback_id ??
            `FB-${feedback.feedback_id}`,

          feedbackId:
            feedback.feedback_id,

          orderId:
            feedback.display_order_id ??
            String(feedback.order_id),

          orderNumericId:
            feedback.order_id,

          cafe:
            feedback.cafe_name ??
            "Cafe",

          customerName:
            feedback.customer_name ??
            "Customer",

          foodRating:
            feedback.food_rating,

          appRating:
            feedback.app_rating,

          comments:
            feedback.comments ?? "",

          createdAt:
            feedback.created_at,
        }));

      setTickets(mappedTickets);
      setFeedbacks(mappedFeedbacks);

    } catch (err) {
      console.error(
        "Failed to load tickets and feedback:",
        err
      );

      setError(
        "Failed to load tickets and feedback. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadSupportData();
  }, []);

  /* =======================================================
     STATUS COLORS
  ======================================================= */

  const getStatusColor = (
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

  /* =======================================================
     STATUS LABEL
  ======================================================= */

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

  /* =======================================================
     UPDATE TICKET STATUS
  ======================================================= */

  const updateTicketStatus = async (
    ticket: Ticket,
    newStatus: TicketStatus
  ) => {
    if (
      ticket.status === newStatus ||
      updatingTicketId !== null
    ) {
      return;
    }

    try {
      setUpdatingTicketId(
        ticket.ticketId
      );

      await updateTicketStatusApi(
        ticket.ticketId,
        newStatus
      );

      /* -----------------------------------------------
         Update local state
      ------------------------------------------------ */

      setTickets((prev) =>
        prev.map((item) =>
          item.ticketId === ticket.ticketId
            ? {
                ...item,
                status: newStatus,
                updatedAt:
                  new Date().toISOString(),
              }
            : item
        )
      );

      /* -----------------------------------------------
         Update selected drawer ticket
      ------------------------------------------------ */

      setSelectedTicket((current) => {
        if (
          !current ||
          current.ticketId !== ticket.ticketId
        ) {
          return current;
        }

        return {
          ...current,
          status: newStatus,
          updatedAt:
            new Date().toISOString(),
        };
      });

    } catch (err) {
      console.error(
        "Failed to update ticket status:",
        err
      );

      alert(
        "Failed to update ticket status. Please try again."
      );
    } finally {
      setUpdatingTicketId(null);
    }
  };

  /* =======================================================
     DATE FORMATTER
  ======================================================= */

  const formatDate = (
    dateStr: string
  ) => {
    if (!dateStr) {
      return "-";
    }

    const date =
      new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
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

  const formatMessageDate = (
  dateStr: string
) => {
  if (!dateStr) {
    return "-";
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

  /* =======================================================
     RATING STARS
  ======================================================= */

  const getRatingStars = (
    rating: number
  ) => {
    const safeRating = Math.max(
      0,
      Math.min(5, rating)
    );

    return (
      "⭐".repeat(safeRating) +
      "☆".repeat(5 - safeRating)
    );
  };

  /* =======================================================
     FILTERED TICKETS
  ======================================================= */

  const filteredTickets =
    useMemo(() => {
      let list = tickets;

      /* Status */

      if (filterStatus !== "all") {
        list = list.filter(
          (ticket) =>
            ticket.status ===
            filterStatus
        );
      }

      /* Search */

      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (query) {
        list = list.filter(
          (ticket) =>
            ticket.customerName
              .toLowerCase()
              .includes(query) ||

            ticket.id
              .toLowerCase()
              .includes(query) ||

            ticket.orderId
              .toLowerCase()
              .includes(query) ||

            ticket.cafe
              .toLowerCase()
              .includes(query) ||

            ticket.issueType
              .toLowerCase()
              .includes(query)
        );
      }

      return list;
    }, [
      tickets,
      filterStatus,
      searchQuery,
    ]);

  /* =======================================================
     FILTERED FEEDBACK
  ======================================================= */

  const filteredFeedbacks =
    useMemo(() => {
      let list = feedbacks;

      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (query) {
        list = list.filter(
          (feedback) =>
            feedback.customerName
              .toLowerCase()
              .includes(query) ||

            feedback.id
              .toLowerCase()
              .includes(query) ||

            feedback.orderId
              .toLowerCase()
              .includes(query) ||

            feedback.cafe
              .toLowerCase()
              .includes(query)
        );
      }

      return list;
    }, [
      feedbacks,
      searchQuery,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const openCount =
    tickets.filter(
      (ticket) =>
        ticket.status === "open"
    ).length;

  const progressCount =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "in-progress"
    ).length;

  const resolvedCount =
    tickets.filter(
      (ticket) =>
        ticket.status ===
          "resolved" ||
        ticket.status === "closed"
    ).length;


    const openTicket = async (ticket: Ticket) => {
      try {
        setSelectedTicket(ticket);
        setReplyMessage('');
        setTicketDetailLoading(true);

        const detail = await getAdminTicketApi(ticket.ticketId);

        setSelectedTicket({
          ...ticket,
          messages: detail.messages ?? [],
          updatedAt: detail.updated_at,
        });
      } catch (err) {
        console.error('Failed to load ticket details:', err);

        alert('Failed to load ticket details. Please try again.');
      } finally {
        setTicketDetailLoading(false);
      }
    };


  //send and receiving replies

  const sendAdminReply = async () => {
    if (!selectedTicket) {
      return;
    }

    const message = replyMessage.trim();

    if (!message) {
      return;
    }

    if (sendingReply) {
      return;
    }

    if (selectedTicket.status === "closed") {
      alert(
        "This ticket is closed and cannot receive new replies."
      );
      return;
    }

    try {
      setSendingReply(true);

      const createdMessage =
        await sendAdminTicketMessageApi(
          selectedTicket.ticketId,
          message
        );

      /* -----------------------------------------------
         Update ticket list
       ------------------------------------------------ */

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketId ===
          selectedTicket.ticketId
            ? {
                ...ticket,
                messages: [
                  ...ticket.messages,
                  createdMessage,
                ],
                updatedAt:
                  createdMessage.created_at,
              }
            : ticket
        )
      );

      /* -----------------------------------------------
         Update currently open drawer
      ------------------------------------------------ */

      setSelectedTicket((current) => {
        if (
          !current ||
          current.ticketId !==
            selectedTicket.ticketId
        ) {
          return current;
        }

        return {
          ...current,
          messages: [
            ...current.messages,
            createdMessage,
          ],
          updatedAt:
            createdMessage.created_at,
        };
      });

      setReplyMessage("");

    } catch (err) {
      console.error(
        "Failed to send ticket reply:",
        err
      );

      alert(
        "Failed to send reply. Please try again."
      );
    } finally {
      setSendingReply(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-0 relative bg-gray-50 min-h-screen -m-4 sm:-m-6 lg:-m-8">
      {/* ===================================================
          HEADER / STATS
      =================================================== */}

      <div className="bg-slate-900 text-white p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-400">OPEN TICKETS</p>

          <p className="text-2xl font-bold text-red-400">{openCount}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">IN PROGRESS</p>

          <p className="text-2xl font-bold text-yellow-400">{progressCount}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">RESOLVED</p>

          <p className="text-2xl font-bold text-green-400">{resolvedCount}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">TOTAL TICKETS</p>

          <p className="text-2xl font-bold text-white">{tickets.length}</p>
        </div>
      </div>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="p-6">
        {/* =================================================
            TABS
        ================================================= */}

        <div className="bg-white rounded-t-lg border px-6 py-4 flex gap-8">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`font-bold ${
              activeTab === 'tickets'
                ? 'text-offoOrange border-b-2 border-offoOrange'
                : 'text-gray-500'
            }`}
          >
            Tickets ({tickets.length})
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`font-bold ${
              activeTab === 'feedback'
                ? 'text-offoOrange border-b-2 border-offoOrange'
                : 'text-gray-500'
            }`}
          >
            Feedback ({feedbacks.length})
          </button>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="bg-white border-x border-gray-200 p-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search ID / Name / Cafe"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded text-sm flex-1 min-w-[200px]"
          />

          {activeTab === 'tickets' && (
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | TicketStatus)
              }
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="all">All Status</option>

              <option value="open">Open</option>

              <option value="in-progress">In Progress</option>

              <option value="resolved">Resolved</option>

              <option value="closed">Closed</option>
            </select>
          )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm">{error}</p>

              <button
                onClick={loadSupportData}
                className="text-sm font-semibold underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="bg-white border border-t-0 rounded-b-lg py-16 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />

            <p className="mt-4 text-gray-500">Loading support data...</p>
          </div>
        ) : (
          <>
            {/* =============================================
                TICKETS LIST
            ============================================= */}

            {activeTab === 'tickets' && (
              <div className="bg-white border border-t-0 rounded-b-lg overflow-x-auto">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No tickets found</p>

                    <p className="text-sm mt-1">
                      Tickets submitted by users will appear here.
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className="border-b px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => openTicket(ticket)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                        {/* Customer */}

                        <div>
                          <p className="font-bold">#{ticket.id}</p>

                          <p className="font-semibold">{ticket.customerName}</p>

                          <p className="text-xs text-gray-500">{ticket.cafe}</p>
                        </div>

                        {/* Issue */}

                        <div>
                          <p className="text-sm font-medium">
                            {ticket.issueType}
                          </p>

                          <p className="text-xs text-gray-500">
                            Order #{ticket.orderId}
                          </p>
                        </div>

                        {/* Status */}

                        <div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(
                              ticket.status,
                            )}`}
                          >
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>

                        {/* Date */}

                        <div className="text-right text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </div>

                        {/* Description */}

                        <div className="text-sm text-gray-500 truncate">
                          {ticket.description}
                        </div>

                        {/* View */}

                        <div className="text-right">
                          <span className="text-orange-500 text-sm font-medium">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* =============================================
                FEEDBACK LIST
            ============================================= */}

            {activeTab === 'feedback' && (
              <div className="bg-white border border-t-0 rounded-b-lg overflow-x-auto">
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No feedback found</p>

                    <p className="text-sm mt-1">
                      Customer feedback will appear here.
                    </p>
                  </div>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <div
                      key={feedback.feedbackId}
                      className="border-b px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedFeedback(feedback)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                        {/* Customer */}

                        <div>
                          <p className="font-bold">#{feedback.id}</p>

                          <p className="font-semibold">
                            {feedback.customerName}
                          </p>

                          <p className="text-xs text-gray-500">
                            {feedback.cafe}
                          </p>
                        </div>

                        {/* Ratings */}

                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">Food:</span>

                            <span className="text-sm">
                              {getRatingStars(feedback.foodRating)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-sm">App:</span>

                            <span className="text-sm">
                              {getRatingStars(feedback.appRating)}
                            </span>
                          </div>
                        </div>

                        {/* Order */}

                        <div>
                          <p className="text-xs text-gray-500">
                            Order #{feedback.orderId}
                          </p>
                        </div>

                        {/* Date */}

                        <div className="text-right text-sm text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </div>

                        {/* Comment */}

                        <div className="text-sm text-gray-500 truncate">
                          {feedback.comments || 'No comments'}
                        </div>

                        {/* View */}

                        <div className="text-right">
                          <span className="text-orange-500 text-sm font-medium">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===================================================
          TICKET DRAWER
      =================================================== */}

      <Drawer
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket ? `Ticket #${selectedTicket.id}` : ''}
      >
        {selectedTicket && (
          <div className="space-y-4">
            {ticketDetailLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                Loading conversation...
              </div>
            )}

            {/* Current Status */}

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>

                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getStatusColor(
                    selectedTicket.status,
                  )}`}
                >
                  {getStatusLabel(selectedTicket.status)}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {formatDate(selectedTicket.createdAt)}
              </p>
            </div>

            {/* Status Update */}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Update Status</p>

              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    'open',
                    'in-progress',
                    'resolved',
                    'closed',
                  ] as TicketStatus[]
                ).map((status) => {
                  const isCurrent = selectedTicket.status === status;

                  const isUpdating =
                    updatingTicketId === selectedTicket.ticketId;

                  return (
                    <button
                      key={status}
                      disabled={isCurrent || isUpdating}
                      onClick={() => updateTicketStatus(selectedTicket, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        status === 'open'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : status === 'resolved'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${
                        isCurrent || isUpdating
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {isUpdating ? 'Updating...' : getStatusLabel(status)}
                    </button>
                  );
                })}
              </div>
            </div>

            

            {/* Customer */}

            <div>
              <p className="text-sm text-gray-500">Customer</p>

              <p className="font-semibold">{selectedTicket.customerName}</p>
            </div>

            {/* Cafe */}

            <div>
              <p className="text-sm text-gray-500">Cafe</p>

              <p className="font-semibold">{selectedTicket.cafe}</p>
            </div>

            {/* Order */}

            <div>
              <p className="text-sm text-gray-500">Order</p>

              <p className="font-semibold">#{selectedTicket.orderId}</p>
            </div>

            {/* Issue */}

            <div>
              <p className="text-sm text-gray-500">Issue Type</p>

              <p className="font-semibold">{selectedTicket.issueType}</p>
            </div>

            {/* Item */}

            {selectedTicket.itemName && (
              <div>
                <p className="text-sm text-gray-500">Item</p>

                <p className="font-semibold">{selectedTicket.itemName}</p>
              </div>
            )}

            {/* Description */}

            <div>
              <p className="text-sm text-gray-500">Description</p>

              <p className="text-sm bg-gray-50 p-3 rounded">
                {selectedTicket.description}
              </p>
            </div>

            {/* Image */}

            {selectedTicket.imageUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Attachment</p>

                <img
                  src={selectedTicket.imageUrl}
                  alt="Ticket attachment"
                  className="w-full max-h-64 object-contain rounded-lg border bg-gray-50"
                />
              </div>
            )}

            {/* =================================================
               CONVERSATION
            ================================================= */}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">Conversation</p>

                  <p className="text-xs text-gray-500">
                    Messages between customer and support
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {selectedTicket.messages.length}{' '}
                  {selectedTicket.messages.length === 1
                    ? 'message'
                    : 'messages'}
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedTicket.messages.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No messages yet.</p>

                    <p className="text-xs text-gray-400 mt-1">
                      Send a reply to start the conversation.
                    </p>
                  </div>
                ) : (
                  selectedTicket.messages.map((message) => {
                    const isAdmin = message.sender_type === 'ADMIN';

                    return (
                      <div
                        key={message.message_id}
                        className={`flex ${
                          isAdmin ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-4 py-3 ${
                            isAdmin
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <span
                              className={`text-xs font-semibold ${
                                isAdmin ? 'text-orange-100' : 'text-gray-500'
                              }`}
                            >
                              {isAdmin
                                ? 'Support'
                                : selectedTicket.customerName}
                            </span>

                            <span
                              className={`text-[10px] ${
                                isAdmin ? 'text-orange-100' : 'text-gray-400'
                              }`}
                            >
                              {formatMessageDate(message.created_at)}
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
            </div>

            {/* =================================================
              ADMIN REPLY
            ================================================= */}

            {selectedTicket.status !== 'closed' && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Reply to customer
                </p>

                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write a reply to the customer..."
                  maxLength={5000}
                  rows={4}
                  disabled={sendingReply}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-gray-100"
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {replyMessage.length}/5000
                  </span>

                  <button
                    type="button"
                    onClick={sendAdminReply}
                    disabled={sendingReply || !replyMessage.trim()}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}

            {selectedTicket.status === 'closed' && (
              <div className="pt-4 border-t">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700">
                    This ticket is closed.
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    No further replies can be sent.
                  </p>
                </div>
              </div>
            )}

            {/* Updated */}

            <div>
              <p className="text-xs text-gray-400">
                Last updated: {formatDate(selectedTicket.updatedAt)}
              </p>
            </div>

            
          </div>
        )}
      </Drawer>

      {/* ===================================================
          FEEDBACK DRAWER
      =================================================== */}

      <Drawer
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title={selectedFeedback ? `Feedback #${selectedFeedback.id}` : ''}
      >
        {selectedFeedback && (
          <div className="space-y-4">
            {/* Customer */}

            <div>
              <p className="text-sm text-gray-500">Customer</p>

              <p className="font-semibold">{selectedFeedback.customerName}</p>
            </div>

            {/* Cafe */}

            <div>
              <p className="text-sm text-gray-500">Cafe</p>

              <p className="font-semibold">{selectedFeedback.cafe}</p>
            </div>

            {/* Order */}

            <div>
              <p className="text-sm text-gray-500">Order</p>

              <p className="font-semibold">#{selectedFeedback.orderId}</p>
            </div>

            {/* Food Rating */}

            <div>
              <p className="text-sm text-gray-500">Food Rating</p>

              <p className="text-2xl">
                {getRatingStars(selectedFeedback.foodRating)}
              </p>

              <p className="text-sm text-gray-500">
                {selectedFeedback.foodRating} / 5
              </p>
            </div>

            {/* App Rating */}

            <div>
              <p className="text-sm text-gray-500">App Rating</p>

              <p className="text-2xl">
                {getRatingStars(selectedFeedback.appRating)}
              </p>

              <p className="text-sm text-gray-500">
                {selectedFeedback.appRating} / 5
              </p>
            </div>

            {/* Comments */}

            {selectedFeedback.comments && (
              <div>
                <p className="text-sm text-gray-500">Comments</p>

                <p className="text-sm bg-gray-50 p-3 rounded">
                  {selectedFeedback.comments}
                </p>
              </div>
            )}

            {/* Submitted */}

            <div className="text-xs text-gray-400 pt-2">
              Submitted: {formatDate(selectedFeedback.createdAt)}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TicketsAndFeedback;