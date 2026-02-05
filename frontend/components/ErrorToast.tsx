import { useEffect } from "react";
import { useToastStore } from "../store/toastStore";

const ErrorToast = () => {
  const { message, clear } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clear, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-semibold">
        {message}
      </div>
    </div>
  );
};

export default ErrorToast;
