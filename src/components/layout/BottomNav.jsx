import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/shop", icon: ShoppingBag, label: "Shop" },
  { to: "/rules", icon: BookOpen, label: "Rules" },
];

const HIDDEN_ROUTES = ["/game", "/setup"];

export default function BottomNav() {
  const { pathname } = useLocation();
  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-50 bg-slate-950/95 backdrop-blur border-t border-white/10 pb-safe"
      style={{ height: "calc(var(--bottom-nav-height) + var(--safe-bottom))" }}
    >
      <div className="flex items-center justify-around h-[var(--bottom-nav-height)]">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-amber-400" : "text-slate-400 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}