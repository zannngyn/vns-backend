import * as React from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import api from "@/lib/api";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  product: {
    name: string;
    thumbnail: string | null;
  };
  user: {
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
};

export function ReviewList() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      setReviews(res.data || []);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to physically delete this review?`)) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        fetchReviews();
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
            Reviews_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            User Generated Content
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-64">Product</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Review & Rating</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-48">Author</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24">Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">Loading reviews...</td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">No reviews found.</td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {rev.product.thumbnail ? (
                        <img src={rev.product.thumbnail} alt="Thb" className="w-10 h-10 object-cover border-[2px] border-zinc-950" />
                      ) : (
                        <div className="w-10 h-10 bg-zinc-200 border-[2px] border-zinc-950 flex items-center justify-center">?</div>
                      )}
                      <p className="font-bold text-xs tracking-tight uppercase line-clamp-2 leading-tight">{rev.product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 mb-1 text-zinc-950">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-md ${i < rev.rating ? 'text-zinc-950' : 'text-zinc-300'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-zinc-700 max-w-lg italic">"{rev.comment || 'No text content'}"</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-xs uppercase text-zinc-950">
                      {rev.user.profile?.firstName ? `${rev.user.profile.firstName} ${rev.user.profile.lastName || ''}` : 'Anonymous'}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 bg-zinc-100 px-1 py-0.5 inline-block mt-1 border border-zinc-200">{rev.user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-zinc-500">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(rev.id)}
                      className="text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-red-500 hover:underline transition-colors flex items-center gap-1 justify-end w-full"
                    >
                      <Trash2 size={12} /> [DELETE]
                    </button>
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
