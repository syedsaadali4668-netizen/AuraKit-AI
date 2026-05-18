import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth({ setIsAuthenticated }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      // UPDATED TO LIVE RAILWAY URL
      const res = await fetch(`https://aurakit-ai-production.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      if (isLogin) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setIsLogin(true);
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md animate-fade-in border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Aura<span className="text-emerald-500">Kit</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {isLogin ? 'Welcome back to your workspace' : 'Start generating brands today'}
          </p>
        </div>
        
        {error && (
          <div className={`p-4 rounded-xl text-sm mb-6 ${error.includes('successful') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:transform-none"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <span className="text-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
}