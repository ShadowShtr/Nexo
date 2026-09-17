import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Plus, Route, Search, Sparkles, Ticket, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { quote } from '../../domain/pricing';
import { RouteMap } from '../components/RouteMap';
import { tourRoute, type DemoRoute } from '../demo-routes';
import { searchAddresses } from '../services/address-search';
import { availableCustomerTimes, customerCalendarChangedEvent, readOwnerCalendar } from '../customer-availability';
import { readDemoTariff, subscribeToDemoTariff } from '../demo-config';
import { hasStoredTourCatalog, readPublishedTours, subscribeToTourCatalog, type PublishedTour } from '../tour-catalog';

const tourOptions = [
  { id: 'lisbon', icon: '/route-landmark.png', pt: 'Tour em Lisboa', en: 'Lisbon tour', detailPt: 'Miradouros e centro histórico', detailEn: 'Viewpoints and historic centre' },
  { id: 'sintra', icon: '/compass.png', pt: 'Sintra', en: 'Sintra', detailPt: 'Palácios, serra e mar', detailEn: 'Palaces, hills and sea' },
  { id: 'porto', icon: '/luggage.png', pt: 'Tour no Porto', en: 'Porto tour', detailPt: 'Ribeira, Douro e caves', detailEn: 'Ribeira, Douro and cellars' },
  { id: 'lisbon-sintra', icon: '/passengers.png', pt: 'Lisboa + Sintra', en: 'Lisbon + Sintra', detailPt: 'A experiência completa', detailEn: 'The complete experience' },
  { id: 'custom', icon: '/driver-illustration.png', pt: 'Tour à medida', en: 'Custom tour', detailPt: 'O seu ritmo, o seu percurso', detailEn: 'Your pace, your route' },
  { id: 'custom-route', icon: '/vehicle-sedan.png', pt: 'Tour personalizado', en: 'Personalised tour', detailPt: 'Paragens escolhidas por si', detailEn: 'Stops chosen by you' },
];

const portoTourStops = ['Ribeira do Porto', 'Ponte Dom Luís I', 'Sé do Porto', 'Livraria Lello', 'Palácio da Bolsa', 'Foz do Douro'];

