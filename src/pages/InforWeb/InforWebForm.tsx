import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMediaById,
  getStoreInfoById,
  processStoreInfo,
  uploadMedia,
} from "../../helper/api";
import { FaArrowLeft, FaSave } from "react-icons/fa";

interface StoreInfoFormData {
  id?: number;
  code: string;
  parentCode: string;
  name: string;
  sort: number;
  status: number;
  link: string;
  fileKey?: string;
  mediaId?: number;
}

export default function StoreInfoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<StoreInfoFormData>({
    code: "",
    parentCode: "",
    name: "",
    sort: 0,
    status: 1,
    link: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load chi tiết khi edit
  useEffect(() => {
    // Nếu là "create" thì không gọi API
    if (!id || id === "create") return;

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
            fileKey: data.fileKey ?? "",
            mediaId: data.mediaId ?? undefined,
          });

          if (data.mediaId) {
            await loadPreviewImage(data.mediaId);
          }
        }
      } catch {
        alert("❌ Không thể tải dữ liệu chi tiết!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ Hàm load ảnh preview
  const loadPreviewImage = async (mediaId: number) => {
    try {
      const res = await getMediaById(mediaId.toString());
      const blob = res.data;
      const imageUrl = URL.createObjectURL(blob);
      setPreviewUrl(imageUrl);
    } catch {
      console.error("❌ Không thể tải ảnh preview");
    }
  };

  // ✅ Khi chọn ảnh → upload ngay để lấy fileKey + mediaId
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setPreviewUrl(URL.createObjectURL(file));

      // ✅ Tạo formData đúng cách
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      // ✅ Gọi API đúng tham số (fileKey, formData)
      const uploadRes = await uploadMedia("create", formDataUpload);
      const data = uploadRes.data?.data ?? uploadRes.data;

      // ✅ Gán fileKey và mediaId vào formData
      setFormData((prev) => ({
        ...prev,
        fileKey: data.fileKey,
        mediaId: data.id || data.mediaId,
      }));

      console.log("✅ Uploaded:", data);
    } catch (error) {
      console.error("❌ Upload ảnh thất bại:", error);
      alert("Không thể upload ảnh!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await processStoreInfo(formData);
      alert(
        id && id !== "create" ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      navigate("/inforweb");
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi lưu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        {isEdit ? "📝 Cập nhật thông tin" : "➕ Thêm thông tin mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mã code */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Parent code */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Parent Code
            </label>
            <input
              type="text"
              value={formData.parentCode}
              onChange={(e) =>
                setFormData({ ...formData, parentCode: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium mb-1">Liên kết</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        {/* Ảnh */}
        <div>
          <label className="block text-sm font-medium mb-1">Ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover mt-2 rounded"
            />
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/inforWeb")}
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
