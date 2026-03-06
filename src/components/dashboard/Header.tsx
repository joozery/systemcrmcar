import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";

export function Header() {
    return (
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">อรุณสวัสดิ์, ผู้ดูแลระบบ</h1>
                <p className="text-muted-foreground text-sm font-medium">ตรวจสอบคิวงานวันนี้ได้เลย...</p>
            </div>
            <div className="flex items-center gap-4">
                <Select defaultValue="week">
                    <SelectTrigger className="w-[140px] h-12 bg-black text-white hover:bg-gray-800 border-none rounded-full px-5 flex items-center shadow-sm">
                        <SelectValue placeholder="เลือกช่วงเวลา" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        <SelectItem value="today">วันนี้</SelectItem>
                        <SelectItem value="week">สัปดาห์นี้</SelectItem>
                        <SelectItem value="month">เดือนนี้</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </header>
    );
}
