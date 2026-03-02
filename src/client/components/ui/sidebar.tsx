import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prev) => !prev);
  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <aside className={cn("w-64 flex flex-col bg-sidebar text-sidebar-foreground", className)}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-3 border-b border-sidebar-border", className)}>
      {children}
    </div>
  );
}

export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-2", className)}>
      {children}
    </div>
  );
}

export function SidebarGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function SidebarMenu({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <ul className={cn("space-y-0.5", className)}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <li className={cn("", className)}>
      {children}
    </li>
  );
}

export function SidebarMenuButton({
  children,
  className,
  asChild,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  if (asChild) {
    return <>{children}</>;
  }
  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();
  return (
    <button
      aria-label="Toggle sidebar"
      onClick={toggle}
      className={cn("p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
}
