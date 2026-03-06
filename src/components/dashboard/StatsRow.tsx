import { Car, Droplets, Shield, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatsRow({ data }: { data?: any }) {
    return (
        <div className="grid grid-cols-4 gap-6 mb-6">
            <Card className="rounded-3xl border-0 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold">{data?.wash ?? 0}</p>
                        <p className="text-muted-foreground text-sm">คิวล้างสีดูดฝุ่น</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Droplets className="text-blue-500" size={20} />
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-3xl border-0 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold">{data?.ceramic ?? 0}</p>
                        <p className="text-muted-foreground text-sm">เคลือบเซรามิก</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Star className="text-orange-500" size={20} />
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-3xl border-0 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold">{data?.ppf ?? 0}</p>
                        <p className="text-muted-foreground text-sm">ติดตั้งฟิล์ม PPF</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Shield className="text-red-500" size={20} />
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-3xl border-0 shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold">{data?.ready ?? 0}</p>
                        <p className="text-muted-foreground text-sm">รถส่งมอบวันนี้</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Car className="text-yellow-600" size={20} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
