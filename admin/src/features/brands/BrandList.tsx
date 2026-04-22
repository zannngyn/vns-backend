import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import api from "@/lib/api";

type Brand = {
  id: string;
  name: string;
  slug: string;
  origin: string | null;
  isActive: boolean;
  _count: { products: number };
};

export function BrandList() {
  const navigate = useNavigate();
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/brands');
      setBrands(res.data || []);
    } catch (error) {
      console.error("Failed to fetch brands", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, count: number) => {
    const msg = count > 0 
      ? `This brand has ${count} products. Deleting it will migrate all products to "Unbranded". Accept?`
      : `Are you sure you want to completely destroy this brand?`;
      
    if (confirm(msg)) {
      try {
        await api.delete(`/admin/brands/${id}`);
        fetchBrands();
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
            Brands_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Manufacturer Directory
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/brands/new')}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all"
          >
            <Plus size={16} /> New Brand
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Name / Slug</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-48">Origin</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">Products</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">Loading directory...</td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">No brands found.</td>
              </tr>
            ) : (
              brands.map((br) => (
                <tr key={br.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold bg-zinc-100 px-2 py-1 border border-zinc-300">
                      B-{br.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm tracking-tight uppercase">{br.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">/{br.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium uppercase tracking-widest font-bold text-zinc-600">{br.origin || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold tracking-tight">{br._count?.products || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 border ${br.isActive ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-zinc-500 text-zinc-600 bg-zinc-100'}`}>
                      {br.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <button 
                        onClick={() => navigate(`/brands/${br.id}/edit`)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 hover:underline transition-colors"
                      >
                        [EDIT]
                      </button>
                      <button 
                        onClick={() => handleDelete(br.id, br._count?.products || 0)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-red-500 hover:underline transition-colors"
                      >
                        [DELETE]
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
