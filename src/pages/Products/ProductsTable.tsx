import { useEffect, useState } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaTrash,
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
import { getAllProductsInfo, deleteProductsInfo } from "../../helper/api";
import { useNavigate } from "react-router";

interface ProductVariantSize {
  id: number;
  size: string;
  stock: number;
}

interface ProductVariant {
  id: number;
  color: string;
  material: string;
  price: number;
  stock: number;
  available: boolean;
  sizes: ProductVariantSize[];
}

interface ProductInfo {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  discount: number;
  fileKey: string;
  active: boolean;
  isNew: boolean;
  isShow: boolean;
  brandId: number;
  categoryId: number;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

// 🏷️ Trạng thái hoạt động
const getStatusLabel = (active: boolean) =>
  active ? (
    <Badge size="sm" color="success">
      Hoạt động
    </Badge>
  ) : (
    <Badge size="sm" color="warning">
      Ngừng bán
    </Badge>
  );

export default function ProductsTable() {
  const [data, setData] = useState<ProductInfo[]>([]);
  const [searchName, setSearchName] = useState("");
  const [filterActive, setFilterActive] = useState("");
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
      const res = await getAllProductsInfo();
      const result = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setData(result);
    } catch (err: any) {
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
      item.name.toLowerCase().includes(searchName.toLowerCase()) &&
      (filterActive === "" ||
        item.active.toString() === (filterActive === "true").toString())
  );

  // 📑 Phân trang
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🗑️ Xóa sản phẩm
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      setLoading(true);
      await deleteProductsInfo(id);
      alert("Xóa thành công!");
      fetchData();
    } catch {
      alert("Xóa thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchName("");
    setFilterActive("");
    fetchData();
  };

  return (
    <div className="space-y-1">
      {/* 🔎 Bộ lọc */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
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

        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Tất cả trạng thái --</option>
          <option value="true">Hoạt động</option>
          <option value="false">Ngừng bán</option>
        </select>

        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition"
        >
          <FaSyncAlt className="w-4 h-4" /> Làm mới
        </button>
        <button
          onClick={() => navigate("/product/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
        >
          ➕ Tạo mới
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
                    "Tên sản phẩm",
                    "Mô tả",
                    "Giá gốc (₫)",
                    "Giảm giá (%)",
                    "Tồn kho",
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
                  currentData.map((item) => {
                    const totalStock = item.variants?.reduce(
                      (sum, v) => sum + (v.stock || 0),
                      0
                    );
                    return (
                      <TableRow
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <TableCell className="px-5 py-4 font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 truncate max-w-[200px]">
                          {item.description}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {item.basePrice.toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {item.discount}%
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {totalStock}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {getStatusLabel(item.active)}
                        </TableCell>
                        <TableCell className="px-5 py-4 flex gap-3">
                          <button
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
