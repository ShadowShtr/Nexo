import type { ReactNode } from 'react';
import { ArrowUpRight, Inbox } from 'lucide-react';
export function Header({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="pm-header"><div>{eyebrow && <p className="pm-eyebrow">{eyebrow}</p>}<h1 className="pm-title" tabIndex={-1}>{title}</h1>{description && <p className="pm-secondary">{description}</p>}</div>{action}</header>;
}
export function Empty({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="pm-empty"><div className="pm-empty-icon"><Inbox size={24} strokeWidth={1.4} /></div><h3>{title}</h3><p className="pm-secondary">{description}</p>{children}</div>;
}
export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="pm-section"><div className="pm-section-heading"><h2>{title}</h2>{action}</div>{children}</section>;
}
export function Row({ label, value }: { label: string; value: ReactNode }) {
  return <div className="pm-setting-row"><span>{label}</span><span className="pm-secondary">{value}</span></div>;
}
export function Shortcut({ title, description, href, icon }: { title: string; description: string; href: string; icon: ReactNode }) {
  return <a className="pm-card pm-shortcut" href={href}><span className="pm-shortcut-top">{icon}<ArrowUpRight size={18}/></span><strong>{title}</strong><span className="pm-secondary">{description}</span></a>;
}
