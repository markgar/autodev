import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const { setOpen } = useSidebar();
  return (
    <SidebarMenuItem>
      <NavLink
        to={to}
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors ${
            isActive ? "bg-accent text-accent-foreground font-medium" : ""
          }`
        }
        aria-current={undefined}
      >
        <Icon className="w-4 h-4" />
        {label}
      </NavLink>
    </SidebarMenuItem>
  );
}

function SidebarNav() {
  return (
    <Sidebar className="h-full">
      <SidebarHeader>
        <span className="text-lg font-bold">AutoDev</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarMenu>
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarMenu>
            <NavItem to="/admin/sample-specs" icon={FileText} label="Sample Specs" />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar();
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <SidebarNav />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 flex flex-col bg-background border-r shadow-lg">
            <SidebarNav />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center h-12 px-3 border-b bg-background">
          <SidebarTrigger />
          <span className="ml-2 font-bold">AutoDev</span>
        </header>

        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
