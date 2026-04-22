import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Ticket } from "lucide-react";
import api from "@/lib/api";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export function CouponList() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/coupons');
      setCoupons(res.data || []);
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Conceal this coupon? It will no longer be redeemable.`)) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        fetchCoupons();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-zinc-950 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
            Coupons_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Discounts & Marketing
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/coupons/new')}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all"
          >
            <Plus size={16} /> New Coupon
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-48">Code</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Value (Type)</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">Usage</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-48">Validity Period</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">Loading coupons...</td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">No coupons found.</td>
              </tr>
            ) : (
              coupons.map((cp) => (
                <tr key={cp.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-black text-zinc-950 bg-zinc-100 px-2 py-1 border-[2px] border-dashed border-zinc-400 flex items-center justify-center gap-2 max-w-[fit-content]">
                      <Ticket size={14} /> {cp.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-lg tracking-tight">
                      {cp.discountType === 'PERCENTAGE' ? `${Number(cp.discountValue)}%` : `₫${Number(cp.discountValue).toLocaleString()}`}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{cp.discountType}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-zinc-950 border-b-2 border-zinc-950">
                      {cp.usedCount} / {cp.usageLimit || '∞'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-mono text-[10px] font-bold text-emerald-600 mb-1">
                      FR: {new Date(cp.startDate).toLocaleDateString()}
                    </p>
                    <p className="font-mono text-[10px] font-bold text-red-600">
                      TO: {new Date(cp.endDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 border ${cp.isActive ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-zinc-500 text-zinc-600 bg-zinc-100'}`}>
                      {cp.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <button 
                        onClick={() => navigate(`/coupons/${cp.id}/edit`)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 hover:underline transition-colors"
                      >
                        [EDIT]
                      </button>
                      <button 
                        onClick={() => handleDelete(cp.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-red-500 hover:underline transition-colors"
                      >
                        [CONCEAL]
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
