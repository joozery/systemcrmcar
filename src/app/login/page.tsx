"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/");
                router.refresh();
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans bg-black">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/login-bg.png"
                    alt="Car Detailing"
                    fill
                    className="object-cover opacity-60 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent z-10"></div>
            </div>

            {/* Login Card Container */}
            <div className="relative z-20 w-full max-w-md px-6 animate-in fade-in zoom-in duration-700">
                {/* Logo or Brand */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-[#2563eb] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#2563eb]/30 mb-6 rotate-3">
                        <Car size={32} className="text-white -rotate-3" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                        SYSTEM <span className="text-[#2563eb]">CAR POINT</span>
                    </h1>
                    <p className="text-gray-400 font-medium tracking-wide">MANAGEMENT SYSTEM</p>
                </div>

                {/* Glassmorphism Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2.5rem] shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">ชื่อผู้ใช้งาน</Label>
                            <div className="relative group">
                                <Input
                                    required
                                    placeholder="Username"
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-[#2563eb]/50 transition-all font-bold"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#2563eb] transition-colors" size={20} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">รหัสผ่าน</Label>
                            <div className="relative group">
                                <Input
                                    required
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 pr-12 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-[#2563eb]/50 transition-all font-bold"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#2563eb] transition-colors" size={20} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2563eb] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-[#2563eb] text-white hover:bg-blue-700 rounded-2xl font-black text-lg shadow-xl shadow-[#2563eb]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                "เข้าสู่ระบบ (LOGIN)"
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex justify-center items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    <span>Secure Admin Access Only</span>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#2563eb]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>
    );
}
