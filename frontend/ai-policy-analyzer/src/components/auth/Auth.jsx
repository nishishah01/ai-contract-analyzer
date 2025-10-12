import { useState } from "react";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      {showLogin ? (
        <LoginForm onToggle={() => setShowLogin(false)} />
      ) : (
        <RegistrationForm onToggle={() => setShowLogin(true)} />
      )}
    </div>
  );
};

export default Auth;