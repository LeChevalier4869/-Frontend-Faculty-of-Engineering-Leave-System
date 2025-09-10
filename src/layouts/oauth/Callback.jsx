// Callback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import getApiUrl from "../utils/apiUtils";

export default function Callback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    const refreshToken = urlParams.get("refresh");

    if (accessToken && refreshToken) {
      // เก็บ token
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // ดึงข้อมูล user แล้วเซฟเข้า context เลย
      const fetchUser = async () => {
        try {
          const url = getApiUrl("auth/me");
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const returned = res.data.data ?? res.data.user ?? res.data;
          console.log("Fetched user:", returned);
          setUser(returned);
          navigate("/dashboard");
        } catch (err) {
          console.error("fetch user error:", err);
          navigate("/login");
        }
      };

      fetchUser();
    } else {
      navigate("/login");
    }
  }, [navigate, setUser]);

  return <p>กำลังเข้าสู่ระบบ...</p>;
}
