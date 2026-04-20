import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Indicators from "./pages/Indicators";
import Projection from "./pages/Projection";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="indicators" element={<Indicators />} />
          <Route path="projection" element={<Projection />} />
          <Route path="settings" element={<div className="p-8">設定與匯出區塊建置中...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
