import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ManagementPanel from './ManagementPanel.jsx';
import './AuthPanel.css';

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function AuthPanel({ auth, onClose }) {
  const [mode, setMode] = useState('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [profileName, setProfileName] = useState(auth.user?.displayName || '');
  const [profileImage, setProfileImage] = useState(auth.user?.profileImageUrl || '');
  const [profileImageEdited, setProfileImageEdited] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const roles = auth.user?.roleKeys || [];
  const permissions = auth.user?.permissions || [];
  const hasManagement = roles.includes('developer') || permissions.includes('*') || ['members.manage', 'events.manage', 'roles.manage'].some((permission) => permissions.includes(permission));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmation('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!validEmail(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (mode === 'register') {
      const name = displayName.trim();
      if (!name || name.length > 100) {
        setError('Display name must be between 1 and 100 characters.');
        return;
      }
      if (password.length < 12 || password.length > 128) {
        setError('Password must be between 12 and 128 characters.');
        return;
      }
      if (password !== confirmation) {
        setError('The passwords do not match.');
        return;
      }
    } else if (!password || password.length > 128) {
      setError('Enter your password (up to 128 characters).');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'register') {
        await auth.register({ displayName: displayName.trim(), email: normalizedEmail, password });
      } else {
        await auth.login({ email: normalizedEmail, password });
      }
      setPassword('');
      setConfirmation('');
      onClose();
    } catch (requestError) {
      setError(requestError.status ? requestError.message : 'Unable to reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setError('');
    setBusy(true);
    try {
      await auth.logout();
      onClose();
    } catch (requestError) {
      setError(requestError.status ? requestError.message : 'Unable to reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError('');
    setProfileMessage('');
    const name = profileName.trim();
    if (!name || name.length > 100) {
      setProfileError('Display name must be between 1 and 100 characters.');
      return;
    }
    let imageUrl = null;
    if (profileImage.trim()) {
      try {
        const parsed = new URL(profileImage.trim());
        if (parsed.protocol !== 'https:' || parsed.href.length > 2048) throw new Error('invalid');
        imageUrl = parsed.href;
      } catch {
        setProfileError('Profile image must be an HTTPS URL up to 2048 characters, or blank to clear it.');
        return;
      }
    }

    setProfileBusy(true);
    try {
      const details = { displayName: name };
      if (profileImageEdited) details.profileImageUrl = imageUrl;
      const updated = await auth.updateProfile(details);
      setProfileName(updated.displayName);
      setProfileImage(updated.profileImageUrl || '');
      setProfileImageEdited(false);
      setProfileMessage('Profile updated.');
    } catch (requestError) {
      if (requestError.status === 401) auth.refresh().catch(() => {});
      setProfileError(requestError.status ? requestError.message : 'Unable to reach the server. Please try again.');
    } finally {
      setProfileBusy(false);
    }
  };

  return (
    <div
      className="auth-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section aria-labelledby="auth-panel-title" aria-modal="true" className={`auth-panel ${hasManagement ? 'auth-panel--wide' : ''}`} role="dialog">
        <button aria-label="Close account panel" className="auth-panel__close" onClick={onClose} type="button">
          <X aria-hidden="true" size={20} />
        </button>
        <span className="auth-panel__eyebrow">AAVESH // MEMBER ACCESS</span>
        {auth.user ? (
          <>
            <h2 id="auth-panel-title">Account session</h2>
            <p className="auth-panel__lead">Signed in as {auth.user.displayName}</p>
            <div className="auth-panel__identity">
              <span>{auth.user.email}</span>
              <div className="auth-panel__badges" aria-label="Roles">
                {(auth.user.roleKeys || []).map((role) => <span key={role}>{role}</span>)}
              </div>
              <p>Permissions: {(auth.user.permissions || []).length ? auth.user.permissions.join(', ') : 'No additional permissions assigned.'}</p>
            </div>
            <form className="auth-panel__profile" onSubmit={saveProfile}>
              <h3>My profile</h3>
              <label>
                <span>Display name</span>
                <input autoComplete="name" maxLength={100} onChange={(event) => setProfileName(event.target.value)} required value={profileName} />
              </label>
              <label>
                <span>Profile image URL (HTTPS)</span>
                <input onChange={(event) => { setProfileImage(event.target.value); setProfileImageEdited(true); }} placeholder="https://..." type="url" value={profileImage} />
              </label>
              {profileError && <p className="auth-panel__error" role="alert">{profileError}</p>}
              {profileMessage && <p className="management-panel__success" role="status">{profileMessage}</p>}
              <button className="button button--primary auth-panel__submit" disabled={profileBusy} type="submit">
                {profileBusy ? 'Saving...' : 'Save profile'}
              </button>
            </form>
            {hasManagement && <ManagementPanel onUserChanged={auth.refresh} user={auth.user} />}
            {error && <p className="auth-panel__error" role="alert">{error}</p>}
            <button className="button button--secondary auth-panel__submit" disabled={busy} onClick={logout} type="button">
              {busy ? 'Signing out...' : 'Log out'}
            </button>
          </>
        ) : (
          <>
            <h2 id="auth-panel-title">{mode === 'login' ? 'Welcome back.' : 'Join the society.'}</h2>
            <p className="auth-panel__lead">
              {mode === 'login' ? 'Sign in to your AAVESH member account.' : 'Create a member account to access your profile.'}
            </p>
            {auth.sessionError && <p className="auth-panel__notice" role="status">{auth.sessionError}</p>}
            <div aria-label="Account action" className="auth-panel__tabs" role="group">
              <button aria-pressed={mode === 'login'} className={mode === 'login' ? 'is-active' : ''} onClick={() => switchMode('login')} type="button">Log in</button>
              <button aria-pressed={mode === 'register'} className={mode === 'register' ? 'is-active' : ''} onClick={() => switchMode('register')} type="button">Register</button>
            </div>
            <form className="auth-panel__form" onSubmit={submit}>
              {mode === 'register' && (
                <label>
                  <span>Display name</span>
                  <input autoComplete="name" maxLength={100} onChange={(event) => setDisplayName(event.target.value)} required value={displayName} />
                </label>
              )}
              <label>
                <span>Email address</span>
                <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
              </label>
              <label>
                <span>Password{mode === 'register' ? ' (12-128 characters)' : ''}</span>
                <input
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  maxLength={128}
                  minLength={mode === 'register' ? 12 : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
              </label>
              {mode === 'register' && (
                <label>
                  <span>Confirm password</span>
                  <input autoComplete="new-password" maxLength={128} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
                </label>
              )}
              {error && <p className="auth-panel__error" role="alert">{error}</p>}
              <button className="button button--primary auth-panel__submit" disabled={busy} type="submit">
                {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create member account'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
