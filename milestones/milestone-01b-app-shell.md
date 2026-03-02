## Milestone: App Shell

> **Validates:**
> - The frontend SPA is served at `/` (Express static file serving from `dist/public`)
> - The page renders with "AutoDev" visible in the sidebar
> - Sidebar shows a "Projects" section with a "Dashboard" nav item and an "Admin" section with a "Sample Specs" nav item
> - On desktop (≥768px) the sidebar is visible without any toggle
> - On mobile (<768px) a hamburger button appears in a top bar

> **Reference files:**
> - `src/client/App.tsx` — React Router and layout shell
> - `src/client/components/AppLayout.tsx` — sidebar layout component

- [x] Install `react-router-dom` and set up React Router in `src/client/App.tsx`: wrap with `<BrowserRouter>`, add `<Routes>` with placeholder `<Route>` entries for `/` (Dashboard placeholder), `/projects/new` (placeholder), `/projects/:id` (placeholder), `/admin/sample-specs` (placeholder); each placeholder renders a `<div>` with the route name

- [x] Add shadcn/ui Sidebar components: manually create `src/client/components/ui/sidebar.tsx` exporting `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarTrigger`, and `useSidebar` hook; implement open/close state in `SidebarProvider` via React context; `Sidebar` renders as a fixed `w-64` panel; `SidebarTrigger` toggles sidebar open/closed

- [x] Create `src/client/components/AppLayout.tsx`: use `SidebarProvider`, `Sidebar`, `SidebarHeader` ("AutoDev" text as logo), `SidebarContent` with two `SidebarGroup` sections — "Projects" group containing a Dashboard `SidebarMenuButton` (LayoutDashboard icon from lucide-react) and "Admin" group containing a Sample Specs `SidebarMenuButton` (FileText icon); use `NavLink` from react-router-dom to set active highlight (`aria-current` / active class); render `{children}` in main content area beside the sidebar

- [ ] Implement responsive sidebar behavior in `AppLayout.tsx`: sidebar hidden by default on mobile (`hidden md:flex`), always visible on desktop; add a top bar (`md:hidden`) containing `SidebarTrigger` (hamburger icon) visible only on mobile; when sidebar is open on mobile it renders as a fixed overlay (`fixed inset-0 z-40`) with a backdrop; clicking a nav item on mobile closes the sidebar via `useSidebar`

- [ ] Wrap all routes in `App.tsx` with `AppLayout` as the shell: import `AppLayout`, nest the `<Routes>` block inside `<AppLayout>` so every page shares the sidebar and top bar; main content area applies `max-w-5xl mx-auto px-4 md:px-6` for centering and padding
