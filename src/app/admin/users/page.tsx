"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import {
    Users, UserPlus, Search, Shield,
    Trash2, Edit3, Lock, Mail,
    MoreHorizontal, CheckCircle2, AlertCircle,
    Loader2, ChevronRight, X, UserCog
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
    DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [message, setMessage] = useState("");

    // Form states
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "staff",
        status: "active"
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setMessage("เพิ่มผู้ใช้สำเร็จ!");
                setIsAddUserOpen(false);
                setFormData({ username: "", password: "", firstName: "", lastName: "", role: "staff", status: "active" });
                fetchUsers();
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setMessage("แก้ไขข้อมูลผู้ใช้สำเร็จ!");
                setIsEditUserOpen(false);
                fetchUsers();
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage("ลบผู้ใช้สำเร็จ!");
                fetchUsers();
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            password: "", // Don't show password
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status
        });
        setIsEditUserOpen(true);
    };

    const filteredUsers = Array.isArray(users) ? users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
                {/* Header */}
                <header className="flex justify-between items-center mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#bbfc2f] rounded-3xl flex items-center justify-center shadow-xl shadow-[#bbfc2f]/20 rotate-12 group hover:rotate-0 transition-transform">
                            <UserCog size={32} className="text-black -rotate-12 group-hover:rotate-0 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                จัดการผู้ดูแล (Admin & Users)
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium">จัดการสิทธิ์ พารามิเตอร์ และการเข้าถึงของพนักงานในระบบ</p>
                        </div>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl bg-gray-900 text-white hover:bg-black h-14 px-8 font-black shadow-xl transition-all">
                                <UserPlus size={18} className="mr-2" /> เพิ่มผู้ใช้ใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl">
                            <div className="bg-[#111311] px-10 py-8 text-white relative">
                                <div className="text-2xl font-black text-[#bbfc2f] mb-2">เพิ่มผู้ใช้ใหม่</div>
                                <p className="text-sm text-gray-400 font-medium opacity-80">ระบุข้อมูลพื้นฐานและสิทธิ์การเข้าถึงของผู้ใช้</p>
                            </div>
                            <form onSubmit={handleAddUser} className="p-10 space-y-6 bg-white">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-gray-400">ชื่อผู้ใช้ (Username)</Label>
                                        <Input
                                            required
                                            className="h-12 border-none bg-gray-50 rounded-xl font-bold"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-gray-400">รหัสผ่าน (Password)</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="h-12 border-none bg-gray-50 rounded-xl font-bold"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-gray-400">ชื่อจริง (First Name)</Label>
                                        <Input
                                            required
                                            className="h-12 border-none bg-gray-50 rounded-xl font-bold"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase text-gray-400">นามสกุล (Last Name)</Label>
                                        <Input
                                            className="h-12 border-none bg-gray-50 rounded-xl font-bold"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-gray-400">ระดับสิทธิ์ (Role)</Label>
                                    <Select
                                        defaultValue="staff"
                                        onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger className="h-12 border-none bg-gray-50 rounded-xl font-bold">
                                            <SelectValue placeholder="เลือกสิทธิ์" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100">
                                            <SelectItem value="admin">Administrator (จัดการได้ทั้งหมด)</SelectItem>
                                            <SelectItem value="staff">Staff (จองคิว/ชำระเงิน เท่านั้น)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full bg-[#bbfc2f] text-black hover:bg-[#a6e02a] rounded-2xl h-14 font-black shadow-xl shadow-[#bbfc2f]/20 mt-4">
                                    บันทึกข้อมูล
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Filters */}
                <div className="mb-8 relative group flex items-center">
                    <Search className="absolute left-6 text-gray-400 group-focus-within:text-[#bbfc2f] transition-colors" size={24} />
                    <Input
                        placeholder="พิมพ์เพื่อค้นหาชื่อผู้ใช้ หรือชื่อพนักงาน..."
                        className="h-20 pl-16 pr-8 rounded-3xl bg-white border-none shadow-sm text-lg font-medium focus-visible:ring-2 focus-visible:ring-[#bbfc2f]/30"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Users Table */}
                <Card className="rounded-[2.5rem] border-0 shadow-sm bg-white overflow-hidden pb-10">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-gray-50 h-16">
                                <TableHead className="pl-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ชื่อพนักงาน</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ระดับสิทธิ์ (Role)</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สถานะ (Status)</TableHead>
                                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-widest">สร้างเมื่อ</TableHead>
                                <TableHead className="pr-10 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Loader2 className="animate-spin text-[#bbfc2f] mx-auto h-12 w-12" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                                            <Users size={64} />
                                            <p className="text-xl font-black">ไม่พบข้อมูลผู้ใช้</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((u) => (
                                    <TableRow key={u._id} className="hover:bg-gray-50/50 transition-all border-gray-50 group">
                                        <TableCell className="pl-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                                    <Shield size={20} />
                                                </div>
                                                <span className="text-lg font-black text-gray-900 group-hover:text-black">{u.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold text-gray-700">{u.firstName} {u.lastName}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-xl border-none font-black px-4 py-2 ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {u.role.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-[#bbfc2f]' : 'bg-gray-300'}`} />
                                                <span className="text-xs font-bold text-gray-500">{u.status === 'active' ? 'กำลังทำงาน' : 'ระงับการเข้าถึง'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-xs font-medium text-gray-400">
                                                {new Date(u.createdAt).toLocaleDateString('th-TH')}
                                            </p>
                                        </TableCell>
                                        <TableCell className="pr-10 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl hover:bg-[#bbfc2f]/10 hover:text-black transition-all"
                                                    onClick={() => openEditModal(u)}
                                                >
                                                    <Edit3 size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                                    onClick={() => handleDeleteUser(u._id)}
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Edit User Dialog */}
                <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                    <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-0 shadow-2xl">
                        <div className="bg-gray-900 px-10 py-8 text-white">
                            <div className="text-2xl font-black text-white mb-2">แก้ไขข้อมูลพนักงาน</div>
                            <p className="text-sm text-gray-400">แก้ไขสิทธิ์และข้อมูลของ {selectedUser?.username}</p>
                        </div>
                        <form onSubmit={handleEditUser} className="p-10 space-y-6 bg-white">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-gray-400">ชื่อจริง</Label>
                                    <Input
                                        className="h-12 border-none bg-gray-50 rounded-xl font-bold"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-gray-400">นามสกุล</Label>
                                    <Input
                                        className="h-12 border-none bg-gray-50 rounded-xl font-bold"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase text-gray-400">รหัสผ่านใหม่ (ปล่อยว่างหากไม่ต้องการเปลี่ยน)</Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        className="h-12 border-none bg-gray-50 rounded-xl font-bold pl-10"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-gray-400">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger className="h-12 border-none bg-gray-50 rounded-xl font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase text-gray-400">สถานะ</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v: string) => setFormData({ ...formData, status: v })}
                                    >
                                        <SelectTrigger className="h-12 border-none bg-gray-50 rounded-xl font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-black rounded-2xl h-14 font-black mt-4 shadow-xl">
                                อัปเดตข้อมูลพนักงาน
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {message && (
                    <div className="fixed bottom-10 right-10 flex items-center gap-4 bg-white px-8 py-5 rounded-[2.5rem] shadow-2xl border-l-[10px] border-[#bbfc2f] animate-in slide-in-from-right duration-500 z-50">
                        <CheckCircle2 className="text-[#bbfc2f]" size={32} />
                        <div>
                            <p className="font-black text-gray-900 text-lg">ดำเนินการสำเร็จ</p>
                            <p className="text-sm text-gray-400 font-bold">{message}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
