import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta title="ADMIN MINISTORE" description="ADMIN MINISTORE" />
      <div className="w-full flex items-center justify-center py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Chào mừng bạn đến với trang quản trị MiniStore!
        </h1>
      </div>
    </>
  );
}
