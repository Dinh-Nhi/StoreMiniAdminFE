import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStoreInfoById, processStoreInfo } from "../../helper/api";
import { FaSave, FaArrowLeft, FaPlus } from "react-icons/fa";

interface StoreInfoForm {
  id?: number;
  code: string;
  parentCode: string | null;
  name: string;
  sort: number;
  status: number;
  link: string;
}

export default function InforWebForm() {
  const { id } = useParams<{ id?: string }>(); // id có thể undefined hoặc "create" hoặc "123"
  const navigate = useNavigate();

  // Xác định mode rõ ràng
  const isCreate =
    id === "create" ||
    id === "new" ||
    (id === undefined && window.location.pathname.includes("/create"));
  const isEdit = !!id && !isCreate;

  const [formData, setFormData] = useState<StoreInfoForm>({
    code: "",
    parentCode: "",
    name: "",
    sort: 0,
    status: 1,
    link: "",
  });
  const [loading, setLoading] = useState(false);

  // Nếu là edit (id tồn tại và không phải create) -> load detail
  useEffect(() => {
    if (!isEdit) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getStoreInfoById(Number(id));
        const data = res.data?.data ?? res.data;
        if (data) {
          setFormData({
            id: data.id,
            code: data.code ?? "",
            parentCode: data.parentCode ?? "",
            name: data.name ?? "",
            sort: data.sort ?? 0,
            status: data.status ?? 1,
            link: data.link ?? "",
          });
        }
      } catch (err) {
        alert("❌ Không thể tải dữ liệu chi tiết!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  // Submit: nếu create -> payload không có id, nếu edit -> payload có id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = isEdit
        ? formData // chứa id
        : { ...formData, id: undefined }; // chắc chắn không gửi id khi create

      await processStoreInfo(payload);
      alert(isEdit ? "✅ Cập nhật thành công!" : "✅ Thêm mới thành công!");
      navigate("/inforweb");
    } catch (err) {
      alert("❌ Lưu thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
        {isEdit ? (
          <>
            <FaSave className="text-blue-500" /> Cập nhật thông tin Website
          </>
        ) : (
          <>
            <FaPlus className="text-green-500" /> Thêm mới Website
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Mã */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Mã website
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, code: e.target.value }))
            }
            required
            disabled={loading}
            placeholder="Nhập mã..."
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Mã cha */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Mã cha (nếu có)
          </label>
          <input
            type="text"
            value={formData.parentCode ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, parentCode: e.target.value }))
            }
            disabled={loading}
            placeholder="Nhập mã cha..."
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Tên website */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Tên website
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            disabled={loading}
            placeholder="Nhập tên website..."
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Link
          </label>
          <input
            type="text"
            value={formData.link ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, link: e.target.value }))
            }
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Sắp xếp */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Thứ tự hiển thị
          </label>
          <input
            type="number"
            value={formData.sort}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sort: Number(e.target.value) }))
            }
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

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
            disabled={loading}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Hoạt động</option>
            <option value={0}>Tạm dừng</option>
          </select>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/inforweb")}
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
