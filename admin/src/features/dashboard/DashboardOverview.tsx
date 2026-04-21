export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <p className="text-gray-500">Khu vực hiển thị thống kê tổng hợp của hệ thống e-commerce.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Tổng Đơn Hàng</h3>
          <p className="text-3xl font-bold mt-2">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Doanh Thu</h3>
          <p className="text-3xl font-bold mt-2">₫ 45,000,000</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Sản Phẩm</h3>
          <p className="text-3xl font-bold mt-2">156</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-400">Khu vực biểu đồ thống kê</p>
      </div>
    </div>
  );
}
