import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Bus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout() {
  const location = useLocation();

  const navigation = [
    { name: "儀表板 (Dashboard)", href: "/", icon: LayoutDashboard },
    { name: "總體經濟指標庫", href: "/indicators", icon: TrendingUp },
    { name: "成本預測分析", href: "/projection", icon: Bus },
    { name: "設定與匯出", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white">TR</div>
            <h1 className="text-white font-bold leading-tight">台灣客運業<br/><span className="text-xs font-normal opacity-70">成本預測分析系統</span></h1>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                    isActive
                      ? "text-white bg-blue-600 shadow-lg shadow-blue-900/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                  <span className={cn("text-sm", isActive && "font-medium")}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">USR</div>
            <div className="flex flex-col">
              <span className="text-xs text-white">系統管理員</span>
              <span className="text-[10px] text-slate-500">Firebase Auth Active</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>分析</span>
              <span className="opacity-40">/</span>
              <span className="text-slate-900 font-medium">
                {navigation.find(n => n.href === location.pathname)?.name || "系統首頁"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Status: Syncing (GAS/Sheet)</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </header>
        <div className="flex-1 overflow-auto flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
