import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, UploadCloud, AlertCircle } from "lucide-react";
import api from "@/lib/api";

type Option = { id: string; name: string; slug: string };

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [skus, setSkus] = React.useState([
    { id: Number(1), isExisting: false, skuCode: "", color: "", colorHex: "#000000", size: "", price: "", salePrice: "", stock: 0 }
  ]);
  
  // Data State
  const [categories, setCategories] = React.useState<Option[]>([]);
  const [brands, setBrands] = React.useState<Option[]>([]);
  
  // Form State
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [brandId, setBrandId] = React.useState("");
  const [material, setMaterial] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [gender, setGender] = React.useState("UNISEX");
  const [isActive, setIsActive] = React.useState(true);
  const [thumbnail, setThumbnail] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Validation & UI State
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [toast, setToast] = React.useState<{title: string, message: string, type: 'error'|'success'} | null>(null);

  const showToast = (title: string, message: string, type: 'error'|'success' = 'error') => {
    setToast({title, message, type});
    setTimeout(() => setToast(null), 4000);
  };

  React.useEffect(() => {
    const fetchOptionsAndData = async () => {
      try {
        setLoading(true);
        const [cats, brds] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/brands')
        ]);
        setCategories(cats.data);
        setBrands(brds.data);

        if (isEditMode) {
          const prodRes = await api.get(`/admin/products/${id}`);
          const prod = prodRes.data;
          setName(prod.name || "");
          setCategoryId(prod.categoryId ? prod.categoryId.toString() : "");
          setBrandId(prod.brandId ? prod.brandId.toString() : "");
          setMaterial(prod.material || "");
          setDescription(prod.description || "");
          setGender(prod.gender || "UNISEX");
          setIsActive(prod.isActive ?? true);
          setThumbnail(prod.thumbnail || "");
          
          if (prod.skus && prod.skus.length > 0) {
             setSkus(prod.skus.map((s: any) => ({
               id: s.id,
               isExisting: true,
               skuCode: s.skuCode,
               color: s.color?.name || "",
               colorHex: s.color?.hexCode || "#000000",
               size: s.size?.name || "",
               price: s.price?.toString() || "",
               salePrice: s.salePrice?.toString() || "",
               stock: s.stock || 0
             })));
          }
        }
      } catch (e) {
        console.error("Failed to fetch initial data", e);
        showToast("Error", "Failed to load product details.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOptionsAndData();
  }, [id, isEditMode]);

  const addSku = () => {
    const newId = skus.length > 0 ? Math.max(...skus.map(s => Number(s.id) || 0)) + 1 : 1;
    setSkus([...skus, { id: newId, isExisting: false, skuCode: "", color: "", colorHex: "#000000", size: "", price: "", salePrice: "", stock: 0 }]);
  };

  const removeSku = (id: number) => {
    setSkus(skus.filter(s => s.id !== id));
  };

  const updateSku = (id: number, field: string, value: any) => {
    setSkus(skus.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real production app, upload 'file' to AWS S3 / Cloudinary and set URL
      // Here we use FileReader to temporarily generate a data URL (Base64) to save to DB / Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate primary fields
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!categoryId) newErrors.categoryId = "Category selection is required";
    if (!brandId) newErrors.brandId = "Brand selection is required";
    
    // Validate variants
    if (skus.length === 0) {
      newErrors.skus = "At least one inventory variant must be added";
    }

    skus.forEach((sku, idx) => {
      if (!sku.skuCode || !sku.skuCode.trim()) newErrors[`sku_${idx}_skuCode`] = "Missing Tracking SKU Code";
      if (!sku.price || parseFloat(sku.price) <= 0) newErrors[`sku_${idx}_price`] = "Base price must be > 0";
      
      if (sku.salePrice && sku.price) {
        const sale = parseFloat(sku.salePrice);
        const base = parseFloat(sku.price);
        if (sale >= base) {
          newErrors[`sku_${idx}_salePrice`] = "Sale price must be strictly lower than Base Price";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Validation Failed", "Please fix the highlighted fields in red before submitting.", "error");
      
      // Auto-scroll to top if there's a primary error
      if (newErrors.name || newErrors.categoryId || newErrors.brandId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setErrors({});
    
    try {
      setLoading(true);
      const payload = {
        name,
        categoryId,
        brandId,
        material,
        description,
        gender,
        isActive,
        thumbnail,
        skus: skus.map(s => ({
          ...(isEditMode && s.isExisting && s.id ? { id: s.id.toString() } : {}),
          skuCode: s.skuCode,
          color: s.color,
          colorHex: s.colorHex,
          size: s.size,
          price: s.price,
          salePrice: s.salePrice,
          stock: s.stock
        }))
      };
      if (isEditMode) {
        await api.patch(`/admin/products/${id}`, payload);
        showToast("Success", "Product updated successfully.", "success");
      } else {
        await api.post('/admin/products', payload);
      }
      navigate('/products');
    } catch (e) {
      console.error("Failed to commit product", e);
      showToast("Commit Failed", "Server rejected the payload. Check console.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Custom Brutalist Toast */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 p-5 border-[3px] shadow-[4px_4px_0_0_#d4d4d8] w-[320px] transition-all font-sans flex items-start gap-4 ${toast.type === 'error' ? 'border-red-500 bg-red-50' : 'border-zinc-950 bg-white'}`}>
          <AlertCircle className={`mt-0.5 shrink-0 ${toast.type === 'error' ? 'text-red-500' : 'text-zinc-950'}`} size={20}  />
          <div>
            <h4 className={`text-sm font-black uppercase tracking-widest ${toast.type === 'error' ? 'text-red-600' : 'text-zinc-950'}`}>{toast.title}</h4>
            <p className={`text-xs font-bold mt-1 leading-tight ${toast.type === 'error' ? 'text-red-500' : 'text-zinc-500'}`}>{toast.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10 font-sans text-zinc-950 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
          <div>
            <button 
              type="button"
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to Catalog
            </button>
            <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">{isEditMode ? 'Edit Product_' : 'New Product_'}</h1>
            <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
              Configure Item & Telemetry
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={() => navigate('/products')}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 transition-transform"
            >
              Discard
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              <Save size={16} /> {loading ? "Committing..." : "Commit Record"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            <div className="border-[3px] border-zinc-950 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-black uppercase tracking-widest mb-8 pb-4 border-b-2 border-zinc-100">Primary Information</h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Product Name *</label>
                    {errors.name && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.name}</span>}
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: ''})); }}
                    placeholder="E.g. Heavyweight Cotton Hoodie" 
                    className={`w-full border-[3px] px-4 py-3 font-bold text-sm focus:outline-none placeholder:text-zinc-300 transition-colors ${errors.name ? 'border-red-500 bg-red-50' : 'border-zinc-950 focus:bg-zinc-50'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Category *</label>
                      {errors.categoryId && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Required</span>}
                    </div>
                    <select 
                      value={categoryId}
                      onChange={e => { setCategoryId(e.target.value); setErrors(p => ({...p, categoryId: ''})); }}
                      className={`w-full border-[3px] px-4 py-3 font-bold text-sm focus:outline-none appearance-none ${errors.categoryId ? 'border-red-500 bg-red-50 text-red-900' : 'border-zinc-950 bg-white'}`}
                    >
                      <option value="">Select Category...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 bottom-3 pointer-events-none">
                      <div className={`w-3 h-3 border-b-[3px] border-r-[3px] rotate-45 transform translate-y-[-2px] ${errors.categoryId ? 'border-red-500' : 'border-zinc-950'}`}></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Brand *</label>
                      {errors.brandId && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Required</span>}
                    </div>
                    <select 
                      value={brandId}
                      onChange={e => { setBrandId(e.target.value); setErrors(p => ({...p, brandId: ''})); }}
                      className={`w-full border-[3px] px-4 py-3 font-bold text-sm focus:outline-none appearance-none ${errors.brandId ? 'border-red-500 bg-red-50 text-red-900' : 'border-zinc-950 bg-white'}`}
                    >
                      <option value="">Select Brand...</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 bottom-3 pointer-events-none">
                      <div className={`w-3 h-3 border-b-[3px] border-r-[3px] rotate-45 transform translate-y-[-2px] ${errors.brandId ? 'border-red-500' : 'border-zinc-950'}`}></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Material Spec</label>
                  <input 
                    type="text" 
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    placeholder="E.g. 100% French Terry Cotton, 400gsm" 
                    className="w-full border-[3px] border-zinc-950 px-4 py-3 font-bold text-sm focus:outline-none placeholder:text-zinc-300 transition-colors focus:bg-zinc-50"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Description</label>
                  <textarea 
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Detail the fabric, cut, fit, and origin..." 
                    className="w-full border-[3px] border-zinc-950 px-4 py-3 font-medium text-sm focus:outline-none placeholder:text-zinc-300 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Variants / SKUs */}
            <div className="border-[3px] border-zinc-950 bg-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b-2 border-zinc-100 gap-4">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-widest">Inventory Variants (SKUs)</h2>
                    {errors.skus && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{errors.skus}</p>}
                </div>
                <button 
                  onClick={addSku}
                  type="button" 
                  className="flex items-center gap-2 border-[2px] border-zinc-950 bg-white hover:bg-zinc-950 hover:text-white px-4 py-2 font-bold uppercase tracking-widest text-[10px] transition-colors shrink-0"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {skus.map((sku, index) => (
                  <div key={sku.id} className="grid grid-cols-12 gap-3 sm:gap-4 border-[2px] border-zinc-200 hover:border-zinc-950 p-4 relative group transition-colors bg-zinc-50 hover:bg-white">
                    
                    <div className="col-span-12 md:col-span-12 flex flex-col gap-1 pb-2 border-b border-zinc-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">Tracking SKU Code *</label>
                        {errors[`sku_${index}_skuCode`] && <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">{errors[`sku_${index}_skuCode`]}</span>}
                      </div>
                      <input type="text" value={sku.skuCode} disabled={sku.isExisting} onChange={e => {updateSku(sku.id, 'skuCode', e.target.value); setErrors(prev => ({...prev, [`sku_${index}_skuCode`]: ''})) }} placeholder="PRD-00..." className="w-full border-none px-0 py-1 text-sm font-bold uppercase focus:outline-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>

                    <div className="col-span-6 md:col-span-2 flex flex-col gap-1">
                      <label className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">Color</label>
                      <input type="text" value={sku.color} disabled={sku.isExisting} onChange={e => updateSku(sku.id, 'color', e.target.value)} placeholder="Name" className="w-full border border-zinc-300 px-2 py-2 text-xs font-bold uppercase focus:outline-none focus:border-zinc-950 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-100" />
                    </div>
                    <div className="col-span-6 md:col-span-1 flex flex-col gap-1">
                      <label className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">Size</label>
                      <input type="text" value={sku.size} disabled={sku.isExisting} onChange={e => updateSku(sku.id, 'size', e.target.value)} placeholder="S/M/L" className="w-full border border-zinc-300 px-2 py-2 text-xs font-bold uppercase focus:outline-none focus:border-zinc-950 bg-transparent text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-100" />
                    </div>
                    <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">Base Price</label>
                        {errors[`sku_${index}_price`] && <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Error</span>}
                      </div>
                      <div className="relative">
                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs ${errors[`sku_${index}_price`] ? 'text-red-500' : 'text-zinc-400'}`}>₫</span>
                        <input type="number" value={sku.price} onChange={e => { updateSku(sku.id, 'price', e.target.value); setErrors(prev => ({...prev, [`sku_${index}_price`]: ''})) }} placeholder="VND" className={`w-full border pl-6 pr-2 py-2 font-mono text-xs font-bold focus:outline-none bg-transparent ${errors[`sku_${index}_price`] ? 'border-red-500 text-red-900 bg-red-50' : 'border-zinc-300 focus:border-zinc-950'}`} />
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-3 flex flex-col gap-1 relative">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-black tracking-widest text-emerald-500 uppercase flex items-center gap-1">
                          Sale Price <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </label>
                        {errors[`sku_${index}_salePrice`] && <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Invalid</span>}
                      </div>
                      <div className="relative">
                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs font-bold ${errors[`sku_${index}_salePrice`] ? 'text-red-600' : 'text-emerald-600'}`}>₫</span>
                        <input type="number" value={sku.salePrice} onChange={e => { updateSku(sku.id, 'salePrice', e.target.value); setErrors(prev => ({...prev, [`sku_${index}_salePrice`]: ''})) }} placeholder="Optional" className={`w-full border-[2px] pl-6 pr-2 py-2 font-mono text-xs font-bold focus:outline-none ${errors[`sku_${index}_salePrice`] ? 'border-red-500 bg-red-50 text-red-900' : 'border-emerald-500 bg-emerald-50 text-emerald-900'}`} />
                      </div>
                    </div>
                    <div className="col-span-10 md:col-span-2 flex flex-col gap-1">
                      <label className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">Stock</label>
                      <input type="number" value={sku.stock} onChange={e => updateSku(sku.id, 'stock', parseInt(e.target.value) || 0)} className="w-full border border-zinc-300 px-2 py-2 font-mono text-xs font-bold text-center focus:outline-none focus:border-zinc-950 bg-transparent" />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex items-end justify-center pb-2 text-zinc-300 hover:text-red-500 cursor-pointer transition-colors" onClick={() => removeSku(sku.id)}>
                      <Trash2 size={18} />
                    </div>

                    {/* Show error context below variant if needed */}
                    {errors[`sku_${index}_salePrice`] && <div className="col-span-12 text-[10px] font-bold uppercase tracking-widest text-red-500 mt-1">{errors[`sku_${index}_salePrice`]}</div>}
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Sidebar settings */}
          <div className="flex flex-col gap-8">
            
            {/* Status block Black */}
            <div className="border-[3px] border-zinc-950 bg-zinc-950 p-6 sm:p-8 text-white relative h-fit overflow-hidden">
              <h2 className="text-lg font-black uppercase tracking-widest text-zinc-200 mb-6 relative z-10">Meta & Media</h2>
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Target Audience</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setGender('UNISEX')} className={`flex-1 border-[2px] py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${gender === 'UNISEX' ? 'border-white bg-white text-zinc-950' : 'border-zinc-700 text-zinc-400 hover:border-white'}`}>UNISEX</button>
                    <button type="button" onClick={() => setGender('MALE')} className={`flex-1 border-[2px] py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${gender === 'MALE' ? 'border-white bg-white text-zinc-950' : 'border-zinc-700 text-zinc-400 hover:border-white'}`}>MEN</button>
                    <button type="button" onClick={() => setGender('FEMALE')} className={`flex-1 border-[2px] py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${gender === 'FEMALE' ? 'border-white bg-white text-zinc-950' : 'border-zinc-700 text-zinc-400 hover:border-white'}`}>WOMEN</button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Thumbnail Media</label>
                  
                  <div 
                    className="w-full aspect-[4/5] border-[3px] border-dashed border-zinc-700 hover:border-white flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group bg-zinc-900/50 relative overflow-hidden"
                    onClick={() => !thumbnail && fileInputRef.current?.click()}
                  >
                    {thumbnail ? (
                      <img src={thumbnail} alt="Thumbnail Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                    ) : (
                      <>
                        <div className="p-4 bg-zinc-900 rounded-full group-hover:bg-zinc-800 transition-colors z-10">
                          <UploadCloud size={24} className="text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors text-center px-6 leading-relaxed z-10">
                          Drop high-res image<br/>or click to browse
                        </span>
                      </>
                    )}

                    {thumbnail && (
                      <div 
                        className="absolute inset-0 bg-zinc-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10"
                        onClick={(e) => { e.stopPropagation(); setThumbnail(''); }}
                      >
                        <button type="button" className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-[2px] border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
                          <Trash2 size={14} /> Remove Media
                        </button>
                      </div>
                    )}

                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </div>

                  <div className="flex gap-2 mt-2">
                     <input 
                       type="text" 
                       value={thumbnail} 
                       onChange={e => setThumbnail(e.target.value)} 
                       placeholder="Or paste Link Url..." 
                       className="w-full border-[2px] border-zinc-700 bg-transparent px-3 py-2 text-xs font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors" 
                     />
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6 border-t border-zinc-800 pt-8" onClick={() => setIsActive(!isActive)}>
                  {/* Custom toggle */}
                  <div className={`w-12 h-6 border-[2px] relative cursor-pointer transition-all ${isActive ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-zinc-600 bg-zinc-800'}`}>
                    <div className={`absolute top-0 bottom-0 w-6 border-l-[2px] transition-all ${isActive ? 'right-0 bg-emerald-500 border-emerald-500' : 'left-0 bg-zinc-500 border-zinc-600'}`}></div>
                  </div>
                  <div className="flex flex-col cursor-pointer">
                    <label className="text-xs font-black uppercase tracking-widest text-white cursor-pointer -mb-1">Public Status</label>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{isActive ? 'Active & Visible' : 'Hidden / Draft'}</span>
                  </div>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] pointer-events-none text-white">
                <Plus size={200} strokeWidth={8} />
              </div>
            </div>

          </div>

        </div>

      </form>
    </>
  );
}
