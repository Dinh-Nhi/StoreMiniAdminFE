import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useEffect, useState } from "react";

interface RevenueData {
  date: string; // yyyy-MM-dd
  total: number; // doanh thu của ngày đó
}

export default function WeeklySalesChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState([
    { name: "Doanh thu", data: [] as number[] },
  ]);

  // ✅ Gọi API lấy dữ liệu 7 ngày gần nhất
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        // const response = await axios.get<RevenueData[]>(
        //   "/api/orders/revenue/last7days"
        // );
        // const data = response.data;

        const data: RevenueData[] = [
          { date: "2025-10-24", total: 3500000 },
          { date: "2025-10-25", total: 4200000 },
          { date: "2025-10-26", total: 2800000 },
          { date: "2025-10-27", total: 5100000 },
          { date: "2025-10-28", total: 4700000 },
          { date: "2025-10-29", total: 6200000 },
          { date: "2025-10-30", total: 5800000 },
        ];

        // Chuyển định dạng ngày sang dạng "Oct 24", "Oct 25"...
        const labels = data.map((item) =>
          new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
          })
        );

        const values = data.map((item) => item.total);

        setCategories(labels);
        setSeries([{ name: "Doanh thu", data: values }]);
      } catch (error) {
        console.error("Lỗi khi tải doanh thu:", error);
      }
    };

    fetchRevenue();
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) =>
          val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: {
        formatter: (val: number) =>
          val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      },
    },
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Doanh thu 7 ngày gần nhất
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xem chi tiết
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Xuất dữ liệu
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={200} />
        </div>
      </div>
    </div>
  );
}
