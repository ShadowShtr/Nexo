import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isTourPublishable } from '../../contracts/tour';
import { Button } from '../../ui/components/Button';
import { Row, Section } from '../../ui/components/Primitives';
import { RouteMap } from '../components/RouteMap';
import { searchAddresses, type AddressSearchResult } from '../services/address-search';
import { tourRoute, type DemoRoute } from '../demo-routes';
import { TourSimulator } from './TourSimulator';
import { tourCatalogChangedEvent, tourCatalogStorageKey } from '../tour-catalog';

type Tour = {
  id: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  durationDays: 2;
  baseCents: number;
  extraPassengerCents: number;
  minimumNoticeHours: number;
  active: boolean;
  area: string;
  photoPath: string;
  location?: AddressSearchResult;
};

type TourDraft = Pick<Tour, 'namePt' | 'nameEn' | 'descriptionPt' | 'descriptionEn' | 'area' | 'baseCents' | 'extraPassengerCents' | 'minimumNoticeHours'>;

const areaStorageKey = 'pm.demo.tour-areas';
const defaultAreas = ['Lisboa', 'Sintra', 'Porto', 'Douro', 'Arrábida'];
const localLocations: readonly AddressSearchResult[] = [
  { title: 'Lisboa', detail: 'Lisboa, Portugal', coordinates: [38.7223, -9.1393], source: 'photon' },
  { title: 'Sintra', detail: 'Sintra, Lisboa', coordinates: [38.8029, -9.3817], source: 'photon' },
  { title: 'Cascais', detail: 'Cascais, Lisboa', coordinates: [38.6979, -9.4215], source: 'photon' },
  { title: 'Porto', detail: 'Porto, Portugal', coordinates: [41.1496, -8.6109], source: 'photon' },
  { title: 'Douro', detail: 'Douro, Portugal', coordinates: [41.1702, -7.7909], source: 'photon' },
  { title: 'Arrábida', detail: 'Setúbal, Portugal', coordinates: [38.4896, -8.9867], source: 'photon' },
];
const tourPhotos = [
  { path: '/lisbon-sintra-tour.png', label: 'Lisboa e Sintra' },
  { path: '/porto-tour.png', label: 'Porto e Douro' },
  { path: '/route-landmark.png', label: 'Rota personalizada' },
] as const;
const initial: Tour[] = [
  { id: 't1', namePt: 'Sintra e Cabo da Roca', nameEn: 'Sintra and Cabo da Roca', descriptionPt: 'Palácios, costa e miradouros.', descriptionEn: 'Palaces, coast and viewpoints.', durationDays: 2, baseCents: 20000, extraPassengerCents: 3500, minimumNoticeHours: 48, active: true, area: 'Sintra', photoPath: '/lisbon-sintra-tour.png', location: localLocations[1] },
  { id: 't2', namePt: 'Douro Premium', nameEn: 'Premium Douro', descriptionPt: 'Vinhos e paisagens do Douro.', descriptionEn: 'Wine and Douro landscapes.', durationDays: 2, baseCents: 32000, extraPassengerCents: 4500, minimumNoticeHours: 72, active: true, area: 'Douro', photoPath: '/porto-tour.png', location: localLocations[4] },
];

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function readTours(): Tour[] {
  try {
    const raw = window.localStorage.getItem(tourCatalogStorageKey);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<Tour>[];
    return Array.isArray(parsed) && parsed.length ? parsed.filter(item => typeof item.id === 'string' && typeof item.namePt === 'string' && typeof item.area === 'string').map(item => ({ ...initial[0], ...item, durationDays: 2 as const, photoPath: typeof item.photoPath === 'string' && item.photoPath ? item.photoPath : tourPhotos[0].path })) as Tour[] : initial;
  } catch { return initial; }
}

function readAreas() {
  try {
    const raw = window.localStorage.getItem(areaStorageKey);
    const parsed = raw ? JSON.parse(raw) : undefined;
    return Array.isArray(parsed) && parsed.every(item => typeof item === 'string') ? parsed as string[] : defaultAreas;
  } catch { return defaultAreas; }
}

