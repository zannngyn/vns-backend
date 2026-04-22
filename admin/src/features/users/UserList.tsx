import * as React from "react";
import { Search, Filter, Shield, User as UserIcon } from "lucide-react";
import api from "@/lib/api";

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    fullName?: string;
    phone?: string;
    gender?: string;
  };
  isActive: boolean;
  orders: {
    totalAmount: string;
    status: string;
  }[];
  _count?: {
    orders: number;
  };
};

export function UserList() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper calculation
  const getFinancialInsight = (user: User) => {
    let count = user._count?.orders || 0;
    return { count };
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? 'BAN' : 'UNBAN'} this user?`)) {
      try {
        await api.patch(`/admin/users/${id}/status`, { isActive: !currentStatus });
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || "Action failed");
      }
    }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`Approve promotion/demotion to ${newRole}?`)) {
      try {
        await api.patch(`/admin/users/${id}/role`, { role: newRole });
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || "Action failed");
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans text-zinc-950 pb-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-[3px] border-zinc-950 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">
            Users_
          </h1>
          <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase mt-2">
            Accounts & Analytics
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex flex-1 md:flex-none items-center justify-center gap-2 border-[3px] border-zinc-950 px-4 py-2 font-bold uppercase tracking-widest text-xs hover:-translate-y-1 transition-transform bg-white">
            <Filter size={16} /> Segments
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
            placeholder="Search by Email, Name..."
            className="w-full border-2 border-zinc-900 bg-white px-10 py-2 text-sm font-bold focus:outline-none focus:ring-0 placeholder:text-zinc-400 placeholder:uppercase placeholder:font-bold placeholder:tracking-widest placeholder:text-[10px]"
          />
        </div>
        <div className="flex gap-2 text-[10px] font-bold tracking-widest uppercase items-center text-zinc-500">
          Total Base: {users.length} accs
        </div>
      </div>

      {/* Brutalist Hard-edged Data Table */}
      <div className="overflow-x-auto border-[3px] border-zinc-950 bg-white relative">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-[3px] border-zinc-950 bg-zinc-100">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24">
                User ID
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Identity
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Contact Data
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                LTV & Orders
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Role & Level
              </th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">Querying database...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-bold tracking-widest uppercase text-zinc-400">No users found.</td>
              </tr>
            ) : (
              users.map((user) => {
                const insight = getFinancialInsight(user);
                
                return (
                  <tr
                    key={user.id}
                    className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-zinc-500 tracking-tighter">
                        U-{user.id.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-sm tracking-tight text-zinc-900 group-hover:underline cursor-pointer">
                        {user.profile?.fullName || 'Anonymous User'}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1">
                        JOINED: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-bold tracking-tight text-zinc-700">
                        {user.email}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-1">
                        PH: {user.profile?.phone || 'No Phone Sync'}
                      </p>
                    </td>
                    <td className="px-6 py-4 bg-zinc-50">
                      <p className="font-mono font-black text-sm tracking-tight text-zinc-950">
                        {insight.count}
                      </p>
                      <p className="text-[9px] font-bold tracking-widest uppercase mt-1 text-zinc-500">
                        TOTAL ORDERS
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 border-[2px] ${user.role === 'ADMIN' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white text-zinc-600'}`}
                        >
                          {user.role === 'ADMIN' ? <Shield size={10} /> : <UserIcon size={10} />}
                          {user.role}
                        </span>
                        {!user.isActive && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500 px-1">BANNED</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        <button 
                          onClick={() => toggleRole(user.id, user.role)}
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 hover:underline transition-colors"
                        >
                          [TOGGLE ROLE]
                        </button>
                        <button 
                          onClick={() => toggleStatus(user.id, user.isActive)}
                          className={`text-[10px] font-black uppercase tracking-widest transition-colors hover:underline ${user.isActive ? 'text-zinc-300 hover:text-red-600' : 'text-red-500 hover:text-emerald-500'}`}
                        >
                          [{user.isActive ? 'BAN USER' : 'UNBAN USER'}]
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
