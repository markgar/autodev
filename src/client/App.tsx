import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/projects/new" element={<div>New Project</div>} />
        <Route path="/projects/:id" element={<div>Project Detail</div>} />
        <Route path="/admin/sample-specs" element={<div>Sample Specs</div>} />
      </Routes>
    </BrowserRouter>
  );
}
