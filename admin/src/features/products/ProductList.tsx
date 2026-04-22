import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, MoreHorizontal, Filter } from "lucide-react";
import api from "@/lib/api";

type Sku = {
  id: string;
  skuCode: string;
  price: string;
  salePrice: string | null;
  stock: number;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  category: { name: string };
  brand: { name: string };
  skus: Sku[];
  isActive: boolean;
};

export function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/products");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to conceal this product? It will be archived from the active catalog but not physically deleted from historical orders.",
      )
    ) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error("Failed to conceal product", error);
        alert("Failed to conceal product");
      }
    }
  };

  const calculateStatus = (product: Product) => {
    if (!product.isActive)
      return {
        text: "Disabled",
        style: "border-zinc-500 text-zinc-600 bg-zinc-100",
      };
    const totalStock = product.skus.reduce((sum, sku) => sum + sku.stock, 0);
    if (totalStock === 0)
      return {
        text: "Out of Stock",
        style: "border-red-500 text-red-600 bg-red-50",
      };
    if (totalStock < 20)
      return {
        text: "Low Stock",
        style: "border-amber-500 text-amber-600 bg-amber-50",
      };
    return {
      text: "Active",
      style: "border-emerald-500 text-emerald-600 bg-emerald-50",
    };
  };

  const getBasePriceDisplay = (product: Product) => {
    if (!product.skus || product.skus.length === 0) return "N/A";
    const prices = product.skus.map((s) => Number(s.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) return `₫ ${minPrice.toLocaleString()}`;
    return `₫ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
  };

  const getSalePriceDisplay = (product: Product) => {
    if (!product.skus || product.skus.length === 0) return "—";
    const saleSkus = product.skus.filter(
      (s) => s.salePrice !== null && s.salePrice !== undefined,
    );
    if (saleSkus.length === 0) return "—";

    const prices = saleSkus.map((s) => Number(s.salePrice));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) return `₫ ${minPrice.toLocaleString()}`;
    return `₫ ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-zinc-950 pb-10">
      {/* Header section with signature brutalist style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
            Products_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Catalog & Inventory Management
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 transition-transform bg-white">
            <Filter size={16} /> Filters
          </button>
          <button
            onClick={() => navigate("/products/new")}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 bg-zinc-950 text-white px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 shadow-[4px_4px_0_0_#d4d4d8] hover:shadow-[6px_6px_0_0_#d4d4d8] transition-all"
          >
            <Plus size={16} /> New Product
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
            placeholder="Search by SKU or Name..."
            className="w-full border-2 border-zinc-900 bg-white px-10 py-2 text-sm font-bold focus:outline-none focus:ring-0 placeholder:text-zinc-400 placeholder:uppercase placeholder:font-bold placeholder:tracking-widest placeholder:text-[10px]"
          />
        </div>
        <div className="flex gap-2 text-[10px] font-bold tracking-widest uppercase items-center text-zinc-500">
          Showing {products.length} items
        </div>
      </div>

      {/* Brutalist Hard-edged Data Table */}
      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-32">
                Primary ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 min-w-[200px]">
                Item details
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Base Price
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Sale Price
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Inventory
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400"
                >
                  Loading catalog...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400"
                >
                  No products found. Create one.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const status = calculateStatus(product);
                const totalStock = product.skus.reduce(
                  (sum, sku) => sum + sku.stock,
                  0,
                );

                return (
                  <tr
                    key={product.id}
                    className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold bg-zinc-100 px-2 py-1 border border-zinc-300">
                        P-{product.id.toString().padStart(4, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="font-bold text-sm tracking-tight truncate max-w-[250px]"
                        title={product.name}
                      >
                        {product.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1">
                        CAT: {product.category?.name || "N/A"} • BRAND:{" "}
                        {product.brand?.name || "N/A"} • {product.skus.length}{" "}
                        VARIANTS
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold tracking-tight text-xs">
                        {getBasePriceDisplay(product)}
                      </p>
                    </td>
                    <td className="px-6 py-4 bg-emerald-50/10">
                      <p className="font-mono font-bold tracking-tight text-emerald-600 text-xs">
                        {getSalePriceDisplay(product)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold tracking-tight">
                        {totalStock}{" "}
                        <span className="text-zinc-400 text-[10px] tracking-widest uppercase ml-1">
                          units
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 border ${status.style}`}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        <button
                          onClick={() =>
                            navigate(`/products/${product.id}/edit`)
                          }
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 hover:underline transition-colors"
                        >
                          [EDIT]
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-red-500 hover:underline transition-colors"
                        >
                          [CONCEAL]
                        </button>
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
            <button className="w-8 h-8 flex items-center justify-center bg-zinc-950 text-white font-mono text-xs font-bold border-2 border-zinc-950">
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
