import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'register';

type Props = {
  onClose: () => void;
  defaultMode?: Mode;
};

export default function AuthModal({ onClose, defaultMode = 'login' }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError('Email hoặc mật khẩu không đúng.');
      else onClose();
    } else {
      if (!username.trim()) { setError('Vui lòng nhập tên tài khoản.'); setLoading(false); return; }
      const { error } = await signUp(email, password, username);
      if (error) setError('Đăng ký thất bại. Email có thể đã tồn tại.');
      else { setSuccess('Đăng ký thành công! Đăng nhập ngay.'); setMode('login'); }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#F5C518]/20 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-display text-[#F5C518] tracking-wide">
              {mode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản để đọc truyện'}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-[#E50914]/10 border border-[#E50914]/30 rounded-lg text-[#E50914] text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-lg text-[#F5C518] text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5C518]/50" />
                <input type="text" placeholder="Tên tài khoản" value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/60 transition-colors text-sm" />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5C518]/50" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/60 transition-colors text-sm" />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5C518]/50" />
              <input type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-10 pr-10 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/60 transition-colors text-sm" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C518] transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#E50914] hover:bg-[#B20710] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors mt-2 text-sm uppercase tracking-wider">
              {loading ? 'ĐANG XỬ LÝ...' : mode === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? (
              <>Chưa có tài khoản? <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-[#F5C518] hover:text-[#C9A00C] font-semibold transition-colors">Đăng Ký</button></>
            ) : (
              <>Đã có tài khoản? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-[#F5C518] hover:text-[#C9A00C] font-semibold transition-colors">Đăng Nhập</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
