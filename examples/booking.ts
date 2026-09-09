import { quote } from '../src/domain/pricing.ts';
const result = quote({ passengers: 4, passengerCapacity: 6,
  service: { kind: 'tour', baseCents: 20000, extraPassengerCents: 3500 } });
console.log('Exemplo fictício: tour para 4 passageiros, 200 EUR base e 35 EUR por pessoa acima de 2.');
console.log(JSON.stringify(result, null, 2));
