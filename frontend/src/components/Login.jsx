import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      // Salvăm legitimația și datele user-ului
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Anunțăm componenta părinte
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-body min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-orange-500/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="w-full max-w-md px-6 z-10">
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-xl p-10 shadow-[0_20px_40px_-15px_rgba(7,30,39,0.06)] border border-slate-200 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-slate-100 flex items-center justify-center rounded-full text-orange-600">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                soup_kitchen
              </span>
            </div>
            <div>
              <h1 className="font-manrope font-extrabold text-3xl text-slate-900 tracking-tight">
                StockPot
              </h1>
              <p className="font-body text-slate-500 text-sm mt-1">Ciorbarie</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg border border-red-100 text-center animate-fade-in-down">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Username Input (Floating Label) */}
              <div className="relative group">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-slate-100/50 border-0 border-b-2 border-slate-200 px-4 pt-6 pb-2 rounded-t text-slate-900 font-body text-base focus:bg-white focus:ring-0 focus:border-orange-600 transition-colors"
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 top-4 text-slate-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-600"
                >
                  Username
                </label>
              </div>

              {/* Password Input (Floating Label) */}
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-slate-100/50 border-0 border-b-2 border-slate-200 px-4 pt-6 pb-2 rounded-t text-slate-900 font-body text-base focus:bg-white focus:ring-0 focus:border-orange-600 transition-colors"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-4 text-slate-500 font-medium text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-orange-600"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-orange-600 border-slate-300 bg-slate-100 focus:ring-orange-600 focus:ring-offset-white"
                />
                <span className="font-medium text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="font-medium text-sm text-orange-600 hover:text-orange-800 transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-orange-600 to-orange-700 text-white font-manrope font-semibold py-3.5 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 mt-2 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="font-medium text-xs text-slate-400 uppercase tracking-widest">
            © 2026 StockPot
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
