import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService, getDashboardPathForRole } from '../../services/authService';
import BrandHeader from '../../components/navigation/BrandHeader';
import sidePanelDefaultImage from '../../assets/side-panel-default.png';
import sidePanelForgotImage from '../../assets/side-panel-forgot.png';

const ROLE_DATA = {
  ADMIN: {
    label: 'Admin',
    image: 'https://img.freepik.com/premium-vector/flat-design-illustration-female-admin-receiving-call-from-customer_608297-23864.jpg',
    overlayImage: 'https://img.freepik.com/premium-vector/flat-design-illustration-female-admin-receiving-call-from-customer_608297-23864.jpg',
    blurb: 'Manage teams, resources, and project workflows from one control center.',
  },
  EDITOR: {
    label: 'Editor',
    image: 'https://illustrations.popsy.co/blue/video-call.svg',
    overlayImage: 'https://illustrations.popsy.co/blue/video-call.svg',
    blurb: 'Create and publish quality content while collaborating with your team.',
  },
  STAKEHOLDER: {
    label: 'Stakeholder',
    image: 'https://illustrations.popsy.co/blue/shaking-hands.svg',
    overlayImage: 'https://illustrations.popsy.co/blue/shaking-hands.svg',
    blurb: 'Track outcomes, review progress, and guide project decisions confidently.',
  },
};

const ROLE_OPTIONS = ['STAKEHOLDER', 'EDITOR', 'ADMIN'];

function normalizeRole(roleValue) {
  const role = (roleValue || '').toString().trim().toUpperCase();
  if (role === 'MANAGER') return 'ADMIN';
  if (role === 'CREATOR') return 'EDITOR';
  if (role === 'CLIENT') return 'STAKEHOLDER';
  return ROLE_OPTIONS.includes(role) ? role : 'STAKEHOLDER';
}

function passwordStrength(password) {
  const value = (password || '').trim();
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (value.length === 0) return { label: 'No password', color: '#94a3b8', width: '0%' };
  if (score <= 1) return { label: 'Weak', color: '#dc2626', width: '25%' };
  if (score === 2) return { label: 'Fair', color: '#d97706', width: '50%' };
  if (score === 3) return { label: 'Good', color: '#2563eb', width: '75%' };
  return { label: 'Strong', color: '#16a34a', width: '100%' };
}

