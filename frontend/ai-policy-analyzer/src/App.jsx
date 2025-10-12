import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegistrationForm";
import Dashboard from "./components/dashboard/Dashboard";
import DocumentDetail from "./components/documents/DocumentDetail";
import Documents from "./components/documents/Documents";
import SearchPage from "./components/search/SearchPage";

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {showLogin ? (
        <LoginForm onToggle={() => setShowLogin(false)} />
      ) : (
        <RegisterForm onToggle={() => setShowLogin(true)} />
      )}
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/documents/:id" element={<DocumentDetail />} />
      <Route path="/search" element={<SearchPage />} />

    </Routes>
  </BrowserRouter>
);

export default App;