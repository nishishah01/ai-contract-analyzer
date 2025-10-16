import { useState } from 'react';

const RegisterForm = ({ onToggle }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      alert('Registration successful! You can now log in.');
      onToggle(); // Switch to login form
    } catch (error) {
      alert(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="space-y-2">
        <label htmlFor="username" className="font-bold block mb-1">Username</label>
        <input
          id="username"
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="font-bold block mb-1">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="font-bold block mb-1">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="repeatPassword" className="font-bold block mb-1">Repeat Password</label>
        <input
          id="repeatPassword"
          type="password"
          placeholder="••••••••"
          value={repeatPassword}
          onChange={(e) => setRepeatPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Registering..." : "Sign Up"}
      </button>

      <p className="text-sm text-center text-gray-500 mt-2">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-blue-600 hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;