export default function AuthSplit({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const { roleName } = useParams();
  const { login, register } = useAuth();

  const [mode, setMode] = useState(initialMode === 'signup' ? 'signup' : initialMode === 'forgot' ? 'forgot' : 'login');
  const [signupStep, setSignupStep] = useState(roleName ? 'form' : 'role');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const googleLoginRef = useRef(null);
  const googleSignupRef = useRef(null);

  const defaultRole = useMemo(() => normalizeRole(roleName || localStorage.getItem('selectedRole')), [roleName]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: defaultRole,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot';

  useEffect(() => {
    setMode(initialMode === 'signup' ? 'signup' : initialMode === 'forgot' ? 'forgot' : 'login');
  }, [initialMode]);

  useEffect(() => {
    setSignupForm((prev) => ({ ...prev, role: defaultRole }));
    setSignupStep(roleName ? 'form' : 'role');
    if (roleName) {
      localStorage.setItem('selectedRole', roleName.toLowerCase());
    }
  }, [defaultRole, roleName]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;

    const renderGoogleButtons = () => {
      if (!window.google?.accounts?.id) return;
      const callback = async (response) => {
        const result = await authService.googleSignIn(response.credential, isSignup ? signupForm.role : 'STAKEHOLDER');
        if (!result.ok) {
          if (isSignup) setSignupError(result.message);
          else setLoginError(result.message);
          return;
        }
        navigate(getDashboardPathForRole(result.user?.role));
      };

      window.google.accounts.id.initialize({ client_id: clientId, callback });
      [googleLoginRef.current, googleSignupRef.current].forEach((element) => {
        if (!element) return;
        element.replaceChildren();
        window.google.accounts.id.renderButton(element, { theme: 'outline', size: 'large', width: 360, text: 'continue_with' });
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButtons();
      return undefined;
    }

    let script = document.querySelector('script[data-contify-google-identity]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.contifyGoogleIdentity = 'true';
      script.addEventListener('load', renderGoogleButtons, { once: true });
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', renderGoogleButtons, { once: true });
    }

    return undefined;
  }, [isSignup, navigate, signupForm.role]);

  const roleMeta = ROLE_DATA[signupForm.role] || ROLE_DATA.STAKEHOLDER;
  const strength = passwordStrength(signupForm.password);
  const sidePanelImage = isForgot ? sidePanelForgotImage : sidePanelDefaultImage;
  const sidePanelBackgroundImage = `linear-gradient(150deg, rgba(7, 24, 79, 0.76), rgba(13, 148, 136, 0.62)), url(${sidePanelImage})`;

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    const result = await login(loginForm.email, loginForm.password);
    if (!result.ok) {
      setLoginError(result.message || 'Invalid credentials.');
      setLoading(false);
      return;
    }

    navigate(getDashboardPathForRole(result.user?.role));
    setLoading(false);
  };

  const onSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSignupError('');
    setSignupMessage('');
    setVerificationUrl('');

    const payloadName = signupForm.name.trim();
    const payloadUsername = signupForm.username.trim() || payloadName.split(' ')[0] || 'user';

    if (signupForm.password !== confirmPassword) {
      setSignupError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const result = await register(
      signupForm.email,
      payloadUsername,
      payloadName,
      signupForm.role,
      signupForm.password,
    );

    if (!result.ok) {
      setSignupError(result.message || 'Sign up failed.');
      setLoading(false);
      return;
    }

    if (result.requiresVerification) {
      setSignupMessage(`Check your email. We sent a verification link to ${result.verificationEmail || signupForm.email}.`);
      setVerificationUrl(result.developmentVerificationUrl || '');
      setLoading(false);
      return;
    }

    navigate(getDashboardPathForRole(result.user?.role));
    setLoading(false);
  };

  const onForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotSubmitting(true);

    const result = await authService.forgotPassword(forgotEmail);
    if (!result.ok) {
      setForgotError(result.message || 'Unable to process request.');
      setForgotSubmitting(false);
      return;
    }

    setForgotMessage(result.message || 'If your account exists, reset instructions have been sent.');
    setForgotSubmitting(false);
  };

  const showSignupRoleStep = () => {
    setMode('signup');
    setSignupStep('role');
  };

  const selectRole = (role) => {
    setSignupForm((prev) => ({ ...prev, role }));
    setSignupStep('form');
  };

  return (
    <>
      <BrandHeader />
      <div className="auth-page-shell">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .auth-page-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', sans-serif;
          background:
            radial-gradient(circle at 15% 15%, #dcecff 0%, transparent 35%),
            radial-gradient(circle at 85% 80%, #defff2 0%, transparent 40%),
            linear-gradient(140deg, #eef6ff, #f9fbff);
        }

        .split-auth-container {
          width: min(1060px, 100%);
          min-height: 640px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 25px 60px rgba(16, 42, 120, 0.16);
          position: relative;
          overflow: hidden;
          display: flex;
        }

        .split-auth-panel {
          width: 50%;
          padding: 52px 44px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .split-auth-signup {
          opacity: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .split-auth-container.active .split-auth-signup {
          opacity: 1;
          pointer-events: auto;
        }

        .split-auth-container.active .split-auth-login {
          opacity: 0;
          pointer-events: none;
        }

        .auth-stack {
          width: 100%;
          max-width: 420px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .left-step-track {
          width: 200%;
          display: flex;
          transform: translateX(${isForgot ? '-50%' : '0%'});
          transition: transform 0.6s ease;
        }

        .left-step {
          flex: 0 0 50%;
          width: 50%;
          padding-right: 0;
          box-sizing: border-box;
          opacity: 1;
          transition: opacity 0.35s ease;
        }

        .left-login-step {
          opacity: ${isForgot ? '0' : '1'};
          visibility: ${isForgot ? 'hidden' : 'visible'};
          pointer-events: ${isForgot ? 'none' : 'auto'};
        }

        .left-forgot-step {
          opacity: ${isForgot ? '1' : '0'};
          visibility: ${isForgot ? 'visible' : 'hidden'};
          pointer-events: ${isForgot ? 'auto' : 'none'};
        }

        .split-auth-title {
          margin: 0;
          font-size: 2rem;
          color: #0f1d3a;
          font-weight: 700;
        }

        .split-auth-subtitle {
          margin: 0;
          color: #5f6b84;
          font-size: 0.96rem;
        }

        .split-auth-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dbe4ff;
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 0.95rem;
          color: #0f1d3a;
          background: #ffffff;
          outline: none;
        }

        .password-wrap {
          position: relative;
          width: 100%;
        }

        .password-wrap .split-auth-input {
          padding-right: 54px;
        }

        .password-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: #1e3a8a;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
        }

        .password-toggle:hover {
          background: #eef2ff;
        }

        .split-auth-input:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.14);
        }

        .split-auth-btn {
          border: 0;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .split-auth-btn-primary {
          background: linear-gradient(90deg, #1d4ed8, #1e3a8a);
          color: #ffffff;
        }

        .split-auth-btn-primary:hover {
          filter: brightness(1.05);
        }

        .split-auth-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .split-auth-btn-ghost {
          background: rgba(255, 255, 255, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.7);
          color: #ffffff;
        }

        .split-auth-btn-google {
          background: #ffffff;
          color: #1f2937;
          border: 1px solid #d1d5db;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .split-auth-links {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
        }

        .split-auth-link {
          color: #1d4ed8;
          border: 0;
          background: transparent;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
        }

        .split-auth-link:hover {
          text-decoration: underline;
        }

        .split-auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7b879f;
          font-size: 0.85rem;
        }

        .split-auth-divider::before,
        .split-auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5eaf6;
        }

        .split-auth-flash {
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 0.9rem;
          margin-bottom: 4px;
          border: 1px solid transparent;
        }

        .split-auth-error {
          background: #fff1f2;
          border-color: #fecdd3;
          color: #9f1239;
        }

        .split-auth-success {
          background: #ecfeff;
          border-color: #a5f3fc;
          color: #155e75;
        }

        .strength-wrap {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: -4px;
        }

        .strength-bar {
          width: 100%;
          height: 7px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .strength-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.25s ease, background-color 0.25s ease;
        }

        .strength-text {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .split-auth-overlay {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          transition: transform 0.6s ease;
          transform: translateX(0);
          z-index: 2;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 38px;
          box-sizing: border-box;
          background-image:
            linear-gradient(150deg, rgba(7, 24, 79, 0.76), rgba(13, 148, 136, 0.62)),
            url(${sidePanelDefaultImage});
          background-size: cover;
          background-position: center;
        }

        .split-auth-container.active .split-auth-overlay {
          transform: translateX(-100%);
        }

        .split-auth-overlay h3 {
          margin: 0 0 10px;
          font-size: 2rem;
          font-weight: 700;
        }

        .split-auth-overlay p {
          margin: 0 0 18px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        .role-avatar {
          width: 110px;
          height: 110px;
          border-radius: 999px;
          object-fit: cover;
          border: 3px solid rgba(255, 255, 255, 0.7);
          margin-bottom: 16px;
          background: rgba(255, 255, 255, 0.2);
        }

        .signup-step-track {
          width: 200%;
          display: flex;
          transform: translateX(${signupStep === 'form' ? '-50%' : '0%'});
          transition: transform 0.6s ease;
        }

        .signup-step {
          flex: 0 0 50%;
          width: 50%;
          box-sizing: border-box;
          padding-right: 0;
          opacity: 1;
          transition: opacity 0.35s ease;
        }

        .signup-step-role {
          opacity: ${signupStep === 'role' ? '1' : '0'};
          visibility: ${signupStep === 'role' ? 'visible' : 'hidden'};
          pointer-events: ${signupStep === 'role' ? 'auto' : 'none'};
        }

        .signup-step-form {
          opacity: ${signupStep === 'form' ? '1' : '0'};
          visibility: ${signupStep === 'form' ? 'visible' : 'hidden'};
          pointer-events: ${signupStep === 'form' ? 'auto' : 'none'};
        }

        .role-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .role-card-btn {
          border: 1px solid #dbe4ff;
          background: #f8fbff;
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #0f1d3a;
          font-weight: 600;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }

        .role-card-btn:hover {
          border-color: #1d4ed8;
          box-shadow: 0 10px 20px rgba(29, 78, 216, 0.12);
          transform: translateY(-2px);
        }

        .role-card-img {
          width: 44px;
          height: 44px;
          object-fit: cover;
          border-radius: 999px;
          margin: 0;
          display: inline-block;
          border: 2px solid #e6eeff;
          background: #ffffff;
        }

        .back-role-btn {
          margin-top: 12px;
          width: fit-content;
          padding: 0;
          font-size: 0.9rem;
          display: inline-block;
        }

        @media (max-width: 900px) {
          .split-auth-container {
            min-height: auto;
            display: block;
          }

          .split-auth-panel,
          .split-auth-signup,
          .split-auth-login {
            width: 100%;
            padding: 32px 24px;
            opacity: 1;
            pointer-events: auto;
          }

          .split-auth-signup {
            display: none;
          }

          .split-auth-container.active .split-auth-signup {
            display: flex;
          }

          .split-auth-container.active .split-auth-login {
            display: none;
          }

          .split-auth-overlay {
            position: static;
            width: 100%;
            min-height: 230px;
            transform: none !important;
          }
        }
      `}</style>

      <div className={`split-auth-container ${isSignup ? 'active' : ''}`}>
        <section className="split-auth-panel split-auth-login" style={{ overflow: 'hidden' }}>
          <div className="left-step-track">
            <div className="left-step left-login-step">
              <div className="auth-stack">
                <h2 className="split-auth-title">Welcome Back</h2>
                <p className="split-auth-subtitle">Sign in to continue to your Contify dashboard.</p>

                {loginError && <div className="split-auth-flash split-auth-error">{loginError}</div>}

                <form onSubmit={onLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    className="split-auth-input"
                    type="email"
                    placeholder="Email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <div className="password-wrap">
                    <input
                      className="split-auth-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                    >
                      {showLoginPassword ? 'Hide' : '👁'}
                    </button>
                  </div>
                  <button className="split-auth-btn split-auth-btn-primary" disabled={loading} type="submit">
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="split-auth-divider">or</div>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? <div ref={googleLoginRef} /> : <button type="button" className="split-auth-btn split-auth-btn-google" onClick={() => setLoginError('Google sign-in is not configured for this environment.')}>Continue with Google</button>}

                <button type="button" className="split-auth-btn split-auth-btn-primary" onClick={() => navigate('/demo')}>
                  Try Demo (read-only)
                </button>

                <div className="split-auth-links">
                  <button
                    className="split-auth-link"
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotEmail(loginForm.email);
                      setForgotError('');
                      setForgotMessage('');
                    }}
                  >
                    Forgot Password?
                  </button>
                  <button className="split-auth-link" type="button" onClick={showSignupRoleStep}>
                    Need an account?
                  </button>
                </div>
              </div>
            </div>

            <div className="left-step left-forgot-step">
              <div className="auth-stack">
                <h2 className="split-auth-title">Forgot Password</h2>
                <p className="split-auth-subtitle">Enter your email to receive reset instructions.</p>

                {forgotError && <div className="split-auth-flash split-auth-error">{forgotError}</div>}
                {forgotMessage && <div className="split-auth-flash split-auth-success">{forgotMessage}</div>}

                <form onSubmit={onForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    className="split-auth-input"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  <button className="split-auth-btn split-auth-btn-primary" disabled={forgotSubmitting} type="submit">
                    {forgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <button className="split-auth-link" type="button" onClick={() => setMode('login')}>
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="split-auth-panel split-auth-signup" style={{ overflow: 'hidden' }}>
          <div className="signup-step-track">
            <div className="signup-step signup-step-role">
              <div className="auth-stack">
                <h2 className="split-auth-title">Select Role</h2>
                <p className="split-auth-subtitle">Choose your role first, then continue to sign up.</p>

                <div className="role-grid">
                  {ROLE_OPTIONS.map((role) => (
                    <button key={role} type="button" className="role-card-btn" onClick={() => selectRole(role)}>
                      <img className="role-card-img" src={ROLE_DATA[role].image} alt={ROLE_DATA[role].label} />
                      {ROLE_DATA[role].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="signup-step signup-step-form">
              <div className="auth-stack">
                <h2 className="split-auth-title">Create Account</h2>
                <p className="split-auth-subtitle">Signing up as {roleMeta.label}.</p>

                {signupError && <div className="split-auth-flash split-auth-error">{signupError}</div>}
                {signupMessage && <div className="split-auth-flash split-auth-success">{signupMessage}{verificationUrl && <><br /><a href={verificationUrl} target="_blank" rel="noreferrer">Open local verification link</a></>}</div>}

                <form onSubmit={onSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    className="split-auth-input"
                    type="text"
                    placeholder="Full Name"
                    required
                    value={signupForm.name}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    className="split-auth-input"
                    type="text"
                    placeholder="Username"
                    required
                    value={signupForm.username}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, username: e.target.value }))}
                  />
                  <input
                    className="split-auth-input"
                    type="email"
                    placeholder="Email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <div className="password-wrap">
                    <input
                      className="split-auth-input"
                      type={showSignupPassword ? 'text' : 'password'}
                      placeholder="Password"
                      minLength={6}
                      required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowSignupPassword((prev) => !prev)}
                    >
                      {showSignupPassword ? 'Hide' : '👁'}
                    </button>
                  </div>

                  <input
                    className="split-auth-input"
                    type="password"
                    placeholder="Confirm Password"
                    minLength={6}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <div className="strength-wrap">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: strength.width, backgroundColor: strength.color }}></div>
                    </div>
                    <span className="strength-text" style={{ color: strength.color }}>
                      Password strength: {strength.label}
                    </span>
                  </div>

                  <button className="split-auth-btn split-auth-btn-primary" disabled={loading} type="submit">
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>

                <div className="split-auth-divider">or</div>
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? <div ref={googleSignupRef} /> : <button type="button" className="split-auth-btn split-auth-btn-google" onClick={() => setSignupError('Google sign-in is not configured for this environment.')}>Sign up with Google</button>}

                <button className="split-auth-link back-role-btn" type="button" onClick={() => setSignupStep('role')}>
                  ← Back to role selection
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside
          className="split-auth-overlay"
          style={{ backgroundImage: sidePanelBackgroundImage }}
        >
          <div>
            {isSignup && signupStep === 'form' && <img className="role-avatar" src={roleMeta.overlayImage || roleMeta.image} alt={roleMeta.label} />}
            <h3>{isSignup ? `${roleMeta.label} Sign Up` : isForgot ? 'Reset Access' : 'New Here?'}</h3>
            <p>
              {isSignup
                ? roleMeta.blurb
                : isForgot
                  ? 'Use your registered email and we will send password reset instructions.'
                  : 'Create your account to collaborate with admins, editors, and stakeholders in one place.'}
            </p>
            <button
              type="button"
              className="split-auth-btn split-auth-btn-ghost"
              onClick={() => {
                if (isSignup) {
                  setMode('login');
                  setSignupStep('role');
                } else if (isForgot) {
                  setMode('login');
                } else {
                  showSignupRoleStep();
                }
              }}
            >
              {isSignup || isForgot ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
}
