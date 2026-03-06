import { Calendar as CalendarIcon, CreditCard, Home, LayoutDashboard, MessageCircleQuestion, Package, Settings, Users, Sparkles, UserCog, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SidebarLeft() {
    const router = useRouter();

    const handleLogout = async () => {
        if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <aside className="group w-24 hover:w-64 bg-[#111311] text-white flex flex-col py-8 rounded-r-3xl h-screen sticky top-0 custom-shadow z-20 transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5">
            <div className="mb-12 flex justify-center">
                {/* Logo */}
                <div className="w-10 h-10 border-2 border-[#bbfc2f] shrink-0 rounded flex items-center justify-center transform rotate-45 shadow-lg shadow-[#bbfc2f]/20">
                    <div className="transform -rotate-45 font-bold text-[#bbfc2f] text-lg">CP</div>
                </div>
            </div>
            <nav className="flex flex-col gap-4 flex-1 w-full px-5">
                <Link href="/" className="flex items-center p-3 bg-[#bbfc2f] text-black rounded-2xl cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 shadow-xl shadow-[#bbfc2f]/10">
                    <Home fill="currentColor" size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">หน้าแรก</span>
                </Link>
                <Link href="/dashboard" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <LayoutDashboard size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">แดชบอร์ด</span>
                </Link>
                <Link href="/bookings" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <CalendarIcon size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">จองคิวบริการ</span>
                </Link>
                <Link href="/stock" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <Package size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">สต็อกสินค้า</span>
                </Link>
                <Link href="/services" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <Sparkles size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">จัดการบริการ</span>
                </Link>
                <Link href="/payments" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <CreditCard size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">การชำระเงิน</span>
                </Link>
                <Link href="/customers" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <Users size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">จัดการลูกค้า</span>
                </Link>
                <Link href="/admin/users" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5 border-t border-white/5 pt-4 mt-2">
                    <UserCog size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">จัดการผู้ดูแล</span>
                </Link>
                <Link href="/settings" className="flex items-center p-3 text-gray-400 hover:text-white cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl hover:bg-white/5">
                    <Settings size={24} className="shrink-0" />
                    <span className="ml-4 font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]">ตั้งค่าระบบ</span>
                </Link>
            </nav>
            <div className="mt-auto px-5 w-full pb-8">
                <button
                    onClick={handleLogout}
                    className="flex items-center p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all duration-300 w-14 group-hover:w-full mx-auto group-hover:mx-0 rounded-2xl"
                >
                    <LogOut size={24} className="shrink-0" />
                    <span className="ml-4 font-black whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px] uppercase text-xs tracking-wider">ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    );
}
