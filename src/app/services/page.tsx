"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Plus, Search, Filter, Sparkles, Clock,
    Tag, MoreVertical, Edit, Trash2,
    CheckCircle2, AlertCircle, ImageIcon, X,
    Car, ShieldCheck, Droplets, Loader2,
    Coins, Gift, Bell, ChevronRight, Layers,
    ArrowLeft, MoveUp, MoveDown, Grid
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

export default function ServicesPage() {
    const [view, setView] = useState<'categories' | 'services'>('categories');
    const [categories, setCategories] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Category Modals
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isCatEditMode, setIsCatEditMode] = useState(false);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState({ name: "", description: "", order: 0 });

    // Service Modals
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isServiceEditMode, setIsServiceEditMode] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [newService, setNewService] = useState({
        name: "",
        categoryId: "",
        description: "",
        prices: { Bike: 0, S: 0, M: 0, L: 0, X: 0, XL: 0, XXL: 0 },
        pointCost: { Bike: 0, S: 0, M: 0, L: 0, X: 0, XL: 0, XXL: 0 },
        redeemable: false,
        duration: "",
        maintenanceIntervalMonths: 0,
        maintenanceIntervalUnit: "months",
        maintenanceServiceId: "",
        status: "เปิดให้บริการ",
        image: "",
        priceType: "size",
        order: 0
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catRes, srvRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/services')
            ]);
            const catData = await catRes.json();
            const srvData = await srvRes.json();
            
            if (Array.isArray(catData)) setCategories(catData);
            if (Array.isArray(srvData)) setServices(srvData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Category Actions ---
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const method = isCatEditMode ? 'PUT' : 'POST';
            const url = isCatEditMode ? `/api/categories/${editingCatId}` : '/api/categories';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });

            if (res.ok) {
                await fetchData();
                setIsCatModalOpen(false);
                setNewCategory({ name: "", description: "", order: 0 });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        const catServices = services.filter(s => s.categoryId === id);
        if (catServices.length > 0) {
            alert(`ไม่สามารถลบหมวดหมู่ "${name}" ได้ เนื่องจากยังมีบริการภายในหมวดนี้ กรุณาย้ายหรือลบบริการออกก่อน`);
            return;
        }
        if (!confirm(`ยืนยันการลบหมวดหมู่ "${name}"?`)) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const openEditCategory = (cat: any) => {
        setIsCatEditMode(true);
        setEditingCatId(cat._id);
        setNewCategory({ name: cat.name, description: cat.description || "", order: cat.order || 0 });
        setIsCatModalOpen(true);
    };

    // --- Service Actions ---
    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...newService,
                categoryId: selectedCategory?._id || newService.categoryId,
                maintenanceServiceId: newService.maintenanceServiceId === "" ? null : newService.maintenanceServiceId
            };

            if (isServiceEditMode && editingServiceId) {
                const res = await fetch(`/api/services/${editingServiceId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    await fetchData();
                    setIsServiceModalOpen(false);
                    resetServiceForm();
                }
            } else {
                // Generate simple ID
                const nextIdNumber = services.length > 0
                    ? Math.max(...services.map(s => parseInt(s.id?.split('-')[1]) || 0)) + 1
                    : 1;
                const nextId = `SRV-${nextIdNumber.toString().padStart(3, '0')}`;

                const res = await fetch('/api/services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id: nextId })
                });
                if (res.ok) {
                    await fetchData();
                    setIsServiceModalOpen(false);
                    resetServiceForm();
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (!confirm(`ลบบริการ "${name}"?`)) return;
        try {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const openEditService = (srv: any) => {
        setIsServiceEditMode(true);
        setEditingServiceId(srv.id);
        setNewService({
            name: srv.name,
            categoryId: srv.categoryId || "",
            description: srv.description || "",
            prices: { ...srv.prices },
            pointCost: srv.pointCost ? { ...srv.pointCost } : { Bike: 0, S: 0, M: 0, L: 0, X: 0, XL: 0, XXL: 0 },
            redeemable: srv.redeemable || false,
            duration: srv.duration || "",
            maintenanceIntervalMonths: srv.maintenanceIntervalMonths || 0,
            maintenanceIntervalUnit: srv.maintenanceIntervalUnit || "months",
            maintenanceServiceId: srv.maintenanceServiceId || "",
            status: srv.status || "เปิดให้บริการ",
            image: srv.image || "",
            priceType: srv.priceType || "size",
            order: srv.order || 0
        });
        setIsServiceModalOpen(true);
    };

    const resetServiceForm = () => {
        setIsServiceEditMode(false);
        setEditingServiceId(null);
        setNewService({
            name: "",
            categoryId: selectedCategory?._id || "",
            description: "",
            prices: { Bike: 0, S: 0, M: 0, L: 0, X: 0, XL: 0, XXL: 0 },
            pointCost: { Bike: 0, S: 0, M: 0, L: 0, X: 0, XL: 0, XXL: 0 },
            redeemable: false,
            duration: "",
            maintenanceIntervalMonths: 0,
            maintenanceIntervalUnit: "months",
            maintenanceServiceId: "",
            status: "เปิดให้บริการ",
            image: "",
            priceType: "size",
            order: 0
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewService({ ...newService, image: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const moveItem = async (type: 'category' | 'service', id: string, direction: 'up' | 'down') => {
        const items = type === 'category' ? categories : services.filter(s => s.categoryId === selectedCategory?._id);
        const index = items.findIndex(item => (type === 'category' ? item._id : item.id) === id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        const updatedItems = [...items];
        const temp = updatedItems[index];
        updatedItems[index] = updatedItems[newIndex];
        updatedItems[newIndex] = temp;

        // Update orders in bulk (simplified: send one by one or create a bulk API)
        // For now, let's just update the two affected items
        const itemA = updatedItems[index];
        const itemB = updatedItems[newIndex];

        try {
            const updateUrl = (id: string, objId?: string) => type === 'category' ? `/api/categories/${objId}` : `/api/services/${id}`;
            await Promise.all([
                fetch(updateUrl(itemA.id, itemA._id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: index })
                }),
                fetch(updateUrl(itemB.id, itemB._id), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: newIndex })
                })
            ]);
            await fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredServices = services.filter(srv => 
        srv.categoryId === selectedCategory?._id &&
        srv.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="flex bg-[#f8fafc] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
                {/* Header with Navigation Breadcrumbs */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <button 
                            onClick={() => setView('categories')}
                            className={`text-xs font-black uppercase tracking-widest transition-colors ${view === 'categories' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            หมวดหมู่ทั้งหมด
                        </button>
                        {view === 'services' && (
                            <>
                                <ChevronRight size={14} className="text-slate-300" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-900">{selectedCategory?.name}</span>
                            </>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                                {view === 'categories' ? <Layers size={28} className="text-white" /> : <Grid size={28} className="text-white" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {view === 'categories' ? 'จัดการหมวดหมู่บริการ' : selectedCategory?.name}
                                </h1>
                                <p className="text-slate-400 text-xs font-bold">
                                    {view === 'categories' ? 'เลือกหมวดหมู่เพื่อดูหรือจัดการรายการบริการภายใน' : `จัดการรายการบริการและแพ็กเกจในหมวด ${selectedCategory?.name}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {view === 'categories' ? (
                                <Button 
                                    onClick={() => { setIsCatEditMode(false); setNewCategory({ name: "", description: "", order: categories.length }); setIsCatModalOpen(true); }}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl px-6 h-12 shadow-lg shadow-indigo-100 font-black"
                                >
                                    <Plus size={18} className="mr-2" /> เพิ่มหมวดหมู่
                                </Button>
                            ) : (
                                <>
                                    <Button 
                                        variant="outline"
                                        onClick={() => setView('categories')}
                                        className="rounded-xl h-12 px-6 border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> กลับ
                                    </Button>
                                    <Button 
                                        onClick={() => { resetServiceForm(); setIsServiceModalOpen(true); }}
                                        className="bg-slate-900 text-white hover:bg-black rounded-xl px-6 h-12 shadow-lg shadow-slate-200 font-black"
                                    >
                                        <Plus size={18} className="mr-2" /> เพิ่มรายการในหมวดนี้
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Filters */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <Input
                        placeholder={view === 'categories' ? "ค้นหาหมวดหมู่..." : "ค้นหาบริการในหมวดนี้..."}
                        className="w-full bg-white border-none shadow-sm h-16 pl-14 pr-6 rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-600/20 text-base font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Main Content Grid */}
                {isLoading ? (
                    <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-slate-100">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">กำลังเตรียมข้อมูล...</p>
                    </div>
                ) : view === 'categories' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {filteredCategories.map((cat, idx) => {
                            const catSrvCount = services.filter(s => s.categoryId === cat._id).length;
                            return (
                                <Card 
                                    key={cat._id} 
                                    className="group rounded-3xl border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white cursor-pointer"
                                    onClick={() => { setSelectedCategory(cat); setView('services'); setSearchTerm(""); }}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                <Sparkles size={24} />
                                            </div>
                                            <div className="flex gap-1">
                                                <Button 
                                                    size="icon" variant="ghost" 
                                                    className="h-8 w-8 rounded-lg text-slate-300 hover:text-indigo-600"
                                                    onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                                                >
                                                    <Edit size={14} />
                                                </Button>
                                                <Button 
                                                    size="icon" variant="ghost" 
                                                    className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-600"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id, cat.name); }}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                                        <p className="text-slate-400 text-xs font-bold line-clamp-2 h-8 mb-4">{cat.description || "ไม่มีคำอธิบาย"}</p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <Badge className="bg-slate-50 text-slate-400 border-0 text-[10px] font-black px-3">
                                                {catSrvCount} รายการบริการ
                                            </Badge>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    size="icon" variant="ghost" className="h-6 w-6"
                                                    disabled={idx === 0}
                                                    onClick={(e) => { e.stopPropagation(); moveItem('category', cat._id, 'up'); }}
                                                >
                                                    <MoveUp size={12} />
                                                </Button>
                                                <Button 
                                                    size="icon" variant="ghost" className="h-6 w-6"
                                                    disabled={idx === categories.length - 1}
                                                    onClick={(e) => { e.stopPropagation(); moveItem('category', cat._id, 'down'); }}
                                                >
                                                    <MoveDown size={12} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-4 pb-20">
                        {filteredServices.length === 0 ? (
                            <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                <Plus size={48} className="text-slate-100 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-slate-900">ยังไม่มีรายการบริการ</h3>
                                <p className="text-slate-400 text-sm mt-1">เริ่มเพิ่มรายการแรกสำหรับหมวดหมู่นี้</p>
                                <Button 
                                    onClick={() => { resetServiceForm(); setIsServiceModalOpen(true); }}
                                    className="mt-6 bg-indigo-600 text-white rounded-xl font-black"
                                >
                                    เพิ่มบริการใหม่
                                </Button>
                            </div>
                        ) : (
                            filteredServices.map((srv, sIdx) => (
                                <Card key={srv.id} className="group rounded-2xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <div className="flex items-center p-4">
                                        {/* Image Preview */}
                                        <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-50">
                                            {srv.image ? (
                                                <img src={srv.image} alt={srv.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ImageIcon size={24} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-5 flex-1 grid grid-cols-12 gap-4 items-center">
                                            <div className="col-span-4">
                                                <h3 className="text-base font-black text-slate-900">{srv.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                        <Clock size={10} /> {srv.duration || "-"}
                                                    </span>
                                                    <Badge className={`text-[9px] font-black border-0 ${srv.status === 'เปิดให้บริการ' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {srv.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="col-span-4 flex gap-2 overflow-x-auto no-scrollbar">
                                                {srv.priceType === 'fixed' ? (
                                                    <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-white flex items-baseline gap-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Fixed</span>
                                                        <span className="text-sm font-black tracking-tighter">฿{srv.prices.S.toLocaleString()}</span>
                                                    </div>
                                                ) : (
                                                    ['Bike', 'S', 'M', 'L', 'X', 'XL', 'XXL'].map(size => (
                                                        <div key={size} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-baseline gap-1">
                                                            <span className="text-[10px] font-black text-slate-400">{size}</span>
                                                            <span className="text-sm font-black text-slate-900 tracking-tighter">฿{srv.prices[size]?.toLocaleString()}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div className="col-span-2 flex justify-center gap-1">
                                                <Button 
                                                    size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-slate-600"
                                                    disabled={sIdx === 0}
                                                    onClick={() => moveItem('service', srv.id, 'up')}
                                                >
                                                    <MoveUp size={14} />
                                                </Button>
                                                <Button 
                                                    size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-slate-600"
                                                    disabled={sIdx === filteredServices.length - 1}
                                                    onClick={() => moveItem('service', srv.id, 'down')}
                                                >
                                                    <MoveDown size={14} />
                                                </Button>
                                            </div>

                                            <div className="col-span-2 flex justify-end gap-2">
                                                <Button 
                                                    size="sm" variant="outline" 
                                                    onClick={() => openEditService(srv)}
                                                    className="h-9 px-4 rounded-lg border-slate-200 font-bold text-xs"
                                                >
                                                    <Edit size={14} className="mr-2" /> แก้ไข
                                                </Button>
                                                <Button 
                                                    size="icon" variant="ghost" 
                                                    onClick={() => handleDeleteService(srv.id, srv.name)}
                                                    className="h-9 w-9 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* Category Modal */}
                <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-slate-900 p-6 text-white">
                            <DialogTitle className="text-xl font-black">
                                {isCatEditMode ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCategory} className="p-8 space-y-5 bg-white">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ชื่อหมวดหมู่</Label>
                                <Input
                                    required
                                    placeholder="เช่น เคลือบเซรามิก"
                                    className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">รายละเอียด</Label>
                                <textarea
                                    className="w-full h-24 rounded-xl bg-slate-50 border-none p-4 text-sm font-bold no-scrollbar"
                                    placeholder="คำอธิบายสั้นๆ..."
                                    value={newCategory.description}
                                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsCatModalOpen(false)} className="rounded-xl h-11 px-6 font-bold">ยกเลิก</Button>
                                <Button type="submit" className="bg-indigo-600 text-white rounded-xl h-11 px-10 font-black shadow-lg shadow-indigo-100" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'บันทึกข้อมูล'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Service Modal (Shared logic from old page but updated UI) */}
                <Dialog open={isServiceModalOpen} onOpenChange={(open) => {
                    setIsServiceModalOpen(open);
                    if (!open) resetServiceForm();
                }}>
                    <DialogContent className="sm:max-w-[800px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
                        <DialogHeader className="bg-slate-900 p-6 text-white relative">
                            <DialogTitle className="text-xl font-black">
                                {isServiceEditMode ? 'แก้ไขรายการบริการ' : 'เพิ่มบริการใหม่'}
                            </DialogTitle>
                            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">
                                {isServiceEditMode ? 'Service Update' : 'New Service Entry'}
                            </p>
                        </DialogHeader>

                        <div className="max-h-[75vh] overflow-y-auto p-8 no-scrollbar bg-white">
                            <form onSubmit={handleSaveService}>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ชื่อบริการ / แพ็กเกจ</Label>
                                            <Input
                                                required
                                                placeholder="เช่น แพ็กเกจ 1 ปี"
                                                className="h-12 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                                value={newService.name}
                                                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">รายละเอียด</Label>
                                            <textarea
                                                className="w-full h-24 rounded-xl bg-slate-50 border-none p-4 text-sm font-bold no-scrollbar focus:ring-2 focus:ring-indigo-600 transition-all"
                                                placeholder="ระบุสิ่งที่ลูกค้าจะได้รับ..."
                                                value={newService.description}
                                                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">สถานะการแสดงผล (โชว์/ซ่อน ในหน้าจอง)</Label>
                                            <select
                                                className="w-full h-11 rounded-xl bg-slate-50 border-none px-3 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all"
                                                value={newService.status}
                                                onChange={(e) => setNewService({ ...newService, status: e.target.value })}
                                            >
                                                <option value="เปิดให้บริการ">เปิดให้บริการ (โชว์ในหน้าจอง)</option>
                                                <option value="ปิดให้บริการ">ปิดให้บริการ (ซ่อนจากหน้าจอง)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ระยะเวลาทำงาน</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <Input
                                                    placeholder="เช่น 1 ชม."
                                                    className="h-11 rounded-xl bg-slate-50 border-none font-bold text-sm pl-11"
                                                    value={newService.duration}
                                                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 pt-4">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ภาพประกอบบริการ</Label>
                                            <div className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors group">
                                                {newService.image ? (
                                                    <img src={newService.image} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                                                        <ImageIcon size={32} className="mb-2" />
                                                        <span className="text-xs font-black">คลิกเพื่ออัปโหลด</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-2">
                                                    <Tag size={12} /> Pricing Setup
                                                </Label>
                                                <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                                                    {['size', 'fixed'].map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setNewService({ ...newService, priceType: type as any })}
                                                            className={`px-3 py-1.5 text-[9px] font-black rounded-md transition-all uppercase ${newService.priceType === type ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                                        >
                                                            {type === 'size' ? 'By Size' : 'Fixed'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {newService.priceType === 'fixed' ? (
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-1">Single Price (฿)</span>
                                                    <Input
                                                        type="number"
                                                        className="h-12 rounded-xl bg-white border-slate-200 font-black text-xl text-indigo-600"
                                                        value={newService.prices.S}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            setNewService({ ...newService, prices: { Bike: val, S: val, M: val, L: val, X: val, XL: val, XXL: val } });
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['Bike', 'S', 'M', 'L', 'X', 'XL', 'XXL'].map((size) => (
                                                        <div key={size} className="space-y-1">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-1">Size {size}</span>
                                                            <Input
                                                                type="number"
                                                                className="h-10 rounded-xl bg-white border-slate-200 text-sm font-black px-3"
                                                                value={newService.prices[size as keyof typeof newService.prices] || 0}
                                                                onChange={(e) => setNewService({ 
                                                                    ...newService, 
                                                                    prices: { ...newService.prices, [size]: Number(e.target.value) } 
                                                                })}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <Label className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2">
                                                    <Coins size={14} /> Points Redemption
                                                </Label>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 rounded-lg accent-indigo-600 cursor-pointer"
                                                    checked={newService.redeemable}
                                                    onChange={(e) => setNewService({ ...newService, redeemable: e.target.checked })}
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                {newService.priceType === 'fixed' ? (
                                                    <div className="col-span-2 space-y-1">
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter ml-1">Points Needed</span>
                                                        <Input
                                                            type="number"
                                                            disabled={!newService.redeemable}
                                                            className="h-10 rounded-xl bg-white border-indigo-100 text-sm font-black disabled:opacity-30"
                                                            value={newService.pointCost.S}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                setNewService({ ...newService, pointCost: { Bike: val, S: val, M: val, L: val, X: val, XL: val, XXL: val } });
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    ['Bike', 'S', 'M', 'L', 'X', 'XL', 'XXL'].map((size) => (
                                                        <div key={size} className="space-y-1">
                                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter ml-1">PTS {size}</span>
                                                            <Input
                                                                type="number"
                                                                disabled={!newService.redeemable}
                                                                className="h-10 rounded-xl bg-white border-indigo-100 text-sm font-black disabled:opacity-30 px-3"
                                                                value={newService.pointCost[size as keyof typeof newService.pointCost] || 0}
                                                                onChange={(e) => setNewService({ 
                                                                    ...newService, 
                                                                    pointCost: { ...newService.pointCost, [size]: Number(e.target.value) } 
                                                                })}
                                                            />
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                                            <Label className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-2 mb-4">
                                                <Bell size={14} /> Maintenance Reminder
                                            </Label>
                                            <div className="space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="flex-1 space-y-1">
                                                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter ml-1">Interval</span>
                                                        <Input
                                                            type="number"
                                                            className="h-10 rounded-xl bg-white border-amber-100 text-sm font-black"
                                                            value={newService.maintenanceIntervalMonths}
                                                            onChange={(e) => setNewService({ ...newService, maintenanceIntervalMonths: Number(e.target.value) })}
                                                        />
                                                    </div>
                                                    <div className="w-1/3 space-y-1">
                                                        <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter ml-1">Unit</span>
                                                        <select
                                                            className="w-full h-10 rounded-xl bg-white border border-amber-100 px-3 text-xs font-black uppercase text-amber-600 outline-none"
                                                            value={newService.maintenanceIntervalUnit}
                                                            onChange={(e) => setNewService({ ...newService, maintenanceIntervalUnit: e.target.value })}
                                                        >
                                                            <option value="days">Days</option>
                                                            <option value="months">Months</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-tighter ml-1">Follow-up Service</span>
                                                    <select
                                                        className="w-full h-10 rounded-xl bg-white border border-amber-100 px-3 text-xs font-bold outline-none"
                                                        value={newService.maintenanceServiceId}
                                                        onChange={(e) => setNewService({ ...newService, maintenanceServiceId: e.target.value })}
                                                    >
                                                        <option value="">Same as current service</option>
                                                        {services.map(s => (
                                                            <option key={s._id} value={s._id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-10">
                                    <Button type="button" variant="ghost" onClick={() => setIsServiceModalOpen(false)} className="rounded-xl h-12 px-6 font-bold" disabled={isSubmitting}>ยกเลิก</Button>
                                    <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl h-12 px-12 font-black shadow-xl shadow-indigo-100 border-0" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (isServiceEditMode ? 'บันทึกการแก้ไข' : 'สร้างรายการบริการ')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