function distanceMeters(from: readonly [number, number], to: readonly [number, number]) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6_371_000;
  const dLat = radians(to[0] - from[0]);
  const dLon = radians(to[1] - from[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)) * 1.18);
}

function makeTourRoute(location: AddressSearchResult | undefined, area: string): DemoRoute {
  const destination = location ?? localLocations.find(item => normalize(item.title) === normalize(area));
  const origin = tourRoute.points[0];
  const fallback = tourRoute.points[1];
  const destinationPoint = { label: destination?.title || area || fallback.label || 'Local do tour', coordinates: destination?.coordinates ?? fallback.coordinates, kind: 'destination' as const };
  const middle: readonly [number, number] = [(origin.coordinates[0] + destinationPoint.coordinates[0]) / 2, (origin.coordinates[1] + destinationPoint.coordinates[1]) / 2];
  const meters = Math.max(8_000, distanceMeters(origin.coordinates, destinationPoint.coordinates));
  return { name: `${origin.label} → ${destinationPoint.label}`, meters, minutes: Math.max(45, Math.round(meters / 1000 / 42 * 60)), points: [origin, destinationPoint], shape: [origin.coordinates, middle, destinationPoint.coordinates] };
}

function emptyDraft(): TourDraft {
  return { namePt: '', nameEn: '', descriptionPt: '', descriptionEn: '', area: '', baseCents: 20000, extraPassengerCents: 3500, minimumNoticeHours: 48 };
}

