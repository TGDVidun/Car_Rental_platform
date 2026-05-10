import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import MapPage from "./pages/MapPage";
import VehicleDetails from "./pages/VehicleDetails";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HelpPage from "./pages/HelpPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import CareersPage from "./pages/CareersPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";
import NotFound from "./pages/NotFound";

// Admin / Owner Pages
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AddVehiclePage from "./pages/AddVehiclePage";
import ManageVehiclesPage from "./pages/ManageVehiclesPage";
import ManageBookingsPage from "./pages/ManageBookingsPage";
import PaidVehiclesPage from "./pages/PaidVehiclesPage";
import ChatBox from "./components/ChatBox";

const queryClient = new QueryClient();

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
    >
      <motion.span
        className="font-heading text-4xl sm:text-5xl font-bold text-neutral-900 inline-block"
        animate={{
          scale: [1, 1.06, 1],
          opacity: [1, 0.88, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Rent<span className="text-primary">X</span>
      </motion.span>
    </motion.div>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen key="splash" />
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="min-h-screen"
            >
              <BrowserRouter>
                <ScrollToTop />
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/vehicle/:id" element={<VehicleDetails />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/checkout/:bookingId" element={<CheckoutPage />} />

                    {/* Admin/Owner Routes (No main navbar/footer) */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="add" element={<AddVehiclePage />} />
                      <Route path="cars" element={<ManageVehiclesPage />} />
                      <Route path="bookings" element={<ManageBookingsPage />} />
                      <Route path="paid" element={<PaidVehiclesPage />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
                <ChatBox />
              </BrowserRouter>
            </motion.div>
          )}
        </AnimatePresence>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
