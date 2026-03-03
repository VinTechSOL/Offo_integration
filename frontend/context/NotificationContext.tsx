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

  // ✅ useRef instead of useState (no re-render loop)
  const lastReadyIdRef = useRef<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // 🔒 Don’t poll if not logged in
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const notifications = await getUserNotifications();
        if (!notifications?.length) return;

        const unread = notifications.filter(
          (n: any) => !n.is_read
        ).length;

        setUnreadCount(unread);

        const latestReady = notifications.find(
          (n: any) => n.event_type === "ORDER_READY"
        );

        if (
          latestReady &&
          latestReady.id !== lastReadyIdRef.current
        ) {
          lastReadyIdRef.current = latestReady.id;

          playNotificationSound();

          setAnimateBell(true);
          setTimeout(() => setAnimateBell(false), 500);
        }
      } catch (err) {
        console.error("Notification polling failed", err);
      }
    };

    fetchNotifications();

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