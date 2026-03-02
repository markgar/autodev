import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects/new" element={<div>New Project</div>} />
          <Route path="/projects/:id" element={<div>Project Detail</div>} />
          <Route path="/admin/sample-specs" element={<div>Sample Specs</div>} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
