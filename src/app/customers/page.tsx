"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Search, User, Phone, Calendar,
    Car, Clock, Edit, Trash2,
    CheckCircle2, Loader2, Plus,
    ExternalLink, Sparkles, Minus, Gift,
    ChevronLeft, ChevronRight, MoreHorizontal,
    UserPlus, ShieldCheck, Mail, MapPin, History,
    TrendingUp, Users, Award, Bell, Filter,
    Download, LayoutGrid, List, Info, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // all, registered, overdue, with_cars
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [viewingCustomer, setViewingCustomer] = useState<any>(null);
    const [customerBookings, setCustomerBookings] = useState<any[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCarFilter, setSelectedCarFilter] = useState<string>("all");
    const [globalPackages, setGlobalPackages] = useState<any[]>([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/customers');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomers(data);
            }
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            const pkgs = data.find((s: any) => s.key === 'global_packages')?.value || [];
            setGlobalPackages(pkgs);
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    };

    const calculateTimeRemaining = (nextDate: string) => {
        if (!nextDate) return null;
        const now = new Date();
        const next = new Date(nextDate);
        const diffInMs = next.getTime() - now.getTime();
        return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    };

    const filteredCustomers = customers.filter(c => {
        // Search Filter
        const matchesSearch = (c.firstName?.toLowerCase() + " " + c.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
            c.phone?.includes(searchTerm) ||
            c.cars?.some((car: any) => car.plate?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (!matchesSearch) return false;

        // Status Filter
        if (filterStatus === "registered") return c.isRegistered;
        if (filterStatus === "overdue") {
            const days = calculateTimeRemaining(c.nextServiceDate);
            return days !== null && days <= 0;
        }
        if (filterStatus === "with_cars") return c.cars && c.cars.length > 0;
        
        return true;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

    const registeredCount = customers.filter(c => c.isRegistered).length;
    const totalPoints = customers.reduce((sum, c) => sum + (c.points || 0), 0);
    const totalCars = customers.reduce((sum, c) => sum + (c.cars?.length || 0), 0);

    const handleExportCSV = () => {
        if (filteredCustomers.length === 0) return alert("ไม่มีข้อมูลสำหรับการ Export");

        const headers = ["ID", "Name", "Phone", "Points", "Registered", "Cars", "Next Service"];
        const rows = filteredCustomers.map(c => [
            c._id,
            `${c.firstName} ${c.lastName}`,
            c.phone,
            c.points,
            c.isRegistered ? "Yes" : "No",
            c.cars?.map((car: any) => car.plate).join(" | "),
            c.nextServiceDate ? new Date(c.nextServiceDate).toLocaleDateString('th-TH') : "-"
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `customer_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/customers/${editingCustomer._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCustomer)
            });
            if (res.ok) {
                const updated = await res.json();
                setCustomers(customers.map(c => c._id === updated._id ? updated : c));
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to update customer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickSetNextService = async (customerId: string, months: number) => {
        const today = new Date();
        const nextDate = new Date(today.setMonth(today.getMonth() + months));
        
        try {
            const res = await fetch(`/api/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nextServiceDate: nextDate.toISOString() })
            });
            if (res.ok) {
                const updated = await res.json();
                setCustomers(customers.map(c => c._id === updated._id ? updated : c));
                if (viewingCustomer?._id === updated._id) {
                    setViewingCustomer(updated);
                }
            }
        } catch (error) {
            console.error("Failed to quick set next service:", error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`คุณต้องการลบข้อมูลลูกค้า "${name}" ใช่หรือไม่?`)) return;
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCustomers(customers.filter(c => c._id !== id));
            }
        } catch (error) {
            console.error("Failed to delete customer:", error);
        }
    };

    const handleViewProfile = async (customer: any) => {
        setViewingCustomer(customer);
        setIsViewModalOpen(true);
        setIsLoadingBookings(true);
        setSelectedCarFilter("all");
        try {
            const res = await fetch(`/api/bookings?customerId=${customer._id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setCustomerBookings(data);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleAddPackageFromGlobal = async (customer: any, globalPkg: any) => {
        const newPackage = {
            _id: Math.random().toString(36).substr(2, 9),
            name: globalPkg.name,
            totalWashes: globalPkg.totalWashes,
            remainingWashes: globalPkg.totalWashes,
            status: 'active',
            purchaseDate: new Date().toISOString()
        };

        const updatedPackages = [...(customer.packages || []), newPackage];

        try {
            const res = await fetch(`/api/customers/${customer._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packages: updatedPackages })
            });
            if (res.ok) {
                const updated = await res.json();
                setCustomers(customers.map(c => c._id === updated._id ? updated : c));
                setViewingCustomer(updated);
                alert(`เพิ่มแพ็กเกจ "${globalPkg.name}" ให้ลูกค้าเรียบร้อยแล้ว ✨`);
            }
        } catch (error) {
            console.error("Failed to add global package:", error);
        }
    };

    const handleDeductPackage = async (customer: any, packageId: string) => {
        if (!confirm("ต้องการหักจำนวนครั้งการใช้งานในแพ็กเกจนี้ใช่หรือไม่?")) return;
        
        const updatedPackages = customer.packages.map((p: any) => {
            if (p._id === packageId && p.remainingWashes > 0) {
                return { ...p, remainingWashes: p.remainingWashes - 1 };
            }
            return p;
        });

        try {
            const res = await fetch(`/api/customers/${customer._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packages: updatedPackages })
            });
            if (res.ok) {
                const updated = await res.json();
                setCustomers(customers.map(c => c._id === updated._id ? updated : c));
                setViewingCustomer(updated);
            }
        } catch (error) {
            console.error("Failed to deduct package:", error);
        }
    };

    const filteredHistory = selectedCarFilter === "all" 
        ? customerBookings 
        : customerBookings.filter(b => b.carPlate === selectedCarFilter);

    return (
        <div className="flex bg-[#f8fafc] h-screen overflow-hidden font-sans w-full text-slate-900">
            <SidebarLeft />

            <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                {/* Professional Stable Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Users size={24} className="text-blue-600" />
                            ฐานข้อมูลลูกค้า
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Master Customer Database</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-6 px-6 border-r border-slate-100">
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Clients</div>
                                <div className="text-sm font-black text-slate-900">{customers.length.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Cars</div>
                                <div className="text-sm font-black text-blue-600">{totalCars.toLocaleString()}</div>
                            </div>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-4 rounded-xl border-slate-200 font-bold text-xs bg-white hover:bg-slate-50 transition-all"
                            onClick={handleExportCSV}
                        >
                            <Download size={14} className="mr-2" /> Export CSV
                        </Button>
                    </div>
                </header>

                <div className="p-8 flex-1 overflow-y-auto no-scrollbar space-y-6">
                    {/* Search & Filter Bar */}
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <Input
                                placeholder="ค้นหาด้วยชื่อ, เบอร์โทรศัพท์ หรือเลขทะเบียนรถ..."
                                className="w-full bg-transparent border-0 h-10 pl-12 pr-6 text-sm font-medium text-slate-900 focus-visible:ring-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="h-6 w-[1px] bg-slate-100" />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 rounded-xl font-bold text-xs px-4 text-slate-500 hover:text-slate-900">
                                    <Filter size={16} className="mr-2" /> 
                                    {filterStatus === "all" ? "คัดกรองทั้งหมด" : 
                                     filterStatus === "registered" ? "สมาชิก Verified" : 
                                     filterStatus === "overdue" ? "นัดหมายที่เลยกำหนด" : "ลูกค้าที่มีรถ"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-100">
                                <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">Filter by Status</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 cursor-pointer" onClick={() => setFilterStatus("all")}>ทั้งหมด</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 cursor-pointer" onClick={() => setFilterStatus("registered")}>สมาชิก Verified เท่านั้น</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 cursor-pointer" onClick={() => setFilterStatus("overdue")}>นัดหมายที่เลยกำหนด</DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg font-bold text-xs py-2.5 cursor-pointer" onClick={() => setFilterStatus("with_cars")}>ลูกค้าที่มีข้อมูลรถ</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Stable Data Table */}
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-slate-200 h-12">
                                        <TableHead className="pl-6 font-bold text-slate-500 text-[10px] uppercase tracking-wider">ลูกค้า</TableHead>
                                        <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">เบอร์โทรศัพท์</TableHead>
                                        <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider text-center">แต้มสะสม</TableHead>
                                        <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">ยานพาหนะ</TableHead>
                                        <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">นัดหมายถัดไป</TableHead>
                                        <TableHead className="pr-6 text-right font-bold text-slate-500 text-[10px] uppercase tracking-wider">จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="h-96 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></TableCell></TableRow>
                                    ) : paginatedCustomers.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="h-96 text-center text-slate-400 font-bold uppercase tracking-widest">ไม่พบข้อมูลลูกค้า</TableCell></TableRow>
                                    ) : (
                                        paginatedCustomers.map((c) => {
                                            const daysLeft = calculateTimeRemaining(c.nextServiceDate);
                                            return (
                                                <TableRow key={c._id} className="group hover:bg-slate-50 transition-colors border-slate-100 h-16">
                                                    <TableCell className="pl-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative shrink-0">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                                    <User size={20} />
                                                                </div>
                                                                {c.isRegistered && (
                                                                    <div className="absolute -right-1 -bottom-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                                        <CheckCircle2 size={10} className="text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1 truncate">{c.firstName} {c.lastName}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {c._id.substring(c._id.length-6).toUpperCase()}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-slate-600">{c.phone}</TableCell>
                                                    <TableCell className="text-center font-black text-slate-900 text-sm">{c.points.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 flex-wrap max-w-[300px]">
                                                            {c.cars && c.cars.length > 0 ? (
                                                                <>
                                                                    {c.cars.slice(0, 2).map((car: any, idx: number) => (
                                                                        <Badge key={idx} variant="outline" className="bg-white border-slate-200 text-slate-700 font-bold text-[10px] h-6 px-2 rounded-lg flex items-center gap-1.5 shadow-sm group-hover:border-blue-200 transition-all">
                                                                            <Car size={10} className="text-blue-500" />
                                                                            {car.plate}
                                                                        </Badge>
                                                                    ))}
                                                                    {c.cars.length > 2 && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Badge variant="secondary" className="h-6 px-2 text-[10px] font-black text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-help rounded-lg">
                                                                                        +{c.cars.length - 2} คัน
                                                                                    </Badge>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent className="bg-slate-900 text-white border-0 rounded-xl p-3 shadow-2xl">
                                                                                    <div className="space-y-2">
                                                                                        {c.cars.slice(2).map((car: any, i: number) => (
                                                                                            <div key={i} className="text-[10px] font-bold flex items-center gap-3 border-b border-slate-800 pb-1 last:border-0 last:pb-0">
                                                                                                <Car size={12} className="text-blue-500" /> 
                                                                                                <div>
                                                                                                    <div className="text-white">{car.plate}</div>
                                                                                                    <div className="text-slate-500 uppercase">{car.brand} {car.model}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                </>
                                                            ) : <span className="text-xs text-slate-200">/</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {daysLeft !== null ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "w-9 h-9 rounded-xl flex items-center justify-center border font-black text-sm",
                                                                    daysLeft <= 3 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-blue-50 border-blue-100 text-blue-600"
                                                                )}>
                                                                    {Math.abs(daysLeft)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{daysLeft >= 0 ? 'เหลืออีก (วัน)' : 'เลยกำหนด'}</div>
                                                                    <div className="text-[10px] font-bold text-slate-600">{new Date(c.nextServiceDate).toLocaleDateString('th-TH')}</div>
                                                                </div>
                                                            </div>
                                                        ) : <span className="text-xs text-slate-200">/</span>}
                                                    </TableCell>
                                                    <TableCell className="pr-6 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Button
                                                                variant="ghost" size="icon"
                                                                className="h-9 w-9 rounded-xl hover:bg-blue-600 hover:text-white text-blue-600 transition-all"
                                                                onClick={() => handleViewProfile(c)}
                                                            >
                                                                <ExternalLink size={16} />
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:bg-slate-100">
                                                                        <MoreHorizontal className="h-4.5 w-4.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 border-slate-100 shadow-2xl bg-white">
                                                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer focus:bg-slate-50" onClick={() => { setEditingCustomer({ ...c }); setIsEditModalOpen(true); }}>
                                                                        <Edit className="mr-3 h-4 w-4 text-blue-600" /> แก้ไขข้อมูลโปรไฟล์
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-slate-50" />
                                                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 text-rose-600 focus:bg-rose-50 cursor-pointer" onClick={() => handleDelete(c._id, `${c.firstName} ${c.lastName}`)}>
                                                                        <Trash2 className="mr-3 h-4 w-4" /> ลบข้อมูลลูกค้า
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {/* Professional Pagination */}
                    {!isLoading && (
                        <div className="flex items-center justify-between gap-6 px-4 pb-12">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                แสดงผล {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} จาก {filteredCustomers.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="sm" className="h-10 px-5 rounded-2xl text-slate-700 border-slate-200 bg-white font-bold text-xs hover:bg-slate-50 disabled:opacity-30"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} className="mr-2" /> ก่อนหน้า
                                </Button>
                                <Button
                                    variant="outline" size="sm" className="h-10 px-5 rounded-2xl text-slate-700 border-slate-200 bg-white font-bold text-xs hover:bg-slate-50 disabled:opacity-30"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    ถัดไป <ChevronRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Professional Customer View Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="sm:max-w-[850px] rounded-[2rem] p-0 overflow-hidden border-0 bg-[#f8fafc] shadow-2xl">
                        <DialogHeader className="bg-white px-8 py-6 border-b border-slate-100 flex-row items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0">
                                    <User size={32} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {viewingCustomer?.firstName} {viewingCustomer?.lastName}
                                        </DialogTitle>
                                        <Badge className="bg-blue-50 text-blue-600 border-0 text-[9px] font-black h-5 px-2 rounded-md uppercase tracking-wider">Member</Badge>
                                    </div>
                                    <div className="flex items-center gap-5 text-[11px] font-bold text-slate-500">
                                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-blue-500" /> {viewingCustomer?.phone}</span>
                                        <span className="flex items-center gap-1.5 text-amber-600"><Award size={12} /> {viewingCustomer?.points} แต้ม</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">นัดหมายครั้งถัดไป</div>
                                <div className="text-xl font-black text-blue-600 leading-none mb-3">
                                    {viewingCustomer?.nextServiceDate ? new Date(viewingCustomer.nextServiceDate).toLocaleDateString('th-TH') : '-'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 px-3 rounded-lg text-[9px] font-black bg-white border-blue-100 text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleQuickSetNextService(viewingCustomer._id, 1)}
                                    >
                                        + 1 เดือน
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 px-3 rounded-lg text-[9px] font-black bg-white border-blue-100 text-blue-600 hover:bg-blue-50"
                                        onClick={() => handleQuickSetNextService(viewingCustomer._id, 3)}
                                    >
                                        + 3 เดือน
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left: Assets */}
                                <div className="md:col-span-5 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <Car size={16} className="text-blue-500" /> รายการรถ
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {viewingCustomer?.cars?.map((car: any, idx: number) => (
                                                <div key={idx} className={cn(
                                                    "bg-white p-4 rounded-2xl border transition-all cursor-pointer group/car shadow-sm",
                                                    selectedCarFilter === car.plate ? "border-blue-500 ring-2 ring-blue-500/5" : "border-slate-100 hover:border-blue-200"
                                                )} onClick={() => setSelectedCarFilter(car.plate)}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-lg font-black text-slate-900 tracking-tight">{car.plate}</div>
                                                        <Badge variant="secondary" className="text-[9px] font-black h-5 px-2 rounded-md uppercase">{car.size}</Badge>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">{car.brand} {car.model}</div>
                                                    <div className="text-[9px] font-bold text-slate-400 flex items-center gap-3 border-t border-slate-50 pt-2">
                                                        <span>สี: {car.color}</span>
                                                        <span>ปี: {car.year || '-'}</span>
                                                        <ExternalLink size={10} className={cn("ml-auto", selectedCarFilter === car.plate ? "text-blue-500" : "text-slate-200")} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Packages Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <Sparkles size={16} className="text-emerald-500" /> แพ็กเกจของลูกค้า
                                            </h3>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 px-2.5 rounded-lg text-[9px] font-black bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                                                        <Plus size={12} className="mr-1" /> เพิ่มแพ็กเกจ
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl border-slate-100 bg-white">
                                                    <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">เลือกจากแพ็กเกจส่วนกลาง</DropdownMenuLabel>
                                                    {globalPackages.length > 0 ? (
                                                        globalPackages.map((gp, i) => (
                                                            <DropdownMenuItem 
                                                                key={i} 
                                                                className="rounded-xl font-black text-xs py-4 px-4 cursor-pointer flex justify-between items-center hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white transition-all mb-1 border border-slate-50 shadow-sm"
                                                                onSelect={() => handleAddPackageFromGlobal(viewingCustomer, gp)}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm tracking-tight">{gp.name}</span>
                                                                    <span className="text-[9px] opacity-60 uppercase font-black">คลิกเพื่อเพิ่มแพ็กเกจนี้</span>
                                                                </div>
                                                                <Badge className="bg-emerald-500 text-white border-0 h-6 px-2 font-black shadow-sm group-hover:bg-white group-hover:text-emerald-600">
                                                                    {gp.totalWashes} ครั้ง
                                                                </Badge>
                                                            </DropdownMenuItem>
                                                        ))
                                                    ) : (
                                                        <div className="text-[10px] text-slate-400 font-bold px-2 py-4 text-center italic">ยังไม่ได้ตั้งค่าแพ็กเกจส่วนกลาง</div>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        
                                        {viewingCustomer?.packages?.some((p:any) => p.status === 'active') ? (
                                            viewingCustomer.packages.filter((p:any) => p.status === 'active').map((pkg: any, idx: number) => (
                                                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group/pkg">
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -mr-8 -mt-8 opacity-50"></div>
                                                    <div className="relative flex items-center justify-between mb-4">
                                                        <div className="text-[11px] font-black text-slate-900">{pkg.name}</div>
                                                        <div className="text-2xl font-black text-emerald-600 leading-none">{pkg.remainingWashes} <span className="text-[10px] text-slate-300">/ {pkg.totalWashes}</span></div>
                                                    </div>
                                                    <Button className="w-full h-9 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] shadow-lg shadow-slate-100" onClick={(e) => { e.stopPropagation(); handleDeductPackage(viewingCustomer, pkg._id); }}>บันทึกการใช้งาน (หัก 1 ครั้ง)</Button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center bg-white rounded-2xl border border-dashed border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-widest">ยังไม่มีแพ็กเกจ</div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: History */}
                                <div className="md:col-span-7 space-y-6">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <History size={16} className="text-blue-500" /> ประวัติการใช้บริการ
                                        </h3>
                                        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                                            <Button variant="ghost" size="sm" className={cn("h-7 px-3 text-[9px] font-black rounded-lg", selectedCarFilter === "all" ? "bg-slate-900 text-white" : "text-slate-400")} onClick={() => setSelectedCarFilter("all")}>ทั้งหมด</Button>
                                            {viewingCustomer?.cars?.slice(0, 2).map((car: any) => (
                                                <Button key={car.plate} variant="ghost" size="sm" className={cn("h-7 px-3 text-[9px] font-black rounded-lg", selectedCarFilter === car.plate ? "bg-slate-900 text-white" : "text-slate-400")} onClick={() => setSelectedCarFilter(car.plate)}>{car.plate}</Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {isLoadingBookings ? (
                                            <div className="py-20 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-blue-500" /></div>
                                        ) : filteredHistory.length > 0 ? (
                                            filteredHistory.map((b: any) => (
                                                <div key={b._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                            <Car size={24} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-900 leading-tight mb-1">{b.serviceId?.name}</div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge className="text-[8px] font-black bg-blue-50 text-blue-600 border-0 h-4.5 px-2 rounded-md">{b.carPlate}</Badge>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(b.bookingDate).toLocaleDateString('th-TH')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-slate-900 leading-none mb-1">฿{b.price?.toLocaleString()}</div>
                                                        <Badge className={cn("text-[7px] font-bold px-2 py-0.5 rounded-md border-0 uppercase tracking-widest", b.status === 'เสร็จสิ้น' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{b.status}</Badge>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-[10px] font-black text-slate-300 uppercase tracking-widest">No History Data</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="bg-white px-8 py-5 border-t border-slate-100 flex items-center justify-between">
                            <Button variant="ghost" size="sm" className="rounded-xl px-6 h-10 font-black text-[10px] text-slate-400 uppercase tracking-widest" onClick={() => setIsViewModalOpen(false)}>ปิดหน้าต่าง</Button>
                            <Button size="sm" className="bg-slate-900 text-white hover:bg-black rounded-xl px-10 h-10 font-black text-xs shadow-lg transition-all" onClick={() => { setIsViewModalOpen(false); setEditingCustomer({...viewingCustomer}); setIsEditModalOpen(true); }}>
                                แก้ไขข้อมูลโปรไฟล์
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Stable Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[550px] rounded-[2rem] p-0 overflow-hidden border-0 bg-white shadow-2xl">
                        <DialogHeader className="bg-slate-900 px-8 py-5 text-white">
                            <DialogTitle className="text-lg font-bold">แก้ไขฐานข้อมูลลูกค้า</DialogTitle>
                        </DialogHeader>
                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                            {editingCustomer && (
                                <form onSubmit={handleEditSave} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">First Name</Label>
                                            <Input value={editingCustomer.firstName} onChange={e => setEditingCustomer({...editingCustomer, firstName: e.target.value})} className="h-10 text-xs font-bold rounded-xl" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Last Name</Label>
                                            <Input value={editingCustomer.lastName} onChange={e => setEditingCustomer({...editingCustomer, lastName: e.target.value})} className="h-10 text-xs font-bold rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</Label>
                                        <Input value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} className="h-10 text-xs font-black rounded-xl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase">Last Service</Label>
                                            <Input type="date" value={editingCustomer.lastServiceDate ? new Date(editingCustomer.lastServiceDate).toISOString().split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, lastServiceDate: e.target.value})} className="h-10 text-xs font-bold rounded-xl" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold text-blue-500 uppercase">Next Service Due</Label>
                                            <Input type="date" value={editingCustomer.nextServiceDate ? new Date(editingCustomer.nextServiceDate).toISOString().split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, nextServiceDate: e.target.value})} className="h-10 text-xs font-black text-blue-600 rounded-xl bg-blue-50 border-blue-100" />
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                        <DialogFooter className="px-8 py-4 border-t bg-slate-50">
                            <Button size="sm" variant="ghost" className="text-xs font-bold" onClick={() => setIsEditModalOpen(false)}>ยกเลิก</Button>
                            <Button size="sm" className="bg-blue-600 text-white rounded-xl h-10 px-8 font-bold text-xs" onClick={(e:any) => handleEditSave(e)}>บันทึกข้อมูล</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
