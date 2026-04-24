"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Search, Filter, User, Phone, Calendar,
    Car, Clock, MoreVertical, Edit, Trash2,
    CheckCircle2, AlertCircle, Loader2, Plus,
    ExternalLink, MapPin, MessageSquare, ListFilter,
    ArrowRight, History, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter, DialogTrigger
} from "@/components/ui/dialog";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [viewingCustomer, setViewingCustomer] = useState<any>(null);
    const [customerBookings, setCustomerBookings] = useState<any[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    }, []);

    const filteredCustomers = customers.filter(c =>
        (c.firstName?.toLowerCase() + " " + c.lastName?.toLowerCase()).includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

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

    const calculateTimeRemaining = (nextDate: string) => {
        if (!nextDate) return null;
        const now = new Date();
        const next = new Date(nextDate);
        const diffInMs = next.getTime() - now.getTime();
        const diffInMonths = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 30));
        return diffInMonths;
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-6 py-6 overflow-y-auto w-full no-scrollbar">
                {/* Header */}
                <header className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <User className="text-[#2563eb] fill-[#2563eb]/20" size={28} />
                            จัดการลูกค้า (Customer Management)
                        </h1>
                        <p className="text-muted-foreground text-sm">ตรวจสอบข้อมูลลูกค้า รถ และติดตามกำหนดการเข้ารับบริการ</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8 items-stretch lg:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2563eb] transition-colors" size={18} />
                        <Input
                            placeholder="ค้นหาชื่อลูกค้า..."
                            className="w-full bg-white border-0 shadow-sm h-12 pl-12 pr-6 rounded-xl focus-visible:ring-2 focus-visible:ring-[#2563eb]/50 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white shadow-sm rounded-xl px-5 h-12 flex items-center gap-3 border-0 transition-all min-w-[150px]">
                        <div className="w-8 h-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="text-[#65a30d]" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">สมาชิกทั้งหมด</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-gray-900 leading-none">{customers.length}</span>
                                <span className="text-[10px] font-bold text-gray-500">คน</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table/Grid */}
                <div className="grid grid-cols-1 gap-4 pb-20">
                    {isLoading ? (
                        <div className="py-20 text-center bg-white rounded-2xl shadow-sm">
                            <Loader2 className="h-10 w-10 animate-spin text-[#2563eb] mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">กำลังโหลดข้อมูลลูกค้า...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">ไม่พบข้อมูลลูกค้า</h3>
                        </div>
                    ) : (
                        filteredCustomers.map((c) => {
                            const monthsLeft = calculateTimeRemaining(c.nextServiceDate);
                            return (
                                <Card key={c._id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-50 h-full min-h-[160px]">
                                        {/* Profile Info */}
                                        <div className="w-full md:w-[280px] p-5 flex flex-col justify-center bg-gray-50/50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-[#2563eb]/20 flex items-center justify-center shrink-0">
                                                    <User size={24} className="text-black" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-base text-gray-900">{c.firstName} {c.lastName}</h3>
                                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                                        <Phone size={12} className="mr-1" /> {c.phone}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-orange-100 text-orange-600 border-0 text-[10px]">{c.points} PTS</Badge>
                                                {c.isRegistered && <Badge className="bg-green-100 text-green-600 border-0 text-[10px]">Registered</Badge>}
                                            </div>
                                        </div>

                                        {/* Car Info */}
                                        <div className="flex-1 p-6 flex flex-col justify-center">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">ข้อมูลรถยนต์</div>
                                            {c.cars && c.cars.length > 0 ? (
                                                <div className="space-y-2">
                                                    {c.cars.map((car: any, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                            <Car className="text-gray-400 shrink-0" size={20} />
                                                            <div className="flex-1">
                                                                <div className="text-sm font-bold text-gray-900">{car.plate}</div>
                                                                <div className="text-[10px] text-gray-500">{car.brand} {car.model} • {car.size}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">ยังไม่มีข้อมูลรถ</p>
                                            )}
                                        </div>

                                        {/* Maintenance Tracking */}
                                        <div className="w-full md:w-[320px] p-6 flex flex-col justify-center">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">การติดตามการบริการ</div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">บริการล่าสุด:</span>
                                                    <span className="text-xs font-bold text-gray-900">{c.lastServiceDate ? new Date(c.lastServiceDate).toLocaleDateString('th-TH') : '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-black text-white shadow-md">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-[#2563eb]" />
                                                        <span className="text-[10px] font-bold">กำหนดครั้งถัดไป</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        {monthsLeft !== null ? (
                                                            <>
                                                                <span className="text-lg font-black text-[#2563eb]">{monthsLeft}</span>
                                                                <span className="text-[9px] text-white/60">เดือน</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-white/50">ไม่ได้กำหนด</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-full md:w-[120px] p-6 flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="w-10 h-10 rounded-full hover:bg-[#2563eb]/10 text-[#2563eb]"
                                                onClick={() => handleViewProfile(c)}
                                                title="ดูโปรไฟล์ลูกค้า"
                                            >
                                                <ExternalLink size={20} />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900"
                                                onClick={() => { setEditingCustomer({ ...c }); setIsEditModalOpen(true); }}
                                            >
                                                <Edit size={20} />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="w-10 h-10 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                                                onClick={() => handleDelete(c._id, `${c.firstName} ${c.lastName}`)}
                                            >
                                                <Trash2 size={20} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#0a0b0a] p-6 text-white">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Edit size={24} className="text-[#2563eb]" />
                                แก้ไขข้อมูลลูกค้า
                            </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                        {editingCustomer && (
                            <form onSubmit={handleEditSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>ชื่อจริง</Label>
                                        <Input
                                            value={editingCustomer.firstName}
                                            onChange={e => setEditingCustomer({ ...editingCustomer, firstName: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>นามสกุล</Label>
                                        <Input
                                            value={editingCustomer.lastName}
                                            onChange={e => setEditingCustomer({ ...editingCustomer, lastName: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>เบอร์โทรศัพท์</Label>
                                    <Input
                                        value={editingCustomer.phone}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t pt-6">
                                    <div className="space-y-2">
                                        <Label>บริการล่าสุด</Label>
                                        <Input
                                            type="date"
                                            value={editingCustomer.lastServiceDate ? new Date(editingCustomer.lastServiceDate).toISOString().split('T')[0] : ''}
                                            onChange={e => setEditingCustomer({ ...editingCustomer, lastServiceDate: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>กำหนดเช็คอัพครั้งถัดไป</Label>
                                        <Input
                                            type="date"
                                            value={editingCustomer.nextServiceDate ? new Date(editingCustomer.nextServiceDate).toISOString().split('T')[0] : ''}
                                            onChange={e => setEditingCustomer({ ...editingCustomer, nextServiceDate: e.target.value })}
                                            className="rounded-xl border-[#2563eb]/50 bg-[#2563eb]/5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 border-t pt-6">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            <Car size={18} className="text-[#2563eb]" /> จัดการรถยนต์ ({editingCustomer.cars?.length || 0})
                                        </Label>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm" 
                                            className="rounded-xl border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/5"
                                            onClick={() => {
                                                const newCars = [...(editingCustomer.cars || []), { plate: '', brand: '', model: '', color: '', size: 'S' }];
                                                setEditingCustomer({ ...editingCustomer, cars: newCars });
                                            }}
                                        >
                                            <Plus size={16} className="mr-1" /> เพิ่มรถ
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {editingCustomer.cars?.map((car: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                                <button 
                                                    type="button"
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    onClick={() => {
                                                        const newCars = editingCustomer.cars.filter((_: any, i: number) => i !== idx);
                                                        setEditingCustomer({ ...editingCustomer, cars: newCars });
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                                <div className="grid grid-cols-2 gap-3 mb-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-gray-400">ทะเบียนรถ</Label>
                                                        <Input 
                                                            placeholder="เช่น กข 1234"
                                                            value={car.plate}
                                                            onChange={e => {
                                                                const newCars = [...editingCustomer.cars];
                                                                newCars[idx].plate = e.target.value;
                                                                setEditingCustomer({ ...editingCustomer, cars: newCars });
                                                            }}
                                                            className="h-9 text-xs rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-gray-400">ขนาดรถ</Label>
                                                        <select 
                                                            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            value={car.size}
                                                            onChange={e => {
                                                                const newCars = [...editingCustomer.cars];
                                                                newCars[idx].size = e.target.value;
                                                                setEditingCustomer({ ...editingCustomer, cars: newCars });
                                                            }}
                                                        >
                                                            <option value="S">Small (S)</option>
                                                            <option value="M">Medium (M)</option>
                                                            <option value="L">Large (L)</option>
                                                            <option value="XL">Extra Large (XL)</option>
                                                            <option value="XXL">Super Car (XXL)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-gray-400">ยี่ห้อ</Label>
                                                        <Input 
                                                            placeholder="Toyota"
                                                            value={car.brand}
                                                            onChange={e => {
                                                                const newCars = [...editingCustomer.cars];
                                                                newCars[idx].brand = e.target.value;
                                                                setEditingCustomer({ ...editingCustomer, cars: newCars });
                                                            }}
                                                            className="h-9 text-xs rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-gray-400">รุ่น</Label>
                                                        <Input 
                                                            placeholder="Camry"
                                                            value={car.model}
                                                            onChange={e => {
                                                                const newCars = [...editingCustomer.cars];
                                                                newCars[idx].model = e.target.value;
                                                                setEditingCustomer({ ...editingCustomer, cars: newCars });
                                                            }}
                                                            className="h-9 text-xs rounded-lg"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-gray-400">สี</Label>
                                                        <Input 
                                                            placeholder="ขาว"
                                                            value={car.color}
                                                            onChange={e => {
                                                                const newCars = [...editingCustomer.cars];
                                                                newCars[idx].color = e.target.value;
                                                                setEditingCustomer({ ...editingCustomer, cars: newCars });
                                                            }}
                                                            className="h-9 text-xs rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!editingCustomer.cars || editingCustomer.cars.length === 0) && (
                                            <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-xs text-gray-400">ยังไม่มีข้อมูลรถ กดปุ่ม "เพิ่มรถ" เพื่อเริ่มบันทึก</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter className="p-6 pt-0">
                                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>ยกเลิก</Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-[#2563eb] text-white hover:bg-blue-700 rounded-xl px-8 font-bold">
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'บันทึกข้อมูล'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* View Profile Modal */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="sm:max-w-[800px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#0a0b0a] p-8 text-white relative">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-[#2563eb] flex items-center justify-center shadow-xl shadow-[#2563eb]/20 shrink-0">
                                    <User size={40} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <DialogTitle className="text-3xl font-black tracking-tight mb-1">
                                        {viewingCustomer?.firstName} {viewingCustomer?.lastName}
                                    </DialogTitle>
                                    <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
                                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-[#2563eb]" /> {viewingCustomer?.phone}</span>
                                        <span className="flex items-center gap-1.5"><Badge className="bg-[#2563eb]/20 text-[#2563eb] border-0">{viewingCustomer?.points} PTS</Badge></span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="max-h-[75vh] overflow-y-auto no-scrollbar bg-[#f8fafc] p-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Side: Cars */}
                                <div className="md:col-span-5 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Car size={18} className="text-[#2563eb]" /> รถที่ลงทะเบียน ({viewingCustomer?.cars?.length || 0})
                                        </h3>
                                        <div className="space-y-3">
                                            {viewingCustomer?.cars && viewingCustomer.cars.length > 0 ? (
                                                viewingCustomer.cars.map((car: any, idx: number) => (
                                                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group hover:border-[#2563eb]/30 transition-all">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-lg font-black text-gray-900">{car.plate}</span>
                                                            <Badge variant="outline" className="text-[10px] uppercase">{car.size}</Badge>
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-bold">{car.brand} {car.model}</div>
                                                        <div className="mt-2 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block">Color: {car.color}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-xs text-gray-400">ไม่มีข้อมูลรถ</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Card className="bg-black text-white p-6 rounded-[2rem] border-0 shadow-xl overflow-hidden relative">
                                        <div className="relative z-10">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563eb] mb-2">กำหนดการครั้งถัดไป</h4>
                                            <div className="text-2xl font-black mb-1">
                                                {viewingCustomer?.nextServiceDate ? new Date(viewingCustomer.nextServiceDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'ยังไม่ได้ระบุ'}
                                            </div>
                                            <p className="text-[10px] text-gray-400">กรุณาติดต่อแจ้งเตือนลูกค้าก่อนถึงกำหนด 3 วัน</p>
                                        </div>
                                        <Clock className="absolute -right-4 -bottom-4 text-[#2563eb] opacity-20 w-24 h-24" />
                                    </Card>
                                </div>

                                {/* Right Side: Service History */}
                                <div className="md:col-span-7 space-y-6">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <History size={18} className="text-[#2563eb]" /> ประวัติการใช้บริการ
                                    </h3>
                                    
                                    {isLoadingBookings ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
                                            <Loader2 className="animate-spin text-[#2563eb] mb-2" />
                                            <p className="text-xs text-gray-400">กำลังโหลดประวัติ...</p>
                                        </div>
                                    ) : customerBookings.length > 0 ? (
                                        <div className="space-y-3">
                                            {customerBookings.map((b: any) => {
                                                const carDetails = viewingCustomer?.cars?.find((c: any) => c.plate === b.carPlate);
                                                return (
                                                    <div key={b._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] group-hover:bg-[#2563eb] group-hover:text-white transition-all">
                                                                <Car size={24} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-black text-gray-900 leading-tight mb-1">{b.serviceId?.name}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant="secondary" className="text-[10px] font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 px-2 h-5">
                                                                        {b.carPlate}
                                                                    </Badge>
                                                                    {carDetails && (
                                                                        <span className="text-[11px] font-bold text-gray-600">
                                                                            {carDetails.brand} {carDetails.model}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                                        • {new Date(b.bookingDate).toLocaleDateString('th-TH')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-black text-gray-900">฿{b.price?.toLocaleString()}</div>
                                                            <Badge className={`text-[9px] px-2 py-0 h-4 border-0 mt-1 ${
                                                                b.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-600' : 
                                                                b.status === 'ยกเลิก' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                                            }`}>
                                                                {b.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-sm text-gray-400">ยังไม่เคยใช้บริการ</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="bg-white p-6 border-t">
                            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => setIsViewModalOpen(false)}>ปิดหน้าต่าง</Button>
                            <Button className="bg-[#2563eb] text-white hover:bg-blue-700 rounded-xl px-8 h-12 font-bold shadow-lg shadow-[#2563eb]/20" onClick={() => { setIsViewModalOpen(false); setEditingCustomer({...viewingCustomer}); setIsEditModalOpen(true); }}>
                                แก้ไขข้อมูลลูกค้า
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
