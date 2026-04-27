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
        <div className="flex bg-[#f8fafc] h-screen overflow-hidden font-sans w-full">
            <SidebarLeft />

            <main className="flex-1 px-6 py-6 overflow-y-auto w-full no-scrollbar">
                {/* Compact Header */}
                <header className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <UserCog size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">
                                จัดการผู้ดูแลระบบ
                            </h1>
                            <p className="text-slate-400 text-xs font-bold">จัดการสิทธิ์และการเข้าถึงของทีมงาน</p>
                        </div>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl bg-slate-900 text-white hover:bg-black h-11 px-6 font-black shadow-sm transition-all text-sm">
                                <UserPlus size={16} className="mr-2" /> เพิ่มผู้ใช้ใหม่
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                            <div className="bg-slate-900 px-8 py-6 text-white">
                                <div className="text-xl font-black mb-1">เพิ่มผู้ใช้ใหม่</div>
                                <p className="text-xs text-slate-400 font-bold opacity-80">ระบุข้อมูลพื้นฐานและสิทธิ์การเข้าถึง</p>
                            </div>
                            <form onSubmit={handleAddUser} className="p-8 space-y-5 bg-white">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</Label>
                                        <Input
                                            required
                                            className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</Label>
                                        <Input
                                            type="password"
                                            required
                                            className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ชื่อจริง</Label>
                                        <Input
                                            required
                                            className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm"
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">นามสกุล</Label>
                                        <Input
                                            className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm"
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ระดับสิทธิ์ (Role)</Label>
                                    <Select
                                        defaultValue="staff"
                                        onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm">
                                            <SelectValue placeholder="เลือกสิทธิ์" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-slate-100">
                                            <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                                            <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                                            <SelectItem value="sale">Sale (Salesperson - No Revenue View)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl h-12 font-black shadow-lg shadow-indigo-100 mt-2">
                                    บันทึกข้อมูล
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Professional Search */}
                <div className="mb-6 relative group flex items-center">
                    <Search className="absolute left-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <Input
                        placeholder="ค้นหาชื่อผู้ใช้ หรือชื่อพนักงาน..."
                        className="h-14 pl-14 pr-6 rounded-2xl bg-white border-none shadow-sm text-base font-bold placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-600/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Users Table Card */}
                <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden mb-10">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-50">
                                <TableHead className="pl-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อพนักงาน</TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ระดับสิทธิ์</TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สถานะ</TableHead>
                                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">สร้างเมื่อ</TableHead>
                                <TableHead className="pr-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Loader2 className="animate-spin text-indigo-600 mx-auto h-8 w-8" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 opacity-20">
                                            <Users size={48} />
                                            <p className="text-base font-black">ไม่พบข้อมูลผู้ใช้</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((u) => (
                                    <TableRow key={u._id} className="hover:bg-slate-50/50 transition-all border-slate-50 group">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                                    <Shield size={16} />
                                                </div>
                                                <span className="text-sm font-black text-slate-900 truncate max-w-[150px]">{u.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-bold text-slate-600">{u.firstName} {u.lastName}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`rounded-lg border-none font-black px-3 py-1 text-[10px] uppercase ${
                                                u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 
                                                u.role === 'sale' ? 'bg-amber-50 text-amber-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {u.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                <span className="text-[11px] font-bold text-slate-500">{u.status === 'active' ? 'ปกติ' : 'ระงับการใช้งาน'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-[11px] font-bold text-slate-400">
                                                {new Date(u.createdAt).toLocaleDateString('th-TH')}
                                            </p>
                                        </TableCell>
                                        <TableCell className="pr-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                                    onClick={() => openEditModal(u)}
                                                >
                                                    <Edit3 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                                                    onClick={() => handleDeleteUser(u._id)}
                                                >
                                                    <Trash2 size={14} />
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
                    <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                        <div className="bg-slate-900 px-8 py-6 text-white">
                            <div className="text-xl font-black mb-1">แก้ไขข้อมูลพนักงาน</div>
                            <p className="text-xs text-slate-400 font-bold opacity-80">ปรับปรุงสิทธิ์และข้อมูลของ {selectedUser?.username}</p>
                        </div>
                        <form onSubmit={handleEditUser} className="p-8 space-y-5 bg-white">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">ชื่อจริง</Label>
                                    <Input
                                        className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">นามสกุล</Label>
                                    <Input
                                        className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">รหัสผ่านใหม่ (ระบุเมื่อต้องการเปลี่ยน)</Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm pl-10"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="sale">Sale</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">สถานะ</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v: string) => setFormData({ ...formData, status: v })}
                                    >
                                        <SelectTrigger className="h-11 border-slate-100 bg-slate-50 rounded-xl font-bold text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-black rounded-xl h-12 font-black shadow-lg mt-2 transition-all">
                                อัปเดตข้อมูลพนักงาน
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {message && (
                    <div className="fixed bottom-10 right-10 flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-2xl border-l-4 border-indigo-600 animate-in slide-in-from-right duration-500 z-50">
                        <CheckCircle2 className="text-indigo-600" size={24} />
                        <div>
                            <p className="font-black text-slate-900 text-base">ดำเนินการสำเร็จ</p>
                            <p className="text-[11px] text-slate-400 font-bold">{message}</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
