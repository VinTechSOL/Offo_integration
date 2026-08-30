import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import BottomNav from "../components/BottomNav";

import {
  getMyTicketsApi,
  TicketResponse,
} from "@/api/support";

const TicketsScreen: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] =
    useState<TicketResponse[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    let cancelled = false;

    const loadTickets = async () => {

      try {

        setLoading(true);
        setError("");

        const data =
          await getMyTicketsApi();

        if (!cancelled) {
          setTickets(data);
        }

      } catch (err) {

        console.error(
          "Failed to load tickets:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load your tickets. Please try again."
          );
        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    };

    loadTickets();

    return () => {
      cancelled = true;
    };

  }, []);

  const getStatusStyle = (
    status: TicketResponse["status"]
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

  const getStatusLabel = (
    status: TicketResponse["status"]
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

  const formatDate = (
    value: string
  ) => {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* HEADER */}

      <header className="p-4 flex items-center border-b bg-white sticky top-0 z-10">
        <button
          onClick={() => {
            if (location.state?.from === '/profile') {
              navigate('/profile', { replace: true });
            } else {
              navigate('/home', { replace: true });
            }
          }}
          className="w-1/5"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="w-3/5 text-center text-xl font-bold text-gray-800">
          My Support Tickets
        </h1>

        <div className="w-1/5" />
      </header>

      {/* CONTENT */}

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />

            <span className="ml-3 text-sm text-gray-500">
              Loading tickets...
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-red-500 text-sm">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎫</div>

            <h2 className="font-semibold text-gray-800">No support tickets</h2>

            <p className="text-sm text-gray-500 mt-1">
              Tickets you create will appear here.
            </p>
          </div>
        )}

        {!loading && !error && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.ticket_id}
                onClick={() => navigate(`/support/tickets/${ticket.ticket_id}`)}
                className="w-full text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-bold text-gray-800">
                      Ticket #{ticket.ticket_id}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Order #{ticket.order_id}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
                      ticket.status,
                    )}`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {ticket.issue_type}
                  </p>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {ticket.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {formatDate(ticket.created_at)}
                  </span>

                  <span className="text-sm font-semibold text-orange-500">
                    View Ticket →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default TicketsScreen;