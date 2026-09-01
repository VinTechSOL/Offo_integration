import React, {
  useEffect,
  useState,
} from "react";

import {
  getVendorTickets,
  getVendorTicket,
  createVendorTicket,
  createVendorTicketMessage,
  getVendorFeedback,
  type VendorTicket,
  type VendorTicketDetail,
  type VendorFeedback,
  type SeverityLevel,
  type TicketStatus,
} from "../apis/support";

/* =========================================================
   ISSUE CATEGORIES
========================================================= */

const ISSUE_CATEGORIES = [
  {
    label: "Software & App Bug",
    subtext:
      "App crashing, orders not showing up, delay in status sync",
  },
  {
    label: "Menu & Stock Management",
    subtext:
      "Unable to mark items out-of-stock, price updates",
  },
  {
    label: "Payouts & Settlement",
    subtext:
      "Discrepancy in weekly payout, missing refund adjustments",
  },
  {
    label: "Order / Customer Dispute",
    subtext:
      "Customer cancelled late, wrong pickup tag",
  },
  {
    label: "General Operations / Training",
    subtext:
      "Staff onboarding request, extra supplies",
  },
];

/* =========================================================
   SEVERITY LEVELS
========================================================= */

const SEVERITY_LEVELS: {
  level: SeverityLevel;
  icon: string;
  title: string;
  description: string;
  activeBg: string;
}[] = [
  {
    level: "CRITICAL",
    icon: "🔴",
    title: "Critical",
    description:
      "Live counter stopped / Cannot process orders right now.",
    activeBg:
      "bg-red-50 border-red-500",
  },
  {
    level: "HIGH",
    icon: "🟠",
    title: "High",
    description:
      "System sluggish / Specific feature or payment method failing.",
    activeBg:
      "bg-orange-50 border-orange-500",
  },
  {
    level: "NORMAL",
    icon: "🟡",
    title: "Normal",
    description:
      "Non-urgent query, menu update request, settlement question.",
    activeBg:
      "bg-yellow-50 border-yellow-500",
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export const TicketsAndFeedback: React.FC = () => {
  /* =======================================================
     TABS
  ======================================================= */

  const [activeTab, setActiveTab] = useState<
    "tickets" | "feedback"
  >("tickets");

  /* =======================================================
     CREATE TICKET FORM
  ======================================================= */

  const [showRaiseForm, setShowRaiseForm] =
    useState(false);

  const [issueCategory, setIssueCategory] =
    useState(
      ISSUE_CATEGORIES[0].label
    );

  const [severity, setSeverity] =
    useState<SeverityLevel>("NORMAL");

  const [affectedOrderIds, setAffectedOrderIds] =
    useState("");

  const [issueTitle, setIssueTitle] =
    useState("");

  const [
    detailedDescription,
    setDetailedDescription,
  ] = useState("");

  /* =======================================================
     TICKET IMAGE
  ======================================================= */

  const [ticketImage, setTicketImage] =
    useState<File | null>(null);

  const [
    ticketImagePreview,
    setTicketImagePreview,
  ] = useState<string | null>(null);

  /* =======================================================
     API DATA
  ======================================================= */

  const [tickets, setTickets] =
    useState<VendorTicket[]>([]);

  const [feedbacks, setFeedbacks] =
    useState<VendorFeedback[]>([]);

  /* =======================================================
     LOADING STATES
  ======================================================= */

  const [loadingTickets, setLoadingTickets] =
    useState(true);

  const [loadingFeedback, setLoadingFeedback] =
    useState(true);

  const [loadingTicketDetail, setLoadingTicketDetail] =
    useState(false);

  const [submittingTicket, setSubmittingTicket] =
    useState(false);

  const [sendingReply, setSendingReply] =
    useState(false);

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  /* =======================================================
     ERROR
  ======================================================= */

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     SELECTED DRAWERS
  ======================================================= */

  const [
    selectedTicket,
    setSelectedTicket,
  ] = useState<VendorTicketDetail | null>(null);

  const [
    selectedFeedback,
    setSelectedFeedback,
  ] = useState<VendorFeedback | null>(null);

  /* =======================================================
     REPLY
  ======================================================= */

  const [replyText, setReplyText] =
    useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setError(null);

    try {
      setLoadingTickets(true);
      setLoadingFeedback(true);

      const [
        ticketsData,
        feedbackData,
      ] = await Promise.all([
        getVendorTickets(),
        getVendorFeedback(),
      ]);

      setTickets(ticketsData);
      setFeedbacks(feedbackData);
    } catch (err) {
      console.error(
        "Failed to load support data:",
        err
      );

      setError(
        "Unable to load support information. Please try again."
      );
    } finally {
      setLoadingTickets(false);
      setLoadingFeedback(false);
    }
  };

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  const handleTicketImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only JPG, PNG and WEBP images are allowed."
      );

      e.target.value = "";
      return;
    }

    const maxSize = 400 * 1024;

    if (file.size > maxSize) {
      alert(
        "Maximum image size is 400 KB."
      );

      e.target.value = "";
      return;
    }

    if (ticketImagePreview) {
      URL.revokeObjectURL(
        ticketImagePreview
      );
    }

    setTicketImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setTicketImagePreview(
      previewUrl
    );
  };

  const handleRemoveTicketImage = () => {
    if (ticketImagePreview) {
      URL.revokeObjectURL(
        ticketImagePreview
      );
    }

    setTicketImage(null);
    setTicketImagePreview(null);
  };

  /* =======================================================
     CREATE TICKET
  ======================================================= */

  const handleCreateTicket = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !issueTitle.trim() ||
      !detailedDescription.trim()
    ) {
      alert(
        "Please fill in all required fields."
      );

      return;
    }

    if (submittingTicket) {
      return;
    }

    try {
      setSubmittingTicket(true);

      const createdTicket =
        await createVendorTicket({
          category: issueCategory,

          severity,

          affected_order_ids:
            affectedOrderIds.trim() ||
            undefined,

          subject: issueTitle.trim(),

          description:
            detailedDescription.trim(),

          image: ticketImage,
        });

      /*
       * Add the newly created ticket to
       * the beginning of the list.
       */
      setTickets((prev) => [
        createdTicket,
        ...prev,
      ]);

      /* Close form */
      setShowRaiseForm(false);

      /* Reset form */
      setIssueCategory(
        ISSUE_CATEGORIES[0].label
      );

      setSeverity("NORMAL");

      setAffectedOrderIds("");

      setIssueTitle("");

      setDetailedDescription("");

      handleRemoveTicketImage();

      setShowSuccessPopup(true);
    } catch (err) {
      console.error(
        "Failed to create vendor ticket:",
        err
      );

      alert(
        "Unable to raise support ticket. Please try again."
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  /* =======================================================
     OPEN TICKET DETAIL
  ======================================================= */

  const handleOpenTicket = async (
    ticket: VendorTicket
  ) => {
    if (loadingTicketDetail) {
      return;
    }

    try {
      setLoadingTicketDetail(true);

      const detail =
        await getVendorTicket(
          ticket.vendor_ticket_id
        );

      setSelectedTicket(detail);

      setReplyText("");
    } catch (err) {
      console.error(
        "Failed to load ticket details:",
        err
      );

      alert(
        "Unable to load ticket details. Please try again."
      );
    } finally {
      setLoadingTicketDetail(false);
    }
  };

  /* =======================================================
     SEND VENDOR REPLY
  ======================================================= */

  const handleSendVendorReply =
    async () => {
      if (
        !selectedTicket ||
        !replyText.trim() ||
        sendingReply
      ) {
        return;
      }

      try {
        setSendingReply(true);

        const message =
          await createVendorTicketMessage(
            selectedTicket.vendor_ticket_id,
            replyText.trim()
          );

        /*
         * Update drawer immediately.
         */
        const updatedTicket: VendorTicketDetail =
          {
            ...selectedTicket,

            updated_at:
              message.created_at,

            messages: [
              ...selectedTicket.messages,
              message,
            ],
          };

        setSelectedTicket(
          updatedTicket
        );

        /*
         * Update list timestamp.
         */
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.vendor_ticket_id ===
            updatedTicket.vendor_ticket_id
              ? {
                  ...ticket,
                  updated_at:
                    updatedTicket.updated_at,
                }
              : ticket
          )
        );

        setReplyText("");
      } catch (err) {
        console.error(
          "Failed to send vendor reply:",
          err
        );

        alert(
          "Unable to send reply. Please try again."
        );
      } finally {
        setSendingReply(false);
      }
    };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    dateStr: string
  ) => {
    if (!dateStr) {
      return "-";
    }

    const d = new Date(dateStr);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString(
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
     STATUS BADGE
  ======================================================= */

  const getStatusBadge = (
    status: TicketStatus
  ) => {
    switch (status) {
      case "open":
        return (
          <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold">
            OPEN
          </span>
        );

      case "in-progress":
        return (
          <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
            IN PROGRESS
          </span>
        );

      case "resolved":
        return (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold">
            RESOLVED
          </span>
        );

      case "closed":
        return (
          <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-bold">
            CLOSED
          </span>
        );

      default:
        return null;
    }
  };

  /* =======================================================
     SEVERITY BADGE
  ======================================================= */

  const getSeverityBadge = (
    level: SeverityLevel
  ) => {
    switch (level) {
      case "CRITICAL":
        return (
          <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
            🔴 Critical
          </span>
        );

      case "HIGH":
        return (
          <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
            🟠 High
          </span>
        );

      case "NORMAL":
        return (
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
            🟡 Normal
          </span>
        );

      default:
        return null;
    }
  };

  /* =======================================================
     STAR RENDER
  ======================================================= */

  const renderStars = (
    rating: number
  ) => {
    return (
      "⭐".repeat(rating) +
      "☆".repeat(5 - rating)
    );
  };

  /* =======================================================
     SUMMARY COUNTS
  ======================================================= */

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "open"
    ).length;

  const inProgressTickets =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "in-progress"
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* =====================================================
          GLOBAL ERROR
      ===================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>

          <button
            onClick={loadSupportData}
            className="font-semibold underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          HEADER / SUMMARY BAR
      ===================================================== */}

      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            Open Tickets
          </p>

          <p className="text-2xl font-bold text-red-400 mt-1">
            {loadingTickets ? '—' : openTickets}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            In Progress
          </p>

          <p className="text-2xl font-bold text-amber-400 mt-1">
            {loadingTickets ? '—' : inProgressTickets}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            Total Tickets
          </p>

          <p className="text-2xl font-bold text-white mt-1">
            {loadingTickets ? '—' : tickets.length}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
            User Reviews
          </p>

          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {loadingFeedback ? '—' : feedbacks.length}
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ===================================================
            TABS
        =================================================== */}

        <div className="border-b border-gray-200 bg-gray-50/50 px-6 pt-4 flex items-center justify-between">
          <div className="flex gap-8">
            <button
              onClick={() => {
                setActiveTab('tickets');

                setShowRaiseForm(false);
              }}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'tickets'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Support Tickets ({loadingTickets ? '...' : tickets.length})
            </button>

            <button
              onClick={() => {
                setActiveTab('feedback');

                setShowRaiseForm(false);
              }}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'feedback'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Customer Feedbacks ({loadingFeedback ? '...' : feedbacks.length})
            </button>
          </div>

          {activeTab === 'tickets' && !showRaiseForm && (
            <button
              onClick={() => setShowRaiseForm(true)}
              className="mb-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg transition shadow-sm"
            >
              + Raise New Ticket
            </button>
          )}
        </div>

        {/* ===================================================
            TAB 1: TICKETS
        =================================================== */}

        {activeTab === 'tickets' && (
          <div>
            {/* =================================================
                CREATE TICKET FORM
            ================================================= */}

            {showRaiseForm ? (
              <div className="p-6 max-w-3xl space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Raise Support Ticket
                    </h2>

                    <p className="text-xs text-gray-500 mt-0.5">
                      Submit an issue to technical support & platform admins
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRaiseForm(false)}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-5">
                  {/* =========================================
                      CATEGORY
                  ========================================= */}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Issue Category
                    </label>

                    <div className="space-y-2">
                      {ISSUE_CATEGORIES.map((cat) => (
                        <label
                          key={cat.label}
                          className={`flex items-start p-3 border rounded-lg cursor-pointer transition ${
                            issueCategory === cat.label
                              ? 'border-orange-500 bg-orange-50/40'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={issueCategory === cat.label}
                            onChange={() => setIssueCategory(cat.label)}
                            className="mt-1 text-orange-500 focus:ring-orange-500"
                          />

                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {cat.label}
                            </p>

                            <p className="text-xs text-gray-500">
                              {cat.subtext}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* =========================================
                      SEVERITY
                  ========================================= */}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Severity Level (Urgency)
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {SEVERITY_LEVELS.map((item) => (
                        <div
                          key={item.level}
                          onClick={() => setSeverity(item.level)}
                          className={`p-3 border-2 rounded-xl cursor-pointer transition ${
                            severity === item.level
                              ? item.activeBg
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                            <span>{item.icon}</span>

                            <span>{item.title}</span>
                          </div>

                          <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* =========================================
                      AFFECTED ORDERS
                  ========================================= */}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Affected Order ID(s){' '}
                      <span className="font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      placeholder="#ORD-9402, #ORD-9405"
                      value={affectedOrderIds}
                      onChange={(e) => setAffectedOrderIds(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* =========================================
                      SUBJECT
                  ========================================= */}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Issue Title / Subject{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      placeholder='e.g., "Printer not outputting order slips"'
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* =========================================
                      DESCRIPTION
                  ========================================= */}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Detailed Description{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <span
                        className={`text-xs font-medium ${
                          detailedDescription.length > 0 &&
                          detailedDescription.trim().length < 10
                            ? 'text-red-500 font-semibold'
                            : 'text-gray-400'
                        }`}
                      >
                        {detailedDescription.trim().length}/10 min characters
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      placeholder="What happened, and what error message did you see?"
                      value={detailedDescription}
                      onChange={(e) => setDetailedDescription(e.target.value)}
                      required
                      className={`w-full rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none ${
                        detailedDescription.length > 0 &&
                        detailedDescription.trim().length < 10
                          ? 'border-2 border-red-400 bg-red-50/30 text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                      }`}
                    />

                    {/* Error Message & Helper Note */}
                    {detailedDescription.length > 0 &&
                    detailedDescription.trim().length < 10 ? (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
                        <svg
                          className="w-3.5 h-3.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Please enter at least{' '}
                        {10 - detailedDescription.trim().length} more character
                        {10 - detailedDescription.trim().length === 1
                          ? ''
                          : 's'}
                        .
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-gray-500">
                        Minimum 10 characters required to help us understand the
                        issue.
                      </p>
                    )}
                  </div>

                  {/* =========================================
                      IMAGE
                  ========================================= */}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      Attach Image / Screenshot{' '}
                      <span className="font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>

                    <p className="text-[11px] text-gray-400 mb-2">
                      JPG, PNG or WEBP · Maximum 400 KB · One image
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleTicketImageUpload}
                      className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />

                    {ticketImagePreview && (
                      <div className="mt-3 relative w-24 h-24">
                        <img
                          src={ticketImagePreview}
                          alt="Ticket attachment"
                          className="w-full h-full object-cover rounded-lg border"
                        />

                        <button
                          type="button"
                          onClick={handleRemoveTicketImage}
                          className="absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* =========================================
                      FORM BUTTONS
                  ========================================= */}

                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowRaiseForm(false)}
                      disabled={submittingTicket}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submittingTicket}
                      className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition"
                    >
                      {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* =============================================
                 TICKET LIST
              ============================================= */

              <div>
                {loadingTickets ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="text-base font-medium">
                      Loading support tickets...
                    </div>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-base font-medium">
                      No tickets created yet.
                    </p>

                    <button
                      onClick={() => setShowRaiseForm(true)}
                      className="mt-3 text-xs font-semibold text-orange-600 underline"
                    >
                      Click here to raise your first ticket.
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.vendor_ticket_id}
                        onClick={() => handleOpenTicket(ticket)}
                        className="p-5 hover:bg-gray-50/80 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-sm text-gray-900">
                              {ticket.display_ticket_id}
                            </span>

                            {getStatusBadge(ticket.status)}

                            <span className="text-xs text-gray-400">
                              {ticket.category}
                            </span>
                          </div>

                          <p className="font-semibold text-gray-800 text-sm">
                            {ticket.subject}
                          </p>

                          <p className="text-xs text-gray-500 line-clamp-1">
                            {ticket.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 text-right">
                          <div className="text-xs text-gray-400">
                            <p>{formatDate(ticket.created_at)}</p>

                            <p className="mt-0.5">
                              Last updated {formatDate(ticket.updated_at)}
                            </p>
                          </div>

                          <span className="text-orange-500 font-semibold text-sm">
                            View →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            TAB 2: FEEDBACK
        =================================================== */}

        {activeTab === 'feedback' && (
          <div className="divide-y divide-gray-100">
            {loadingFeedback ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-base font-medium">
                  Loading customer feedback...
                </p>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-base font-medium">
                  No customer feedback available yet.
                </p>
              </div>
            ) : (
              feedbacks.map((feedback) => (
                <div
                  key={feedback.feedback_id}
                  onClick={() => setSelectedFeedback(feedback)}
                  className="p-5 hover:bg-gray-50/80 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-sm text-gray-900">
                        {feedback.display_feedback_id}
                      </span>

                      <span className="text-xs font-semibold text-gray-500">
                        Order {feedback.display_order_id}
                      </span>

                      <span className="text-xs text-gray-400">
                        {formatDate(feedback.created_at)}
                      </span>
                    </div>

                    <p className="font-semibold text-gray-800 text-sm">
                      {feedback.customer_name}
                    </p>

                    <p className="text-xs text-gray-600 italic">
                      "{feedback.comments || 'No comment provided.'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Food Rating:
                        <span className="text-amber-500 font-bold ml-1">
                          {renderStars(feedback.food_rating)}
                        </span>
                      </div>
                    </div>

                    <span className="text-orange-500 font-semibold text-sm">
                      View →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          TICKET DETAIL DRAWER
      ===================================================== */}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* ===============================================
                DRAWER HEADER
            =============================================== */}

            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedTicket.display_ticket_id}
                  </h3>

                  {getStatusBadge(selectedTicket.status)}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {selectedTicket.category}
                  </span>

                  <span className="text-gray-300">•</span>

                  {getSeverityBadge(selectedTicket.severity)}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedTicket(null);

                  setReplyText('');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* ===============================================
                DRAWER BODY
            =============================================== */}

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* SUBJECT */}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Subject
                </p>

                <p className="font-semibold text-gray-900 text-sm mt-0.5">
                  {selectedTicket.subject}
                </p>
              </div>

              {/* AFFECTED ORDERS */}

              {selectedTicket.affected_order_ids && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Affected Order(s)
                  </p>

                  <p className="font-medium text-gray-800 text-xs mt-0.5">
                    {selectedTicket.affected_order_ids}
                  </p>
                </div>
              )}

              {/* DESCRIPTION */}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Detailed Explanation
                </p>

                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* ATTACHED SCREENSHOT */}

              {selectedTicket.image_url && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                    Attached Screenshot
                  </p>

                  <a
                    href={selectedTicket.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:opacity-90 shadow-sm transition"
                  >
                    <img
                      src={selectedTicket.image_url}
                      alt="Ticket attachment"
                      className="w-full h-full object-cover"
                    />
                  </a>
                </div>
              )}

              {/* CONVERSATION */}

              <div className="pt-4 border-t border-gray-100">
                <p className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3">
                  Conversation Log
                </p>

                {selectedTicket.messages.length === 0 ? (
                  <p className="text-xs text-gray-400">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedTicket.messages.map((msg) => {
                      const isVendor = msg.sender_type === 'VENDOR';

                      return (
                        <div
                          key={msg.message_id}
                          className={`flex ${
                            isVendor ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs ${
                              isVendor
                                ? 'bg-orange-500 text-white rounded-br-none'
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-4 mb-1 opacity-80 text-[10px]">
                              <span className="font-bold">
                                {isVendor ? 'You (Vendor)' : 'Support Admin'}
                              </span>

                              <span>{formatDate(msg.created_at)}</span>
                            </div>

                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ===============================================
                REPLY BOX
            =============================================== */}

            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
              {selectedTicket.status === 'closed' ? (
                <div className="text-center text-xs text-gray-500 py-2">
                  This ticket is closed and can no longer receive replies.
                </div>
              ) : (
                <>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to support..."
                    disabled={sendingReply}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                  />

                  <div className="flex items-center justify-end">
                    <button
                      onClick={handleSendVendorReply}
                      disabled={!replyText.trim() || sendingReply}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-lg transition"
                    >
                      {sendingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FEEDBACK DETAIL DRAWER
      ===================================================== */}

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              {/* HEADER */}

              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    Feedback {selectedFeedback.display_feedback_id}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Submitted on {formatDate(selectedFeedback.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
                >
                  ✕
                </button>
              </div>

              {/* CUSTOMER */}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Customer Name
                </p>

                <p className="font-semibold text-gray-900 text-sm">
                  {selectedFeedback.customer_name}
                </p>
              </div>

              {/* ORDER */}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Order ID
                </p>

                <p className="font-semibold text-gray-900 text-sm">
                  {selectedFeedback.display_order_id}
                </p>
              </div>

              {/* FOOD RATING */}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Food Rating
                </p>

                <p className="text-lg text-amber-500 mt-0.5">
                  {renderStars(selectedFeedback.food_rating)}
                </p>
              </div>

              {/* COMMENTS */}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Customer Comments
                </p>

                <p className="text-xs bg-gray-50 border p-3 rounded-lg text-gray-700 mt-1 leading-relaxed">
                  {selectedFeedback.comments || 'No comment provided.'}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
    TICKET SUCCESS POPUP
===================================================== */}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900">
              Ticket Raised Successfully!
            </h2>

            {/* Message */}
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              Your support ticket has been raised successfully.
              <br />
              Kindly check back later. We will try to reply within{' '}
              <span className="font-semibold text-gray-900">
                4 business hours
              </span>
              .
            </p>

            {/* Button */}
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsAndFeedback;