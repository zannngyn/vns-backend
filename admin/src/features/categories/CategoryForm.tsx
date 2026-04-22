import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [toast, setToast] = React.useState<{title: string, message: string, type: 'error'|'success'} | null>(null);

  const showToast = (title: string, message: string, type: 'error'|'success' = 'error') => {
    setToast({title, message, type});
    setTimeout(() => setToast(null), 4000);
  };

  React.useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        try {
          const res = await api.get(`/admin/categories/${id}`);
          setName(res.data.name || "");
          setSlug(res.data.slug || "");
          setDescription(res.data.description || "");
          setIsActive(res.data.isActive ?? true);
        } catch (error) {
          showToast("Error", "Failed to load category", "error");
        }
      };
      fetchCategory();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ name: "Category Name is physically required" });
      return;
    }

    try {
      setLoading(true);
      const payload = { name, slug, description, isActive };
      if (isEditMode) {
        await api.patch(`/admin/categories/${id}`, payload);
      } else {
        await api.post(`/admin/categories`, payload);
      }
      navigate('/categories');
    } catch (error) {
      showToast("Commit Failed", "Server rejected the payload.", "error");
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

      <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col gap-10 font-sans text-zinc-950 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
          <div>
            <button 
              type="button"
              onClick={() => navigate('/categories')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to List
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
              {isEditMode ? 'Edit Category_' : 'New Category_'}
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

        <div className="border-[3px] border-zinc-950 bg-white p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Name *</label>
              {errors.name && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.name}</span>}
            </div>
            <input 
              type="text" 
              value={name}
              onChange={e => { setName(e.target.value); setErrors({}); }}
              placeholder="E.g. Outerwear" 
              className={`w-full border-[3px] px-4 py-3 font-bold text-sm focus:outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-zinc-950'}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Custom Slug</label>
            <input 
              type="text" 
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="Leave blank to auto-generate from name" 
              className="w-full border-[3px] border-zinc-950 px-4 py-3 font-mono text-sm focus:outline-none focus:bg-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Description</label>
            <textarea 
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border-[3px] border-zinc-950 px-4 py-3 font-medium text-sm focus:outline-none resize-y"
            />
          </div>

          <div className="flex items-center gap-4 mt-6 border-t-[3px] border-zinc-100 pt-6" onClick={() => setIsActive(!isActive)}>
            <div className={`w-12 h-6 border-[2px] relative cursor-pointer transition-all ${isActive ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-400 bg-zinc-100'}`}>
              <div className={`absolute top-0 bottom-0 w-6 border-l-[2px] transition-all ${isActive ? 'right-0 bg-emerald-500 border-emerald-500' : 'left-0 bg-zinc-400 border-zinc-400'}`}></div>
            </div>
            <div className="flex flex-col cursor-pointer">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-950 cursor-pointer -mb-1">Availability</label>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{isActive ? 'Active' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
