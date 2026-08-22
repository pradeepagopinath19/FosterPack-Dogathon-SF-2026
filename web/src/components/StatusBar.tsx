// Mock OS status bar — only shown inside the desktop phone-frame mockup
// (see PhoneFrame.tsx). A real phone already has its own status bar, so
// this is hidden below the `sm` breakpoint where the frame itself disappears.
export default function StatusBar() {
  return (
    <div className="hidden shrink-0 items-center justify-between bg-black px-6 pb-1 pt-2 text-white sm:flex">
      <span className="text-xs font-semibold tabular-nums">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden>
          <rect x="0" y="7" width="2.5" height="4" rx="0.5" fill="currentColor" />
          <rect x="4.5" y="5" width="2.5" height="6" rx="0.5" fill="currentColor" />
          <rect x="9" y="3" width="2.5" height="8" rx="0.5" fill="currentColor" />
          <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="currentColor" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden>
          <path
            d="M7.5 9.5C8.05 9.5 8.5 9.05 8.5 8.5C8.5 7.95 8.05 7.5 7.5 7.5C6.95 7.5 6.5 7.95 6.5 8.5C6.5 9.05 6.95 9.5 7.5 9.5Z"
            fill="currentColor"
          />
          <path
            d="M4.5 6.2C5.3 5.5 6.35 5 7.5 5C8.65 5 9.7 5.5 10.5 6.2"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <path
            d="M1.5 3.3C3 1.9 5.15 1 7.5 1C9.85 1 12 1.9 13.5 3.3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <div className="flex items-center">
          <div className="h-[11px] w-[22px] rounded-[3px] border border-white/70 p-[1.5px]">
            <div className="h-full w-[80%] rounded-[1px] bg-white" />
          </div>
          <div className="ml-[1px] h-[4px] w-[1.5px] rounded-r-sm bg-white/70" />
        </div>
      </div>
    </div>
  );
}
