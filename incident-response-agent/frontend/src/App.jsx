import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ChatPage  from "./pages/ChatPage";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/chat"  element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="*"      element={<Navigate to="/login" replace />} />
    </Routes>
  );
}