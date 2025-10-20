import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router";
import { login } from "../../helper/api";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: loginAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setLoading(true);
    try {
      const res = await login({ userName: email, password });

      if (res.data.code !== 2000) {
        alert(res.data.message || "Đăng nhập thất bại!");
        return;
      }

      const token = res.data?.data ?? null;

      if (token && typeof token === "string") {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          console.log("Token payload:", payload);

          // Lưu token vào AuthContext
          loginAuth(token);

          // Kiểm tra role để điều hướng
          const isAdmin = Array.isArray(payload.roles)
            ? payload.roles.includes("admin")
            : payload.roles === "admin";

          alert("Đăng nhập thành công!");
          navigate(isAdmin ? "/admin" : "/");
        } catch {
          alert("Token không hợp lệ!");
        }
      } else {
        alert("Không nhận được token từ server!");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      alert(err?.response?.data?.message ?? "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h1>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Tài khoản <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
