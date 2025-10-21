import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { getUserById, processUser } from "../../helper/api";

interface UserFormData {
  id?: number;
  fullName: string;
  username: string;
  email: string;
  address: string;
  phone: string;
  password: string;
  role: string;
  status: number;
}

export default function UserForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isCreate = id === "create" || id === "new" || !id;
  const isEdit = !!id && !isCreate;

  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    username: "",
    email: "",
    address: "",
    phone: "",
    password: "",
    role: "USER",
    status: 1,
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Load dữ liệu nếu là edit
  useEffect(() => {
    if (!isEdit) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getUserById(Number(id));
        const data = res.data?.data ?? res.data;
        if (data) {
          setFormData({
            id: data.id,
            fullName: data.fullName ?? "",
            username: data.username ?? "",
            email: data.email ?? "",
            address: data.address ?? "",
            phone: data.phone ?? "",
            password: "", // không hiển thị password cũ
            role: data.role ?? "USER",
            status: data.status ?? 1,
          });
        }
      } catch (err) {
        alert("❌ Không thể tải dữ liệu chi tiết người dùng!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  // 🔹 Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = { ...formData };
      if (!isEdit) delete payload.id;

      await processUser(payload);
      alert(
        isEdit
          ? "✅ Cập nhật người dùng thành công!"
          : "✅ Tạo mới người dùng thành công!"
      );
      navigate("/user");
    } catch (err) {
      alert("❌ Lưu thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        {isEdit ? "📝 Cập nhật thông tin" : "➕ Thêm thông tin mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
              disabled={loading}
              placeholder="Nhập họ và tên..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tên đăng nhập */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              disabled={isEdit || loading}
              placeholder="Nhập username..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              disabled={loading}
              placeholder="Nhập email..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium mb-1">Địa chỉ</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={loading}
              placeholder="Nhập địa chỉ..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={loading}
              placeholder="Nhập số điện thoại..."
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mật khẩu */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!isEdit}
                disabled={loading}
                placeholder="Nhập mật khẩu..."
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Quyền */}
          <div>
            <label className="block text-sm font-medium mb-1">Quyền</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              disabled={loading}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm"
            >
              <option value="USER">Người dùng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: Number(e.target.value) })
              }
              disabled={loading}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Tạm dừng</option>
            </select>
          </div>
        </div>
        {/* Nút hành động */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/user")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 text-sm transition"
          >
            <FaArrowLeft className="w-4 h-4" /> Quay lại
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60"
          >
            <FaSave className="w-4 h-4" />
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
