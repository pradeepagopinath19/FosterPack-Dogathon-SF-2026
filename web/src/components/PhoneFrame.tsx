import type { ReactNode } from "react";
import StatusBar from "@/components/StatusBar";
import BottomTabBar from "@/components/BottomTabBar";

// Wraps every page in a phone-shaped device mockup on screens wider than a
// real phone (sm and up) — for demoing the app from a laptop. On an actual
// phone the bezel/shadow disappear and this is just the normal full-bleed
// layout with a status bar + bottom tab bar.
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col items-center bg-zinc-50 dark:bg-black sm:h-screen sm:justify-center sm:bg-zinc-200 sm:py-10 sm:dark:bg-zinc-950">
      <div className="flex w-full flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-black sm:h-[844px] sm:max-h-[85vh] sm:w-[390px] sm:flex-none sm:rounded-[3rem] sm:border-[10px] sm:border-black sm:shadow-2xl">
        <StatusBar />
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        <BottomTabBar />
      </div>
    </div>
  );
}
