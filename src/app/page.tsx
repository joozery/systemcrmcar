"use client";

import { useEffect, useState } from "react";
import { SidebarLeft } from "@/components/dashboard/SidebarLeft";
import { Header } from "@/components/dashboard/Header";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { MainChartRow } from "@/components/dashboard/MainChartRow";
import { BottomRow } from "@/components/dashboard/BottomRow";
import { SidebarRight } from "@/components/dashboard/SidebarRight";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await fetch('/api/dashboard/stats');
        const statsData = await statsRes.json();
        setData(statsData);

        // Fetch user info
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex bg-[#f3f5f8] h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin text-[#2563eb]" size={48} />
      </div>
    );
  }

  return (
    <div className="flex bg-[#f3f5f8] h-screen overflow-hidden font-sans w-full">
      <SidebarLeft />
      <main className="flex-1 px-8 py-8 overflow-y-auto w-full no-scrollbar">
        <Header />
        <StatsRow data={data?.categoryStats} />
        <MainChartRow chartData={data?.monthlyBookings} extraStats={data?.extraStats} />
        <BottomRow bookings={data?.recentBookings} extraStats={data?.extraStats} />
      </main>
      <SidebarRight data={data} user={user} />
    </div>
  );
}
