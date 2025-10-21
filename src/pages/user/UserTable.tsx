import { useEffect, useState } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaTrash,
  FaEdit,
  FaPlus,
} from "react-icons/fa";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router-dom";
import { deleteUser, getAllUser } from "../../helper/api";

// 🧩 Interface dữ liệu user
interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  status: number;
}

// 🏷️ Hàm hiển thị trạng thái
const getStatusLabel = (status: number) => {
  switch (status) {
    case 1:
      return (
        <Badge size="sm" color="success">
          Hoạt động
        </Badge>
      );
    case 0:
      return (
        <Badge size="sm" color="warning">
          Tạm dừng
        </Badge>
      );
    default:
      return (
        <Badge size="sm" color="error">
          Không xác định
        </Badge>
      );
  }
};

export default function UserTable() {
  const [data, setData] = useState<User[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  // 🔹 Gọi API lấy danh sách user
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllUser();
      const result = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setData(result);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Lọc dữ liệu theo tên, username, trạng thái
  const filteredData = data.filter(
    (item) =>
      item.fullName.toLowerCase().includes(searchName.toLowerCase()) &&
      item.username.toLowerCase().includes(searchUsername.toLowerCase()) &&
      (filterStatus === "" || item.status.toString() === filterStatus)
  );

  // 📑 Phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🗑️ Xử lý xóa user
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      setLoading(true);
      await deleteUser(id);
      alert("Xóa người dùng thành công!");
      fetchData();
    } catch (err) {
      alert("Xóa thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchName("");
    setSearchUsername("");
    setFilterStatus("");
    fetchData();
  };

  return (
    <div className="space-y-1">
      {/* 🔎 Bộ lọc */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tìm theo tên */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 pl-10 pr-3 py-2 rounded-lg w-56 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tìm theo username */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 pl-10 pr-3 py-2 rounded-lg w-52 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bộ lọc trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="1">Hoạt động</option>
          <option value="0">Tạm dừng</option>
        </select>

        {/* Nút làm mới */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition"
        >
          <FaSyncAlt className="w-4 h-4" /> Làm mới
        </button>

        {/* Nút thêm mới */}
        <button
          onClick={() => navigate("/user/new")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
        >
          <FaPlus className="w-4 h-4" /> Thêm mới
        </button>
      </div>

      {/* 🧾 Bảng dữ liệu */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6 text-gray-500 italic">
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <TableRow>
                  {[
                    "ID",
                    "Họ tên",
                    "Username",
                    "Email",
                    "Số điện thoại",
                    "Vai trò",
                    "Trạng thái",
                    "Hành động",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      isHeader
                      className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <TableCell className="px-5 py-4">{user.id}</TableCell>
                      <TableCell className="px-5 py-4 font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {user.username}
                      </TableCell>
                      <TableCell className="px-5 py-4">{user.email}</TableCell>
                      <TableCell className="px-5 py-4">
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 uppercase">
                        {user.role}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {getStatusLabel(user.status)}
                      </TableCell>
                      <TableCell className="px-5 py-4 flex justify-center gap-3">
                        <button
                          onClick={() => navigate(`/user/${user.id}`)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center py-6 text-gray-500 italic">
                      Không có người dùng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* 🔢 Phân trang */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        <span>
          Trang {currentPage}/{totalPages || 1}
        </span>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <FaChevronLeft className="w-3 h-3" /> Trước
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Sau <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
