import api from "./client";


export const getUserNotifications = async () => {
  const res = await api.get("/notifications/user");
  return res.data;
};

export const markUserNotificationsRead = async () => {
  await api.post("/notifications/user/mark-read");
};

export const getUnreadNotificationCount = async () => {
  const res = await api.get("/notifications/user/unread-count");
  return res.data.unread;
};