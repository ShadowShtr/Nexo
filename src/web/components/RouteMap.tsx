import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DemoRoute } from '../demo-routes';

export function RouteMap({ route, language }: { route: DemoRoute; language: 'pt' | 'en' }) {
  const target = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!target.current) return;
    const map = L.map(target.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const shape = route.shape.map(([lat,lng]) => L.latLng(lat,lng));
    L.polyline(shape, { color: '#18181a', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }).addTo(map);
    route.points.forEach((item, index) => {
      const end = item.kind === 'destination';
      L.circleMarker([item.coordinates[0], item.coordinates[1]], { radius: 9, color: '#fff', weight: 3, fillColor: end ? '#18181a' : '#4f5056', fillOpacity: 1 })
        .addTo(map).bindTooltip(`${index + 1}. ${item.label}`);
    });
    map.fitBounds(L.latLngBounds(shape), { padding: [32,32], maxZoom: 12 });
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); };
  }, [route]);
  const km = new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(route.meters / 1000);
  return <section className="pm-route-preview" aria-label={language === 'en' ? 'Route preview' : 'Pré-visualização do percurso'}>
    <div ref={target} className="pm-route-map" aria-hidden="true" />
    <div className="pm-route-summary"><strong>{km} km</strong><span>{route.minutes} min</span><span>{language === 'en' ? 'Fictional route' : 'Rota fictícia'}</span></div>
    <ol className="pm-route-points">{route.points.map((point,index)=><li key={`${point.label}-${index}`}><span>{index + 1}</span><div><strong>{point.label}</strong><small>{point.kind === 'pickup' ? (language === 'en' ? 'Pickup' : 'Recolha') : point.kind === 'stop' ? (language === 'en' ? 'Stop' : 'Paragem') : (language === 'en' ? 'Destination' : 'Destino')}</small></div></li>)}</ol>
    <p className="pm-secondary pm-small">{language === 'en' ? 'Illustrative geometry and estimates. The production version will use a road-routing provider.' : 'Geometria e estimativas ilustrativas. A versão funcional usará um fornecedor de rotas rodoviárias.'} {' '}<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>.</p>
  </section>;
}
