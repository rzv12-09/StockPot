import React, { useState } from 'react';
import { login, register } from '../services/authService';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  // State-uri formular
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  // State-uri UI
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin && password !== confirmPassword) {
      return setError('Parolele nu coincid!');
    }

    if (!isLogin && !role) {
      return setError('Vă rugăm să selectați un rol.');
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const data = await login(username, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        await register(username, password, role);
        setSuccess('Înregistrare cu succes! Așteaptă aprobarea managerului.');
        setTimeout(() => {
          setIsLogin(true);
          setPassword('');
          setConfirmPassword('');
          setSuccess('');
        }, 4000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode) => {
    setIsLogin(mode === 'signin');
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-[#f3faff] text-[#071e27] font-body min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#ffdbd1]/30 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-[#a6eff3]/30 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="w-full max-w-md px-6 z-10">
        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-xl p-10 shadow-[0_20px_40px_-15px_rgba(7,30,39,0.06)] border border-[#e3bfb2]/30 flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-[#dbf1fe] flex items-center justify-center rounded-full text-[#ad2c00]">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                soup_kitchen
              </span>
            </div>
            <div>
              <h1 className="font-manrope font-extrabold text-3xl text-[#071e27] tracking-tight">
                StockPot
              </h1>
              <p className="font-body text-[#5a4138] text-sm mt-1">
                Gestiune Culinară de Precizie
              </p>
            </div>
          </div>

          {/* Role Selector (Tabs) */}
          <div className="flex border-b border-[#e3bfb2]/30 mb-2">
            <button
              type="button"
              onClick={() => toggleMode('signin')}
              className={`flex-1 pb-3 text-sm transition-all ${
                isLogin
                  ? 'text-[#ad2c00] border-b-2 border-[#ad2c00] font-semibold'
                  : 'text-[#5a4138] font-medium hover:text-[#071e27]'
              }`}
            >
              Autentificare
            </button>
            <button
              type="button"
              onClick={() => toggleMode('signup')}
              className={`flex-1 pb-3 text-sm transition-all ${
                !isLogin
                  ? 'text-[#ad2c00] border-b-2 border-[#ad2c00] font-semibold'
                  : 'text-[#5a4138] font-medium hover:text-[#071e27]'
              }`}
            >
              Înregistrare
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-lg border border-red-100 text-center animate-fade-in-down">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-teal-50 text-teal-700 text-sm font-medium p-3 rounded-lg border border-teal-100 text-center animate-fade-in-down">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {/* Username Input */}
              <div className="relative group">
                <input
                  required
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-[#d5ecf8] border-0 border-b-2 border-[#e3bfb2]/30 px-4 pt-6 pb-2 rounded-t text-[#071e27] font-body text-base focus:bg-white focus:ring-0 focus:border-[#ad2c00] transition-colors outline-none"
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 top-4 text-[#5a4138] font-label text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ad2c00]"
                >
                  Utilizator
                </label>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full bg-[#d5ecf8] border-0 border-b-2 border-[#e3bfb2]/30 px-4 pt-6 pb-2 rounded-t text-[#071e27] font-body text-base focus:bg-white focus:ring-0 focus:border-[#ad2c00] transition-colors outline-none"
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-4 text-[#5a4138] font-label text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ad2c00]"
                >
                  Parolă
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-[#5a4138] hover:text-[#071e27] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {/* Confirm Password - Only on Sign Up */}
              {!isLogin && (
                <div className="relative group animate-fade-in-down">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    id="confirm_password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=" "
                    className="peer w-full bg-[#d5ecf8] border-0 border-b-2 border-[#e3bfb2]/30 px-4 pt-6 pb-2 rounded-t text-[#071e27] font-body text-base focus:bg-white focus:ring-0 focus:border-[#ad2c00] transition-colors outline-none"
                  />
                  <label
                    htmlFor="confirm_password"
                    className="absolute left-4 top-4 text-[#5a4138] font-label text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ad2c00]"
                  >
                    Confirmă Parola
                  </label>
                </div>
              )}
            </div>
            {/* Role Select - Only on Sign Up */}

            {!isLogin && (
              <div className="relative group animate-fade-in-down">
                <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="peer w-full bg-[#d5ecf8] border-0 border-b-2 border-[#e3bfb2]/30 px-4 pt-6 pb-2 rounded-t text-[#071e27] font-body text-base focus:bg-white focus:ring-0 focus:border-[#ad2c00] transition-colors appearance-none outline-none cursor-pointer"
                >
                  <option disabled value="">
                    Selectează rolul...
                  </option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="SALES">SALES</option>
                  <option value="PRODUCTION">PRODUCTION</option>
                </select>
                <label className="absolute left-4 top-2 text-[#ad2c00] font-label text-xs transition-all">
                  Rol
                </label>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 pt-4 text-[#5a4138]">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            )}

            {/* Remember Me / Forgot Password - Only on Sign In */}
            {isLogin && (
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-[#ad2c00] border-[#e3bfb2]/50 bg-[#d5ecf8] focus:ring-[#ad2c00] focus:ring-offset-white"
                  />
                  <span className="font-label text-sm text-[#5a4138] group-hover:text-[#071e27] transition-colors">
                    Ține-mă minte
                  </span>
                </label>
                <a
                  href="#"
                  className="font-label text-sm text-[#ad2c00] font-medium hover:text-[#d34011] transition-colors"
                >
                  Ai uitat parola?
                </a>
              </div>
            )}

            {/* Approval Notice - Only on Sign Up */}
            {!isLogin && (
              <div className="bg-[#d5ecf8]/50 border-l-4 border-[#ad2c00] p-4 rounded-r-lg animate-fade-in-down">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[#ad2c00] text-xl">info</span>
                  <p className="font-body text-sm text-[#5a4138] leading-relaxed">
                    Contul tău necesită aprobare manuală din partea unui{' '}
                    <span className="font-semibold text-[#071e27]">Manager</span> înainte de a putea accesa aplicația.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-b from-[#ad2c00] to-[#d34011] text-white font-label font-semibold py-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : isLogin ? (
                'Autentificare'
              ) : (
                'Cere Acces'
              )}
            </button>
          </form>
        </div>

        {/* Footer Simple */}
        <div className="text-center mt-8">
          <p className="font-label text-xs text-[#5a4138]/70 uppercase tracking-widest">
            © 2026 STOCKPOT
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
