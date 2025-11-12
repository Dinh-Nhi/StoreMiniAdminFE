import {
  ShoppingCartIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
import Badge from "../ui/badge/Badge";

export default function EcommerceMetrics() {
  const orderStats = [
    {
      title: "Mới đặt",
      value: "152",
      icon: <ShoppingCartIcon className="size-6 text-blue-600" />,
      color: "blue",
      percent: "+8.3%",
      trend: "up",
    },
    {
      title: "Đã thanh toán",
      value: "127",
      icon: <CreditCardIcon className="size-6 text-green-600" />,
      color: "green",
      percent: "+5.1%",
      trend: "up",
    },
    {
      title: "Chưa giao",
      value: "64",
      icon: <ClockIcon className="size-6 text-yellow-600" />,
      color: "yellow",
      percent: "-2.0%",
      trend: "down",
    },
    {
      title: "Đang giao",
      value: "41",
      icon: <TruckIcon className="size-6 text-indigo-600" />,
      color: "indigo",
      percent: "+3.5%",
      trend: "up",
    },
    {
      title: "Hoàn thành",
      value: "188",
      icon: <CheckCircleIcon className="size-6 text-emerald-600" />,
      color: "emerald",
      percent: "+9.8%",
      trend: "up",
    },
    {
      title: "Đã hủy",
      value: "19",
      icon: <XCircleIcon className="size-6 text-red-600" />,
      color: "red",
      percent: "-1.4%",
      trend: "down",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-6">
      {orderStats.map((item, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] transition-all hover:shadow-md"
        >
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${item.color}-100/60 dark:bg-${item.color}-900/20`}
          >
            {item.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.title}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-xl dark:text-white/90">
                {item.value}
              </h4>
            </div>

            <Badge color={item.trend === "up" ? "success" : "error"}>
              {item.trend === "up" ? "▲" : "▼"} {item.percent}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
