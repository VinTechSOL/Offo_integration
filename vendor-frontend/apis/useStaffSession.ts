import { useEffect, useState } from "react";
import api from "@/apis/client";

export function useStaffSession() {
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api.get("/staff/auth/me")
      .then((res) => {
        if (mounted) {
          setStaff(res.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setStaff(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    staff,
    loading,
  };
}