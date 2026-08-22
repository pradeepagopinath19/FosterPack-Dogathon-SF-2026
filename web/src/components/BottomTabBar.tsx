"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/volunteer", label: "Volunteer", icon: "🐾" },
  { href: "/foster", label: "Foster", icon: "🏠" },
  { href: "/admin", label: "Admin", icon: "📊" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-stretch justify-around border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              active ? "text-orange-500" : "text-zinc-500"
            }`}
          >
            <span className="text-lg leading-none" aria-hidden>
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
