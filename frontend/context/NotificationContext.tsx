import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { getUserNotifications } from "@/api/notifications";
import { playNotificationSound } from "@/utils/sound";

interface NotificationContextType {
  unreadCount: number;
  animateBell: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  animateBell: false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateBell, setAnimateBell] = useState(false);

  // 🔒 Track highest notification ID seen
  const highestSeenIdRef = useRef<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // 🚫 Do not poll if user not logged in
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const notifications = await getUserNotifications();

        if (!notifications || notifications.length === 0) return;

        // 🔹 Update unread count
        const unread = notifications.filter(
          (n: any) => !n.is_read
        ).length;

        setUnreadCount(unread);

        // 🔹 Assume newest notification is first (most APIs return sorted desc)
        const newest = notifications[0];

        //  Only trigger sound if:
        // 1. It is ORDER_READY
        // 2. It is newer than what we already saw
        if (
          newest &&
          newest.event_type === "ORDER_READY" &&
          newest.id > highestSeenIdRef.current
        ) {
          highestSeenIdRef.current = newest.id;

          playNotificationSound();

          setAnimateBell(true);
          setTimeout(() => setAnimateBell(false), 500);
        }

      } catch (err) {
        console.error("Notification polling failed", err);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 8 seconds
    const interval = setInterval(fetchNotifications, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ unreadCount, animateBell }}
    >
      {children}
    </NotificationContext.Provider>
  );
};