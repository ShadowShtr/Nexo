import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2, LockKeyhole, LogIn, LogOut, Save } from 'lucide-react';
import type { Membership } from '../../modules/identity/session';
import { readIdentity, signIn } from '../../modules/identity/session';
import { Button } from '../../ui/components/Button';
import type { Area } from '../navigation';
import { getBrowserSupabase } from './browser-client';

type AccessState = 'checking' | 'signed-out' | 'allowed' | 'denied' | 'unconfigured';

export function AuthGate({area,demo,children}:{area:Area;demo:boolean;children:ReactNode}) {
  const { t, i18n } = useTranslation();
  const bypass = demo || area === 'customer';
  const client = getBrowserSupabase();
  const [state,setState] = useState<AccessState>(()=>bypass ? 'allowed' : client ? 'checking' : 'unconfigured');
  const [memberships,setMemberships] = useState<Membership[]>([]);
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [inviteMode,setInviteMode] = useState(()=>new URLSearchParams(window.location.search).get('invite') === '1');

  useEffect(()=>{
    if (bypass) { setState('allowed'); return; }
    if (!client) { setState('unconfigured'); return; }
    let current = true;
    const refresh = async () => {
      try {
        const identity = await readIdentity(client);
        if (!current) return;
        setMemberships(identity);
        if (!identity.length) setState('signed-out');
        else setState(identity.some(item=>item.role === 'owner' || (area === 'driver' && item.role === 'driver')) ? 'allowed' : 'denied');
      } catch { if(current) { setMemberships([]); setState('signed-out'); } }
    };
    void refresh();
    const {data} = client.auth.onAuthStateChange(()=>{ void refresh(); });
    return ()=>{ current=false; data.subscription.unsubscribe(); };
  },[area,bypass,client]);

  if (bypass) return children;
  const language = <label className="pm-language"><Globe2 size={17}/><span className="pm-sr-only">{t('language')}</span><select aria-label={t('language')} value={i18n.language} onChange={event=>void i18n.changeLanguage(event.target.value)}><option value="pt-PT">Português</option><option value="en">English</option></select></label>;
  const shell = (body:ReactNode) => <main className="pm-theme pm-auth-shell"><section className="pm-card pm-auth-card"><div className="pm-auth-heading"><span className="pm-logo">pm.</span>{language}</div>{body}</section></main>;
  if (state === 'allowed' && !inviteMode) return children;
  if (state === 'allowed' && inviteMode) {
    const completeInvite = async (event:FormEvent<HTMLFormElement>) => {
      event.preventDefault();setBusy(true);setError('');
      const form=new FormData(event.currentTarget);const password=String(form.get('password')||'');const confirmation=String(form.get('confirmation')||'');
      if(password.length<12||password!==confirmation){setError(t('passwordMismatch'));setBusy(false);return;}
      const result=await client!.auth.updateUser({password});
      if(result.error){setError(t('passwordUpdateFailed'));setBusy(false);return;}
      const url=new URL(window.location.href);url.searchParams.delete('invite');url.searchParams.delete('code');history.replaceState(null,'',url);setInviteMode(false);setBusy(false);
    };
    return shell(<><LockKeyhole size={28}/><h1>{t('completeInvite')}</h1><p>{t('completeInviteBody')}</p><form className="pm-form" onSubmit={completeInvite}><div className="pm-field"><label htmlFor="new-password">{t('newPassword')}</label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={12} required/></div><div className="pm-field"><label htmlFor="password-confirmation">{t('confirmPassword')}</label><input id="password-confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={12} required/></div>{error&&<p className="pm-error" role="alert">{error}</p>}<Button type="submit" disabled={busy}><Save size={17} aria-hidden="true" />{busy?t('authChecking'):t('savePassword')}</Button></form></>);
  }
  if (state === 'checking') return shell(<p role="status">{t('authChecking')}</p>);
  if (state === 'unconfigured') return shell(<><LockKeyhole size={28}/><h1>{t('authSetupTitle')}</h1><p>{t('authSetupBody')}</p><p className="pm-note">VITE_SUPABASE_URL · VITE_SUPABASE_PUBLISHABLE_KEY</p></>);
  if (state === 'denied') return shell(<><LockKeyhole size={28}/><h1>{t('authDenied')}</h1><p>{t('authDeniedBody')}</p><Button onClick={()=>void client?.auth.signOut({scope:'local'})}><LogOut size={17} aria-hidden="true" />{t('signOut')}</Button></>);

  const submit = async (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const identity = await signIn(client!,String(form.get('email')||''),String(form.get('password')||''));
      setMemberships(identity);
      setState(identity.some(item=>item.role === 'owner' || (area === 'driver' && item.role === 'driver')) ? 'allowed' : 'denied');
    } catch { setError(t('signInFailed')); }
    finally { setBusy(false); }
  };
  return shell(<><LockKeyhole size={28}/><span className="pm-eyebrow">{t(area)}</span><h1>{t('signIn')}</h1><p>{t('signInBody')}</p><form className="pm-form" onSubmit={submit}><div className="pm-field"><label htmlFor="auth-email">{t('email')}</label><input id="auth-email" name="email" type="email" autoComplete="username" required/></div><div className="pm-field"><label htmlFor="auth-password">{t('password')}</label><input id="auth-password" name="password" type="password" autoComplete="current-password" minLength={12} required/></div>{error&&<p className="pm-error" role="alert">{error}</p>}<Button type="submit" disabled={busy}><LogIn size={17} aria-hidden="true" />{busy?t('authChecking'):t('signIn')}</Button></form>{memberships.length>0&&<p className="pm-note">{t('authDeniedBody')}</p>}</>);
}
