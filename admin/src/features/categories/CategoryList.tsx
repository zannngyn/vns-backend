import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import api from "@/lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  _count: { products: number };
};

export function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, count: number) => {
    const msg = count > 0 
      ? `This category has ${count} products. Deleting it will migrate all products to "Uncategorized". Accept?`
      : `Are you sure you want to completely destroy this category?`;
      
    if (confirm(msg)) {
      try {
        await api.delete(`/admin/categories/${id}`);
        fetchCategories();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete");
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-zinc-950 pb-10">
      
      {/* Header section with signature brutalist style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
            Categories_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Taxonomy Management
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => navigate('/categories/new')}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all"
          >
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Name / Slug</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-64">Description</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">Products</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">Loading taxonomy...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">No categories found.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold bg-zinc-100 px-2 py-1 border border-zinc-300">
                      C-{cat.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm tracking-tight uppercase">{cat.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">/{cat.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-zinc-600 line-clamp-2">{cat.description || "—"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold tracking-tight">{cat._count?.products || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 border ${cat.isActive ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-zinc-500 text-zinc-600 bg-zinc-100'}`}>
                      {cat.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col gap-1 items-end">
                      <button 
                        onClick={() => navigate(`/categories/${cat.id}/edit`)}
                        className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 hover:underline transition-colors"
                      >
                        [EDIT]
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id, cat._count?.products || 0)}
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
