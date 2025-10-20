import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { token } = useAuth();

  const savedToken = token || localStorage.getItem("token");

  if (!savedToken) {
    return <Navigate to="/signin" replace />;
  }

  try {
    const payload = JSON.parse(atob(savedToken.split(".")[1]));
    const exp = payload.exp * 1000; // convert to ms
    const now = Date.now();

    // Nếu token hết hạn -> xóa token và chuyển hướng về /signin
    if (now > exp) {
      localStorage.removeItem("token");
      return <Navigate to="/signin" replace />;
    }

    // ✅ Token hợp lệ -> cho phép truy cập
    return <Outlet />;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/signin" replace />;
  }
}
