import React, { useEffect, useMemo, useState } from 'react';
import Drawer from '../components/common/Drawer';

import {
  getAdminTicketsApi,
  getAdminTicketApi,
  getAdminFeedbackApi,
  updateTicketStatusApi,
  sendAdminTicketMessageApi,

  // Vendor ticket APIs
  getAdminVendorTicketsApi,
  getAdminVendorTicketApi,
  updateVendorTicketStatusApi,
  sendAdminVendorTicketMessageApi,

  type TicketStatus,
  type TicketMessage,
  type AdminVendorTicket,
  type AdminVendorTicketMessage,
} from '@/apis/support';

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

interface VendorTicket {
  id: string;
  vendorTicketId: number;
  vendorStaffId: number;
  vendorName: string;
  vendorUsername: string;
  cafe: string;
  branchName: string;
  cafeId?: number | null;
  branchId?: number | null;
  category: string;
  severity: string;
  affectedOrderIds?: string | null;
  subject: string;
  description: string;
  imageUrl?: string | null;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: AdminVendorTicketMessage[];
}

/* =========================================================
   COMPONENT
========================================================= */

export const TicketsAndFeedback: React.FC = () => {
  /* =======================================================
     STATE
  ======================================================= */

  const [activeTab, setActiveTab] = useState<
    'tickets' | 'feedback' | 'vendor-tickets'
  >('tickets');

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [selectedVendorTicket, setSelectedVendorTicket] = useState<VendorTicket | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [vendorReplyMessage, setVendorReplyMessage] = useState('');

  const [sendingReply, setSendingReply] = useState(false);
  const [sendingVendorReply, setSendingVendorReply] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TicketStatus>('all');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [vendorTickets, setVendorTickets] = useState<VendorTicket[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null);
  const [updatingVendorTicketId, setUpdatingVendorTicketId] = useState<number | null>(null);

  const [ticketDetailLoading, setTicketDetailLoading] = useState(false);
  const [vendorTicketDetailLoading, setVendorTicketDetailLoading] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadSupportData = async () => {
    try {
      setLoading(true);
      setError('');

      const [ticketsResponse, feedbackResponse, vendorTicketsResponse] =
        await Promise.all([
          getAdminTicketsApi(),
          getAdminFeedbackApi(),
          getAdminVendorTicketsApi(),
        ]);

      const mappedTickets: Ticket[] = ticketsResponse.map((ticket) => ({
        id: ticket.display_ticket_id ?? `TKT-${ticket.ticket_id}`,
        ticketId: ticket.ticket_id,
        orderId: ticket.display_order_id ?? String(ticket.order_id),
        orderNumericId: ticket.order_id,
        cafe: ticket.cafe_name ?? 'Cafe',
        customerName: ticket.customer_name ?? 'Customer',
        issueType: ticket.issue_type,
        description: ticket.description,
        itemName: ticket.item_name ?? undefined,
        status: ticket.status,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        imageUrl: ticket.image_url ?? null,
        messages: ticket.messages ?? [],
      }));

      const mappedFeedbacks: Feedback[] = feedbackResponse.map((feedback) => ({
        id: feedback.display_feedback_id ?? `FB-${feedback.feedback_id}`,
        feedbackId: feedback.feedback_id,
        orderId: feedback.display_order_id ?? String(feedback.order_id),
        orderNumericId: feedback.order_id,
        cafe: feedback.cafe_name ?? 'Cafe',
        customerName: feedback.customer_name ?? 'Customer',
        foodRating: feedback.food_rating,
        appRating: feedback.app_rating,
        comments: feedback.comments ?? '',
        createdAt: feedback.created_at,
      }));

      const mappedVendorTickets: VendorTicket[] = vendorTicketsResponse.map(
        (ticket) => ({
          id: ticket.display_ticket_id ?? `TKT-${ticket.vendor_ticket_id}`,
          vendorTicketId: ticket.vendor_ticket_id,
          vendorStaffId: ticket.vendor_staff_id,
          vendorName: ticket.vendor_name ?? 'Vendor',
          vendorUsername: ticket.vendor_username ?? '',
          cafe: ticket.cafe_name ?? 'Cafe',
          branchName: ticket.branch_name ?? ticket.cafe_name ?? 'Branch',
          cafeId: ticket.cafe_id ?? null,
          branchId: ticket.branch_id ?? null,
          category: ticket.category,
          severity: ticket.severity,
          affectedOrderIds: ticket.affected_order_ids ?? null,
          subject: ticket.subject,
          description: ticket.description,
          imageUrl: ticket.image_url ?? null,
          status: ticket.status,
          createdAt: ticket.created_at,
          updatedAt: ticket.updated_at,
          messages: ticket.messages ?? [],
        }),
      );

      setTickets(mappedTickets);
      setFeedbacks(mappedFeedbacks);
      setVendorTickets(mappedVendorTickets);
    } catch (err) {
      console.error('Failed to load tickets, feedback and vendor tickets:', err);
      setError('Failed to load support data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, []);

  /* =======================================================
     HELPERS & FORMATTERS
  ======================================================= */

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'NORMAL':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const updateTicketStatus = async (ticket: Ticket, newStatus: TicketStatus) => {
    if (ticket.status === newStatus || updatingTicketId !== null) return;
    try {
      setUpdatingTicketId(ticket.ticketId);
      await updateTicketStatusApi(ticket.ticketId, newStatus);
      const updatedAt = new Date().toISOString();

      setTickets((prev) =>
        prev.map((item) =>
          item.ticketId === ticket.ticketId
            ? { ...item, status: newStatus, updatedAt }
            : item,
        ),
      );

      setSelectedTicket((current) => {
        if (!current || current.ticketId !== ticket.ticketId) return current;
        return { ...current, status: newStatus, updatedAt };
      });
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      alert('Failed to update ticket status. Please try again.');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const updateVendorTicketStatus = async (ticket: VendorTicket, newStatus: TicketStatus) => {
    if (ticket.status === newStatus || updatingVendorTicketId !== null) return;
    try {
      setUpdatingVendorTicketId(ticket.vendorTicketId);
      await updateVendorTicketStatusApi(ticket.vendorTicketId, newStatus);
      const updatedAt = new Date().toISOString();

      setVendorTickets((prev) =>
        prev.map((item) =>
          item.vendorTicketId === ticket.vendorTicketId
            ? { ...item, status: newStatus, updatedAt }
            : item,
        ),
      );

      setSelectedVendorTicket((current) => {
        if (!current || current.vendorTicketId !== ticket.vendorTicketId) return current;
        return { ...current, status: newStatus, updatedAt };
      });
    } catch (err) {
      console.error('Failed to update vendor ticket status:', err);
      alert('Failed to update vendor ticket status. Please try again.');
    } finally {
      setUpdatingVendorTicketId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingStars = (rating: number) => {
    const safeRating = Math.max(0, Math.min(5, rating));
    return '⭐'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  const filteredTickets = useMemo(() => {
    let list = tickets;
    if (filterStatus !== 'all') {
      list = list.filter((ticket) => ticket.status === filterStatus);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (ticket) =>
          ticket.customerName.toLowerCase().includes(query) ||
          ticket.id.toLowerCase().includes(query) ||
          ticket.orderId.toLowerCase().includes(query) ||
          ticket.cafe.toLowerCase().includes(query) ||
          ticket.issueType.toLowerCase().includes(query),
      );
    }
    return list;
  }, [tickets, filterStatus, searchQuery]);

  const filteredFeedbacks = useMemo(() => {
    let list = feedbacks;
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (feedback) =>
          feedback.customerName.toLowerCase().includes(query) ||
          feedback.id.toLowerCase().includes(query) ||
          feedback.orderId.toLowerCase().includes(query) ||
          feedback.cafe.toLowerCase().includes(query),
      );
    }
    return list;
  }, [feedbacks, searchQuery]);

  const filteredVendorTickets = useMemo(() => {
    let list = vendorTickets;
    if (filterStatus !== 'all') {
      list = list.filter((ticket) => ticket.status === filterStatus);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (ticket) =>
          ticket.vendorName.toLowerCase().includes(query) ||
          ticket.vendorUsername.toLowerCase().includes(query) ||
          ticket.id.toLowerCase().includes(query) ||
          ticket.cafe.toLowerCase().includes(query) ||
          ticket.branchName.toLowerCase().includes(query) ||
          ticket.category.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query),
      );
    }
    return list;
  }, [vendorTickets, filterStatus, searchQuery]);

  /* =======================================================
     DRAWER ACTIONS
  ======================================================= */

  const openTicket = async (ticket: Ticket) => {
    try {
      setSelectedTicket(ticket);
      setSelectedFeedback(null);
      setSelectedVendorTicket(null);
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

  const openVendorTicket = async (ticket: VendorTicket) => {
    try {
      setSelectedVendorTicket(ticket);
      setSelectedTicket(null);
      setSelectedFeedback(null);
      setVendorReplyMessage('');
      setVendorTicketDetailLoading(true);

      const detail = await getAdminVendorTicketApi(ticket.vendorTicketId);

      setSelectedVendorTicket({
        ...ticket,
        vendorName: detail.vendor_name ?? ticket.vendorName,
        vendorUsername: detail.vendor_username ?? ticket.vendorUsername,
        cafe: detail.cafe_name ?? ticket.cafe,
        branchName: detail.branch_name ?? ticket.branchName,
        messages: detail.messages ?? [],
        updatedAt: detail.updated_at,
      });
    } catch (err) {
      console.error('Failed to load vendor ticket details:', err);
      alert('Failed to load vendor ticket details. Please try again.');
    } finally {
      setVendorTicketDetailLoading(false);
    }
  };

  const sendAdminReply = async () => {
    if (!selectedTicket) return;
    const message = replyMessage.trim();
    if (!message || sendingReply) return;

    if (selectedTicket.status === 'closed') {
      alert('This ticket is closed and cannot receive new replies.');
      return;
    }

    try {
      setSendingReply(true);
      const createdMessage = await sendAdminTicketMessageApi(selectedTicket.ticketId, message);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.ticketId === selectedTicket.ticketId
            ? {
                ...ticket,
                messages: [...ticket.messages, createdMessage],
                updatedAt: createdMessage.created_at,
              }
            : ticket,
        ),
      );

      setSelectedTicket((current) => {
        if (!current || current.ticketId !== selectedTicket.ticketId) return current;
        return {
          ...current,
          messages: [...current.messages, createdMessage],
          updatedAt: createdMessage.created_at,
        };
      });

      setReplyMessage('');
    } catch (err) {
      console.error('Failed to send ticket reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const sendVendorAdminReply = async () => {
    if (!selectedVendorTicket) return;
    const message = vendorReplyMessage.trim();
    if (!message || sendingVendorReply) return;

    if (selectedVendorTicket.status === 'closed') {
      alert('This vendor ticket is closed and cannot receive new replies.');
      return;
    }

    try {
      setSendingVendorReply(true);
      const createdMessage = await sendAdminVendorTicketMessageApi(
        selectedVendorTicket.vendorTicketId,
        message,
      );

      setVendorTickets((prev) =>
        prev.map((ticket) =>
          ticket.vendorTicketId === selectedVendorTicket.vendorTicketId
            ? {
                ...ticket,
                messages: [...ticket.messages, createdMessage],
                updatedAt: createdMessage.created_at,
              }
            : ticket,
        ),
      );

      setSelectedVendorTicket((current) => {
        if (!current || current.vendorTicketId !== selectedVendorTicket.vendorTicketId) return current;
        return {
          ...current,
          messages: [...current.messages, createdMessage],
          updatedAt: createdMessage.created_at,
        };
      });

      setVendorReplyMessage('');
    } catch (err) {
      console.error('Failed to send vendor ticket reply:', err);
      alert('Failed to send vendor reply. Please try again.');
    } finally {
      setSendingVendorReply(false);
    }
  };

  const changeTab = (tab: 'tickets' | 'feedback' | 'vendor-tickets') => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedTicket(null);
    setSelectedFeedback(null);
    setSelectedVendorTicket(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ===================================================
          SUPPORT OVERVIEW METRICS - BULGY SIDES
      =================================================== */}
      <div className="bg-black rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl space-y-8">
        {/* --- USER TICKETS SECTION --- */}
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">
            User Tickets
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Total</p>
              <p className="text-3xl font-bold mt-2 text-white">{tickets.length}</p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Open</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {tickets.filter((t) => t.status === 'open').length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">In Progress</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {tickets.filter((t) => t.status === 'in-progress').length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Resolved</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {tickets.filter((t) => t.status === 'resolved').length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Closed</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {tickets.filter((t) => t.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* --- VENDOR TICKETS SECTION --- */}
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">
            Vendor Tickets
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Total</p>
              <p className="text-3xl font-bold mt-2 text-white">{vendorTickets.length}</p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Open</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {vendorTickets.filter((vt) => vt.status === 'open').length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">In Progress</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {vendorTickets.filter((vt) => vt.status === 'in-progress').length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Resolved</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {vendorTickets.filter((vt) => vt.status === 'resolved').length}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-400 tracking-wide">Closed</p>
              <p className="text-3xl font-bold mt-2 text-white">
                {vendorTickets.filter((vt) => vt.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          MAIN CONTENT AREA
      =================================================== */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* TABS */}
        <div className="border-b px-6 py-4 flex gap-8 overflow-x-auto">
          <button
            onClick={() => changeTab('tickets')}
            className={`font-bold whitespace-nowrap pb-2 transition-colors ${
              activeTab === 'tickets'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            User Tickets ({tickets.length})
          </button>

          <button
            onClick={() => changeTab('feedback')}
            className={`font-bold whitespace-nowrap pb-2 transition-colors ${
              activeTab === 'feedback'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Feedback ({feedbacks.length})
          </button>

          <button
            onClick={() => changeTab('vendor-tickets')}
            className={`font-bold whitespace-nowrap pb-2 transition-colors ${
              activeTab === 'vendor-tickets'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Vendor Tickets ({vendorTickets.length})
          </button>
        </div>

        {/* FILTERS */}
        <div className="border-b bg-gray-50/50 p-4 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder={
              activeTab === 'vendor-tickets'
                ? 'Search ticket / vendor / cafe / branch'
                : 'Search ID / Name / Cafe'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm flex-1 min-w-[200px] bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {(activeTab === 'tickets' || activeTab === 'vendor-tickets') && (
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as 'all' | TicketStatus)
              }
              className="border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3">
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

        {/* LOADING & CONTENT LISTS */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Loading support data...</p>
          </div>
        ) : (
          <div>
            {/* USER TICKETS TAB */}
            {activeTab === 'tickets' && (
              <div className="divide-y">
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
                      className="px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => openTicket(ticket)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                        <div>
                          <p className="font-bold text-gray-900">#{ticket.id}</p>
                          <p className="font-semibold text-gray-700">{ticket.customerName}</p>
                          <p className="text-xs text-gray-500">{ticket.cafe}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {ticket.issueType}
                          </p>
                          <p className="text-xs text-gray-500">
                            Order #{ticket.orderId}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(
                              ticket.status,
                            )}`}
                          >
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>

                        <div className="text-right md:text-left text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </div>

                        <div className="text-sm text-gray-500 truncate">
                          {ticket.description}
                        </div>

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

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
              <div className="divide-y">
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
                      className="px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => setSelectedFeedback(feedback)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                        <div>
                          <p className="font-bold text-gray-900">#{feedback.id}</p>
                          <p className="font-semibold text-gray-700">
                            {feedback.customerName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {feedback.cafe}
                          </p>
                        </div>

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

                        <div>
                          <p className="text-xs text-gray-500">
                            Order #{feedback.orderId}
                          </p>
                        </div>

                        <div className="text-right md:text-left text-sm text-gray-500">
                          {formatDate(feedback.createdAt)}
                        </div>

                        <div className="text-sm text-gray-500 truncate">
                          {feedback.comments || 'No comments'}
                        </div>

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

            {/* VENDOR TICKETS TAB */}
            {activeTab === 'vendor-tickets' && (
              <div className="divide-y">
                {filteredVendorTickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No vendor tickets found</p>
                    <p className="text-sm mt-1">
                      Support tickets raised by vendors will appear here.
                    </p>
                  </div>
                ) : (
                  filteredVendorTickets.map((ticket) => (
                    <div
                      key={ticket.vendorTicketId}
                      className="px-6 py-5 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => openVendorTicket(ticket)}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-5 items-center">
                        <div>
                          <p className="font-bold text-gray-900">#{ticket.id}</p>
                          <p className="font-semibold text-gray-700">{ticket.vendorName}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.vendorUsername}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800">{ticket.cafe}</p>
                          <p className="text-xs text-gray-500">
                            {ticket.branchName}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {ticket.category}
                          </p>
                          <span
                            className={`inline-block mt-1 text-[10px] px-2 py-1 rounded-full font-bold ${getSeverityColor(
                              ticket.severity,
                            )}`}
                          >
                            {ticket.severity}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {ticket.description}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(
                              ticket.status,
                            )}`}
                          >
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {formatDate(ticket.createdAt)}
                        </div>

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
          </div>
        )}
      </div>

      {/* ===================================================
          USER TICKET DRAWER
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

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {(
                  ['open', 'in-progress', 'resolved', 'closed'] as TicketStatus[]
                ).map((status) => {
                  const isCurrent = selectedTicket.status === status;
                  const isUpdating = updatingTicketId === selectedTicket.ticketId;

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
                        isCurrent || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUpdating ? 'Updating...' : getStatusLabel(status)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-semibold">{selectedTicket.customerName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Cafe</p>
              <p className="font-semibold">{selectedTicket.cafe}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Order</p>
              <p className="font-semibold">#{selectedTicket.orderId}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Issue Type</p>
              <p className="font-semibold">{selectedTicket.issueType}</p>
            </div>

            {selectedTicket.itemName && (
              <div>
                <p className="text-sm text-gray-500">Item</p>
                <p className="font-semibold">{selectedTicket.itemName}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm bg-gray-50 p-3 rounded">
                {selectedTicket.description}
              </p>
            </div>

            {selectedTicket.imageUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Attachment</p>
                <a
                  href={selectedTicket.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={selectedTicket.imageUrl}
                    alt="Ticket attachment"
                    className="w-full max-h-64 object-contain rounded-lg border bg-gray-50"
                  />
                </a>
              </div>
            )}

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
                  {selectedTicket.messages.length === 1 ? 'message' : 'messages'}
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedTicket.messages.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No messages yet.</p>
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
                              {isAdmin ? 'Support' : selectedTicket.customerName}
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

            <div>
              <p className="text-xs text-gray-400">
                Last updated: {formatDate(selectedTicket.updatedAt)}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* ===================================================
          VENDOR TICKET DRAWER
      =================================================== */}
      <Drawer
        isOpen={!!selectedVendorTicket}
        onClose={() => setSelectedVendorTicket(null)}
        title={
          selectedVendorTicket
            ? `Vendor Ticket #${selectedVendorTicket.id}`
            : ''
        }
      >
        {selectedVendorTicket && (
          <div className="space-y-4">
            {vendorTicketDetailLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                Loading conversation...
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getStatusColor(
                    selectedVendorTicket.status,
                  )}`}
                >
                  {getStatusLabel(selectedVendorTicket.status)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(selectedVendorTicket.createdAt)}
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {(
                  ['open', 'in-progress', 'resolved', 'closed'] as TicketStatus[]
                ).map((status) => {
                  const isCurrent = selectedVendorTicket.status === status;
                  const isUpdating =
                    updatingVendorTicketId === selectedVendorTicket.vendorTicketId;

                  return (
                    <button
                      key={status}
                      disabled={isCurrent || isUpdating}
                      onClick={() =>
                        updateVendorTicketStatus(selectedVendorTicket, status)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        status === 'open'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : status === 'resolved'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${
                        isCurrent || isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isUpdating ? 'Updating...' : getStatusLabel(status)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="font-semibold">{selectedVendorTicket.vendorName}</p>
              {selectedVendorTicket.vendorUsername && (
                <p className="text-xs text-gray-500">
                  {selectedVendorTicket.vendorUsername}
                </p>
              )}
            </div>


            <div>
              <p className="text-sm text-gray-500">Branch</p>
              <p className="font-semibold">{selectedVendorTicket.branchName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold">{selectedVendorTicket.category}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Severity</p>
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${getSeverityColor(
                  selectedVendorTicket.severity,
                )}`}
              >
                {selectedVendorTicket.severity}
              </span>
            </div>

            {selectedVendorTicket.affectedOrderIds && (
              <div>
                <p className="text-sm text-gray-500">Affected Orders</p>
                <p className="font-semibold text-sm">
                  {selectedVendorTicket.affectedOrderIds}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-semibold">{selectedVendorTicket.subject}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm bg-gray-50 p-3 rounded">
                {selectedVendorTicket.description}
              </p>
            </div>

            {selectedVendorTicket.imageUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Attachment</p>
                <a
                  href={selectedVendorTicket.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={selectedVendorTicket.imageUrl}
                    alt="Vendor ticket attachment"
                    className="w-full max-h-64 object-contain rounded-lg border bg-gray-50"
                  />
                </a>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">Conversation</p>
                  <p className="text-xs text-gray-500">
                    Messages between vendor and support
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {selectedVendorTicket.messages.length}{' '}
                  {selectedVendorTicket.messages.length === 1 ? 'message' : 'messages'}
                </span>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedVendorTicket.messages.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No messages yet.</p>
                  </div>
                ) : (
                  selectedVendorTicket.messages.map((message) => {
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
                                : selectedVendorTicket.vendorName}
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

            {selectedVendorTicket.status !== 'closed' && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Reply to vendor
                </p>
                <textarea
                  value={vendorReplyMessage}
                  onChange={(e) => setVendorReplyMessage(e.target.value)}
                  placeholder="Write a reply to the vendor..."
                  maxLength={5000}
                  rows={4}
                  disabled={sendingVendorReply}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 disabled:bg-gray-100"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {vendorReplyMessage.length}/5000
                  </span>
                  <button
                    type="button"
                    onClick={sendVendorAdminReply}
                    disabled={sendingVendorReply || !vendorReplyMessage.trim()}
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {sendingVendorReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            )}

            {selectedVendorTicket.status === 'closed' && (
              <div className="pt-4 border-t">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700">
                    This vendor ticket is closed.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No further replies can be sent.
                  </p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400">
                Last updated: {formatDate(selectedVendorTicket.updatedAt)}
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
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-semibold">{selectedFeedback.customerName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Cafe</p>
              <p className="font-semibold">{selectedFeedback.cafe}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Order</p>
              <p className="font-semibold">#{selectedFeedback.orderId}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Food Rating</p>
              <p className="text-2xl">
                {getRatingStars(selectedFeedback.foodRating)}
              </p>
              <p className="text-sm text-gray-500">
                {selectedFeedback.foodRating} / 5
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">App Rating</p>
              <p className="text-2xl">
                {getRatingStars(selectedFeedback.appRating)}
              </p>
              <p className="text-sm text-gray-500">
                {selectedFeedback.appRating} / 5
              </p>
            </div>

            {selectedFeedback.comments && (
              <div>
                <p className="text-sm text-gray-500">Comments</p>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {selectedFeedback.comments}
                </p>
              </div>
            )}

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