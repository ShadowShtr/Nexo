import { CalendarDays, ChevronRight, Clock3, MapPinned, Search, Sparkles, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tourOptions = [
  { id: 'lisbon', icon: '✦', pt: 'Tour em Lisboa', en: 'Lisbon tour', detailPt: 'Miradouros e centro histórico', detailEn: 'Viewpoints and historic centre' },
  { id: 'sintra', icon: '◈', pt: 'Sintra', en: 'Sintra', detailPt: 'Palácios, serra e mar', detailEn: 'Palaces, hills and sea' },
  { id: 'lisbon-sintra', icon: '↗', pt: 'Lisboa + Sintra', en: 'Lisbon + Sintra', detailPt: 'A experiência completa', detailEn: 'The complete experience' },
  { id: 'custom', icon: '＋', pt: 'Tour à medida', en: 'Custom tour', detailPt: 'O seu ritmo, o seu percurso', detailEn: 'Your pace, your route' },
];

export default function CustomerDiscoverSandbox() {
  const { i18n } = useTranslation();
  const say = (pt: string, en: string) => i18n.language === 'en' ? en : pt;
  const chooseTour = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tour', '1');
    url.hash = '#/customer/booking';
    window.location.assign(url.toString());
  };
  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  };

  return <div className="pm-client-home">
    <header className="pm-client-toolbar">
      <span className="pm-client-wordmark"><span className="pm-client-mark">pm.</span><strong>Premium Mobility</strong></span>
      <label className="pm-client-language"><span className="pm-sr-only">{say('Idioma', 'Language')}</span><select aria-label={say('Idioma', 'Language')} value={i18n.language} onChange={event => changeLanguage(event.target.value)}><option value="pt-PT">Português</option><option value="en">English</option></select></label>
    </header>

    <button type="button" className="pm-client-search" onClick={chooseTour} aria-label={say('Pesquisar um tour', 'Search for a tour')}>
      <Search size={24} strokeWidth={2.2}/><strong>{say('Para onde?', 'Where to?')}</strong><span className="pm-client-later"><CalendarDays size={18}/>{say('Mais tarde', 'Later')}</span>
    </button>

    <section className="pm-client-categories" aria-labelledby="client-adventure-title">
      <div className="pm-client-section-title"><h1 id="client-adventure-title">{say('Escolhe a tua aventura.', 'Choose your adventure.')}</h1><span className="pm-client-spark"><Sparkles size={18}/></span></div>
      <div className="pm-client-category-grid">
        {tourOptions.map(option => <button type="button" className="pm-client-category" key={option.id} onClick={chooseTour}>
          <span className="pm-client-category-art" aria-hidden="true">{option.icon}</span>
          <strong>{say(option.pt, option.en)}</strong>
          <span>{say(option.detailPt, option.detailEn)}</span>
        </button>)}
      </div>
    </section>

    <button type="button" className="pm-client-tour-promo" onClick={chooseTour} aria-label={say('Abrir tour Lisboa Sintra', 'Open Lisbon Sintra tour')}>
      <img src="/lisbon-sintra-tour.png" alt=""/>
      <span className="pm-client-tour-shade"/>
      <span className="pm-client-tour-copy"><span className="pm-client-kicker"><Ticket size={15}/> {say('Experiência privada', 'Private experience')}</span><strong>Lisboa <span>→</span> Sintra</strong><span>{say('Do centro histórico aos palácios da serra.', 'From the historic centre to the hilltop palaces.')}</span><span className="pm-client-tour-meta"><Clock3 size={15}/> {say('2 dias · até 2 pessoas incluídas', '2 days · up to 2 people included')}</span><span className="pm-client-tour-action">{say('Ver tour', 'View tour')} <ChevronRight size={18}/></span></span>
    </button>

    <p className="pm-client-note">{say('Valores e disponibilidade são confirmados antes do pedido.', 'Prices and availability are confirmed before your request.')}</p>
  </div>;
}
