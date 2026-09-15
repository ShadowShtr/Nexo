import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { getBrowserSupabase } from './browser-client';

export function SessionControl({demo}:{demo:boolean}) {
  const {t}=useTranslation();const client=getBrowserSupabase();
  if(demo||!client)return null;
  return <button className="pm-session-button" type="button" onClick={()=>void client.auth.signOut({scope:'local'})}><LogOut size={16} aria-hidden="true" />{t('signOut')}</button>;
}
