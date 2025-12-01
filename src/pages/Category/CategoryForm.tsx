import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, updateCategory } from "../../helper/api";
import { FaSave, FaArrowLeft } from "react-icons/fa";

interface CategoryFormData {
  id?: number;
  name: string;
  description: string;
  status: number;
  isShow: boolean;
}

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    status: 1,
    isShow: true,
  });
  const [loading, setLoading] = useState(false);

  // 🧩 Nếu có id và id !== 'create' thì gọi API load dữ liệu
  useEffect(() => {
    if (id && id !== "create") {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await getCategoryById(Number(id));
          const data = res.data?.data ?? res.data;
          setFormData({
            id: data.id,
            name: data.name,
            description: data.description,
            status: data.status,
            isShow: data.isShow,
          });
        } catch (err) {
          alert("Không thể tải dữ liệu category!");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  // 📝 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateCategory(formData);
      alert(
        id && id !== "create" ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      navigate("/category");
    } catch (err) {
      alert("Lưu thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        {id && id !== "create" ? "Cập nhật Category" : "Thêm mới Category"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên danh mục */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Tên danh mục
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nhập tên danh mục..."
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Miêu tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Nhập mô tả..."
          />
        </div>
        {/* Trạng thái + Hiển thị */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Tạm dừng</option>
            </select>
          </div>

          {/* Hiển thị */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Hiển thị
            </label>
            <select
              value={formData.isShow ? "true" : "false"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isShow: e.target.value === "true",
                }))
              }
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Hiển thị</option>
              <option value="false">Ẩn</option>
            </select>
          </div>
        </div>

       
        {/* Nút hành động */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/category")}
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
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
