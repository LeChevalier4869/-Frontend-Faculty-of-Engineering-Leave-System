import { useEffect, useState } from "react";
import { API } from "../../utils/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchProtected = async () => {
    try {
      const res = await API.get("/auth/protected"); // ใช้ route ที่มี middleware
      setUser(res.data.user);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        // Access Token หมดอายุ → ใช้ refresh
        try {
          const refreshToken = localStorage.getItem("refresh");
          const res = await API.post("/auth/refresh", { token: refreshToken });
          localStorage.setItem("access", res.data.accessToken);
          fetchProtected(); // retry
        } catch (err2) {
          navigate("/login");
        }
      }
    }
  };

  useEffect(() => {
    fetchProtected();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
}
