import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { NewProjectPage } from "@/pages/NewProjectPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { SampleSpecsAdminPage } from "@/pages/SampleSpecsAdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/admin/sample-specs" element={<SampleSpecsAdminPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
