import * as React from "react";
import { Search, Filter, MoreHorizontal, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";

type Order = {
  id: string;
  totalAmount: string;
  shippingFee: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    profile?: { fullName?: string, phone?: string };
  };
  address: {
    city: string;
    addressLine: string;
    receiverName: string;
    phone: string;
  };
  payment?: {
    method: string;
    status: string;
  };
};

export function OrderList() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.data || []);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const getOrderStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-500';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-500';
      case 'SHIPPING': return 'bg-indigo-50 text-indigo-600 border-indigo-500';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-600 border-emerald-500';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-500';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-500';
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-emerald-600 border-b-2 border-emerald-600';
      case 'FAILED': return 'text-red-600 border-b-2 border-red-600';
      case 'REFUNDED': return 'text-amber-600 border-b-2 border-amber-600';
      default: return 'text-zinc-500 border-b-2 border-zinc-400';
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-zinc-950 pb-10">
      
      {/* Header section with signature brutalist style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
            Sales & Orders_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Fulfillment and Revenue Ledger
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 transition-transform bg-white">
            <Filter size={16} /> Filters
          </button>
          <button className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all">
            Export CSV <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Toolbar Setup */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-100 p-4 border-[3px] border-zinc-950">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by Order ID, Customer..."
            className="w-full border-2 border-zinc-900 bg-white px-10 py-2 text-sm font-bold focus:outline-none focus:ring-0 placeholder:text-zinc-400 placeholder:uppercase placeholder:font-bold placeholder:tracking-widest placeholder:text-[10px]"
          />
        </div>
        <div className="flex gap-2 text-[10px] font-bold tracking-widest uppercase items-center text-zinc-500">
          Showing {orders.length} ledgers
        </div>
      </div>

      {/* Brutalist Hard-edged Data Table */}
      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">
                Order ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 min-w-[200px]">
                Customer
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Logistics & Target
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Financials
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">Loading ledgers...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">No ledgers recorded.</td>
              </tr>
            ) : (
              orders.map((order) => {
                const customerName = order.user.profile?.fullName || order.address?.receiverName || 'Unknown';
                const paymentStatus = order.payment ? order.payment.status : 'PENDING';
                const paymentMethod = order.payment ? order.payment.method : 'N/A';
                
                return (
                  <tr
                    key={order.id}
                    className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs font-bold bg-zinc-100 px-2 py-1 border border-zinc-300 w-fit cursor-text">
                          #{order.id.toString().padStart(6, '0')}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm tracking-tight truncate max-w-[200px] text-zinc-900 group-hover:underline">
                        {customerName}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1 max-w-[200px] truncate">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-xs tracking-tight text-zinc-700">
                        {order.address?.city || 'N/A'}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-1">
                        {order.address?.phone || order.user.profile?.phone || 'No Phone'}
                      </p>
                    </td>
                    <td className="px-6 py-4 bg-zinc-50">
                      <p className="font-mono font-black text-sm tracking-tight text-zinc-950">
                        <span className="text-zinc-400 text-xs mr-1">₫</span>
                        {Number(order.totalAmount).toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold tracking-widest uppercase mt-1">
                        {paymentMethod} • <span className={getPaymentStatusStyle(paymentStatus)}>{paymentStatus}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-fit">
                        <select
                          className={`appearance-none text-[10px] font-black tracking-widest uppercase pr-8 pl-3 py-1.5 border-[2px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950 ${getOrderStatusStyle(order.status)}`}
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPING">SHIPPING</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <div className="absolute right-2 top-[45%] -translate-y-1/2 pointer-events-none border-b-[2px] border-r-[2px] border-current w-1.5 h-1.5 rotate-45"></div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination block */}
        <div className="flex items-center justify-between border-t-[3px] border-zinc-950 p-4 bg-zinc-50">
          <button className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors flex items-center gap-1">
            <span className="text-lg leading-none">&larr;</span> Prev
          </button>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-zinc-950 text-white font-mono text-xs font-bold border-[2px] border-zinc-950 shadow-[2px_2px_0_0_#d4d4d8]">
              1
            </button>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest hover:text-zinc-950 transition-colors flex items-center gap-1">
            Next <span className="text-lg leading-none">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
