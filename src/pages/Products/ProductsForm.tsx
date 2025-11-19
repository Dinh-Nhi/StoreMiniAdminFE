import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProductById,
  processProductInfo,
  uploadMediaList,
  getAllCategory,
  getAllBranch,
  getMediaAllByFileKey,
} from "../../helper/api";
import { FaArrowLeft, FaSave, FaPlus, FaTrash } from "react-icons/fa";

interface ProductSize {
  size: string;
  stock: number;
}

interface ProductVariant {
  color: string;
  price: number;
  stock: number;
  sold: number;
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

interface ExistingFile {
  id?: number;
  name?: string;
  url: string; // base64
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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
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

  // Load product detail when editing
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

        if (data.fileKey) {
          const mediaRes = await getMediaAllByFileKey(data.fileKey);

          const files =
            mediaRes.data?.map((item: any, idx: number) => ({
              id: idx,
              name: item.name ?? `image_${idx}.jpg`,
              url: item.data, // <=== FIX: backend trả về đúng field "data"
            })) ?? [];

          setExistingFiles(files);
        }
      } catch (err) {
        console.error(err);
        alert("Không thể tải thông tin sản phẩm!");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  // handle new images
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validImages = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );

    if (validImages.length === 0) {
      alert("Vui lòng chọn file ảnh hợp lệ!");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validImages]);
    e.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removePreview = (globalIndex: number) => {
    const existingCount = existingFiles.length;

    if (globalIndex < existingCount) {
      removeExistingImage(globalIndex);
    } else {
      removeNewImage(globalIndex - existingCount);
    }
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = isEdit
        ? { ...formData, id: Number(id) }
        : { ...formData, id: undefined };

      const noImages =
        existingFiles.length === 0 && selectedFiles.length === 0;

      if (noImages) payload.fileKey = undefined;

      // Upload new images
      if (selectedFiles.length > 0) {
        const fd = new FormData();
        selectedFiles.forEach((f) => fd.append("files", f));

        const uploadKey = formData.fileKey ?? "create";
        const res = await uploadMediaList(uploadKey, fd);

        if (res.data?.fileKey) {
          payload.fileKey = res.data.fileKey;
        }
      }

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

  // render previews
  const renderPreviews = () => {
    const newPreviewUrls = selectedFiles.map((f) => URL.createObjectURL(f));
    const all = [...existingFiles.map((f) => f.url), ...newPreviewUrls];

    return all.map((url, idx) => (
      <div
        key={idx}
        className="relative w-40 h-40 border bg-white rounded-lg shadow-sm flex items-center justify-center overflow-hidden"
      >
        <img
          src={url}
          className="w-full h-full object-contain"
          alt={`preview-${idx}`}
        />

        <button
          type="button"
          onClick={() => removePreview(idx)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ✕
        </button>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">
        {isEdit ? "📝 Cập nhật sản phẩm" : "➕ Thêm sản phẩm mới"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* name & price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Tên sản phẩm</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label>Giá cơ bản</label>
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

        {/* discount, show, new */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Giảm giá (%)</label>
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
              onChange={(e) =>
                setFormData({ ...formData, isShow: e.target.checked })
              }
            />
            <label>Hiển thị</label>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={formData.isNew}
              onChange={(e) =>
                setFormData({ ...formData, isNew: e.target.checked })
              }
            />
            <label>Sản phẩm mới</label>
          </div>
        </div>

        {/* description */}
        <div>
          <label>Mô tả</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* category + brand */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Danh mục</label>
            <select
              value={formData.categoryId ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryId: Number(e.target.value),
                })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, brandId: Number(e.target.value) })
              }
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

        {/* Images */}
        <div>
          <label className="font-medium">Ảnh sản phẩm</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesChange}
            className="block w-full border rounded px-3 py-2 mt-1"
          />

          {(existingFiles.length > 0 || selectedFiles.length > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {renderPreviews()}
            </div>
          )}
        </div>

        {/* variants */}
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
                    {
                      color: "",
                      price: 0,
                      stock: 0,
                      sold: 0,
                      available: true,
                      sizes: [],
                    },
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
                  className="text-red-500"
                >
                  <FaTrash />
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

              {/* Sizes */}
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
                        updated[vIdx].sizes[sIdx].stock =
                          parseInt(e.target.value) || 0;
                        updated[vIdx].stock = updated[vIdx].sizes.reduce(
                          (sum, s) => sum + (s.stock || 0),
                          0
                        );
                        setFormData({ ...formData, variants: updated });
                      }}
                      className="border rounded px-3 py-2"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.variants];
                        updated[vIdx].sizes.splice(sIdx, 1);
                        updated[vIdx].stock = updated[vIdx].sizes.reduce(
                          (sum, s) => sum + (s.stock || 0),
                          0
                        );
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
                    updated[vIdx].stock = updated[vIdx].sizes.reduce(
                      (sum, s) => sum + (s.stock || 0),
                      0
                    );
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

        {/* status */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Trạng thái</label>
            <select
              value={formData.active ? "true" : "false"}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.value === "true" })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng bán</option>
            </select>
          </div>
        </div>

        {/* buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/product")}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
          >
            <FaArrowLeft /> Quay lại
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            <FaSave /> {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
