import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FertilizerPlanner from "./pages/FertilizerPlanner";
import Housings from "./pages/Housings";
import GISDashboard from "./pages/GISDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import FarmerDashboard from "./pages/FarmerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RoleRoute from "./components/RoleRoute";
import AgricultureServices from "./pages/AgricultureServices";
import HousingScheme from "./pages/HousingScheme";
import ApplyHousing from "./pages/ApplyHousing";
import About from "./pages/About";
import Help from "./pages/Help";
import Modules from "./pages/Modules";
import GISPlatform from "./pages/GISPlatform";
import HousingMIS from "./pages/HousingMIS";
import Reports from "./pages/Reports";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/gis-platform" element={<GISPlatform />} />
        <Route path="/housing-mis" element={<HousingMIS />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/fertilizer-planner" element={<FertilizerPlanner />} />
        <Route path="/housings" element={<Housings />} />
        <Route path="/gis-dashboard" element={<GISDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/agri-services" element={<AgricultureServices />} />
        <Route path="/housing-scheme" element={<HousingScheme />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route
          path="/farmer"
          element={
            <RoleRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/apply-housing"
          element={
            <RoleRoute allowedRoles={['farmer']}>
              <ApplyHousing />
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
</QueryClientProvider>);
export default App;
