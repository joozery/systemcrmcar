import { Calendar as CalendarIcon, CreditCard, Home, LayoutDashboard, MessageCircleQuestion, Package, Settings, Users, Sparkles, UserCog, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export function SidebarLeft() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        if (confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        }
    };

    const navItems = [
        { href: "/", icon: Home, label: "หน้าแรก" },
        { href: "/dashboard", icon: LayoutDashboard, label: "แดชบอร์ด" },
        { href: "/bookings", icon: CalendarIcon, label: "จองคิวบริการ" },
        { href: "/stock", icon: Package, label: "สต็อกสินค้า" },
        { href: "/services", icon: Sparkles, label: "จัดการบริการ" },
        { href: "/payments", icon: CreditCard, label: "การชำระเงิน" },
        { href: "/customers", icon: Users, label: "จัดการลูกค้า" },
    ];

    const adminItems = [
        { href: "/admin/users", icon: UserCog, label: "จัดการผู้ดูแล" },
        { href: "/settings", icon: Settings, label: "ตั้งค่าระบบ" },
    ];

    const renderItem = (item: any) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
            <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center p-2.5 rounded-xl cursor-pointer transition-all duration-300 w-12 group-hover:w-full mx-auto group-hover:mx-0 ${
                    isActive 
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <Icon size={20} className="shrink-0" fill={isActive ? "currentColor" : "none"} />
                <span className={`ml-3 text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px]`}>
                    {item.label}
                </span>
            </Link>
        );
    };

    return (
        <aside className="group w-20 hover:w-56 bg-[#0a0b0a] text-white flex flex-col py-6 rounded-r-2xl h-screen sticky top-0 custom-shadow z-20 transition-all duration-300 ease-in-out overflow-hidden border-r border-white/5">
            <div className="mb-10 flex justify-center">
                {/* Logo */}
                <div className="w-9 h-9 border-2 border-[#2563eb] shrink-0 rounded flex items-center justify-center transform rotate-45 shadow-lg shadow-[#2563eb]/20">
                    <div className="transform -rotate-45 font-bold text-[#2563eb] text-base">CP</div>
                </div>
            </div>
            <nav className="flex flex-col gap-2 flex-1 w-full px-3">
                {navItems.map(renderItem)}
                <div className="my-2 border-t border-white/5" />
                {adminItems.map(renderItem)}
            </nav>
            <div className="mt-auto px-3 w-full pb-6">
                <button
                    onClick={handleLogout}
                    className="flex items-center p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-all duration-300 w-12 group-hover:w-full mx-auto group-hover:mx-0 rounded-xl"
                >
                    <LogOut size={20} className="shrink-0" />
                    <span className="ml-3 text-xs font-bold whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[200px] uppercase tracking-wider">ออกจากระบบ</span>
                </button>
            </div>
        </aside>
    );
}
