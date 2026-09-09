export function integer(value: number, name: string, min = 0): number {
  if (!Number.isSafeInteger(value) || value < min) throw new RangeError(`${name}: inteiro seguro >= ${min} obrigatório`);
  return value;
}

export function sum(...values: number[]): number {
  return integer(values.reduce((total, value) => total + integer(value, 'parcela'), 0), 'total');
}

/** Arredondamento comercial half-up; entrada e resultado em unidades inteiras. */
export function ratio(value: number, numerator: number, denominator: number): number {
  integer(value, 'valor'); integer(numerator, 'numerador'); integer(denominator, 'denominador', 1);
  const d = BigInt(denominator);
  const result = (BigInt(value) * BigInt(numerator) * 2n + d) / (2n * d);
  return integer(Number(result), 'resultado');
}

/** Exige offset explícito: o servidor não deve adivinhar uma hora local. */
export function instant(iso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(iso)) throw new Error('Instante ISO com offset obrigatório');
  const [hour, minute, second] = iso.slice(11, 19).split(':').map(Number);
  if (hour > 23 || minute > 59 || second > 59) throw new Error('Hora inexistente');
  const result = Date.parse(iso);
  if (!Number.isFinite(result)) throw new Error('Instante inválido');
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('Data inexistente');
  return result;
}
