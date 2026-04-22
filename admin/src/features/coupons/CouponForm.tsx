import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import api from "@/lib/api";

type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export function CouponForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = React.useState("");
  const [minOrderValue, setMinOrderValue] = React.useState("");
  const [maxDiscountValue, setMaxDiscountValue] = React.useState("");
  const [usageLimit, setUsageLimit] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [toast, setToast] = React.useState<{title: string, message: string, type: 'error'|'success'} | null>(null);

  const showToast = (title: string, message: string, type: 'error'|'success' = 'error') => {
    setToast({title, message, type});
    setTimeout(() => setToast(null), 4000);
  };

  React.useEffect(() => {
    if (isEditMode) {
      const fetchCoupon = async () => {
        try {
          const res = await api.get(`/admin/coupons/${id}`);
          const c = res.data;
          setCode(c.code);
          setDiscountType(c.discountType);
          setDiscountValue(c.discountValue?.toString() || "");
          setMinOrderValue(c.minOrderValue?.toString() || "");
          setMaxDiscountValue(c.maxDiscountValue?.toString() || "");
          setUsageLimit(c.usageLimit?.toString() || "");
          
          if (c.startDate) setStartDate(new Date(c.startDate).toISOString().slice(0, 16));
          if (c.endDate) setEndDate(new Date(c.endDate).toISOString().slice(0, 16));
          setIsActive(c.isActive ?? true);
        } catch (error) {
          showToast("Error", "Failed to load coupon", "error");
        }
      };
      fetchCoupon();
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(new Date().toISOString().slice(0, 16));
      setEndDate(tomorrow.toISOString().slice(0, 16));
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrors({ code: "Code is required" });
      return;
    }
    if (!discountValue || isNaN(Number(discountValue))) {
      setErrors({ discountValue: "Valid discount value is required" });
      return;
    }

    try {
      setLoading(true);
      const payload = { 
        code, 
        discountType, 
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        maxDiscountValue: maxDiscountValue ? Number(maxDiscountValue) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive 
      };

      if (isEditMode) {
        await api.patch(`/admin/coupons/${id}`, payload);
      } else {
        await api.post(`/admin/coupons`, payload);
      }
      navigate('/coupons');
    } catch (error: any) {
      showToast("Commit Failed", error.response?.data?.message || "Server rejected the payload.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <div className={`fixed top-8 right-8 z-50 p-5 border-[3px] shadow-[4px_4px_0_0_#d4d4d8] w-[320px] transition-all font-sans flex items-start gap-4 ${toast.type === 'error' ? 'border-red-500 bg-red-50' : 'border-zinc-950 bg-white'}`}>
          <AlertCircle className={`mt-0.5 shrink-0 ${toast.type === 'error' ? 'text-red-500' : 'text-zinc-950'}`} size={20}  />
          <div>
            <h4 className={`text-sm font-black uppercase tracking-widest ${toast.type === 'error' ? 'text-red-600' : 'text-zinc-950'}`}>{toast.title}</h4>
            <p className={`text-xs font-bold mt-1 leading-tight ${toast.type === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>{toast.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col gap-10 font-sans text-zinc-950 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
          <div>
            <button 
              type="button"
              onClick={() => navigate('/coupons')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to Directory
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
              {isEditMode ? 'Edit Coupon_' : 'New Coupon_'}
            </h1>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              type="submit"
              disabled={loading}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all disabled:opacity-50"
            >
              <Save size={16} /> {loading ? "Committing..." : "Commit Record"}
            </button>
          </div>
        </div>

        <div className="border-[3px] border-zinc-950 bg-white p-6 sm:p-8 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Coupon Code *</label>
                {errors.code && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.code}</span>}
              </div>
              <input 
                type="text" 
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setErrors({}); }}
                placeholder="E.g. SUMMER2026" 
                className={`w-full border-[3px] px-4 py-3 font-mono font-bold text-lg focus:outline-none uppercase ${errors.code ? 'border-red-500 bg-red-50' : 'border-zinc-950'}`}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Usage Limit</label>
              <input 
                type="number" 
                value={usageLimit}
                onChange={e => setUsageLimit(e.target.value)}
                placeholder="Leave blank for infinite" 
                className="w-full border-[3px] border-zinc-950 px-4 py-3 font-bold text-sm focus:outline-none focus:bg-zinc-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-[3px] border-dashed border-zinc-300 pt-8 mt-2">
            
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Discount Structure *</label>
              <div className="flex bg-zinc-100 p-1 border-[3px] border-zinc-950">
                <button type="button" onClick={() => setDiscountType('PERCENTAGE')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${discountType === 'PERCENTAGE' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-950'}`}>Percentage (%)</button>
                <button type="button" onClick={() => setDiscountType('FIXED_AMOUNT')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all ${discountType === 'FIXED_AMOUNT' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:text-zinc-950'}`}>Fixed Diff (₫)</button>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Value *</label>
                  {errors.discountValue && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.discountValue}</span>}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">
                    {discountType === 'PERCENTAGE' ? '%' : '₫'}
                  </span>
                  <input 
                    type="number" 
                    value={discountValue}
                    onChange={e => { setDiscountValue(e.target.value); setErrors({}); }}
                    placeholder={discountType === 'PERCENTAGE' ? "E.g. 20" : "E.g. 50000"} 
                    className={`w-full border-[3px] pl-10 pr-4 py-3 font-mono font-bold text-sm focus:outline-none ${errors.discountValue ? 'border-red-500 bg-red-50' : 'border-zinc-950'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Constraints</label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] font-bold tracking-widest text-zinc-400">MIN. OR:</span>
                  <input type="number" placeholder="Min Order Value (₫)" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} className="w-full border-[3px] border-zinc-950 px-2 py-2 font-mono text-sm focus:outline-none form-input" />
                </div>
                <div className={`flex items-center gap-2 ${discountType === 'FIXED_AMOUNT' ? 'opacity-30 pointer-events-none' : ''}`}>
                  <span className="w-16 text-[10px] font-bold tracking-widest text-zinc-400">MAX. DC:</span>
                  <input type="number" placeholder="Max Discount Value (₫)" value={maxDiscountValue} onChange={e => setMaxDiscountValue(e.target.value)} className="w-full border-[3px] border-zinc-950 px-2 py-2 font-mono text-sm focus:outline-none form-input" />
                </div>
              </div>
            </div>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-[3px] border-dashed border-zinc-300 pt-8 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Start Date *</label>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border-[3px] border-zinc-950 px-4 py-3 font-mono text-sm font-bold focus:outline-none focus:bg-zinc-50"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">End Date *</label>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full border-[3px] border-zinc-950 px-4 py-3 font-mono text-sm font-bold focus:outline-none focus:bg-zinc-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 border-t-[3px] border-zinc-950 pt-8" onClick={() => setIsActive(!isActive)}>
            <div className={`w-12 h-6 border-[2px] relative cursor-pointer transition-all ${isActive ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-400 bg-zinc-100'}`}>
              <div className={`absolute top-0 bottom-0 w-6 border-l-[2px] transition-all ${isActive ? 'right-0 bg-emerald-500 border-emerald-500' : 'left-0 bg-zinc-400 border-zinc-400'}`}></div>
            </div>
            <div className="flex flex-col cursor-pointer">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-950 cursor-pointer -mb-1">Public Availability</label>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{isActive ? 'Active (Ready to Use)' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
