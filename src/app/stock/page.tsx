"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import { Bell, ChevronDown, Plus, Minus, Search, Filter, ImageIcon, X, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function StockPage() {
    const [stockItems, setStockItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        quantity: 0,
        unit: "ชิ้น",
        image: ""
    });

    const [selectedProductForMovement, setSelectedProductForMovement] = useState<any>(null);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [movementForm, setMovementForm] = useState({
        type: "OUT" as "IN" | "OUT",
        amount: 1,
        note: ""
    });

    // Fetch Stock Items from Backend
    const fetchStock = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/stock');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStockItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch stock:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const handleSaveMovement = async () => {
        if (!selectedProductForMovement) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/stock/${selectedProductForMovement.id}/movement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: movementForm.type,
                    amount: movementForm.amount,
                    note: movementForm.note,
                    user: 'Admin'
                })
            });

            if (res.ok) {
                const updatedProduct = await res.json();
                setStockItems(prev => prev.map(item =>
                    item.id === updatedProduct.id ? updatedProduct : item
                ));
                setIsMovementModalOpen(false);
                setMovementForm({ type: "OUT", amount: 1, note: "" });
                setSelectedProductForMovement(null);
            }
        } catch (error) {
            console.error("Failed to save movement:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate upcoming ID
    const nextIdNumber = stockItems.length > 0
        ? Math.max(...stockItems.map(i => parseInt(i.id.split('-')[1]) || 0)) + 1
        : 1;
    const nextId = `STK-${nextIdNumber.toString().padStart(3, '0')}`;

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: nextId,
                    ...newProduct,
                    price: 0,
                    minAlert: 5,
                    description: "",
                    supplier: ""
                })
            });

            if (res.ok) {
                const createdProduct = await res.json();
                setStockItems([createdProduct, ...stockItems]);
                setIsAddModalOpen(false);
                setNewProduct({
                    name: "",
                    category: "",
                    quantity: 0,
                    unit: "ชิ้น",
                    image: ""
                });
            }
        } catch (error) {
            console.error("Failed to add product:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({ ...newProduct, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
                {/* Customized Header for Stock */}
                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการสต็อกสินค้า</h1>
                        <p className="text-muted-foreground text-sm">ตรวจสอบและจัดการวัตถุดิบทั้งหมดที่มีในระบบ</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#2563eb] text-white hover:bg-blue-700 rounded-full px-5 py-2.5 h-auto shadow-sm transition-colors border-0">
                                    <Plus size={16} className="mr-2" />
                                    <span className="text-sm font-semibold">เพิ่มสินค้าใหม่</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="id">รหัสสินค้า</Label>
                                        <Input
                                            id="id"
                                            value={nextId}
                                            disabled
                                            className="bg-gray-100 text-gray-500 font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground -mt-1">รหัสสินค้าจะถูกสร้างขึ้นอัตโนมัติ</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="image">อัปโหลดรูปภาพ</Label>
                                        <div className="flex items-center gap-3">
                                            {newProduct.image ? (
                                                <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-gray-50 flex-shrink-0">
                                                    <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewProduct({ ...newProduct, image: "" })}
                                                        className="absolute top-0 right-0 bg-white/80 rounded-full p-0.5 shadow hover:bg-white"
                                                    >
                                                        <X size={12} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-md border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 flex-shrink-0">
                                                    <ImageIcon size={16} className="text-gray-400" />
                                                </div>
                                            )}
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                className="cursor-pointer file:text-sm file:font-medium file:text-gray-600 file:bg-gray-100 hover:file:bg-gray-200 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 h-10 text-xs"
                                                onChange={handleImageChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">ชื่อสินค้า <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            required
                                            placeholder="เช่น น้ำยาขัดสี"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">หมวดหมู่</Label>
                                        <Input
                                            id="category"
                                            placeholder="เช่น ทำความสะอาด"
                                            value={newProduct.category}
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="quantity">จำนวน</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                min="0"
                                                value={newProduct.quantity}
                                                onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="unit">หน่วย</Label>
                                            <Input
                                                id="unit"
                                                placeholder="เช่น ชิ้น, ขวด"
                                                value={newProduct.unit}
                                                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>ยกเลิก</Button>
                                        <Button type="submit" className="bg-[#2563eb] text-white hover:bg-blue-700" disabled={isSubmitting}>
                                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            บันทึกข้อมูล
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="icon" className="w-11 h-11 rounded-full shadow-sm bg-white border border-gray-200 hover:bg-gray-50">
                            <Bell size={18} className="text-gray-500" />
                        </Button>
                    </div>
                </header>

                {/* Stock Overview Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                    {[
                        { title: "สินค้าทั้งหมด", value: stockItems.length, unit: "รายการ", color: "bg-blue-500" },
                        { title: "มูลค่าสต็อกรวม", value: "฿124k", unit: "บาท", color: "bg-[#2563eb]" },
                        { title: "ใกล้หมดสต็อก", value: stockItems.filter(i => i.status === "ใกล้หมด").length, unit: "รายการ", color: "bg-orange-500" },
                        { title: "สินค้าที่หมด", value: stockItems.filter(i => i.status === "หมดสต็อก").length, unit: "รายการ", color: "bg-red-500" },
                    ].map((stat, i) => (
                        <Card key={i} className="rounded-3xl border-0 shadow-sm relative overflow-hidden">
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-3xl font-bold text-gray-900">{stat.value}</h2>
                                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                                </div>
                                <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 blur-xl ${stat.color}`}></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Stock Table Section */}
                <Card className="rounded-3xl border-0 shadow-sm">
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between pb-6 pt-6 px-6 border-b border-gray-100">
                        <CardTitle className="text-lg">รายการสินค้าล่าสุด</CardTitle>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="ค้นหาสินค้า..."
                                    className="bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#2563eb] focus:outline-none w-64 text-gray-800"
                                />
                            </div>
                            <Button variant="outline" className="rounded-xl border border-gray-200 gap-2 text-gray-600">
                                <Filter size={16} />
                                หมวดหมู่
                                <ChevronDown size={14} className="ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Details Modal (View Only) */}
                        <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                            <DialogContent className="sm:max-w-[500px]">
                                {selectedProduct && (
                                    <>
                                        <DialogHeader className="mb-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">รหัสสินค้า: {selectedProduct.id}</p>
                                                </div>
                                                <Badge className={`font-normal border-0 shadow-none px-3 py-1 ${selectedProduct.status === 'ปกติ' ? 'bg-[#ecfccb] text-[#65a30d]' :
                                                    selectedProduct.status === 'ใกล้หมด' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                    {selectedProduct.status}
                                                </Badge>
                                            </div>
                                        </DialogHeader>

                                        <div className="grid grid-cols-3 gap-6 mb-6">
                                            <div className="col-span-1 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                                                {selectedProduct.image ? (
                                                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full object-contain rounded" />
                                                ) : (
                                                    <div className="aspect-square w-full flex flex-col items-center justify-center text-gray-400">
                                                        <ImageIcon size={32} />
                                                        <span className="text-xs mt-2">ไม่มีรูปภาพ</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-2 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-1">หมวดหมู่</p>
                                                        <p className="font-medium text-sm">{selectedProduct.category}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-1">อัปเดตล่าสุด</p>
                                                        <p className="font-medium text-sm">{selectedProduct.lastUpdated}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <p className="text-xs text-muted-foreground mb-1">คงเหลือปัจจุบัน</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-gray-900">{selectedProduct.quantity}</span>
                                                        <span className="text-sm text-gray-500">{selectedProduct.unit}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-sm mb-3">ประวัติการเคลื่อนไหวล่าสุด</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm border-b pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        <span className="text-gray-600">นำเข้าสินค้า</span>
                                                    </div>
                                                    <span className="text-green-600 font-medium">+10 {selectedProduct.unit}</span>
                                                    <span className="text-xs text-gray-400">{selectedProduct.lastUpdated}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                        <span className="text-gray-600">เบิกใช้งาน (เคลือบรถลูกค้า)</span>
                                                    </div>
                                                    <span className="text-red-600 font-medium">-1 {selectedProduct.unit}</span>
                                                    <span className="text-xs text-gray-400">เมื่อวาน</span>
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="mt-6 flex justify-between sm:justify-between w-full">
                                            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">แก้ไขข้อมูล</Button>
                                            <Button
                                                variant="default"
                                                className="bg-[#2563eb] text-white hover:bg-blue-700"
                                                onClick={() => {
                                                    // Navigate to full details page
                                                    window.location.href = `/stock/${selectedProduct.id}`;
                                                }}
                                            >
                                                รายละเอียดฉบับเต็ม
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Movement Recording Modal */}
                        <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
                            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 rounded-[2rem] shadow-2xl">
                                {selectedProductForMovement && (
                                    <>
                                        <DialogHeader className={`p-6 text-white flex flex-row items-center justify-between ${movementForm.type === 'IN' ? 'bg-green-600' : 'bg-red-600'}`}>
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    {movementForm.type === 'IN' ? <Plus size={24} /> : <Minus size={24} />}
                                                </div>
                                                <div>
                                                    <DialogTitle className="text-xl font-bold">{movementForm.type === 'IN' ? 'เติมสต็อกสินค้า' : 'เบิกใช้งานสินค้า'}</DialogTitle>
                                                    <p className="text-white/80 text-xs mt-0.5">{selectedProductForMovement.name}</p>
                                                </div>
                                            </div>
                                        </DialogHeader>

                                        <div className="p-6 space-y-6">
                                            <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setMovementForm({ ...movementForm, type: 'OUT' })}
                                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${movementForm.type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 opacity-60'}`}
                                                >
                                                    เบิกออก
                                                </button>
                                                <button
                                                    onClick={() => setMovementForm({ ...movementForm, type: 'IN' })}
                                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${movementForm.type === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 opacity-60'}`}
                                                >
                                                    เติมเข้า
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid gap-2">
                                                    <Label className="text-gray-600">จำนวนที่ {movementForm.type === 'IN' ? 'เติม' : 'เบิก'} ({selectedProductForMovement.unit})</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={movementForm.amount}
                                                            onChange={(e) => setMovementForm({ ...movementForm, amount: Number(e.target.value) })}
                                                            className="h-12 text-lg font-bold pl-4 border-gray-200 focus:ring-0 focus:border-[#2563eb] rounded-xl"
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                                                            {selectedProductForMovement.unit}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label className="text-gray-600">หมายเหตุ</Label>
                                                    <Input
                                                        placeholder="เช่น เบิกใช้ Job-001"
                                                        value={movementForm.note}
                                                        onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value })}
                                                        className="h-12 border-gray-200 rounded-xl"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <Button variant="ghost" onClick={() => setIsMovementModalOpen(false)} className="flex-1 rounded-xl h-12 text-gray-500" disabled={isSubmitting}>ยกเลิก</Button>
                                                <Button
                                                    onClick={handleSaveMovement}
                                                    disabled={isSubmitting}
                                                    className={`flex-1 h-12 rounded-xl text-white shadow-lg border-0 ${movementForm.type === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                                >
                                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    ยืนยัน
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="py-4 px-6 font-medium">รูปภาพ</th>
                                        <th className="py-4 px-6 font-medium">รหัสสินค้า</th>
                                        <th className="py-4 px-6 font-medium">ชื่อสินค้า</th>
                                        <th className="py-4 px-6 font-medium">หมวดหมู่</th>
                                        <th className="py-4 px-6 font-medium text-center">คงเหลือ</th>
                                        <th className="py-4 px-6 font-medium">สถานะ</th>
                                        <th className="py-4 px-6 font-medium text-right">อัปเดตล่าสุด</th>
                                        <th className="py-4 px-6 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={8} className="py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
                                                    <p className="text-sm text-gray-500">กำลังโหลดข้อมูลสต็อก...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : stockItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-20 text-center">
                                                <p className="text-sm text-gray-500">ไม่พบรายการสินค้าในสต็อก</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        stockItems.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon size={18} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-500">{item.id}</td>
                                                <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
                                                <td className="py-4 px-6">
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal hover:bg-gray-200">{item.category}</Badge>
                                                </td>
                                                <td className="py-4 px-6 text-center font-medium">
                                                    <span className={item.quantity === 0 ? "text-red-500" : item.quantity < item.minAlert ? "text-orange-500" : "text-gray-900"}>
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-gray-400 text-xs ml-1">{item.unit}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge className={`font-normal border-0 shadow-none px-3 py-1 ${item.status === 'ปกติ' ? 'bg-[#ecfccb] text-[#65a30d] hover:bg-[#d9f99d]' :
                                                        item.status === 'ใกล้หมด' ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' :
                                                            'bg-red-100 text-red-600 hover:bg-red-200'
                                                        }`}>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-right text-muted-foreground">{item.lastUpdated}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedProductForMovement(item);
                                                                setIsMovementModalOpen(true);
                                                            }}
                                                            className="h-8 text-xs rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 px-3"
                                                        >
                                                            เบิก/เติม
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedProduct(item)}
                                                            className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3"
                                                        >
                                                            รายละเอียด
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