const bookingDates = [
  { value: '2026-09-14', pt: 'Seg 14 set', en: 'Mon 14 Sep', ariaPt: 'Segunda-feira, 14 de setembro', ariaEn: 'Monday, 14 September' },
  { value: '2026-09-15', pt: 'Ter 15 set', en: 'Tue 15 Sep', ariaPt: 'Terça-feira, 15 de setembro', ariaEn: 'Tuesday, 15 September' },
  { value: '2026-09-16', pt: 'Qua 16 set', en: 'Wed 16 Sep', ariaPt: 'Quarta-feira, 16 de setembro', ariaEn: 'Wednesday, 16 September' },
  { value: '2026-09-17', pt: 'Qui 17 set', en: 'Thu 17 Sep', ariaPt: 'Quinta-feira, 17 de setembro', ariaEn: 'Thursday, 17 September' },
];
const bookingTimes = ['09:00', '11:30', '14:00', '16:30', '18:00'];
const customDateCopy = (value: string, english: boolean) => {
  const date = new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-PT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
};
const demoBookingToday = '2026-09-14';
const calendarWeekdays = { pt: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'], en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] };
const monthKey = (value: string) => value.slice(0, 7);
const shiftMonth = (value: string, amount: number) => {
  const [year, month] = value.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (value: string, english: boolean) => new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}-01T12:00:00Z`));
const calendarCells = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const leading = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const total = Math.ceil((leading + daysInMonth) / 7) * 7;
  return Array.from({ length: total }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, index - leading + 1));
    return { value: date.toISOString().slice(0, 10), day: date.getUTCDate(), inMonth: date.getUTCMonth() === month - 1 };
  });
};
const customDateLabel = (value: string, english: boolean) => new Intl.DateTimeFormat(english ? 'en-GB' : 'pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
const clientIcons = {
  location: '/location-pin.png',
  clock: '/clock.png',
  calendar: '/calendar.png',
  car: '/vehicle-sedan.png',
};

const recentPlaces = [
  { title: 'Sintra', detail: 'Sintra, Lisboa' },
  { title: 'Porto', detail: 'Porto, Portugal' },
  { title: 'Ribeira do Porto', detail: 'Cais da Ribeira, Porto' },
  { title: 'Ponte Dom Luís I', detail: 'Av. de Vímara Peres, Porto' },
  { title: 'Sé do Porto', detail: 'Terreiro da Sé, Porto' },
  { title: 'Livraria Lello', detail: 'Rua das Carmelitas, Porto' },
  { title: 'Palácio da Bolsa', detail: 'Rua Ferreira Borges, Porto' },
  { title: 'Foz do Douro', detail: 'Foz do Douro, Porto' },
  { title: 'Quinta da Regaleira', detail: 'Rua Barbosa du Bocage, Sintra' },
  { title: 'Palácio Nacional da Pena', detail: 'Estrada da Pena, Sintra' },
  { title: 'Castelo dos Mouros', detail: 'Estrada da Pena, Sintra' },
  { title: 'Palácio Nacional de Sintra', detail: 'Largo Rainha Dona Amélia, Sintra' },
  { title: 'Cabo da Roca', detail: 'Estrada do Cabo da Roca, Sintra' },
  { title: 'Praia Grande', detail: 'Colares, Sintra' },
  { title: 'Praia da Adraga', detail: 'Almoçageme, Sintra' },
  { title: 'Boca do Inferno', detail: 'Av. Rei Humberto II de Itália, Cascais' },
  { title: 'Marina de Cascais', detail: 'Cascais' },
  { title: 'Torre de Belém', detail: 'Av. Brasília, Lisboa' },
  { title: 'Mosteiro dos Jerónimos', detail: 'Praça do Império, Lisboa' },
  { title: 'Praça do Comércio', detail: 'Baixa, Lisboa' },
  { title: 'Castelo de São Jorge', detail: 'Rua de Santa Cruz do Castelo, Lisboa' },
  { title: 'Oceanário de Lisboa', detail: 'Esplanada Dom Carlos I, Lisboa' },
  { title: 'Parque das Nações', detail: 'Lisboa' },
  { title: 'LX Factory', detail: 'Rua Rodrigues de Faria, Lisboa' },
  { title: 'Time Out Market Lisboa', detail: 'Av. 24 de Julho, Lisboa' },
  { title: 'Centro Colombo', detail: 'Av. Lusíada, Lisboa' },
  { title: 'Amoreiras Shopping Center', detail: 'Av. Eng. Duarte Pacheco, Lisboa' },
  { title: 'CascaiShopping', detail: 'Estrada Nacional 9, Alcabideche' },
  { title: 'Oeiras Parque', detail: 'Av. António Bernardo Cabral de Macedo, Oeiras' },
  { title: 'UBBO', detail: 'Av. Cruzeiro Seixas, Amadora' },
  { title: 'Freeport Lisboa Fashion Outlet', detail: 'Av. Euro 2004, Alcochete' },
  { title: 'Carregado', detail: 'Carregado, Alenquer' },
  { title: 'Rua Pedro de Sintra', detail: 'Carregado e Cadafais, Alenquer' },
  { title: 'Avenida Cabo da Boa Esperança L65', detail: 'Carregado, Alenquer' },
  { title: 'Estação Carregado', detail: 'R. da Estação, Castanheira do Ribatejo' },
  { title: 'Aeroporto de Lisboa', detail: 'Alameda das Comunidades Portuguesas' },
  { title: 'Estação do Oriente', detail: 'Av. Dom João II, Lisboa' },
  { title: 'Vasco da Gama Shopping', detail: 'Av. Dom João II, Lisboa' },
  { title: 'Centro de Lisboa', detail: 'Lisboa' },
];

const visibleRecentPlaces = recentPlaces.slice(0, 3);

type GeocodedPlace = { title: string; detail: string; coordinates: readonly [number, number] };
type Suggestion = { title: string; detail: string; coordinates?: readonly [number, number] };
type AddressUnit = { value: string; marker: 'number' | 'lot' };
type AddressUnitPrefix = { marker: AddressUnit['marker'] };

const knownStreets: ReadonlyArray<{ aliases: string[]; street: string; detail: string; coordinates: readonly [number, number]; unitKind?: AddressUnit['marker'] }> = [
  { aliases: ['rua pedro de sintra', 'rua pedro sintra'], street: 'Rua Pedro de Sintra', detail: 'Carregado e Cadafais, Alenquer', coordinates: [39.0224941, -8.9707512], unitKind: 'lot' },
  { aliases: ['avenida cabo da boa esperanca', 'avenida cabo da boa esperanca l65'], street: 'Avenida Cabo da Boa Esperança', detail: 'Carregado, Alenquer', coordinates: [39.0218561, -8.9748176], unitKind: 'lot' },
];

const placeCoordinates: ReadonlyArray<{ aliases: string[]; coordinates: readonly [number, number] }> = [
  { aliases: ['lisboa', 'centro de lisboa', 'a minha localizacao'], coordinates: [38.7223, -9.1393] },
  { aliases: ['sintra'], coordinates: [38.8029, -9.3817] },
  { aliases: ['porto'], coordinates: [41.1496, -8.6109] },
  { aliases: ['ribeira do porto', 'ribeira porto'], coordinates: [41.1406, -8.6110] },
  { aliases: ['ponte dom luis i', 'ponte dom luis'], coordinates: [41.1403, -8.6093] },
  { aliases: ['se do porto', 'sé do porto'], coordinates: [41.1429, -8.6110] },
  { aliases: ['livraria lello'], coordinates: [41.1468, -8.6149] },
  { aliases: ['palacio da bolsa', 'palácio da bolsa'], coordinates: [41.1406, -8.6158] },
  { aliases: ['foz do douro', 'foz'], coordinates: [41.1512, -8.6763] },
  { aliases: ['quinta da regaleira', 'regaleira'], coordinates: [38.7967, -9.3977] },
  { aliases: ['palacio nacional da pena', 'palacio da pena', 'pena'], coordinates: [38.7876, -9.3906] },
  { aliases: ['castelo dos mouros'], coordinates: [38.7894, -9.3904] },
  { aliases: ['palacio nacional de sintra'], coordinates: [38.7975, -9.3904] },
  { aliases: ['cabo da roca'], coordinates: [38.7804, -9.4989] },
  { aliases: ['praia grande'], coordinates: [38.8066, -9.4737] },
  { aliases: ['praia da adraga', 'adraga'], coordinates: [38.8004, -9.4759] },
  { aliases: ['boca do inferno'], coordinates: [38.6913, -9.4307] },
  { aliases: ['marina de cascais', 'marina cascais'], coordinates: [38.6916, -9.4183] },
  { aliases: ['torre de belem', 'torre de belém'], coordinates: [38.6916, -9.2159] },
  { aliases: ['mosteiro dos jeronimos', 'jeronimos'], coordinates: [38.6979, -9.2065] },
  { aliases: ['praca do comercio', 'terreiro do paco'], coordinates: [38.7079, -9.1366] },
  { aliases: ['castelo de sao jorge', 'castelo sao jorge'], coordinates: [38.7139, -9.1335] },
  { aliases: ['oceanario de lisboa', 'oceanario'], coordinates: [38.7634, -9.0936] },
  { aliases: ['parque das nacoes'], coordinates: [38.7675, -9.0953] },
  { aliases: ['lx factory'], coordinates: [38.7034, -9.1784] },
  { aliases: ['time out market lisboa', 'time out market'], coordinates: [38.7066, -9.1455] },
  { aliases: ['centro colombo', 'colombo'], coordinates: [38.7537, -9.1883] },
  { aliases: ['amoreiras shopping center', 'amoreiras shopping', 'amoreiras'], coordinates: [38.7257, -9.1600] },
  { aliases: ['cascai shopping', 'cascai'], coordinates: [38.7410, -9.4072] },
  { aliases: ['oeiras parque'], coordinates: [38.7085, -9.2994] },
  { aliases: ['ubbo'], coordinates: [38.7586, -9.2047] },
  { aliases: ['freeport lisboa fashion outlet', 'freeport'], coordinates: [38.9536, -8.8710] },
  { aliases: ['carregado'], coordinates: [39.0234, -8.9768] },
  { aliases: ['rua pedro de sintra'], coordinates: [39.0230, -8.9750] },
  // Centro geográfico da Avenida Cabo da Boa Esperança (CP 2580-469,
  // Carregado). O lote 65 usa o mesmo arruamento até termos geocoding
  // por porta/lote no fornecedor de mapas.
  { aliases: ['avenida cabo da boa esperanca', 'avenida cabo da boa esperanca l65'], coordinates: [39.0218561, -8.9748176] },
  { aliases: ['estacao carregado'], coordinates: [39.0228, -8.9757] },
  { aliases: ['aeroporto de lisboa', 'aeroporto'], coordinates: [38.7742, -9.1342] },
  { aliases: ['estacao do oriente', 'oriente'], coordinates: [38.7677, -9.0993] },
  { aliases: ['vasco da gama shopping', 'shopping vasco', 'vasco da gama'], coordinates: [38.7677, -9.0993] },
  { aliases: ['cascais'], coordinates: [38.6979, -9.4215] },
  { aliases: ['setubal', 'setúbal'], coordinates: [38.5244, -8.8882] },
];

function normalizePlace(value: string) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

const addressTypeWords = new Set(['rua', 'r', 'avenida', 'av', 'estrada', 'travessa', 'alameda', 'rotunda', 'largo', 'praia']);
const addressConnectorWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
const addressUnitWords = /(?:n(?:\s*[.ºo°]){0,2}|numero|num|lt|lote|loteamento)/i;

function addressSearchTerms(value: string) {
  const parsed = /\s/.test(value) ? value : runningAddressQuery(value);
  const withoutUnit = normalizePlace(parsed)
    .replace(/(?:^|[\s,])(?:n(?:\s*[.ºo°]){0,2}|numero|num|lt|lote|loteamento)\s*\d{1,5}[a-z]?(?=\s|$)/gi, ' ')
    .replace(new RegExp(`(?:^|[\\s,])${addressUnitWords.source}(?=\\s*$)`, 'i'), ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const tokens = withoutUnit.split(/\s+/).filter(token => token && !/^\d/.test(token));
  const meaningful = tokens.filter(token => !addressTypeWords.has(token) && !addressConnectorWords.has(token));
  return meaningful.length ? meaningful : tokens;
}

function containsAddressTerm(value: string, term: string) {
  return normalizePlace(value).split(/[^a-z0-9]+/).includes(term);
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = row[rightIndex];
      row[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? diagonal
        : Math.min(diagonal, row[rightIndex - 1], above) + 1;
      diagonal = above;
    }
  }
  return row[right.length];
}

function similarAddressTerm(value: string, term: string) {
  if (containsAddressTerm(value, term)) return true;
  if (term.length < 4) return false;
  const maxDistance = term.length >= 7 ? 2 : 1;
  return normalizePlace(value).split(/[^a-z0-9]+/).some(word => word.length >= 4 && editDistance(word, term) <= maxDistance);
}

function streetUnitFallbackSuggestions(query: string): Suggestion[] {
  const street = knownStreetForQuery(query);
  if (!street) return [];
  const requestedUnit = addressUnit(query);
  if (!requestedUnit) return [];
  const unit = street.unitKind ? { ...requestedUnit, marker: street.unitKind } : requestedUnit;
  return [{
    title: titleWithUnit(street.street, unit),
    detail: `${street.detail} · ${unit.marker === 'lot' ? 'Lote' : 'Número'} indicado · ponto aproximado na rua`,
    coordinates: street.coordinates,
  }];
}

function geocoderRelevance(query: string, title: string, detail: string, requestedUnit?: AddressUnit, rawTitle = title) {
  const terms = addressSearchTerms(query);
  const matchedTerms = terms.filter(term => similarAddressTerm(`${title} ${detail}`, term)).length;
  const titleHasStreet = terms.some(term => similarAddressTerm(title, term));
  const hasUnit = requestedUnit ? containsAddressTerm(title, normalizePlace(requestedUnit.value)) : false;
  const genericNumberTitle = /^\d+[A-Za-z]?$/.test(rawTitle.trim());
  return matchedTerms * 20 + (matchedTerms === terms.length && terms.length > 1 ? 12 : 0) + (titleHasStreet ? 5 : 0) + (hasUnit ? 8 : 0) - (genericNumberTitle ? 12 : 0);
}

function placeMatches(place: { title: string; detail: string }, query: string) {
  const tokens = normalizePlace(query).split(/\s+/).filter(Boolean);
  const haystack = normalizePlace(`${place.title} ${place.detail}`);
  if (tokens.every(token => haystack.includes(token))) return true;
  const streetTerms = addressSearchTerms(query);
  if (streetTerms.length >= 1 && streetTerms.every(token => similarAddressTerm(haystack, token))) return true;
  const unit = addressUnit(query);
  const compactQuery = normalizePlace(query).replace(/[^a-z0-9]/g, '').replace(unit ? /(?:loteamento|lote|lt|numero|num|n)\d{1,5}[a-z]?$/ : /$^/, '');
  return compactQuery.length >= 5 && haystack.replace(/[^a-z0-9]/g, '').includes(compactQuery);
}

function addressUnit(value: string): AddressUnit | undefined {
  const parsed = /\s/.test(value) ? value : runningAddressQuery(value);
  const spacedMatch = parsed.match(/(?:^|[\s,])(?:n(?:\s*[.ºo°]){0,2}|numero|num|lt|lote|loteamento)\s*(\d{1,5}[A-Za-z]?)(?=\s|$)/i);
  const compact = normalizePlace(parsed).replace(/[^a-z0-9]/g, '');
  const compactMatch = compact.match(/(?:loteamento|lote|lt|numero|num|n)(\d{1,5}[a-z]?)$/i);
  const match = spacedMatch ?? compactMatch;
  if (!match) {
    const bareNumber = parsed.match(/(?:^|[\s,])(\d{1,5}[A-Za-z]?)(?=\s*$)/i);
    const beforeNumber = bareNumber ? parsed.slice(0, bareNumber.index) : '';
    if (!bareNumber || !/\b(?:rua|r|avenida|av|estrada|travessa|alameda|rotunda|largo|praia)\b/i.test(beforeNumber)) return undefined;
    return { value: bareNumber[1], marker: 'number' };
  }
  return { value: match[1], marker: /(?:lt|lote|loteamento)/i.test(match[0]) ? 'lot' : 'number' };
}

function addressUnitPrefix(value: string): AddressUnitPrefix | undefined {
  const parsed = /\s/.test(value) ? value : runningAddressQuery(value);
  const match = normalizePlace(parsed).match(new RegExp(`(?:^|[\\s,])(${addressUnitWords.source})(?=\\s*$)`, 'i'));
  if (!match) return undefined;
  return { marker: /(?:lt|lote|loteamento)/i.test(match[1]) ? 'lot' : 'number' };
}

function knownStreetForQuery(query: string) {
  const terms = addressSearchTerms(query);
  return knownStreets.find(street => terms.length > 0 && terms.every(term => street.aliases.some(alias => similarAddressTerm(alias, term))));
}

function titleWithUnit(title: string, unit?: AddressUnit) {
  if (!unit) return title;
  const escaped = unit.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const alreadyHasUnit = new RegExp(`(?:lote|lt|n(?:\\s*[.ºo°]){0,2}|numero|num)\\s*${escaped}(?:\\D|$)`, 'i').test(title);
  if (alreadyHasUnit) return title;
  return `${title}, ${unit.marker === 'lot' ? 'Lote' : 'n.º'} ${unit.value}`;
}

function runningAddressQuery(value: string) {
  let compact = normalizePlace(value).replace(/[^a-z0-9]/g, '');
  const unitMatch = compact.match(/(loteamento|lote|lt|numero|num|n)(\d{1,5}[a-z]?)?$/i);
  const unitSuffix = unitMatch?.[2] ? ` ${unitMatch[1]} ${unitMatch[2]}` : unitMatch && /(?:loteamento|lote|lt|numero|num)/i.test(unitMatch[1]) ? ` ${unitMatch[1]}` : '';
  if (unitMatch) compact = compact.slice(0, unitMatch.index);
  const prefixes = ['avenida', 'estrada', 'travessa', 'alameda', 'rotunda', 'praia', 'largo', 'rua', 'av', 'r'];
  const prefix = prefixes.find(candidate => compact.startsWith(candidate) && compact.length > candidate.length);
  let spaced = prefix ? `${prefix} ${compact.slice(prefix.length)}` : compact;
  spaced = spaced.replace(/([a-z])(\d)/gi, '$1 $2').replace(/(\d)([a-z])/gi, '$1 $2');
  if (prefix) {
    const rest = spaced.slice(prefix.length).trim().replace(/([a-z]{3,})(de|da|do|dos|das)([a-z]{3,})/gi, '$1 $2 $3');
    spaced = `${prefix} ${rest}`.trim();
  } else {
    spaced = spaced.replace(/([a-z]{3,})(de|da|do|dos|das)([a-z]{3,})/gi, '$1 $2 $3');
  }
  return `${spaced}${unitSuffix}`.trim();
}

function geocoderQueries(query: string) {
  const clean = (value: string) => value
    .replace(/[;,]+/g, ' ')
    .replace(/\b(?:n(?:\s*[.ºo°]){0,2}|numero|num|lt|lote|loteamento)\s*(?=\d)/gi, '')
    .replace(new RegExp(`\b${addressUnitWords.source}\s*$`, 'i'), '')
    .replace(/\s+/g, ' ')
    .trim();
  const compact = clean(query);
  const running = /\s/.test(query) ? '' : clean(runningAddressQuery(query));
  const base = running || compact;
  const tokens = base.split(' ').filter(Boolean);
  const variants = [...new Set([base, compact])];
  // Pessoas costumam acrescentar a localidade no fim (por exemplo,
  // “rua ... Sintra Carregado”). Se a frase completa não devolver nada,
  // procurar também o núcleo da morada evita perder a rua por excesso de
  // contexto.
  for (let index = tokens.length - 1; index > 0 && variants.length < 6; index -= 1) {
    variants.push(tokens.filter((_, tokenIndex) => tokenIndex !== index).join(' '));
  }
  return [...new Set(variants)].filter(value => value.length >= 3);
}

function coordinatesFor(value: string, resolved: readonly GeocodedPlace[] = []) {
  const normalized = normalizePlace(value);
  const remote = resolved.find(place => normalizePlace(place.title) === normalized);
  if (remote) return remote.coordinates;
  return placeCoordinates.find(place => place.aliases.some(alias => normalized === normalizePlace(alias) || normalized.includes(normalizePlace(alias))))?.coordinates;
}

function distanceMeters(from: readonly [number, number], to: readonly [number, number]) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6_371_000;
  const latitudeDelta = radians(to[0] - from[0]);
  const longitudeDelta = radians(to[1] - from[1]);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from[0])) * Math.cos(radians(to[0])) * Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)) * 1.2);
}

function dynamicRoute(origin: string, destination: string, stops: readonly string[] = [], resolved: readonly GeocodedPlace[] = []): DemoRoute {
  const labels = [origin || 'Lisboa', ...stops.filter(stop => stop.trim()), destination || 'Destino'];
  const coordinates = labels.map(label => coordinatesFor(label, resolved));
  const start = coordinates[0] ?? tourRoute.points[0].coordinates;
  if (coordinates.some((point): point is undefined => !point)) {
    return { name: labels.join(' → '), meters: 0, minutes: 0, points: [{ ...tourRoute.points[0], label: labels[0], coordinates: start }], shape: [start] };
  }
  const shape: Array<readonly [number, number]> = [coordinates[0]!];
  let meters = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const from = coordinates[index - 1]!;
    const to = coordinates[index]!;
    meters += distanceMeters(from, to);
    shape.push(
      [from[0] + (to[0] - from[0]) * .33, from[1] + (to[1] - from[1]) * .28],
      [from[0] + (to[0] - from[0]) * .68, from[1] + (to[1] - from[1]) * .78],
      to,
    );
  }
  const points = labels.map((label, index) => ({
    label,
    coordinates: coordinates[index]!,
    kind: index === 0 ? 'pickup' : index === labels.length - 1 ? 'destination' : 'stop',
  } as const));
  return { name: labels.join(' → '), meters, minutes: Math.max(10, Math.round(meters / 1000 / 55 * 60)), points, shape };
}

function plannerRoute(origin: string, destination: string, stops: readonly string[], kind: 'transfer' | 'tour', english: boolean, resolved: readonly GeocodedPlace[] = []): DemoRoute {
  const stopSuffix = english ? 'stop' : 'paragem';
  if (kind !== 'tour' || normalizePlace(destination) !== 'sintra' || stops.length > 0 || !normalizePlace(origin).includes('lisboa')) return dynamicRoute(origin, destination, stops, resolved);
  const points = tourRoute.points.map((point, index) => index === 0
    ? { ...point, label: origin || 'Lisboa' }
    : index === tourRoute.points.length - 1
      ? { ...point, label: 'Cabo da Roca' }
      : point.label.toLocaleLowerCase() === destination.toLocaleLowerCase() ? { ...point, label: `${point.label} · ${stopSuffix}` } : point);
  return { ...tourRoute, name: `${origin || 'Lisboa'} → ${destination}`, points };
}

function tourLocation(tour: PublishedTour): GeocodedPlace | undefined {
  if (tour.location) return { title: tour.location.title, detail: tour.location.detail, coordinates: tour.location.coordinates };
  const coordinates = coordinatesFor(tour.area);
  return coordinates ? { title: tour.area, detail: tour.area, coordinates } : undefined;
}

export default function CustomerDiscoverSandbox() {
  const { i18n } = useTranslation();
  const say = (pt: string, en: string) => i18n.language === 'en' ? en : pt;
  type PlannerKind = 'transfer' | 'tour';
  type ActiveSearch = { kind: 'origin' | 'destination' | 'stop'; index?: number } | null;
  const [planning, setPlanning] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [plannerKind, setPlannerKind] = useState<PlannerKind>('transfer');
  const [origin, setOrigin] = useState('Lisboa');
  const [destination, setDestination] = useState('');
  const [stops, setStops] = useState<string[]>([]);
  const [bookingStart, setBookingStart] = useState('2026-09-14T10:00');
  const [calendarVersion, setCalendarVersion] = useState(0);
  const [customCalendarOpen, setCustomCalendarOpen] = useState(false);
  const [customCalendarDate, setCustomCalendarDate] = useState('2026-09-14');
  const [customCalendarMonth, setCustomCalendarMonth] = useState('2026-09');
  const [activeSearch, setActiveSearch] = useState<ActiveSearch>(null);
  const [remoteSuggestions, setRemoteSuggestions] = useState<GeocodedPlace[]>([]);
  const [geocoderState, setGeocoderState] = useState<'idle' | 'loading'>('idle');
  const [locationState, setLocationState] = useState<'suggested' | 'requesting' | 'fallback'>('suggested');
  const [resolvedPlaces, setResolvedPlaces] = useState<GeocodedPlace[]>([]);
  const [tariff, setTariff] = useState(readDemoTariff);
  const [ownerTours, setOwnerTours] = useState<PublishedTour[]>(readPublishedTours);
  const [hasOwnerCatalog, setHasOwnerCatalog] = useState(hasStoredTourCatalog);

  useEffect(() => { const refresh = () => setTariff(readDemoTariff()); return subscribeToDemoTariff(refresh); }, []);

  useEffect(() => {
    const refresh = () => { setOwnerTours(readPublishedTours()); setHasOwnerCatalog(hasStoredTourCatalog()); };
    return subscribeToTourCatalog(refresh);
  }, []);

  const previewRoute = useMemo(() => plannerRoute(origin, destination, stops, plannerKind, i18n.language === 'en', resolvedPlaces), [origin, destination, plannerKind, stops, i18n.language, resolvedPlaces]);
  const routeKnown = Boolean(origin.trim() && destination.trim() && coordinatesFor(origin, resolvedPlaces) && coordinatesFor(destination, resolvedPlaces) && stops.every(stop => Boolean(coordinatesFor(stop, resolvedPlaces))));
  const activeQuery = activeSearch?.kind === 'origin' ? origin : activeSearch?.kind === 'destination' ? destination : activeSearch ? stops[activeSearch.index ?? -1] ?? '' : '';
  const localUnitSuggestions = useMemo(() => streetUnitFallbackSuggestions(activeQuery), [activeQuery]);
  const localActiveSuggestions = useMemo(() => localUnitSuggestions.length ? localUnitSuggestions : recentPlaces.filter(place => placeMatches(place, activeQuery)), [activeQuery, localUnitSuggestions]);
  const activeUnit = addressUnit(activeQuery);
  const activeUnitPrefix = addressUnitPrefix(activeQuery);
  const activeStreetTerms = addressSearchTerms(activeQuery);
  const remoteActiveSuggestions: Suggestion[] = remoteSuggestions
    .filter(place => !activeUnitPrefix || activeStreetTerms.length === 0 || activeStreetTerms.every(term => similarAddressTerm(`${place.title} ${place.detail}`, term)))
    .map(place => ({ ...place, title: titleWithUnit(place.title, activeUnit) }));
  const activeSuggestions: Suggestion[] = [...remoteActiveSuggestions, ...localActiveSuggestions
    .filter(local => !remoteActiveSuggestions.some(remote => normalizePlace(remote.title).startsWith(normalizePlace(local.title))))
    .map(place => ({ ...place, title: localUnitSuggestions.length ? place.title : titleWithUnit(place.title, activeUnit) }))];
  const originPreviewRoute = useMemo<DemoRoute>(() => ({
    name: origin || 'Lisboa', meters: 0, minutes: 0,
    points: [{ ...tourRoute.points[0], label: origin || 'Lisboa' }],
    shape: [tourRoute.points[0].coordinates],
  }), [origin]);
  const tourPrice = quote({ passengers: 2, passengerCapacity: 6, service: { kind: 'tour', baseCents: tariff.tourBaseCents, extraPassengerCents: tariff.tourExtraPassengerCents } });
  const transferPrice = quote({ passengers: 2, passengerCapacity: 6, service: { kind: 'transfer', distanceMeters: previewRoute.meters, centsPerKm: tariff.transferCentsPerKm }, nightSurchargeBps: tariff.nightSurchargeBps });
  const plannerPrice = plannerKind === 'tour' ? tourPrice : transferPrice;
  const km = new Intl.NumberFormat(i18n.language === 'en' ? 'en-GB' : 'pt-PT', { maximumFractionDigits: 1 }).format(previewRoute.meters / 1000);
  const money = (cents: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const ownerCalendar = useMemo(() => readOwnerCalendar(), [calendarVersion]);
  const serviceDurationMinutes = Math.max(60, previewRoute.minutes);
  const availableBookingDates = useMemo(() => bookingDates.filter(day => availableCustomerTimes(day.value, serviceDurationMinutes, ownerCalendar.bookings, ownerCalendar.settings).length > 0), [ownerCalendar, serviceDurationMinutes]);
  const bookingStartDate = bookingStart.slice(0, 10);
  const bookingStartDateTimes = useMemo(() => availableCustomerTimes(bookingStartDate, serviceDurationMinutes, ownerCalendar.bookings, ownerCalendar.settings), [bookingStartDate, ownerCalendar, serviceDurationMinutes]);
  const selectedBookingDate = bookingStartDateTimes.length > 0 ? bookingStartDate : availableBookingDates[0]?.value ?? bookingStartDate;
  const availableBookingTimes = useMemo(() => availableCustomerTimes(selectedBookingDate, serviceDurationMinutes, ownerCalendar.bookings, ownerCalendar.settings), [ownerCalendar, selectedBookingDate, serviceDurationMinutes]);
  const bookingTimesForDate = (date: string) => availableCustomerTimes(date, serviceDurationMinutes, ownerCalendar.bookings, ownerCalendar.settings);
  const customCalendarCells = useMemo(() => calendarCells(customCalendarMonth).map(cell => ({
    ...cell,
    isToday: cell.value === demoBookingToday,
    isSelected: cell.value === customCalendarDate,
    available: cell.inMonth && cell.value >= demoBookingToday && availableCustomerTimes(cell.value, serviceDurationMinutes, ownerCalendar.bookings, ownerCalendar.settings).length > 0,
  })), [customCalendarMonth, customCalendarDate, ownerCalendar, serviceDurationMinutes]);
  const calendarDates = useMemo(() => availableBookingDates.some(day => day.value === selectedBookingDate) || !bookingStartDateTimes.length
    ? availableBookingDates
    : [...availableBookingDates, { value: selectedBookingDate, pt: customDateCopy(selectedBookingDate, false), en: customDateCopy(selectedBookingDate, true), ariaPt: customDateCopy(selectedBookingDate, false), ariaEn: customDateCopy(selectedBookingDate, true) }], [availableBookingDates, bookingStartDateTimes.length, selectedBookingDate]);

  useEffect(() => {
    const refresh = () => setCalendarVersion(version => version + 1);
    window.addEventListener('storage', refresh);
    window.addEventListener(customerCalendarChangedEvent, refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener(customerCalendarChangedEvent, refresh); };
  }, []);

  useEffect(() => {
    const selectedTime = bookingStart.slice(11, 16);
    const nextTime = availableBookingTimes.includes(selectedTime) ? selectedTime : availableBookingTimes[0];
    if (!nextTime || selectedBookingDate === bookingStart.slice(0, 10) && nextTime === selectedTime) return;
    setBookingStart(`${selectedBookingDate}T${nextTime}`);
  }, [availableBookingTimes, bookingStart, selectedBookingDate]);

  const openPlanner = (preset = '', kind: PlannerKind = 'transfer', presetStops: readonly string[] = [], presetLocation?: GeocodedPlace) => {
    setPlanning(true);
    setRouteReady(false);
    setPlannerKind(kind);
    setDestination(preset);
    setStops([...presetStops]);
    setBookingStart('2026-09-14T10:00');
    setCustomCalendarDate('2026-09-14');
    setCustomCalendarMonth('2026-09');
    setCustomCalendarOpen(false);
    setActiveSearch(null);
    setRemoteSuggestions([]);
    setResolvedPlaces(presetLocation ? [presetLocation] : []);
  };
  const chooseBooking = () => {
    try {
      window.sessionStorage.setItem('pm.customer.route-handoff', JSON.stringify({
        kind: plannerKind,
        origin: origin.trim(),
        destination: destination.trim(),
        stops: stops.filter(stop => stop.trim()),
        start: bookingStart,
        route: previewRoute,
      }));
    } catch {
      // A blocked session store should not prevent the demo navigation.
    }
    const url = new URL(window.location.href);
    if (plannerKind === 'tour') url.searchParams.set('tour', '1');
    else url.searchParams.delete('tour');
    url.hash = '#/customer/booking';
    window.location.assign(url.toString());
  };
  const chooseCategory = (id: string) => {
    const preset = id === 'lisbon' ? 'Lisboa' : id === 'sintra' || id === 'lisbon-sintra' ? 'Sintra' : id === 'porto' ? 'Porto' : '';
    openPlanner(preset, 'tour', id === 'porto' ? portoTourStops : []);
  };
  const openOwnerTour = (tour: PublishedTour) => {
    const location = tourLocation(tour);
    openPlanner(location?.title || tour.area, 'tour', [], location);
  };
  const useLocation = () => {
    if (!navigator.geolocation) {
      setOrigin('Lisboa');
      setLocationState('fallback');
      return;
    }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      () => { setOrigin('A minha localização'); setLocationState('suggested'); },
      () => { setOrigin('Lisboa'); setLocationState('fallback'); },
      { enableHighAccuracy: false, timeout: 2500 },
    );
  };
  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', language);
    window.history.replaceState(null, '', url);
  };
  const addStop = () => {
    setStops(current => [...current, '']);
    setRouteReady(false);
  };
  const updateStop = (index: number, value: string) => {
    setStops(current => current.map((stop, stopIndex) => stopIndex === index ? value : stop));
    setRouteReady(false);
  };
  const removeStop = (index: number) => {
    setStops(current => current.filter((_, stopIndex) => stopIndex !== index));
    setRouteReady(false);
  };
  const moveStop = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= stops.length) return;
    setStops(current => {
      if (index < 0 || target < 0 || index >= current.length || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setActiveSearch(current => {
      if (!current || current.kind !== 'stop') return current;
      if (current.index === index) return { ...current, index: target };
      if (current.index === target) return { ...current, index };
      return current;
    });
    setRouteReady(false);
  };
  useEffect(() => {
    const query = activeQuery.trim();
    if (!activeSearch || query.length < 3 || localActiveSuggestions.length > 0) {
      setRemoteSuggestions([]);
      setGeocoderState('idle');
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setGeocoderState('loading');
      try {
        const requestedUnit = addressUnit(query);
        const providerResults = await searchAddresses({
          queries: geocoderQueries(query),
          language: i18n.language === 'en' ? 'en' : 'pt',
          signal: controller.signal,
          geoapifyKey: import.meta.env.VITE_GEOAPIFY_API_KEY?.trim(),
          geoapifyUrl: import.meta.env.VITE_GEOAPIFY_URL?.trim() || undefined,
          photonUrl: import.meta.env.VITE_PHOTON_URL?.trim() || undefined,
        });
        const next = providerResults.map(result => {
          const knownStreet = knownStreetForQuery(query);
          const effectiveUnit = requestedUnit && knownStreet?.unitKind ? { ...requestedUnit, marker: knownStreet.unitKind } : requestedUnit;
          const title = titleWithUnit(result.title, effectiveUnit);
          const detail = effectiveUnit && normalizePlace(title) !== normalizePlace(result.title)
            ? `${result.detail} · ${effectiveUnit.marker === 'lot' ? 'Lote' : 'Número'} indicado · ponto aproximado na rua`
            : result.detail;
          return { place: { title, detail, coordinates: result.coordinates }, score: geocoderRelevance(query, title, detail, effectiveUnit, result.title) };
        });
        const unique = next
          .sort((left, right) => right.score - left.score)
          .map(item => item.place)
          .filter((place, index, all) => index === all.findIndex(other => normalizePlace(`${other.title}|${other.detail}`) === normalizePlace(`${place.title}|${place.detail}`)));
        if (controller.signal.aborted) return;
        setRemoteSuggestions(unique.slice(0, 6));
      } catch (error) {
        if ((error as { name?: string }).name !== 'AbortError') setRemoteSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setGeocoderState('idle');
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [activeQuery, activeSearch?.kind, activeSearch?.index, i18n.language, localActiveSuggestions.length]);
  const selectPlace = (place: Suggestion) => {
    if (!activeSearch) return;
    const coordinates = place.coordinates;
    if (coordinates) setResolvedPlaces(current => [...current.filter(item => normalizePlace(item.title) !== normalizePlace(place.title)), { title: place.title, detail: place.detail, coordinates }]);
    if (activeSearch.kind === 'origin') setOrigin(place.title);
    else if (activeSearch.kind === 'destination') setDestination(place.title);
    else updateStop(activeSearch.index ?? 0, place.title);
    setActiveSearch(null);
    setRouteReady(false);
  };

  return <div className="pm-client-home">
    <header className="pm-client-toolbar">
      <span className="pm-client-wordmark"><span className="pm-client-mark">pm.</span><strong>Premium Mobility</strong></span>
      <label className="pm-client-language"><img className="pm-language-flag" src={i18n.language === 'en' ? '/flag-usa.png' : '/flag-portugal.png'} alt="" aria-hidden="true"/><span className="pm-sr-only">{say('Idioma', 'Language')}</span><select aria-label={say('Idioma', 'Language')} value={i18n.language} onChange={event => changeLanguage(event.target.value)}><option value="pt-PT">Português</option><option value="en">English</option></select></label>
    </header>

    {!planning && <button type="button" className="pm-client-search" onClick={() => openPlanner()} aria-label={say('Pesquisar um tour', 'Search for a tour')}>
      <Search size={24} strokeWidth={2.2}/><strong>{say('Para onde?', 'Where to?')}</strong><span className="pm-client-later"><img className="pm-client-pill-icon" src={clientIcons.calendar} alt="" aria-hidden="true"/>{say('Mais tarde', 'Later')}</span>
    </button>}

    {planning ? <section className="pm-client-planner" aria-labelledby="client-planner-title">
      <div className="pm-client-planner-head"><button type="button" className="pm-client-back" onClick={() => { setPlanning(false); setRouteReady(false); }} aria-label={say('Voltar', 'Back')}><ChevronLeft size={24}/></button><div><span className="pm-client-eyebrow">{say('Tour privado', 'Private tour')}</span><h1 id="client-planner-title">{say('Planear a sua viagem', 'Plan your trip')}</h1></div></div>
      <div className="pm-client-planner-pills"><span><img className="pm-client-pill-icon" src={clientIcons.clock} alt="" aria-hidden="true"/>{say('Mais tarde', 'Later')}</span><span><img className="pm-client-pill-icon" src={clientIcons.location} alt="" aria-hidden="true"/>{say('Para mim', 'For me')}</span></div>
      <div className="pm-client-address-card">
        <label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-pickup-icon"><img className="pm-client-address-art" src={clientIcons.location} alt="" aria-hidden="true"/></span><span className="pm-client-address-field"><small>{say('Local de partida', 'Pickup location')}</small><input aria-label={say('Local de partida', 'Pickup location')} value={origin} onFocus={() => setActiveSearch({ kind: 'origin' })} onChange={event => { setOrigin(event.target.value); setActiveSearch({ kind: 'origin' }); setRouteReady(false); }} placeholder={say('De onde partimos?', 'Where should we pick you up?')} /></span></label>
        {stops.map((stop, index) => <Fragment key={`stop-${index}`}><div className="pm-client-address-divider" /><label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-stop-icon"><img className="pm-client-address-art" src={clientIcons.location} alt="" aria-hidden="true"/></span><span className="pm-client-address-field"><small>{say(`Paragem ${index + 1}`, `Stop ${index + 1}`)}</small><input list={`pm-client-stop-options-${index}`} aria-label={say(`Paragem ${index + 1}`, `Stop ${index + 1}`)} value={stop} onFocus={() => setActiveSearch({ kind: 'stop', index })} onChange={event => { updateStop(index, event.target.value); setActiveSearch({ kind: 'stop', index }); }} placeholder={say('Adicionar uma morada', 'Add an address')} /><datalist id={`pm-client-stop-options-${index}`}>{recentPlaces.map(place => <option value={place.title} key={place.title}>{place.detail}</option>)}</datalist></span><span className="pm-client-stop-actions"><button type="button" className="pm-client-reorder-stop" onClick={() => moveStop(index, -1)} disabled={index === 0} aria-label={say(`Subir paragem ${index + 1}`, `Move stop ${index + 1} up`)}><ChevronUp size={15}/></button><button type="button" className="pm-client-reorder-stop" onClick={() => moveStop(index, 1)} disabled={index === stops.length - 1} aria-label={say(`Descer paragem ${index + 1}`, `Move stop ${index + 1} down`)}><ChevronDown size={15}/></button><button type="button" className="pm-client-remove-stop" onClick={() => removeStop(index)} aria-label={say(`Remover paragem ${index + 1}`, `Remove stop ${index + 1}`)}><X size={17}/></button></span></label></Fragment>)}
        <div className="pm-client-address-divider" />
        <label className="pm-client-address-row"><span className="pm-client-address-icon pm-client-destination-icon"><img className="pm-client-address-art" src={clientIcons.location} alt="" aria-hidden="true"/></span><span className="pm-client-address-field"><small>{say('Destino', 'Destination')}</small><input list="pm-client-destination-options" aria-label={say('Destino', 'Destination')} value={destination} onFocus={() => setActiveSearch({ kind: 'destination' })} onChange={event => { setDestination(event.target.value); setActiveSearch({ kind: 'destination' }); setRouteReady(false); }} placeholder={say('Para onde?', 'Where to?')} /><datalist id="pm-client-destination-options">{recentPlaces.map(place => <option value={place.title} key={place.title}>{place.detail}</option>)}</datalist></span><button type="button" className="pm-client-add-stop" onClick={addStop} aria-label={say('Adicionar paragem', 'Add stop')}><Plus size={20} aria-hidden="true" /></button></label>
      </div>
      {activeSearch && activeQuery.trim() && <div className="pm-client-inline-suggestions" role="listbox" aria-label={say('Sugestões de morada', 'Address suggestions')}>{activeUnitPrefix && activeSuggestions.length > 0 && <div className="pm-client-suggestions-title"><strong>{say('Arruamento encontrado', 'Street found')}</strong><span>{say('Escreva o lote ou número', 'Enter the lot or number')}</span></div>}{activeSuggestions.length ? activeSuggestions.map(place => <button type="button" role="option" className="pm-client-inline-suggestion" key={`${place.title}-${place.detail}`} onClick={() => selectPlace(place)}><img className="pm-client-inline-icon" src={clientIcons.location} alt="" aria-hidden="true"/><span><strong>{place.title}</strong><small>{place.detail}</small></span><ChevronRight size={16}/></button>) : <p>{geocoderState === 'loading' ? say('A procurar moradas…', 'Searching addresses…') : say('Nenhum resultado encontrado. Verifique a localidade ou experimente só o nome da rua.', 'No result found. Check the town or try only the street name.')}</p>}</div>}
      <RouteMap route={destination.trim() && routeKnown ? previewRoute : originPreviewRoute} language={i18n.language === 'en' ? 'en' : 'pt'} mode={destination.trim() && routeKnown ? 'full' : 'preview'} previewMessage={destination.trim() && !routeKnown ? say('Escolha um endereço sugerido para calcular quilómetros e preço.', 'Choose a suggested address to calculate distance and price.') : say('Escolha um destino para calcular quilómetros e preço.', 'Choose a destination to calculate distance and price.')}/>
      <button type="button" className="pm-client-location-button" onClick={useLocation}><img className="pm-client-button-icon" src={clientIcons.location} alt="" aria-hidden="true"/>{locationState === 'requesting' ? say('A localizar…', 'Locating…') : say('Usar localização atual', 'Use current location')}</button>
      <p className="pm-client-field-help">{locationState === 'fallback' ? say('Localização indisponível; Lisboa foi preenchida como exemplo.', 'Location unavailable; Lisbon was filled as an example.') : !routeKnown && destination.trim() ? say('O endereço ainda não foi reconhecido; escolha uma sugestão da lista.', 'The address is not recognised yet; choose a suggestion from the list.') : say('A origem fica sugerida e pode ser alterada antes de calcular.', 'Pickup is suggested and can be changed before calculating.')}</p>
      {!destination.trim() && !routeReady && <div className="pm-client-suggestions"><div className="pm-client-suggestions-title"><strong>{say('Locais recentes', 'Recent places')}</strong><span>{say('Toque para preencher o destino', 'Tap to fill destination')}</span></div>{visibleRecentPlaces.map(place => <button type="button" className="pm-client-suggestion" key={place.title} onClick={() => { setDestination(place.title); setRouteReady(false); }}><span className="pm-client-suggestion-pin"><img className="pm-client-list-icon" src={clientIcons.clock} alt="" aria-hidden="true"/></span><span><strong>{place.title}</strong><small>{place.detail}</small></span><ChevronRight size={17}/></button>)}</div>}
      {!routeReady ? <button type="button" className="pm-client-primary-action" onClick={() => setRouteReady(Boolean(origin.trim() && destination.trim() && routeKnown))} disabled={!origin.trim() || !destination.trim() || !routeKnown}><img className="pm-client-action-route" src="/route-landmark.png" alt="" aria-hidden="true" />{say('Ver rota e preço', 'See route and price')}<ChevronRight size={19}/></button> : <div className="pm-client-route-quote"><div className="pm-client-route-quote-head"><div><span>{plannerKind === 'tour' ? say('Estimativa do tour', 'Tour estimate') : say('Estimativa do transfer', 'Transfer estimate')}</span><strong>{money(plannerPrice.totalCents)}</strong></div><span className="pm-client-route-badge">{plannerKind === 'tour' ? say('2 dias', '2 days') : say('Transfer', 'Transfer')}</span></div><div className="pm-client-route-stats"><span><strong>{km} km</strong>{say('percurso previsto', 'planned route')}</span><span><strong>{previewRoute.minutes} min</strong>{say('tempo de condução', 'driving time')}</span><span><strong>{money(plannerPrice.depositCents)}</strong>{say('sinal · 25%', 'deposit · 25%')}</span></div><p>{plannerKind === 'tour' ? say('Inclui até 2 pessoas. Cada pessoa adicional acrescenta 35,00 €. A disponibilidade do motorista será confirmada no passo seguinte.', 'Includes up to 2 people. Each additional person adds €35. Driver availability is confirmed in the next step.') : say(`Cálculo de demonstração: ${money(200)} por km de rota. Paragens incluídas no percurso; a tarifa real será definida pelo proprietário.`, `Demo calculation: ${money(200)} per route kilometre. Stops are included in the route; the owner will define the live tariff.`)}</p><section className="pm-client-booking-calendar" aria-label={say('Escolher data e hora', 'Choose date and time')}><div className="pm-client-booking-calendar-head"><img className="pm-client-calendar-icon" src={clientIcons.calendar} alt="" aria-hidden="true"/><div><strong>{say('Quando deseja viajar?', 'When would you like to travel?')}</strong><span>{say('Escolha um dia e um horário disponíveis.', 'Choose an available day and time.')}</span></div></div><div className="pm-client-calendar-days" role="listbox" aria-label={say('Dias disponíveis', 'Available days')}>{calendarDates.map(day => <button type="button" role="option" aria-selected={selectedBookingDate === day.value} aria-label={say(day.ariaPt, day.ariaEn)} className={selectedBookingDate === day.value ? 'pm-client-calendar-choice pm-client-calendar-choice-active' : 'pm-client-calendar-choice'} onClick={() => setBookingStart(`${day.value}T${bookingTimesForDate(day.value)[0] ?? '00:00'}`)} key={day.value}>{say(day.pt, day.en)}</button>)}</div><div className="pm-client-calendar-times" role="listbox" aria-label={say('Horários disponíveis', 'Available times')}>{availableBookingTimes.map(time => <button type="button" role="option" aria-selected={bookingStart.slice(11, 16) === time} aria-label={time} className={bookingStart.slice(11, 16) === time ? 'pm-client-calendar-choice pm-client-calendar-choice-active' : 'pm-client-calendar-choice'} onClick={() => setBookingStart(`${bookingStart.slice(0, 10)}T${time}`)} key={time}>{time}</button>)}</div><button type="button" className="pm-client-calendar-more" aria-expanded={customCalendarOpen} aria-controls="pm-client-more-dates" onClick={() => { setCustomCalendarDate(bookingStartDate); setCustomCalendarMonth(monthKey(bookingStartDate)); setCustomCalendarOpen(open => !open); }}><img src={clientIcons.calendar} alt="" aria-hidden="true"/><span>{say('Escolher outra data', 'Choose another date')}</span><ChevronDown size={17} aria-hidden="true"/></button>{customCalendarOpen && <div id="pm-client-more-dates" className="pm-client-more-dates" role="dialog" aria-label={say('Mais datas', 'More dates')}><div className="pm-client-date-picker-head"><button type="button" className="pm-client-date-picker-nav" aria-label={say('Mês anterior', 'Previous month')} disabled={customCalendarMonth <= monthKey(demoBookingToday)} onClick={() => setCustomCalendarMonth(shiftMonth(customCalendarMonth, -1))}><ChevronLeft size={17} aria-hidden="true"/></button><strong>{monthLabel(customCalendarMonth, i18n.language === 'en')}</strong><button type="button" className="pm-client-date-picker-nav" aria-label={say('Mês seguinte', 'Next month')} onClick={() => setCustomCalendarMonth(shiftMonth(customCalendarMonth, 1))}><ChevronRight size={17} aria-hidden="true"/></button></div><div className="pm-client-date-picker-weekdays" aria-hidden="true">{calendarWeekdays[i18n.language === 'en' ? 'en' : 'pt'].map((day, index) => <span key={index}>{day}</span>)}</div><div className="pm-client-date-picker-grid" role="grid" aria-label={say('Dias do mês', 'Days of the month')}>{customCalendarCells.map(cell => <button type="button" role="gridcell" aria-label={cell.inMonth ? customDateLabel(cell.value, i18n.language === 'en') : undefined} aria-selected={cell.isSelected} disabled={!cell.inMonth || !cell.available} className={'pm-client-date-picker-day' + (!cell.inMonth ? ' pm-client-date-picker-day-outside' : '') + (!cell.available ? ' pm-client-date-picker-day-unavailable' : '') + (cell.isToday ? ' is-today' : '') + (cell.isSelected ? ' is-selected' : '')} onClick={() => { const nextTime = bookingTimesForDate(cell.value)[0]; if (!nextTime) return; setCustomCalendarDate(cell.value); setBookingStart(cell.value + 'T' + nextTime); setCustomCalendarOpen(false); }} key={cell.value}>{cell.day}</button>)}</div><div className="pm-client-date-picker-footer"><button type="button" onClick={() => { const nextTime = bookingTimesForDate(demoBookingToday)[0]; setCustomCalendarDate(demoBookingToday); setCustomCalendarMonth(monthKey(demoBookingToday)); if (nextTime) { setBookingStart(demoBookingToday + 'T' + nextTime); setCustomCalendarOpen(false); } }}>{say('Hoje', 'Today')}</button></div></div>}</section><button type="button" className="pm-client-primary-action" onClick={chooseBooking}><img className="pm-client-action-car" src={clientIcons.car} alt="" aria-hidden="true"/>{say('Escolher motorista e carro', 'Choose driver and vehicle')}<ChevronRight size={19}/></button></div>}
    </section> : <>
      <section className="pm-client-categories" aria-labelledby="client-adventure-title">
        <div className="pm-client-section-title"><h1 id="client-adventure-title">{say('Escolhe a tua aventura.', 'Choose your adventure.')}</h1><span className="pm-client-spark"><Sparkles size={18}/></span></div>
        <div className="pm-client-category-grid">{tourOptions.map(option => <button type="button" className="pm-client-category" key={option.id} onClick={() => chooseCategory(option.id)}><span className="pm-client-category-art" aria-hidden="true"><img src={option.icon} alt="" /></span><strong>{say(option.pt, option.en)}</strong><span>{say(option.detailPt, option.detailEn)}</span></button>)}</div>
      </section>
      {hasOwnerCatalog ? <section className="pm-client-owner-catalog" aria-labelledby="client-owner-catalog-title">
        <div className="pm-client-section-title"><div><span className="pm-client-eyebrow">{say('Catálogo do proprietário', 'Owner catalogue')}</span><h2 id="client-owner-catalog-title">{say('Tours disponíveis', 'Available tours')}</h2></div><span className="pm-client-catalog-count">{ownerTours.filter(tour => tour.active).length}</span></div>
        {ownerTours.some(tour => tour.active) ? <div className="pm-client-promo-list">{ownerTours.filter(tour => tour.active).map(tour => <button type="button" className="pm-client-tour-promo pm-client-owner-tour-promo" key={tour.id} onClick={() => openOwnerTour(tour)} aria-label={say(`Abrir tour ${tour.namePt}`, `Open ${tour.nameEn} tour`)}><img src={tour.photoPath} alt=""/><span className="pm-client-tour-shade"/><span className="pm-client-tour-copy"><span className="pm-client-kicker"><Ticket size={15}/> {say('Experiência privada', 'Private experience')}</span><strong>{say(tour.namePt, tour.nameEn)}</strong><span>{say(tour.descriptionPt, tour.descriptionEn)}</span><span className="pm-client-tour-meta pm-client-tour-meta-clock">{say(`2 dias · até 2 pessoas incluídas · ${money(tour.baseCents)}`, `2 days · up to 2 people included · ${money(tour.baseCents)}`)}</span><span className="pm-client-tour-action">{say('Ver tour', 'View tour')} <ChevronRight size={18}/></span></span></button>)}</div> : <p className="pm-client-owner-empty">{say('Neste momento não há tours ativos para marcar.', 'There are no active tours available to book right now.')}</p>}
      </section> : <div className="pm-client-promo-list">
        <button type="button" className="pm-client-tour-promo" onClick={() => openPlanner('Sintra', 'tour')} aria-label={say('Abrir tour Lisboa Sintra', 'Open Lisbon Sintra tour')}><img src="/lisbon-sintra-tour.png" alt=""/><span className="pm-client-tour-shade"/><span className="pm-client-tour-copy"><span className="pm-client-kicker"><Ticket size={15}/> {say('Experiência privada', 'Private experience')}</span><strong>Lisboa <span>→</span> Sintra</strong><span>{say('Do centro histórico aos palácios da serra.', 'From the historic centre to the hilltop palaces.')}</span><span className="pm-client-tour-meta pm-client-tour-meta-clock">{say('2 dias · até 2 pessoas incluídas', '2 days · up to 2 people included')}</span><span className="pm-client-tour-action">{say('Ver tour', 'View tour')} <ChevronRight size={18}/></span></span></button>
        <button type="button" className="pm-client-tour-promo pm-client-tour-promo-porto" onClick={() => openPlanner('Porto', 'tour', portoTourStops)} aria-label={say('Abrir tour do Porto com seis paragens', 'Open Porto tour with six stops')}><img src="/porto-tour.png" alt=""/><span className="pm-client-tour-shade"/><span className="pm-client-tour-copy"><span className="pm-client-kicker"><Ticket size={15}/> {say('Experiência privada', 'Private experience')}</span><strong>Porto <span>·</span> 6 paragens</strong><span>{say('Ribeira, centro histórico e Douro num percurso privado.', 'Ribeira, historic centre and Douro on a private route.')}</span><span className="pm-client-tour-meta pm-client-tour-meta-clock">{say('2 dias · até 2 pessoas incluídas', '2 days · up to 2 people included')}</span><span className="pm-client-tour-action">{say('Ver tour', 'View tour')} <ChevronRight size={18}/></span></span></button>
      </div>}
      <p className="pm-client-note">{say('Valores e disponibilidade são confirmados antes do pedido.', 'Prices and availability are confirmed before your request.')}</p>
    </>}
  </div>;
}
