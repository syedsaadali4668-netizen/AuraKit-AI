import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ setIsAuthenticated }) {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // tracks if looking at history or new
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      // UPDATED TO LIVE RAILWAY URL
      const res = await fetch('https://aurakit-ai-production.up.railway.app/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchHistory();
  }, []);

  const runAgent = async () => {
    if (!niche) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      // UPDATED TO LIVE RAILWAY URL
      const res = await fetch('https://aurakit-ai-production.up.railway.app/api/agent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ niche, platform })
      });
      
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      
      const data = await res.json();
      setOutput(data.result || data.error);
      setActiveTab('generated');
      fetchHistory(); // Refresh history sidebar instantly
      
    } catch (err) {
      setOutput('Failed to connect to the agent. Ensure backend is running.');
    }
    setLoading(false);
  };

  const loadPastGeneration = (record) => {
    setNiche(record.niche);
    setPlatform(record.platform);
    setOutput(record.result);
    setActiveTab('history-view');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: Navigation & History */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgb(0,0,0,0.02)] z-10 animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Aura<span className="text-emerald-500">Kit</span>
          </h1>
          <button onClick={handleLogout} className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>

        {/* New Generation Button */}
        <div className="p-4">
          <button 
            onClick={() => { setOutput(''); setNiche(''); setActiveTab('new'); }}
            className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
          >
            + New Generation
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2 mt-2">Recent Strategies</p>
          
          {history.length === 0 ? (
            <div className="text-center p-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No history yet.<br/>Start your first project!
            </div>
          ) : (
            history.map((record) => (
              <div 
                key={record.id} 
                onClick={() => loadPastGeneration(record)}
                className="group p-4 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-emerald-300 hover:shadow-md hover:bg-emerald-50/30 transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{record.platform}</span>
                  <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{record.date}</span>
                </div>
                <p className="text-gray-500 text-sm truncate font-medium">{record.niche}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL */}
      <div className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
          
          {/* Header Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {activeTab === 'new' ? 'Create Strategy' : 'Strategy Dashboard'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">Configure parameters to deploy the AI agent.</p>
          </div>

          {/* Input Controls Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-2">Target Niche</label>
                <input 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium"
                  placeholder="e.g., Fitness Coaching, Tech Reviews..."
                  value={niche} 
                  onChange={(e) => setNiche(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-bold text-gray-700 mb-2">Content Platform</label>
                <select 
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium cursor-pointer"
                  value={platform} 
                  onChange={(e) => setPlatform(e.target.value)}
                >
                  <option>TikTok</option>
                  <option>YouTube Shorts</option>
                  <option>Instagram Reels</option>
                  <option>LinkedIn</option>
                </select>
              </div>
            </div>

            <button 
              onClick={runAgent}
              disabled={loading || !niche}
              className="mt-8 w-full bg-emerald-500 text-white font-extrabold text-lg py-4 rounded-xl shadow-[0_8px_20px_rgb(16,185,129,0.3)] hover:bg-emerald-600 hover:shadow-[0_8px_25px_rgb(16,185,129,0.4)] transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating Blueprint...
                </span>
              ) : 'Generate Brand Blueprint'}
            </button>
          </div>

          {/* AI Output Result Card */}
          {output && (
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in relative overflow-hidden">
              {/* Decorative top green bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-emerald-500">✦</span> Output Results
              </h3>
              
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-600 font-sans leading-relaxed text-[15px]">
                  {output}
                </pre>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}