import { Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ReviewPage from "./pages/Review";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />

      <Route path="/upload/:source" element={<UploadPage />} />

      <Route path="/review/:batchId" element={<ReviewPage />} />
    </Routes>
  );
};

export default AppRoutes;
