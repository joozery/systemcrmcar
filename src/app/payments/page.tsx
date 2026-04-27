"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    CreditCard, DollarSign, Search, Filter,
    MoreVertical, CheckCircle2, History, AlertCircle,
    Loader2, Download, ExternalLink, Calendar,
    User, Phone, Car, Sparkles, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

export default function PaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await fetch('/api/payments');
                const data = await res.json();
                setPayments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter(p =>
        (p.customerId?.firstName + " " + p.customerId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bookingId?.carPlate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <style jsx global>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .no-print, .no-print * {
                        display: none !important;
                    }
                    #receipt-print {
                        display: block !important;
                        visibility: visible !important;
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 9999;
                        background: white !important;
                    }
                    #receipt-print * {
                        visibility: visible !important;
                    }
                }
            `}</style>
            
            <div id="receipt-print" className="hidden">
                <div className="p-20 bg-white text-gray-900 font-sans max-w-[800px] mx-auto">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <img src="/logo/logoprosteam.png" alt="Pro Steam" className="h-12 mb-4" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Receipt / ใบเสร็จรับเงิน</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Pro Steam Car Detailing Service</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt No.</p>
                            <p className="font-bold text-sm">#{selectedPayment?._id.slice(-8).toUpperCase()}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Date / วันที่</p>
                            <p className="font-bold text-sm">{selectedPayment && new Date(selectedPayment.paidAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10 mb-10 pb-10 border-b border-gray-100">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Customer / ลูกค้า</h3>
                            <p className="font-black text-lg">{selectedPayment?.customerId?.firstName} {selectedPayment?.customerId?.lastName}</p>
                            <p className="text-sm font-bold text-gray-600 mt-1">{selectedPayment?.customerId?.phone}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Vehicle / ข้อมูลรถ</h3>
                            <p className="font-black text-lg">{selectedPayment?.bookingId?.carPlate}</p>
                            <p className="text-sm font-bold text-gray-600 mt-1">{selectedPayment?.bookingId?.carBrand} {selectedPayment?.bookingId?.carModel}</p>
                        </div>
                    </div>

                    <table className="w-full mb-10">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-4 text-xs font-black uppercase tracking-widest">Description / รายการ</th>
                                <th className="text-right py-4 text-xs font-black uppercase tracking-widest">Amount / จำนวนเงิน</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50">
                                <td className="py-6">
                                    <p className="font-black text-base">{selectedPayment?.bookingId?.serviceId?.name || 'บริการดูแลรักษารถยนต์'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Car Detailing & Maintenance Service</p>
                                </td>
                                <td className="py-6 text-right font-black text-lg">฿{selectedPayment?.amount?.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Payment Method:</span>
                                <span className="text-gray-900">{selectedPayment?.method}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span>Status:</span>
                                <span className="text-green-600">{selectedPayment?.status}</span>
                            </div>
                        </div>
                        <div className="text-right bg-gray-50 p-6 rounded-2xl min-w-[200px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Amount / ยอดรวมทั้งสิ้น</p>
                            <p className="text-3xl font-black text-gray-900">฿{selectedPayment?.amount?.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center opacity-50">
                        <div className="text-[10px] font-bold text-gray-400 uppercase leading-relaxed">
                            <p>Pro Steam Car Detail - Premium Car Care</p>
                            <p>Thank you for choosing our service!</p>
                        </div>
                        <div className="w-24 h-24 bg-gray-50 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <span className="text-[8px] font-black text-gray-300 uppercase -rotate-12">Authorized Stamp</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="no-print w-full flex h-full">
                <SidebarLeft />

                <main className="flex-1 px-6 py-6 overflow-y-auto w-full no-scrollbar">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-lg shadow-[#2563eb]/20 group cursor-pointer">
                                <CreditCard size={24} className="text-black transition-transform" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">การชำระเงิน (Payments)</h1>
                                <p className="text-muted-foreground text-xs font-medium">บันทึกรายรับ และติดตามสถานะการจ่ายเงินของลูกค้า</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="rounded-xl border-gray-100 h-11 px-5 font-bold shadow-sm text-xs">
                                <Download size={16} className="mr-2" /> รายงาน
                            </Button>
                        </div>
                    </header>

                    {/* Filters & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                        <div className="lg:col-span-2 relative group flex items-center">
                            <Search className="absolute left-5 text-gray-400 group-focus-within:text-[#2563eb] transition-colors" size={18} />
                            <Input
                                placeholder="ค้นหาชื่อลูกค้า, ทะเบียนรถ..."
                                className="h-12 pl-12 pr-6 rounded-xl bg-white border-none shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white p-5 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110">
                                    <AlertCircle size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ค้างชำระ</span>
                                    <span className="text-xs font-bold text-gray-600">รายการค้าง</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-gray-900 pr-2">{payments.filter(p => p.status === 'ค้างชำระ').length}</span>
                        </Card>

                        <Card className="rounded-[1.5rem] border-0 shadow-sm bg-white p-5 flex items-center justify-between group hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#2563eb]/20 flex items-center justify-center text-green-600 transition-transform group-hover:scale-110">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ชำระแล้ว</span>
                                    <span className="text-xs font-bold text-gray-600">ธุรกรรมสำเร็จ</span>
                                </div>
                            </div>
                            <span className="text-2xl font-black text-gray-900 pr-2">{payments.filter(p => p.status === 'ชำระแล้ว').length}</span>
                        </Card>
                    </div>

                    {/* Payments Table */}
                    <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden pb-10">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-50 h-12">
                                    <TableHead className="pl-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">วันที่ชำระ</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-widest">ลูกค้า</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-widest">ทะเบียน</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-widest">ช่องทาง</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-widest">ยอดเงิน</TableHead>
                                    <TableHead className="text-xs font-bold text-gray-400 uppercase tracking-widest">สถานะ</TableHead>
                                    <TableHead className="pr-8 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-[400px] text-center">
                                            <Loader2 className="animate-spin text-[#2563eb] mx-auto h-8 w-8" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-[400px] text-center text-gray-400 font-bold">
                                            ไม่พบข้อมูลการชำระเงิน
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((p) => (
                                        <TableRow key={p._id} className="hover:bg-gray-50/50 transition-all border-gray-50 group cursor-pointer" onClick={() => setSelectedPayment(p)}>
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {new Date(p.paidAt).toLocaleDateString('th-TH')}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(p.paidAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 group-hover:bg-[#2563eb]/10 group-hover:text-black transition-colors">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{p.customerId?.firstName} {p.customerId?.lastName}</span>
                                                        <span className="text-[10px] text-gray-400">{p.customerId?.phone}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="rounded-lg border-gray-100 font-bold bg-white text-gray-700 h-7">
                                                    {p.bookingId?.carPlate}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                    <div className={`w-2 h-2 rounded-full ${p.method === 'โอนเงิน' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                                                    {p.method}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-base font-black text-gray-900">฿{p.amount?.toLocaleString()}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${p.status === 'ชำระแล้ว' ? 'bg-green-50 text-green-600' :
                                                    p.status === 'ค้างชำระ' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                                    }`}>
                                                    {p.status === 'ชำระแล้ว' && <CheckCircle2 size={12} />}
                                                    {p.status === 'ค้างชำระ' && <AlertCircle size={12} />}
                                                    {p.status}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-8 text-right">
                                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-none transition-all">
                                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                    <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
                        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                            <DialogHeader className="bg-[#0a0b0a] p-6 text-white relative">
                                <DialogTitle className="text-xl font-black text-[#2563eb] tracking-tight">รายละเอียดใบเสร็จ</DialogTitle>
                                <CreditCard className="absolute top-6 right-6 text-gray-700 opacity-50" size={32} />
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                            {selectedPayment && (
                                <div className="p-6 bg-white space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ชื่อลูกค้า</p>
                                            <p className="font-black text-sm text-gray-900">{selectedPayment.customerId?.firstName} {selectedPayment.customerId?.lastName}</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ทะเบียนรถ</p>
                                            <p className="font-black text-sm text-gray-900">{selectedPayment.bookingId?.carPlate}</p>
                                        </div>
                                    </div>

                                    <Card className="p-5 bg-gray-50 border-0 rounded-2xl flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ยอดชำระสุทธิ</span>
                                            <span className="text-2xl font-black text-gray-900">฿{selectedPayment.amount?.toLocaleString()}</span>
                                        </div>
                                        <Badge className={`${selectedPayment.status === 'ชำระแล้ว' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} border-0 px-3 py-1.5 rounded-xl font-bold text-xs`}>
                                            {selectedPayment.status}
                                        </Badge>
                                    </Card>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-400 font-medium">จ่ายโดย</span>
                                            <span className="text-gray-900 font-bold">{selectedPayment.method}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-400 font-medium">วันที่ / เวลา</span>
                                            <span className="text-gray-900 font-bold">
                                                {new Date(selectedPayment.paidAt).toLocaleDateString('th-TH')} • {new Date(selectedPayment.paidAt).toLocaleTimeString('th-TH')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <Button className="flex-1 bg-gray-900 text-white hover:bg-black rounded-xl h-12 font-black text-sm shadow-lg transition-all" onClick={handlePrint}>
                                            พิมพ์ใบเสร็จ
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-gray-100 rounded-xl h-12 font-black text-sm" onClick={() => setSelectedPayment(null)}>
                                            ปิดหน้าต่าง
                                        </Button>
                                    </div>
                                </div>
                            )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}
