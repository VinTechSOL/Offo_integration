import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import {
  getUserNotifications,
  markUserNotificationsRead,
} from "@/api/notifications";
import { useNotifications } from "@/context/NotificationContext";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  related_order_id?: number | null;
  event_type?: string;
}

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD NOTIFICATIONS ================= */

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getUserNotifications();
        setNotifications(data || []);

        // Mark all as read in backend
        await markUserNotificationsRead();

        // 🔥 Update UI locally so unread styling disappears immediately
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  /* ================= HELPERS ================= */

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleClick = (notif: NotificationItem) => {
    if (notif.related_order_id) {
      navigate("/orders"); // safer than dynamic route unless defined
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">

      {/* HEADER */}
      <header className="p-4 flex items-center border-b bg-white sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="text-xl font-bold text-gray-800">
          Notifications
        </h1>

        {unreadCount > 0 && (
          <span className="ml-3 text-sm text-orange-600 font-semibold">
            {unreadCount} new
          </span>
        )}
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {loading && (
          <div className="text-center text-gray-500 mt-10">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            You're all caught up 🎉
          </div>
        )}

        {!loading &&
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`p-4 rounded-xl shadow-sm border transition cursor-pointer ${
                notif.is_read
                  ? "bg-white border-gray-200"
                  : "bg-orange-50 border-orange-200"
              } ${
                notif.priority === "HIGH"
                  ? "border-l-4 border-red-500"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {notif.title}
                </h3>

                <span className="text-xs text-gray-500">
                  {formatDate(notif.created_at)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {notif.message}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotificationScreen;