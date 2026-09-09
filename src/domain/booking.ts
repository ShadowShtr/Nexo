export type BookingStatus = 'draft' | 'requested' | 'awaiting_payment' | 'confirmed' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'declined' | 'expired';
const transitions: Record<BookingStatus, BookingStatus[]> = {
  draft: ['requested'], requested: ['awaiting_payment', 'declined', 'expired', 'cancelled'],
  awaiting_payment: ['confirmed', 'expired', 'cancelled'],
  confirmed: ['en_route', 'cancelled'], en_route: ['arrived', 'cancelled'],
  arrived: ['in_progress', 'cancelled'], in_progress: ['completed'],
  completed: [], cancelled: [], declined: [], expired: [],
};

/** Só o grafo: autorização, pagamento e disponibilidade são guardas da aplicação futura. */
export function transition(current: BookingStatus, next: BookingStatus): BookingStatus {
  if (!transitions[current].includes(next)) throw new Error(`Transição inválida: ${current} -> ${next}`);
  return next;
}
