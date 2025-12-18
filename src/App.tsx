import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Reservar from "./pages/Reservar";
import Informacion from "./pages/Informacion";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ValidarQR from "./pages/ValidarQR";
import { AnimatedFox } from "./components/AnimatedFox";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          <AnimatedFox />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reservar" element={<Reservar />} />
            <Route path="/informacion" element={<Informacion />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/validar/:codigo" element={<ValidarQR />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
