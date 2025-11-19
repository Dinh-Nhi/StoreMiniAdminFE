import axios from "axios";

// --- Tạo axios instance chính ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API, // ví dụ: http://localhost:8080
});

// --- Thêm interceptor tự động gắn token ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// 🔹 AUTH API
// ----------------------------
export const login = (data: { userName: string; password: string }) =>
  api.post("/user/auth/login", data);

// ----------------------------
// 🔹 INFORWEB API
// ----------------------------
export const getAllStoreInfo = () => api.get("/admin/inforWeb/getAll");
export const deleteStoreInfo = (id: number) =>
  api.delete(`/admin/inforWeb/delete/${id}`);
export const getStoreInfoById = (id: number) =>
  api.get(`/admin/inforWeb/${id}`);
export const processStoreInfo = (data: any) =>
  api.post("/admin/inforWeb/process", data);

// ----------------------------
// 🔹 BRANCH API
// ----------------------------
export const getAllBranch = () => api.get("/admin/branch/getAll");
export const updateBranch = (data: any) => api.post("/admin/branch/save", data);
export const deleteBranch = (id: number) =>
  api.delete(`/admin/branch/delete/${id}`);
export const getBranchById = (id: number) => api.get(`/admin/branch/${id}`);
export const processBranch = (data: any) =>
  api.post("/admin/branch/process", data);

// ----------------------------
// 🔹 CATEGORY API
// ----------------------------
export const getAllCategory = () => api.get("/admin/category/getAll");
export const updateCategory = (data: any) =>
  api.post("/admin/category/save", data);
export const deleteCategory = (id: number) =>
  api.delete(`/admin/category/delete/${id}`);
export const getCategoryById = (id: number) => api.get(`/admin/category/${id}`);
export const processCategory = (data: any) =>
  api.post("/admin/category/process", data);

// ----------------------------
// 🔹 USER API
// ----------------------------
export const getAllUser = () => api.get("/admin/user/getAll");
export const deleteUser = (id: number) =>
  api.delete(`/admin/user/delete/${id}`);
export const getUserById = (id: number) => api.get(`/admin/user/${id}`);
export const processUser = (data: any) => api.post("/admin/user/process", data);

// ----------------------------
// 🔹 PRODUCT API
// ----------------------------
export const getAllProductsInfo = () => api.get("/admin/product/getAll");
export const deleteProductsInfo = (id: number) =>
  api.delete(`/admin/product/delete/${id}`);
export const getProductById = (id: number) =>
  api.get(`/admin/product/${id}`);
export const processProductInfo = (data: any) =>
  api.post("/admin/product/process", data);


// ----------------------------
// 🔹 ORDER API
// ----------------------------
export const getAllOrder = () => api.get("/admin/order/getAll");
export const getOrderById = (id: number) => api.get(`/admin/order/${id}`);
export const processOrder = (id: number, status: string) =>
  api.post("/admin/order/process", { id, status });

// ----------------------------
// 🔹 MEDIA API
// ----------------------------
export const uploadMedia = (fileKey = "create", formData: FormData) =>
  api.post(`/media/upload/${fileKey}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadMediaList = (fileKey = "create", formData: FormData) =>
  api.post(`/media/uploadList/${fileKey}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getMediaById = (id: string) =>
  api.get(`/media/view/${id}`, {
    responseType: "blob",
  });
  export const getMediaByFileKey = (fileKey: string) =>
    api.get(`/media/viewFileKey/${fileKey}`, { responseType: "blob" });
  
  export const getMediaMainByFileKey = (fileKey: string) =>
    api.get(`/media/viewFileKeyForProduct/${fileKey}`, { responseType: "blob" });
  
  export const getMediaAllByFileKey = (fileKey: string) =>
    api.get(`/media/viewAllFileKeyForProduct/${fileKey}`);

export { api };
