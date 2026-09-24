import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);
  const [status, setStatus] = useState(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? 'Verifying your email...' : 'This verification link is missing its token.');

  useEffect(() => {
    if (!token) return;

    authService.verifyEmail(token).then((result) => {
      setStatus(result.ok ? 'success' : 'error');
      setMessage(result.message);
    });
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/6 p-8 text-center shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Contify account security</p>
        <h1 className="mt-3 text-3xl font-bold text-white">{status === 'loading' ? 'Verify your email' : status === 'success' ? 'Email verified' : 'Verification unavailable'}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">{message}</p>
        {status !== 'loading' && <button type="button" onClick={() => navigate('/login')} className="mt-7 rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950">Continue to Login</button>}
      </section>
    </main>
  );
}
