import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import { getOrderById, processOrder } from "../../helper/api";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface OrderDetail {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("PENDING");

  // 🧩 Gọi API lấy chi tiết đơn hàng
  useEffect(() => {
    if (id && id !== "create") {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await getOrderById(Number(id));
          const data = res.data?.data ?? res.data;
          setOrder(data);
          setStatus(data.status);
        } catch (err) {
          alert("Không thể tải dữ liệu đơn hàng!");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  // 📝 Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      setLoading(true);
      await processOrder(order.id, status);
      alert("Cập nhật trạng thái đơn hàng thành công!");
      navigate("/order");
    } catch (err) {
      alert("Cập nhật thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!order && !loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-semibold mb-2">Chi tiết đơn hàng</h2>

      {loading ? (
        <div className="text-gray-500 italic text-center">Đang tải...</div>
      ) : (
        <>
          {/* 🧾 Thông tin đơn hàng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-600">Khách hàng:</p>
              <p className="text-gray-900">{order?.customerName}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Số điện thoại:</p>
              <p className="text-gray-900">{order?.phone}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Địa chỉ:</p>
              <p className="text-gray-900">{order?.address}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">
                Phương thức thanh toán:
              </p>
              <p className="text-gray-900">
                {order?.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng (COD)"
                  : order?.paymentMethod === "BANK_TRANSFER"
                  ? "Chuyển khoản ngân hàng"
                  : "Không xác định"}
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-600">Ngày tạo:</p>
              <p className="text-gray-900">
                {new Date(order?.createdAt ?? "").toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Tổng tiền:</p>
              <p className="text-gray-900 font-semibold">
                {order?.totalPrice?.toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </div>

          {/* 🔄 Cập nhật trạng thái */}
          <form onSubmit={handleUpdateStatus} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Trạng thái đơn hàng
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">⏳ Chờ xử lý</option>
                <option value="PAYMENT">💳 Đã thanh toán</option>
                <option value="SHIPPED">🚚 Đã giao hàng</option>
                <option value="COMPLETED">🎉 Đã hoàn thành</option>
                <option value="CANCELLED">❌ Đã hủy</option>
              </select>
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate("/order")}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 text-sm transition"
              >
                <FaArrowLeft className="w-4 h-4" /> Quay lại
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition disabled:opacity-60"
              >
                <FaSave className="w-4 h-4" />
                {loading ? "Đang lưu..." : "Cập nhật trạng thái"}
              </button>
            </div>
          </form>

          {/* 🛒 Danh sách sản phẩm */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Sản phẩm trong đơn</h3>
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b text-left">Tên sản phẩm</th>
                  <th className="px-4 py-2 border-b text-center">Số lượng</th>
                  <th className="px-4 py-2 border-b text-right">Giá (₫)</th>
                </tr>
              </thead>
              <tbody>
                {order?.items?.length ? (
                  order.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">
                        {item.price.toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-3 text-gray-500 italic"
                    >
                      Không có sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
