import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import api from "@/lib/api";
import { MoveRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("Attempting login with:", email);
      const response = await api.post("/auth/login", { email, password });
      console.log("Login successful, tokens received");
      
      localStorage.setItem("access_token", response.data.accessToken);
      localStorage.setItem("refresh_token", response.data.refreshToken);
      console.log("Tokens stored in localStorage. Navigating to / ...");
      
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      if (!err.response) {
        setError("Network Error: Cannot connect to backend server. Make sure the backend is running on port 3000.");
      } else {
        setError(err.response?.data?.message || "Invalid authentication credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white text-zinc-950 font-sans selection:bg-zinc-950 selection:text-white">
      {/* LEFT SIDE: Brand & Aesthetic (62%) - Following Golden Ratio */}
      <div className="hidden lg:flex w-[62%] relative bg-zinc-950 text-white flex-col justify-between p-12 overflow-hidden border-r border-zinc-200">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-500 via-zinc-900 to-black mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-xl font-bold tracking-widest uppercase">Viestyle</h1>
        </div>
        
        <div className="relative z-10 max-w-xl">
          <h2 className="text-6xl font-black tracking-tight leading-none mb-6">
            ADMINISTRATIVE<br/>
            COMMAND<br/>
            <span className="text-zinc-500">CENTER.</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed tracking-wide">
            Control commerce operations, manage fulfillment, and orchestrate customer experiences in real-time. Reserved for authorized personnel.
          </p>
        </div>
        
        <div className="relative z-10 text-xs font-mono tracking-widest text-zinc-600 uppercase">
          System Core v1.0.0 // Access Controlled // {new Date().getFullYear()}
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form (38%) */}
      <div className="w-full lg:w-[38%] flex items-center justify-center p-8 sm:p-16 relative">
        <div className="w-full max-w-[360px] flex flex-col">
          
          <div className="mb-12">
            <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2">Sign in to portal</h3>
            <p className="text-sm text-zinc-500">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {error && (
              <div className="text-sm font-medium text-white bg-zinc-900 px-4 py-3 border-l-4 border-red-500">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 group-focus-within:text-zinc-950 transition-colors">
                Security clearance email
              </label>
              <Input 
                type="email" 
                placeholder="admin@viestyle.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-0 border-b-2 border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-950 bg-transparent transition-colors shadow-none text-base font-medium placeholder:text-zinc-300 placeholder:font-normal"
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 group-focus-within:text-zinc-950 transition-colors">
                Passcode
              </label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-0 border-b-2 border-zinc-200 rounded-none px-0 focus-visible:ring-0 focus-visible:border-zinc-950 bg-transparent transition-colors shadow-none text-base font-medium placeholder:text-zinc-300 placeholder:font-normal"
                required 
              />
            </div>
            
            <div className="mt-8">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none shadow-xl shadow-zinc-900/10 text-sm font-bold uppercase tracking-widest relative group transition-all"
              >
                <span className="flex flex-1 items-center justify-center gap-2">
                  {loading ? "Authenticating..." : "Initialize Session"}
                  {!loading && <MoveRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                </span>
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white group-hover:w-full transition-all duration-300 ease-out"></span>
              </Button>
            </div>
          </form>

          <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col gap-2 text-xs text-zinc-400">
            <p>Protected by advanced telemetry.</p>
            <p className="font-mono">IP address logged.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