export function TourSandbox() {
  const { i18n } = useTranslation();
  const en = i18n.language === 'en';
  const language = en ? 'en' : 'pt';
  const say = (pt: string, english: string) => en ? english : pt;
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const [tours, setTours] = useState<Tour[]>(readTours);
  const [areas, setAreas] = useState<string[]>(readAreas);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TourDraft>(emptyDraft());
  const [photoPath, setPhotoPath] = useState<string>(tourPhotos[0].path);
  const [selectedLocation, setSelectedLocation] = useState<AddressSearchResult | undefined>(localLocations[1]);
  const [areaFocused, setAreaFocused] = useState(false);
  const [areaResults, setAreaResults] = useState<AddressSearchResult[]>([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const query = draft.area.trim();
    if (!areaFocused || query.length < 2) { setAreaResults([]); setAreaLoading(false); return; }
    const local = localLocations.filter(item => normalize(item.title).includes(normalize(query)) || normalize(item.detail).includes(normalize(query)));
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAreaLoading(true);
      try {
        const remote = await searchAddresses({ queries: [query], language, signal: controller.signal, geoapifyKey: import.meta.env.VITE_GEOAPIFY_API_KEY?.trim(), geoapifyUrl: import.meta.env.VITE_GEOAPIFY_URL?.trim() || undefined, photonUrl: import.meta.env.VITE_PHOTON_URL?.trim() || undefined });
        if (!controller.signal.aborted) setAreaResults([...local, ...remote.filter(item => !local.some(existing => normalize(existing.title) === normalize(item.title)))].slice(0, 6));
      } catch (reason) {
        if ((reason as { name?: string }).name !== 'AbortError') setAreaResults(local);
      } finally {
        if (!controller.signal.aborted) setAreaLoading(false);
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [areaFocused, draft.area, language]);

  const previewRoute = useMemo(() => makeTourRoute(selectedLocation, draft.area), [draft.area, selectedLocation]);
  const resetForm = () => { setEditingId(null); setDraft(emptyDraft()); setPhotoPath(tourPhotos[0].path); setSelectedLocation(undefined); setError(''); };
  const startCreate = () => { resetForm(); setShowForm(true); setFeedback(''); };
  const startEdit = (tour: Tour) => { setEditingId(tour.id); setDraft({ namePt: tour.namePt, nameEn: tour.nameEn, descriptionPt: tour.descriptionPt, descriptionEn: tour.descriptionEn, area: tour.area, baseCents: tour.baseCents, extraPassengerCents: tour.extraPassengerCents, minimumNoticeHours: tour.minimumNoticeHours }); setPhotoPath(tour.photoPath); setSelectedLocation(tour.location ?? localLocations.find(item => normalize(item.title) === normalize(tour.area))); setShowForm(true); setError(''); setFeedback(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const chooseLocation = (location: AddressSearchResult) => { setSelectedLocation(location); setDraft(current => ({ ...current, area: location.title })); setAreaFocused(false); };
  const onAreaChange = (value: string) => { setDraft(current => ({ ...current, area: value })); setSelectedLocation(localLocations.find(item => normalize(item.title) === normalize(value))); setError(''); };
  const onPhotoFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => { if (typeof reader.result === 'string') setPhotoPath(reader.result); });
    reader.readAsDataURL(file);
  };
  const persist = (nextTours: Tour[], nextAreas: string[]) => { setTours(nextTours); setAreas(nextAreas); try { window.localStorage.setItem(tourCatalogStorageKey, JSON.stringify(nextTours)); window.localStorage.setItem(areaStorageKey, JSON.stringify(nextAreas)); window.dispatchEvent(new Event(tourCatalogChangedEvent)); } catch { /* optional demo persistence */ } };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const row = { ...draft, durationDays: 2 as const };
    const area = draft.area.trim();
    if (!isTourPublishable(row) || !area) { setError(say('Preencha os campos obrigatórios e mantenha a antecedência mínima de 48 horas.', 'Complete the required fields and keep at least 48 hours notice.')); return; }
    const location = selectedLocation ?? localLocations.find(item => normalize(item.title) === normalize(area));
    if (!location) { setError(say('Escolha uma localização nas sugestões para posicionar o mapa.', 'Choose a location from the suggestions so the map can use it.')); return; }
    const saved: Tour = { id: editingId ?? `t${Date.now()}`, ...row, area, active: editingId ? tours.find(item => item.id === editingId)?.active ?? true : true, photoPath: photoPath || tourPhotos[0].path, location };
    const nextTours = editingId ? tours.map(item => item.id === editingId ? saved : item) : [...tours, saved];
    const nextAreas = areas.includes(area) ? areas : [...areas, area];
    persist(nextTours, nextAreas); setShowForm(false); setFeedback(say(editingId ? 'Pacote atualizado.' : 'Pacote criado e publicado.', editingId ? 'Package updated.' : 'Package created and published.')); resetForm();
  };
  const toggleActive = (tour: Tour) => { persist(tours.map(item => item.id === tour.id ? { ...item, active: !item.active } : item), areas); setFeedback(tour.active ? say('Pacote pausado.', 'Package paused.') : say('Pacote reativado.', 'Package reactivated.')); };

  return <div className="pm-owner-tours-page">
    <div className="pm-tour-page-intro"><div><span className="pm-eyebrow">{say('Catálogo do proprietário', 'Owner catalogue')}</span><h2>{say('Pacotes e tours', 'Packages and tours')}</h2><p>{say('Crie experiências completas com local, rota, foto e preço.', 'Create complete experiences with location, route, photo and price.')}</p></div><button type="button" className="pm-tour-new-button" onClick={startCreate}><span aria-hidden="true">+</span>{say('Novo pacote', 'New package')}</button></div>
    <p className="pm-note pm-tour-note">{say('Cada pacote fica disponível para marcações quando está ativo. A localização escolhida alimenta o mapa e aparece no catálogo.', 'Each package is available for bookings while active. The selected location powers the map and appears in the catalogue.')}</p>
    {feedback && !showForm && <p role="status" className="pm-tour-feedback">{feedback}</p>}
    {showForm && <form className="pm-card pm-tour-editor" aria-label={say(editingId ? 'Editar pacote' : 'Novo pacote', editingId ? 'Edit package' : 'New package')} onSubmit={submit}>
      <div className="pm-tour-editor-head"><div><span className="pm-eyebrow">{editingId ? say('Edição', 'Editing') : say('Novo pacote', 'New package')}</span><h2>{editingId ? say('Editar experiência', 'Edit experience') : say('Criar experiência', 'Create experience')}</h2><p>{say('Defina os dados que o cliente verá antes de marcar.', 'Set the details the customer sees before booking.')}</p></div><button type="button" className="pm-icon-button" onClick={() => { setShowForm(false); resetForm(); }} aria-label={say('Fechar formulário', 'Close form')}>×</button></div>
      <div className="pm-tour-form-grid">
        <label>{say('Nome em português', 'Portuguese name')}<input value={draft.namePt} onChange={event => setDraft(current => ({ ...current, namePt: event.target.value }))} required maxLength={120} placeholder={say('Ex.: Sintra e Cabo da Roca', 'e.g. Sintra and Cabo da Roca')} /></label>
        <label>{say('Nome em inglês', 'English name')}<input value={draft.nameEn} onChange={event => setDraft(current => ({ ...current, nameEn: event.target.value }))} required maxLength={120} placeholder="e.g. Sintra and Cabo da Roca" /></label>
        <label className="pm-tour-form-wide">{say('Descrição em português', 'Portuguese description')}<textarea value={draft.descriptionPt} onChange={event => setDraft(current => ({ ...current, descriptionPt: event.target.value }))} required maxLength={2000} rows={3} placeholder={say('O que está incluído no tour?', 'What is included in the tour?')} /></label>
        <label className="pm-tour-form-wide">{say('Descrição em inglês', 'English description')}<textarea value={draft.descriptionEn} onChange={event => setDraft(current => ({ ...current, descriptionEn: event.target.value }))} required maxLength={2000} rows={3} placeholder="What is included in the tour?" /></label>
        <div className="pm-tour-location-field pm-tour-form-wide"><label>{say('Área/local do tour', 'Tour area/location')}<input value={draft.area} onFocus={() => setAreaFocused(true)} onBlur={() => window.setTimeout(() => setAreaFocused(false), 140)} onChange={event => onAreaChange(event.target.value)} required autoComplete="off" list="pm-tour-areas" placeholder={say('Pesquise uma cidade ou morada', 'Search a city or address')} /></label>{areaFocused && draft.area.trim().length >= 2 && <div className="pm-tour-location-suggestions" role="listbox" aria-label={say('Sugestões de localização', 'Location suggestions')}>{areaResults.length ? areaResults.map(location => <button type="button" role="option" key={`${location.title}-${location.detail}`} onMouseDown={event => event.preventDefault()} onClick={() => chooseLocation(location)}><img src="/owner-icon-pin.png" alt="" aria-hidden="true" /><span><strong>{location.title}</strong><small>{location.detail}</small></span></button>) : <p>{areaLoading ? say('A procurar locais…', 'Searching locations…') : say('Nenhum local encontrado.', 'No location found.')}</p>}</div>}<datalist id="pm-tour-areas">{areas.map(area => <option key={area} value={area} />)}</datalist></div>
        <div className="pm-tour-map-block pm-tour-form-wide"><div className="pm-tour-block-heading"><div><strong>{say('Pré-visualização da rota', 'Route preview')}</strong><span>{selectedLocation ? selectedLocation.detail : say('Escolha uma localização para posicionar o mapa.', 'Choose a location to position the map.')}</span></div><img src="/owner-icon-pin.png" alt="" aria-hidden="true" /></div>{selectedLocation ? <RouteMap route={previewRoute} language={language} /> : <div className="pm-tour-map-placeholder"><img src="/owner-icon-pin.png" alt="" aria-hidden="true" /><strong>{say('O mapa aparece depois de escolher um endereço.', 'The map appears after choosing an address.')}</strong><span>{say('Pesquise o local e selecione uma sugestão para confirmar a posição.', 'Search for a location and select a suggestion to confirm the position.')}</span></div>}</div>
        <fieldset className="pm-tour-photo-field pm-tour-form-wide"><legend>{say('Foto principal', 'Cover photo')}</legend><select aria-label={say('Foto principal', 'Cover photo')} className="pm-tour-photo-compat" value={photoPath} onChange={event => setPhotoPath(event.target.value)}>{tourPhotos.map(photo => <option value={photo.path} key={photo.path}>{photo.label}</option>)}</select><div className="pm-tour-photo-grid">{tourPhotos.map(photo => <button type="button" key={photo.path} className={`pm-tour-photo-choice ${photoPath === photo.path ? 'is-selected' : ''}`} aria-pressed={photoPath === photo.path} onClick={() => setPhotoPath(photo.path)}><img src={photo.path} alt="" /><span>{photo.label}</span></button>)}<label className="pm-tour-upload-choice"><input type="file" accept="image/*" onChange={onPhotoFile} /><span aria-hidden="true">+</span><strong>{say('Carregar foto', 'Upload photo')}</strong><small>{say('PNG ou JPG', 'PNG or JPG')}</small></label></div><div className="pm-tour-cover-preview"><img src={photoPath} alt="" /><span>{say('Foto escolhida', 'Selected photo')}</span></div></fieldset>
        <label>{say('Preço base (€)', 'Base price (€)')}<input value={(draft.baseCents / 100).toString()} onChange={event => setDraft(current => ({ ...current, baseCents: Math.round(Number(event.target.value || 0) * 100) }))} type="number" min="0" step="0.01" required /></label>
        <label>{say('Pessoa adicional (€)', 'Additional passenger (€)')}<input value={(draft.extraPassengerCents / 100).toString()} onChange={event => setDraft(current => ({ ...current, extraPassengerCents: Math.round(Number(event.target.value || 0) * 100) }))} type="number" min="0" step="0.01" required /></label>
        <label>{say('Antecedência mínima (horas)', 'Minimum notice (hours)')}<input value={draft.minimumNoticeHours} onChange={event => setDraft(current => ({ ...current, minimumNoticeHours: Number(event.target.value || 0) }))} type="number" min="48" max="8760" required /></label>
        <div className="pm-tour-fixed-field"><span>{say('Duração', 'Duration')}</span><strong>2 {say('dias', 'days')}</strong><small>{say('Regra atual dos pacotes', 'Current package rule')}</small></div>
      </div>
      {error && <p role="alert" className="pm-error">{error}</p>}
      <div className="pm-tour-editor-actions"><button type="button" className="pm-button pm-button-secondary" onClick={() => { setShowForm(false); resetForm(); }}>{say('Cancelar', 'Cancel')}</button><button type="submit" className="pm-button pm-button-primary"><span aria-hidden="true">✓</span>{say('Guardar pacote', 'Save package')}</button></div>
    </form>}
    <Section title={say('Pacotes publicados', 'Published packages')}><div className="pm-tour-grid">{tours.map(tour => <article className="pm-card pm-demo-record pm-tour-card" key={tour.id}><div className="pm-tour-card-media"><img className="pm-tour-cover" src={tour.photoPath} alt="" /><span className="pm-tour-card-status" data-tone={tour.active ? 'positive' : 'neutral'}>{tour.active ? say('ATIVO', 'ACTIVE') : say('PAUSADO', 'PAUSED')}</span></div><div className="pm-tour-card-body"><div className="pm-tour-card-title"><div><span className="pm-eyebrow">{say('Experiência', 'Experience')}</span><h3>{en ? tour.nameEn : tour.namePt}</h3></div><img src="/owner-icon-tours.png" alt="" aria-hidden="true" /></div><p className="pm-tour-description">{en ? tour.descriptionEn : tour.descriptionPt}</p><div className="pm-tour-location"><img src="/owner-icon-pin.png" alt="" aria-hidden="true" /><span><small>{say('Local principal', 'Main location')}</small><strong>{tour.area}</strong></span></div><div className="pm-tour-detail-grid"><div><small>{say('Duração', 'Duration')}</small><strong>2 {say('dias', 'days')}</strong></div><div><small>{say('Preço base', 'Base price')}</small><strong>{money(tour.baseCents)}</strong></div><div><small>{say('Por pessoa extra', 'Extra passenger')}</small><strong>{money(tour.extraPassengerCents)}</strong></div><div><small>{say('Antecedência', 'Notice')}</small><strong>{tour.minimumNoticeHours}h</strong></div></div><div className="pm-tour-card-actions"><button type="button" className="pm-button pm-button-secondary" onClick={() => startEdit(tour)}><span aria-hidden="true">✎</span>{say('Editar', 'Edit')}</button><button type="button" className="pm-button pm-button-ghost" onClick={() => toggleActive(tour)}>{tour.active ? say('Pausar', 'Pause') : say('Ativar', 'Activate')}</button></div></div></article>)}</div></Section>
    <TourSimulator />
  </div>;
}
