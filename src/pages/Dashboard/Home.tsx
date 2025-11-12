import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta title="ADMIN MINISTORE" description="ADMIN MINISTORE" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 xl:col-span-12">
          <EcommerceMetrics />
        </div>
        <div className="col-span-12 xl:col-span-12">
          <MonthlySalesChart />
        </div>
      </div>
    </>
  );
}
