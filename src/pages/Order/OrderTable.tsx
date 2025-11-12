import { useEffect, useState } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaEdit,
} from "react-icons/fa";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useNavigate } from "react-router";
import { getAllOrder } from "../../helper/api";

// 🧾 Kiểu dữ liệu phản ánh đúng OrderEntity
interface OrderInfo {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string; // PENDING / PAYMENT / SHIPPED / CANCELLED
  totalPrice: number;
  createdAt: string;
}

// 🏷️ Hiển thị trạng thái
const getStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge size="sm" color="warning">
          Chờ xử lý
        </Badge>
      );
    case "PAYMENT":
      return (
        <Badge size="sm" color="info">
          Đang thanh toán
        </Badge>
      );
    case "SHIPPED":
      return (
        <Badge size="sm" color="success">
          Đã giao hàng
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge size="sm" color="error">
          Đã hủy
        </Badge>
      );
    default:
      return <Badge size="sm">Không xác định</Badge>;
  }
};

export default function OrderTable() {
  const [data, setData] = useState<OrderInfo[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  // 🧩 Gọi API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllOrder();
      const result = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setData(result);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      setError("Không thể tải dữ liệu, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Lọc dữ liệu
  const filteredData = data.filter(
    (item) =>
      (item.customerName ?? "")
        .toLowerCase()
        .includes(searchName.toLowerCase()) &&
      (item.phone ?? "").includes(searchPhone) &&
      (filterStatus === "" || item.status === filterStatus)
  );

  // 📑 Phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchName("");
    setSearchPhone("");
    setFilterStatus("");
  };

  return (
    <div className="space-y-1">
      {/* 🔎 Bộ lọc */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 pl-10 pr-3 py-2 rounded-lg w-56 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo số điện thoại..."
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 pl-10 pr-3 py-2 rounded-lg w-52 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="PAYMENT">Đang thanh toán</option>
          <option value="SHIPPED">Đã giao hàng</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition"
        >
          <FaSyncAlt className="w-4 h-4" /> Làm mới
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
                    "Tên khách hàng",
                    "Thanh toán",
                    "Trạng thái",
                    "Tổng tiền",
                    "Ngày tạo",
                    "Hành động",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      isHeader
                      className="px-5 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center"
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <TableCell className="text-center">
                        {item.customerName}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.paymentMethod === "COD"
                          ? "Thanh toán khi nhận hàng"
                          : "Chuyển khoản"}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusLabel(item.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.totalPrice?.toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell className="text-center">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="flex justify-center gap-3">
                        <button
                          onClick={() => navigate(`/order/${item.id}`)}
                          className="text-green-500 hover:text-green-700"
                          title="Cập nhật đơn hàng"
                        >
                          <FaEdit />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-center py-6 text-gray-500 italic">
                      Không có dữ liệu
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
