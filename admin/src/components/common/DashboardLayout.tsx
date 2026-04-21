import { Outlet, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/stores/useUIStore';
import { Menu, LogOut, Package, ShoppingCart, Users, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart },
    { name: 'Sản phẩm', href: '/products', icon: Package },
    { name: 'Khách hàng', href: '/users', icon: Users },
  ];

  return (
    <aside
      className={cn(
        "bg-zinc-950 text-white transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-zinc-800">
        <h2 className={cn("font-bold tracking-wider", !isSidebarOpen && "hidden")}>
          VIESTYLE ADMIN
        </h2>
        {!isSidebarOpen && <span className="font-bold">VS</span>}
      </div>
      
      <nav className="flex-1 py-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 mx-2 rounded-md transition-colors",
                isActive ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
                !isSidebarOpen && "justify-center px-0"
              )}
            >
              <Icon size={20} />
              {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Header() {
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Admin User</span>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Thoát</span>
        </button>
      </div>
    </header>
  );
}

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {/* Nơi chứa nội dung các route con */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
