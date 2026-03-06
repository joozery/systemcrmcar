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
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
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

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <User className="text-[#bbfc2f] fill-[#bbfc2f]/20" size={28} />
                            จัดการลูกค้า (Customer Management)
                        </h1>
                        <p className="text-muted-foreground text-sm">ตรวจสอบข้อมูลลูกค้า รถ และติดตามกำหนดการเข้ารับบริการ</p>
                    </div>
                </header>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 mb-10 items-stretch lg:items-center">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bbfc2f] transition-colors" size={20} />
                        <Input
                            placeholder="ค้นหาชื่อลูกค้า หรือเบอร์โทรศัพท์..."
                            className="w-full bg-white border-0 shadow-sm h-16 pl-14 pr-6 rounded-2xl focus-visible:ring-2 focus-visible:ring-[#bbfc2f]/50 transition-all text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="bg-white shadow-sm rounded-2xl px-6 h-16 flex items-center gap-4 border-0 transition-all min-w-[200px]">
                        <div className="w-10 h-10 rounded-full bg-[#bbfc2f]/10 flex items-center justify-center shrink-0">
                            <Sparkles size={18} className="text-[#65a30d]" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">สมาชิกทั้งหมด</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900 leading-none">{customers.length}</span>
                                <span className="text-xs font-bold text-gray-500">คน</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table/Grid */}
                <div className="grid grid-cols-1 gap-6 pb-20">
                    {isLoading ? (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] shadow-sm">
                            <Loader2 className="h-10 w-10 animate-spin text-[#bbfc2f] mx-auto mb-4" />
                            <p className="text-gray-500">กำลังโหลดข้อมูลลูกค้า...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] shadow-sm border border-dashed border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">ไม่พบข้อมูลลูกค้า</h3>
                        </div>
                    ) : (
                        filteredCustomers.map((c) => {
                            const monthsLeft = calculateTimeRemaining(c.nextServiceDate);
                            return (
                                <Card key={c._id} className="rounded-[2.5rem] border-0 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-50 h-full min-h-[160px]">
                                        {/* Profile Info */}
                                        <div className="w-full md:w-[280px] p-6 flex flex-col justify-center bg-gray-50/50">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-14 h-14 rounded-2xl bg-[#bbfc2f]/20 flex items-center justify-center shrink-0">
                                                    <User size={28} className="text-black" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{c.firstName} {c.lastName}</h3>
                                                    <div className="flex items-center text-xs text-gray-500 font-medium">
                                                        <Phone size={12} className="mr-1" /> {c.phone}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-orange-100 text-orange-600 border-0">{c.points} แต้มสะสม</Badge>
                                                {c.isRegistered && <Badge className="bg-green-100 text-green-600 border-0">Registered</Badge>}
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
                                                <div className="flex items-center justify-between p-3 rounded-2xl bg-black text-white shadow-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-[#bbfc2f]" />
                                                        <span className="text-xs font-bold">กำหนดครั้งถัดไป</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        {monthsLeft !== null ? (
                                                            <>
                                                                <span className="text-xl font-black text-[#bbfc2f]">{monthsLeft}</span>
                                                                <span className="text-[10px] text-white/60">เดือน</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-white/50">ไม่ได้กำหนด</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="w-full md:w-[100px] p-6 flex items-center justify-center gap-2">
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
                    <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-[#111311] p-8 text-white">
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Edit size={24} className="text-[#bbfc2f]" />
                                แก้ไขข้อมูลลูกค้า
                            </DialogTitle>
                        </DialogHeader>
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
                                            className="rounded-xl border-[#bbfc2f]/50 bg-[#bbfc2f]/5"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>แต้มสะสม</Label>
                                    <Input
                                        type="number"
                                        value={editingCustomer.points}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, points: Number(e.target.value) })}
                                        className="rounded-xl"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>ยกเลิก</Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-[#bbfc2f] text-black hover:bg-[#a3e635] rounded-xl px-8 font-bold">
                                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'บันทึกข้อมูล'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
