import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import Index from "./pages/Index";
import ClassifyImage from "./pages/ClassifyImage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatbotInterface from "./pages/ChatbotInterface";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Auth Context for managing authentication state
interface AuthContextType {
  isAuthenticated: boolean;
  // login now accepts token and user object returned from backend
  login: (token: string, user: any) => Promise<boolean> | boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const login = async (token: string, user: any) => {
    try {
      // Persist token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Auth login error:", error);
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/classify" element={<ClassifyImage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <ChatbotInterface />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
