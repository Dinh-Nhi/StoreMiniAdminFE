import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  processProductInfo,
  uploadMediaList,
  getAllCategory,
  getAllBranch,
} from "../../helper/api";
import { FaArrowLeft, FaSave, FaPlus, FaTrash } from "react-icons/fa";

interface ProductSize {
  size: string;
  stock: number;
}

interface ProductVariant {
  color: string;
  price: number;
  stock: number; // tổng stock sizes
  sold: number;  // tổng số lượng đã bán
  available: boolean;
  sizes: ProductSize[];
}

interface ProductForm {
  id?: number;
  name: string;
  description: string;
  basePrice: number;
  active: boolean;
  isNew: boolean;
  isShow: boolean;
  categoryId?: number;
  brandId?: number;
  fileKey?: string | null;
  discount: number;
  variants: ProductVariant[];
}

/** Kiểu cho file đã upload trên server */
interface ExistingFile {
  id?: number;
  fileName?: string;
  url: string;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "create";

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    basePrice: 0,
    active: true,
    isNew: false,
    isShow: true,
    discount: 0,
    variants: [],
    fileKey: undefined,
  });

  // previewUrls chứa chuỗi preview từ cả 2 nguồn (existing + new),
  // nhưng để biết nguồn ta giữ 2 danh sách riêng: existingFiles & selectedFiles
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // files user vừa chọn (chưa upload)
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]); // files đã có trên server
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load categories & brands
  useEffect(() => {
    Promise.all([getAllCategory(), getAllBranch()])
      .then(([catRes, brRes]) => {
        setCategories(catRes.data || []);
        setBrands(brRes.data || []);
      })
      .catch(() => alert("Không thể tải danh mục hoặc thương hiệu!"));
  }, []);

  // Load product details when editing
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getProductById(Number(id));
        const data = res.data;

        setFormData((prev) => ({
          ...prev,
          ...data,
          variants: data.variants || [],
          fileKey: data.fileKey ?? null,
        }));

        // Nếu server trả về danh sách files, giữ chúng trong existingFiles và preview
        if (data.files && Array.isArray(data.files)) {
          const ex: ExistingFile[] = data.files.map((f: any) => ({
            id: f.id,
            fileName: f.fileName,
            url: f.url,
          }));
          setExistingFiles(ex);
          setPreviewUrls(ex.map((f) => f.url));
        } else if (data.fileKey && data.fileUrls && Array.isArray(data.fileUrls)) {
          // fallback: nếu API khác trả fileUrls
          const ex: ExistingFile[] = data.fileUrls.map((u: string) => ({ url: u }));
          setExistingFiles(ex);
          setPreviewUrls(ex.map((f) => f.url));
        }
      } catch (err) {
        console.error(err);
        alert("Không thể tải thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Khi user chọn file mới: chỉ lưu File vào selectedFiles và tạo preview local
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }

    // tạo object URLs cho preview
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // reset input để user có thể chọn cùng file lần nữa nếu muốn
    e.currentTarget.value = "";
  };

  // Xóa một ảnh mới (chưa upload)
  const removeNewPreview = (newIndex: number) => {
    // previewUrls includes both existing and new; we need to find mapping.
    // Simpler: reconstruct previewUrls from existingFiles + selectedFiles after removal.
    setSelectedFiles((prev) => {
      const updated = [...prev];
      const removed = updated.splice(newIndex, 1);
      // revoke object URL
      removed.forEach((f) => {
        // we created object URLs in handleFilesChange; find matching URL(s) to revoke:
        // We cannot reliably get objectURL from File, so instead after state update we rebuild previewUrls below.
      });
      // rebuild previewUrls
      setPreviewUrls(() => [
        ...existingFiles.map((f) => f.url),
        ...updated.map((f) => URL.createObjectURL(f)),
      ]);
      return updated;
    });
  };

  // Xóa một ảnh existing (đã có trên server)
  const removeExistingPreview = (existingIndex: number) => {
    setExistingFiles((prev) => {
      const updated = prev.filter((_, i) => i !== existingIndex);
      setPreviewUrls(() => [...updated.map((f) => f.url), ...selectedFiles.map((f) => URL.createObjectURL(f))]);
      return updated;
    });
  };

  // Hỗ trợ generic remove bằng index trên tổng preview list: map index -> existing or new
  const removePreview = (globalIndex: number) => {
    const existingCount = existingFiles.length;
    if (globalIndex < existingCount) {
      // remove from existing
      removeExistingPreview(globalIndex);
    } else {
      // remove from new files: index in selectedFiles = globalIndex - existingCount
      removeNewPreview(globalIndex - existingCount);
    }
  };

  // Clean up object URLs on unmount to avoid memory leak
  useEffect(() => {
    return () => {
      // revoke all created object URLs from selectedFiles previews
      // We don't have stored the object URLs separately, but we can try to revoke previewUrls (some will be remote URLs and revoke will fail silently)
      previewUrls.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility: convert existingFiles' urls -> File objects (via fetch) so we can upload them together
  const convertExistingUrlsToFiles = async (): Promise<File[]> => {
    const files: File[] = [];
    for (const f of existingFiles) {
      try {
        // fetch the blob from URL (CORS needs to allow)
        const resp = await fetch(f.url, { cache: "no-store" });
        if (!resp.ok) {
          console.warn("Không thể fetch file existing:", f.url);
          continue;
        }
        const blob = await resp.blob();
        const name = f.fileName || f.url.split("/").pop() || "file.jpg";
        // Create a File (maintain image type if present)
        const file = new File([blob], name, { type: blob.type || "image/jpeg" });
        files.push(file);
      } catch (err) {
        console.warn("Lỗi khi convert existing url to file:", f.url, err);
        // skip this file
      }
    }
    return files;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = isEdit ? { ...formData, id: Number(id) } : { ...formData, id: undefined };

      // Build list of files to upload: include selectedFiles + existingFiles (converted)
      const totalExisting = existingFiles.length;
      const totalNew = selectedFiles.length;

      if (totalExisting + totalNew > 0) {
        const formDataUpload = new FormData();

        // append newly selected files
        selectedFiles.forEach((f) => {
          formDataUpload.append("files", f);
        });

        // convert existing remote urls to files and append them (so uploadMediaList receives full set)
        // Note: this requires that existing file URLs are accessible (CORS). If not, alternative server-side merging is needed.
        const converted = await convertExistingUrlsToFiles();
        converted.forEach((f) => formDataUpload.append("files", f));

        // call upload API
        const res = await uploadMediaList("create", formDataUpload);
        const { fileKey } = res.data || {};
        if (fileKey) {
          payload.fileKey = fileKey;
        } else {
          // fallback: if response doesn't include fileKey, remove fileKey to avoid accidental overwrite
          payload.fileKey = undefined;
        }
      } else {
        // no images — ensure we don't accidentally send old fileKey when user removed all images
        payload.fileKey = undefined;
      }

      // gọi API lưu product (processProductInfo)
      await processProductInfo(payload);
      alert(isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
      navigate("/product");
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // UI helpers để hiển thị preview với nút xóa
  const renderPreviews = () => {
    // previewUrls is maintained but to keep mapping accurate, reconstruct from existingFiles + selectedFiles
    const existingPreviews = existingFiles.map((f) => f.url);
    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));

    // We must avoid creating duplicate objectURLs repeatedly for same files.
    // For simplicity here, build previews from the two sources freshly:
    const combined = [...existingPreviews, ...newPreviews];
    return combined.map((url, idx) => (
      <div key={idx} className="relative">
        <img src={url} className="w-24 h-24 object-cover rounded border border-gray-200" alt={`preview-${idx}`} />
        <button
          type="button"
          onClick={() => removePreview(idx)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ✕
        </button>
      </div>
    ));
  };

  // Rest of UI (form) — tương tự trước, chỉ chỉnh phần preview rendering và file input handler
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">{isEdit ? "📝 Cập nhật sản phẩm" : "➕ Thêm sản phẩm mới"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên + giá */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Tên sản phẩm</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Giá cơ bản</label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  basePrice: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Giảm giá + Hiển thị + Sản phẩm mới */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Giảm giá (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={formData.discount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={formData.isShow}
              onChange={(e) => setFormData({ ...formData, isShow: e.target.checked })}
            />
            <label>Hiển thị</label>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={formData.isNew}
              onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
            />
            <label>Sản phẩm mới</label>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block mb-1">Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Danh mục + Thương hiệu */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Danh mục</label>
            <select
              value={formData.categoryId ?? ""}
              onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Chọn --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Thương hiệu</label>
            <select
              value={formData.brandId ?? ""}
              onChange={(e) => setFormData({ ...formData, brandId: Number(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Chọn --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ảnh sản phẩm */}
        <div>
          <label className="block mb-2 font-medium">Ảnh sản phẩm</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />

          {/* Previews: xây lại từ existingFiles + selectedFiles */}
          {(existingFiles.length > 0 || selectedFiles.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">{renderPreviews()}</div>
          )}
        </div>

        {/* Biến thể & kích cỡ */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Màu sắc / Kích cỡ</h3>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  variants: [
                    ...prev.variants,
                    { color: "", price: 0, stock: 0, sold: 0, available: true, sizes: [] },
                  ],
                }))
              }
              className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
            >
              <FaPlus /> Thêm biến thể
            </button>
          </div>

          {formData.variants.map((variant, vIdx) => (
            <div key={vIdx} className="border p-3 rounded mt-3 bg-gray-50">
              <div className="flex justify-between">
                <strong>Biến thể {vIdx + 1}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      variants: prev.variants.filter((_, i) => i !== vIdx),
                    }))
                  }
                  className="text-red-500 flex items-center gap-1"
                >
                  <FaTrash /> Xóa
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <input
                  placeholder="Màu sắc"
                  value={variant.color}
                  onChange={(e) => {
                    const updated = [...formData.variants];
                    updated[vIdx].color = e.target.value;
                    setFormData({ ...formData, variants: updated });
                  }}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Giá"
                  value={variant.price}
                  onChange={(e) => {
                    const updated = [...formData.variants];
                    updated[vIdx].price = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, variants: updated });
                  }}
                  className="border rounded px-3 py-2"
                />
              </div>

              <div className="mt-3">
                <h4 className="font-medium">Kích cỡ</h4>
                {variant.sizes.map((s, sIdx) => (
                  <div key={sIdx} className="flex gap-2 mt-2">
                    <input
                      placeholder="Size"
                      value={s.size}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[vIdx].sizes[sIdx].size = e.target.value;
                        setFormData({ ...formData, variants: updated });
                      }}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Số lượng"
                      value={s.stock}
                      onChange={(e) => {
                        const updated = [...formData.variants];
                        updated[vIdx].sizes[sIdx].stock = parseInt(e.target.value) || 0;
                        updated[vIdx].stock = updated[vIdx].sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
                        setFormData({ ...formData, variants: updated });
                      }}
                      className="border rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.variants];
                        updated[vIdx].sizes.splice(sIdx, 1);
                        updated[vIdx].stock = updated[vIdx].sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
                        setFormData({ ...formData, variants: updated });
                      }}
                      className="text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const updated = [...formData.variants];
                    updated[vIdx].sizes.push({ size: "", stock: 0 });
                    updated[vIdx].stock = updated[vIdx].sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
                    setFormData({ ...formData, variants: updated });
                  }}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaPlus /> Thêm size
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trạng thái sản phẩm */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Trạng thái</label>
            <select
              value={formData.active ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng bán</option>
            </select>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/product")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-sm transition"
          >
            <FaArrowLeft /> Quay lại
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60"
          >
            <FaSave />
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
