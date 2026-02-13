import { useEffect, useState } from "react";
import api from "@/apis/client";

export function useStaffSession() {
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/staff/auth/me")
      .then(res => setStaff(res.data))
      .catch(() => {
        localStorage.removeItem("access_token");
        window.location.href = "/";
      })
      .finally(() => setLoading(false));
  }, []);

  return { staff, loading };
}
