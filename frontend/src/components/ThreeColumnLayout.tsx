import { type ReactNode } from "react";

interface ThreeColumnLayoutProps {
  left?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}

export function ThreeColumnLayout({
  left,
  right,
  children,
}: ThreeColumnLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-[72px] pb-6">
      <div className="flex gap-5 items-start">
        {left && (
          <aside className="hidden lg:flex flex-col gap-3 w-60 shrink-0 sticky top-[72px]">
            {left}
          </aside>
        )}
        <main className="flex-1 min-w-0">{children}</main>
        {right && (
          <aside className="hidden xl:flex flex-col gap-3 w-72 shrink-0 sticky top-[72px]">
            {right}
          </aside>
        )}
      </div>
    </div>
  );
}
