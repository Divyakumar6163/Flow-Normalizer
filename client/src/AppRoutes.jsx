import { Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import ReviewPage from "./pages/Review";
import AnalyticsPage from "./pages/Analytics";
import UploadsPage from "./pages/Uploads";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />

      <Route path="/upload/:source" element={<UploadPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/review/:batchId" element={<ReviewPage />} />
      <Route path="/uploads" element={<UploadsPage />} />
    </Routes>
  );
};

export default AppRoutes;
