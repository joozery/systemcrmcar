import { AlertTriangle, Droplets, Star, UserPlus, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function BottomRow({ bookings, extraStats }: { bookings?: any[], extraStats?: any }) {
    return (
        <div className="grid grid-cols-3 gap-6">
            <Card className="rounded-3xl border-0 shadow-sm overflow-hidden relative pb-4">
                <CardHeader>
                    <CardTitle className="text-lg">แจ้งเตือนสต็อกสินค้า</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${extraStats?.lowStock > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-[#bbfc2f]'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900">{extraStats?.lowStock ?? 0}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">รายการใกล้หมด</p>
                        </div>
                    </div>
                    <Link href="/stock" className="block">
                        <Button className="w-full bg-gray-900 text-white hover:bg-black rounded-xl h-10 text-xs font-bold">ไปที่หน้าสต็อก</Button>
                    </Link>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm pb-4">
                <CardHeader>
                    <CardTitle className="text-lg">สรุปการเงิน & สมาชิก</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex justify-between items-center group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                <Wallet size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">ยอดค้างชำระ</p>
                                <p className="text-sm font-black text-gray-900">฿{(extraStats?.pendingRevenue ?? 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <Link href="/payments">
                            <Button size="sm" variant="ghost" className="text-[10px] font-black hover:bg-orange-50 underline">ดูรายการ</Button>
                        </Link>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <UserPlus size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">สมาชิกใหม่ (เดือนนี้)</p>
                                <p className="text-sm font-black text-gray-900">+{extraStats?.newMembers ?? 0} ท่าน</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm pb-4">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">คิวงานรอดำเนินการ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {bookings && bookings.length > 0 ? bookings.slice(0, 2).map((b) => (
                        <div key={b._id} className="flex gap-4 items-center bg-gray-50 rounded-2xl p-2.5">
                            <div className="w-14 h-14 bg-black rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner shrink-0">
                                {b.serviceId?.name?.includes('ล้าง') ? <Droplets className="text-[#bbfc2f]" size={24} /> : <Star className="text-[#bbfc2f]" size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1 truncate">{b.carPlate} - {b.serviceId?.name}</h4>
                                <p className="text-[10px] text-muted-foreground leading-snug truncate">
                                    {b.customerId?.firstName} {b.customerId?.lastName}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl opacity-40">
                            <p className="text-xs font-bold text-gray-400">ไม่มีคิวงานค้าง</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
