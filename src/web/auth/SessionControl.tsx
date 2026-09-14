import { useTranslation } from 'react-i18next';
import { getBrowserSupabase } from './browser-client';

export function SessionControl({demo}:{demo:boolean}) {
  const {t}=useTranslation();const client=getBrowserSupabase();
  if(demo||!client)return null;
  return <button className="pm-session-button" type="button" onClick={()=>void client.auth.signOut({scope:'local'})}>{t('signOut')}</button>;
}
