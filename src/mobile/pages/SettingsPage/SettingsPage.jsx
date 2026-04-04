import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Globe, Bell, Shield, LogOut,
  ChevronRight, User, Trash2, HelpCircle,
} from 'lucide-react';
import MobileNavBar from '../../components/MobileNavBar/MobileNavBar';
import useThemeStore from '../../../stores/themeStore';

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100%', paddingTop: 'calc(var(--m-nav-height) + var(--m-safe-top))', paddingBottom: 'calc(var(--m-tab-height) + var(--m-safe-bottom))' },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 0' },
  section: { marginBottom: 16 },
  sectionLabel: { padding: '8px var(--m-page-pad)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  item: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px var(--m-page-pad)', background: 'var(--bg-primary)',
    cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)',
  },
  itemIcon: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)' },
  itemDesc: { fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 },
  itemRight: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  itemValue: { fontSize: '0.8125rem', color: 'var(--text-secondary)' },
  toggle: {
    width: 44, height: 24, borderRadius: 12, padding: 2,
    border: 'none', cursor: 'pointer', transition: 'background 0.2s',
    display: 'flex', alignItems: 'center',
  },
  toggleDot: {
    width: 20, height: 20, borderRadius: '50%', background: '#fff',
    transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  dangerBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, width: '100%', padding: '13px',
    border: 'none', background: 'none', color: 'var(--accent-danger)',
    fontFamily: 'var(--font-sans)', fontSize: '0.9375rem', fontWeight: 500,
    cursor: 'pointer',
  },
  version: {
    textAlign: 'center', padding: '20px 0', fontSize: '0.6875rem',
    color: 'var(--text-muted)',
  },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('m_user');
    navigate('/m/');
  };

  return (
    <div style={s.page}>
      <MobileNavBar showBack title="设置" />

      <div style={s.scroll}>
        {/* 账号 */}
        <div style={s.section}>
          <div style={s.sectionLabel}>账号</div>
          <div style={s.item} onClick={() => navigate('/m/login')}>
            <div style={{ ...s.itemIcon, background: 'rgba(0,230,118,0.12)', color: '#00E676' }}><User size={16} /></div>
            <div style={s.itemInfo}><div style={s.itemTitle}>编辑资料</div></div>
            <div style={s.itemRight}><ChevronRight size={16} color="var(--text-muted)" /></div>
          </div>
          <div style={s.item}>
            <div style={{ ...s.itemIcon, background: 'rgba(66,133,244,0.12)', color: '#4285F4' }}><Shield size={16} /></div>
            <div style={s.itemInfo}>
              <div style={s.itemTitle}>隐私设置</div>
              <div style={s.itemDesc}>作品可见性、评论权限</div>
            </div>
            <div style={s.itemRight}><ChevronRight size={16} color="var(--text-muted)" /></div>
          </div>
        </div>

        {/* 通用 */}
        <div style={s.section}>
          <div style={s.sectionLabel}>通用</div>
          <div style={s.item} onClick={toggleTheme}>
            <div style={{ ...s.itemIcon, background: theme === 'dark' ? 'rgba(255,193,7,0.12)' : 'rgba(66,66,66,0.12)', color: theme === 'dark' ? '#FFC107' : '#424242' }}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            <div style={s.itemInfo}>
              <div style={s.itemTitle}>深色模式</div>
              <div style={s.itemDesc}>{theme === 'dark' ? '深色主题' : '浅色主题'}</div>
            </div>
            <div style={s.itemRight}>
              <div style={{ ...s.toggle, background: theme === 'dark' ? 'var(--m-accent)' : 'var(--bg-elevated)' }}>
                <div style={{ ...s.toggleDot, transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(0)' }} />
              </div>
            </div>
          </div>

          <div style={s.item}>
            <div style={{ ...s.itemIcon, background: 'rgba(156,39,176,0.12)', color: '#9C27B0' }}><Globe size={16} /></div>
            <div style={s.itemInfo}><div style={s.itemTitle}>语言</div></div>
            <div style={s.itemRight}>
              <span style={s.itemValue}>简体中文</span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>

          <div style={s.item} onClick={() => setPushEnabled(!pushEnabled)}>
            <div style={{ ...s.itemIcon, background: 'rgba(255,87,34,0.12)', color: '#FF5722' }}><Bell size={16} /></div>
            <div style={s.itemInfo}>
              <div style={s.itemTitle}>推送通知</div>
              <div style={s.itemDesc}>互动、系统消息推送</div>
            </div>
            <div style={s.itemRight}>
              <div style={{ ...s.toggle, background: pushEnabled ? 'var(--m-accent)' : 'var(--bg-elevated)' }}>
                <div style={{ ...s.toggleDot, transform: pushEnabled ? 'translateX(20px)' : 'translateX(0)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 其他 */}
        <div style={s.section}>
          <div style={s.sectionLabel}>其他</div>
          <div style={s.item}>
            <div style={{ ...s.itemIcon, background: 'rgba(0,150,136,0.12)', color: '#009688' }}><HelpCircle size={16} /></div>
            <div style={s.itemInfo}><div style={s.itemTitle}>帮助与反馈</div></div>
            <div style={s.itemRight}><ChevronRight size={16} color="var(--text-muted)" /></div>
          </div>
          <div style={s.item}>
            <div style={{ ...s.itemIcon, background: 'rgba(244,67,54,0.12)', color: '#F44336' }}><Trash2 size={16} /></div>
            <div style={s.itemInfo}><div style={s.itemTitle}>清除缓存</div><div style={s.itemDesc}>12.3 MB</div></div>
            <div style={s.itemRight}><ChevronRight size={16} color="var(--text-muted)" /></div>
          </div>
        </div>

        {/* 退出 */}
        <button style={s.dangerBtn} onClick={handleLogout}>
          <LogOut size={16} /> 退出登录
        </button>

        <div style={s.version}>Zeta Zero Hub v1.0.0 (PWA)</div>
      </div>
    </div>
  );
}
