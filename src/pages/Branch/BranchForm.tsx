import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { getBranchById, processBranch } from "../../helper/api";

interface BranchFormData {
  id?: number;
  name: string;
  country: string;
  status: number;
}

export default function BranchForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 🧩 Xác định chế độ
  const isCreate = id === "create";
  const isEdit = !isCreate && !!id;

  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    country: "",
    status: 1,
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Chỉ load chi tiết khi đang ở chế độ sửa
  useEffect(() => {
    if (isEdit && id) {
      fetchBranchDetail(Number(id));
    }
  }, [id, isEdit]);

  const fetchBranchDetail = async (branchId: number) => {
    try {
      setLoading(true);
      const res = await getBranchById(branchId);
      if (res?.data) {
        setFormData(res.data);
      }
    } catch (err) {
      alert("❌ Không thể tải thông tin chi nhánh.");
    } finally {
      setLoading(false);
    }
  };

  // 🧭 Xử lý nhập liệu
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? Number(value) : value,
    }));
  };

  // 💾 Gửi API process (tạo mới hoặc cập nhật)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload: BranchFormData = isEdit
        ? { ...formData, id: Number(id) } // có id nếu update
        : { ...formData, id: undefined }; // không có id nếu create

      const res = await processBranch(payload);

      if (res?.status === 200) {
        alert(
          isEdit
            ? "✅ Cập nhật chi nhánh thành công!"
            : "✅ Thêm chi nhánh thành công!"
        );
        navigate("/branch");
      } else {
        alert("❌ Lưu dữ liệu thất bại!");
      }
    } catch (err) {
      alert("❌ Lưu dữ liệu thất bại!");
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
          {/* Tên chi nhánh */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên thương hiệu
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên thương hiệu"
              disabled={loading}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quốc gia */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Quốc gia
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder="Nhập quốc gia"
              disabled={loading}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Trạng thái */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Trạng thái
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Tạm dừng</option>
          </select>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/branch")}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm transition"
          >
            <FaArrowLeft /> Quay lại
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
          >
            <FaSave />
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
