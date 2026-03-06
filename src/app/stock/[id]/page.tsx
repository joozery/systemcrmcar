"use client"

import { useEffect, use, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import { ArrowLeft, Edit3, Image as ImageIcon, Package, FileText, CheckCircle2, History, Bell, Plus, Minus, Info, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StockDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [movementForm, setMovementForm] = useState({
        type: "OUT" as "IN" | "OUT",
        amount: 1,
        note: ""
    });

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/stock/${resolvedParams.id}`);
            const data = await res.json();
            if (res.ok) {
                setProduct(data);
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [resolvedParams.id]);

    const handleSaveMovement = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/stock/${resolvedParams.id}/movement`, {
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
                setProduct(updatedProduct);
                setIsMovementModalOpen(false);
                setMovementForm({ type: "OUT", amount: 1, note: "" });
            }
        } catch (error) {
            console.error("Failed to save movement:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar relative min-h-screen">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[80vh]">
                        <Loader2 className="h-10 w-10 animate-spin text-[#bbfc2f] mb-4" />
                        <p className="text-gray-500">กำลังโหลดรายละเอียดสินค้า...</p>
                    </div>
                ) : !product ? (
                    <div className="flex flex-col items-center justify-center h-[80vh]">
                        <p className="text-gray-500">ไม่พบสินค้าที่คุณต้องการ</p>
                        <Link href="/stock">
                            <Button className="mt-4 bg-[#bbfc2f] text-black hover:bg-[#a3e635]">กลับสู่หน้าสต็อก</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="/stock" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                    <Badge className={`font-normal border-0 shadow-none px-3 py-1 mt-1 ${product.status === 'ปกติ' ? 'bg-[#ecfccb] text-[#65a30d]' :
                                        product.status === 'ใกล้หมด' ? 'bg-orange-100 text-orange-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {product.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5"><Package size={14} /> รหัสสินค้า: {product.id}</span>
                                    <span className="flex items-center gap-1.5"><FileText size={14} /> หมวดหมู่: {product.category}</span>
                                    <span className="flex items-center gap-1.5"><Bell size={14} /> อัปเดตล่าสุด: {product.lastUpdated}</span>
                                </div>
                            </div>

                            <div className="ml-auto flex gap-3">
                                <Button
                                    onClick={() => {
                                        setMovementForm({ ...movementForm, type: 'IN' });
                                        setIsMovementModalOpen(true);
                                    }}
                                    className="bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-xl px-5 shadow-sm font-bold"
                                >
                                    <Plus size={18} className="mr-2" /> เติมสต็อก
                                </Button>
                                <Button
                                    onClick={() => {
                                        setMovementForm({ ...movementForm, type: 'OUT' });
                                        setIsMovementModalOpen(true);
                                    }}
                                    className="bg-[#171717] text-white hover:bg-black rounded-xl px-5 shadow-lg font-bold"
                                >
                                    <Minus size={18} className="mr-2" /> เบิกใช้งาน
                                </Button>
                            </div>
                        </div>

                        {/* Movement Recording Modal */}
                        <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
                            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 rounded-[2rem] shadow-2xl">
                                <DialogHeader className={`p-6 text-white flex flex-row items-center justify-between ${movementForm.type === 'IN' ? 'bg-green-600' : 'bg-red-600'}`}>
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            {movementForm.type === 'IN' ? <Plus size={24} /> : <Minus size={24} />}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-bold">{movementForm.type === 'IN' ? 'เติมสต็อกสินค้า' : 'เบิกใช้งานสินค้า'}</DialogTitle>
                                            <p className="text-white/80 text-xs mt-0.5">ระบุจำนวนที่ต้องการบันทึกเข้าระบบ</p>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="p-6 space-y-6">
                                    <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                                        <button
                                            onClick={() => setMovementForm({ ...movementForm, type: 'IN' })}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${movementForm.type === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            สต็อกเข้า (+)
                                        </button>
                                        <button
                                            onClick={() => setMovementForm({ ...movementForm, type: 'OUT' })}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${movementForm.type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            เบิกออก (-)
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-500 text-xs font-bold uppercase ml-1">จำนวนที่ต้องการ ({product.unit})</Label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setMovementForm({ ...movementForm, amount: Math.max(1, movementForm.amount - 1) })}
                                                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
                                                >
                                                    <Minus size={18} />
                                                </button>
                                                <Input
                                                    type="number"
                                                    value={movementForm.amount}
                                                    onChange={(e) => setMovementForm({ ...movementForm, amount: parseInt(e.target.value) || 0 })}
                                                    className="h-12 text-center text-xl font-bold rounded-xl border-gray-100"
                                                />
                                                <button
                                                    onClick={() => setMovementForm({ ...movementForm, amount: movementForm.amount + 1 })}
                                                    className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all text-[#bbfc2f]"
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-500 text-xs font-bold uppercase ml-1">หมายเหตุ / Job ID</Label>
                                            <textarea
                                                placeholder="เช่น เบิกใช้งาน Job Q-00XX หรือ ระบุรหัสบิล"
                                                className="w-full min-h-[80px] rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#bbfc2f]/50 transition-all"
                                                value={movementForm.note}
                                                onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value })}
                                            />
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
                                </div>
                            </DialogContent>
                        </Dialog>

                        <div className="grid grid-cols-12 gap-8">
                            {/* Left Column - Details */}
                            <div className="col-span-8 space-y-8">
                                <Tabs defaultValue="info" className="w-full">
                                    <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 h-14 w-full justify-start gap-2 max-w-fit shadow-sm px-2">
                                        <TabsTrigger value="info" className="rounded-xl px-6 h-10 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all">
                                            <Info size={16} className="mr-2" /> รายละเอียดทั่วไป
                                        </TabsTrigger>
                                        <TabsTrigger value="history" className="rounded-xl px-6 h-10 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all">
                                            <History size={16} className="mr-2" /> ประวัติความเคลื่อนไหว
                                        </TabsTrigger>
                                        <TabsTrigger value="edit-log" className="rounded-xl px-6 h-10 data-[state=active]:bg-[#171717] data-[state=active]:text-white transition-all">
                                            <Edit3 size={16} className="mr-2" /> ประวัติการแก้ไข
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="info" className="mt-6">
                                        <Card className="rounded-[2.5rem] border-0 shadow-sm overflow-hidden bg-white">
                                            <CardContent className="p-10">
                                                <div className="flex gap-10">
                                                    <div className="w-1/3 space-y-4">
                                                        <div className="aspect-square bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center overflow-hidden">
                                                            {product.image ? (
                                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="flex flex-col items-center text-gray-300">
                                                                    <ImageIcon size={64} className="mb-2" />
                                                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">No Image Available</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button variant="outline" className="w-full rounded-xl border-dashed border-gray-300 text-gray-400 hover:text-gray-600 h-12">
                                                            <Edit3 size={16} className="mr-2" /> แก้ไขรูปภาพ
                                                        </Button>
                                                    </div>

                                                    <div className="flex-1 space-y-8">
                                                        <div className="grid grid-cols-2 gap-8">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ชื่อสินค้า</Label>
                                                                <p className="text-lg font-bold text-gray-900 ml-1">{product.name}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">หมวดหมู่</Label>
                                                                <p className="text-lg font-bold text-gray-900 ml-1">{product.category}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">ราคาต่อหน่วย (฿)</Label>
                                                                <p className="text-lg font-bold text-gray-900 ml-1">{product.price.toLocaleString()} /{product.unit}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">คู่ค้า / Supplier</Label>
                                                                <p className="text-lg font-bold text-gray-900 ml-1">{product.supplier || '-'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">รายละเอียดสินค้า</Label>
                                                            <p className="text-sm text-gray-500 ml-1 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                                {product.description || 'ไม่มีคำอธิบายสำหรับสินค้านี้'}
                                                            </p>
                                                        </div>

                                                        <div className="pt-4 flex gap-4">
                                                            <Button className="rounded-xl h-12 px-8 bg-[#f5f5f5] text-gray-600 hover:bg-gray-100 border-0 flex-1">พิมพ์ Barcode</Button>
                                                            <Button className="rounded-xl h-12 px-8 bg-[#f5f5f5] text-gray-600 hover:bg-gray-100 border-0 flex-1">แก้ไขข้อมูลฉบับเต็ม</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="history" className="mt-6">
                                        <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden">
                                            <CardHeader className="px-8 pt-8 pb-0">
                                                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <History size={20} className="text-[#bbfc2f]" />
                                                    ประวัติการเบิก-จ่าย
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                {product.movements && product.movements.length > 0 ? (
                                                    product.movements.map((move: any, index: number) => (
                                                        <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-[#bbfc2f]/30 transition-colors">
                                                            <div className={`p-2 rounded-xl ${move.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                {move.type === 'IN' ? <Plus size={18} /> : <Minus size={18} />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-bold text-gray-900">
                                                                        {move.type === 'IN' ? 'เติมสต็อก' : 'เบิกใช้งาน'} {move.amount} {product.unit}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400 font-mono">{move.date}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-500 mb-2">{move.note}</p>
                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                    <div className="w-4 h-4 rounded-full bg-gray-200" />
                                                                    ดำเนินการโดย: {move.user}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="py-20 text-center ">
                                                        <p className="text-sm text-gray-400">ยังไม่มีประวัติการทำรายการ</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="edit-log" className="mt-6">
                                        <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden p-20 text-center">
                                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Edit3 size={32} className="text-gray-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">อยู่ระหว่างการพัฒนา</h3>
                                            <p className="text-gray-500 mt-1">ระบบกำลังเก็บรวบรวมข้อมูลประวัติการแก้ไขข้อมูลสินค้า</p>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Right Column - Status & Actions */}
                            <div className="col-span-4 space-y-6">
                                <Card className="rounded-[2rem] border-0 shadow-sm bg-[#171717] text-white">
                                    <CardContent className="p-8 pb-10">
                                        <p className="text-gray-400 font-medium mb-1 flex items-center gap-2">
                                            <Package size={16} /> ยอดคงเหลือปัจจุบัน
                                        </p>
                                        <div className="flex items-end gap-3 mt-4 mb-2">
                                            <h2 className="text-6xl font-bold tracking-tight text-[#bbfc2f]">{product.quantity}</h2>
                                            <span className="text-xl text-gray-400 mb-2">{product.unit}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-4 border-t border-gray-800 pt-4 flex gap-2 items-start">
                                            <CheckCircle2 className="text-green-400 shrink-0" size={16} />
                                            จำนวนสต็อกยังอยู่ในระดับที่ปลอดภัย (เกินจุดสั่งซื้อขั้นต่ำที่ {product.minAlert} {product.unit})
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden p-8 space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Sparkles className="text-[#bbfc2f]" size={20} />
                                            ทางเลือกด่วน
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            <Button variant="outline" className="justify-start h-14 rounded-2xl border-gray-100 hover:bg-gray-50 px-5 group">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-gray-900">ออกรายงานสต็อก</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">PDF Report</div>
                                                </div>
                                            </Button>
                                            <Button variant="outline" className="justify-start h-14 rounded-2xl border-gray-100 hover:bg-gray-50 px-5 group">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mr-3 group-hover:bg-orange-100 transition-colors">
                                                    <Bell size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-gray-900">ตั้งค่าการแจ้งเตือน</div>
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Low Stock Alert</div>
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 p-6 rounded-3xl space-y-4 border border-red-100/50">
                                        <div>
                                            <h4 className="text-red-900 font-bold text-sm">โซนอันตราย</h4>
                                            <p className="text-red-700/60 text-xs mt-1">การดำเนินการนี้จะไม่สามารถย้อนกลับได้</p>
                                        </div>
                                        <Button variant="destructive" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-red-200">
                                            ลบรายชื่อสินค้าออกจากระบบ
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
