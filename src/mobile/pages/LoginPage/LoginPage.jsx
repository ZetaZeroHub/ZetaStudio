import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, MessageSquare, ArrowRight, Eye, EyeOff } from 'lucide-react';

const s = {
  page: {
    position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
    background: 'var(--bg-primary)', zIndex: 900,
    paddingTop: 'var(--m-safe-top)',
  },
  topBar: {
    display: 'flex', justifyContent: 'flex-end', padding: '8px 16px',
  },
  closeBtn: {
    width: 36, height: 36, border: 'none', background: 'none',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', borderRadius: '50%',
  },
  body: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '20px 24px', gap: 24,
  },
  brand: { textAlign: 'center', marginBottom: 8 },
  logo: { fontSize: '2.5rem', marginBottom: 8 },
  brandTitle: {
    fontFamily: 'var(--font-display)', fontSize: '1.5rem',
    fontWeight: 800, color: 'var(--text-primary)',
  },
  brandSub: { fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 },
  tabs: {
    display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)',
    padding: 2, border: '1px solid var(--border-subtle)',
  },
  tab: {
    flex: 1, padding: '8px', border: 'none', background: 'none',
    color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
    borderRadius: 'var(--radius-full)', textAlign: 'center',
  },
  tabActive: {
    background: 'var(--bg-primary)', color: 'var(--text-primary)',
    fontWeight: 600, boxShadow: 'var(--shadow-sm)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  inputGroup: { position: 'relative' },
  inputLabel: {
    display: 'block', fontSize: '0.75rem', fontWeight: 500,
    color: 'var(--text-secondary)', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '12px 14px', border: '1px solid var(--border-default)',
    borderRadius: 8, background: 'var(--bg-elevated)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
  },
  codeRow: { display: 'flex', gap: 8 },
  codeBtn: {
    flexShrink: 0, padding: '12px 16px', border: '1px solid var(--m-accent)',
    borderRadius: 8, background: 'none', color: 'var(--m-accent)',
    fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  codeBtnDisabled: { borderColor: 'var(--border-default)', color: 'var(--text-muted)', cursor: 'not-allowed' },
  eyeBtn: {
    position: 'absolute', right: 12, top: 32, border: 'none',
    background: 'none', color: 'var(--text-muted)', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  submitBtn: {
    width: '100%', padding: '13px', border: 'none', borderRadius: 8,
    background: 'var(--m-accent)', color: '#000', fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0',
    color: 'var(--text-muted)', fontSize: '0.75rem',
  },
  dividerLine: { flex: 1, height: 1, background: 'var(--border-subtle)' },
  socialRow: { display: 'flex', justifyContent: 'center', gap: 24 },
  socialBtn: {
    width: 52, height: 52, borderRadius: '50%', border: '1px solid var(--border-default)',
    background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', fontSize: '1.25rem',
  },
  agreement: {
    fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center',
    lineHeight: 1.5,
  },
  link: { color: 'var(--m-accent)', cursor: 'pointer' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('phone'); // phone | password
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = () => {
    if (!phone.trim() || phone.length < 11 || countdown > 0) return;
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const canSubmit = mode === 'phone'
    ? phone.length >= 11 && code.length >= 4
    : phone.length >= 11 && password.length >= 6;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Mock login success
    localStorage.setItem('m_user', JSON.stringify({
      id: 'me', name: '创作者001', avatar: '🎨',
      phone: phone.slice(0, 3) + '****' + phone.slice(-4),
    }));
    navigate('/m/profile');
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.closeBtn} onClick={() => navigate(-1)}><X size={20} /></button>
      </div>

      <div style={s.body}>
        <div style={s.brand}>
          <div style={s.logo}>🎮</div>
          <div style={s.brandTitle}>Zeta Zero Hub</div>
          <div style={s.brandSub}>AI驱动的游戏创作平台</div>
        </div>

        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(mode === 'phone' ? s.tabActive : {}) }} onClick={() => setMode('phone')}>
            验证码登录
          </button>
          <button style={{ ...s.tab, ...(mode === 'password' ? s.tabActive : {}) }} onClick={() => setMode('password')}>
            密码登录
          </button>
        </div>

        <div style={s.form}>
          <div style={s.inputGroup}>
            <label style={s.inputLabel}>手机号</label>
            <input
              style={s.input}
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              maxLength={11}
            />
          </div>

          {mode === 'phone' ? (
            <div style={s.inputGroup}>
              <label style={s.inputLabel}>验证码</label>
              <div style={s.codeRow}>
                <input
                  style={{ ...s.input, flex: 1 }}
                  type="text"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <button
                  style={{ ...s.codeBtn, ...(countdown > 0 ? s.codeBtnDisabled : {}) }}
                  onClick={handleSendCode}
                  disabled={countdown > 0 || phone.length < 11}
                >
                  {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>
            </div>
          ) : (
            <div style={s.inputGroup}>
              <label style={s.inputLabel}>密码</label>
              <input
                style={s.input}
                type={showPwd ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          <button
            style={{ ...s.submitBtn, ...(!canSubmit ? s.submitBtnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            登录 / 注册
          </button>
        </div>

        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span>其他方式</span>
          <span style={s.dividerLine} />
        </div>

        <div style={s.socialRow}>
          <button style={s.socialBtn} aria-label="微信登录">💬</button>
          <button style={s.socialBtn} aria-label="苹果登录">🍎</button>
        </div>

        <p style={s.agreement}>
          登录即同意 <span style={s.link}>用户协议</span> 和 <span style={s.link}>隐私政策</span>
        </p>
      </div>
    </div>
  );
}
