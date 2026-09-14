import test from 'node:test';
import assert from 'node:assert/strict';
import { canCarryPassengers, isDriverPublishable, isVehiclePublishable } from '../src/contracts/catalog.ts';
import { isTourPublishable } from '../src/contracts/tour.ts';

const driver={displayName:'Miguel Costa',displayNameEn:'Michael Costa',biographyPt:'Perfil',biographyEn:'Profile',phone:'+351910000000',photoPath:'driver.jpg',languages:['pt-PT','en'] as ('pt-PT'|'en')[]};
const vehicle={registration:'00-AA-00',make:'Mercedes-Benz',model:'Classe V',passengerCapacity:6,luggageCapacity:6,minimumNoticeHours:48,supplementCents:3500};
test('driver profile requires bilingual publishable fields',()=>{
  assert.equal(isDriverPublishable(driver),true);
  assert.equal(isDriverPublishable({...driver,biographyEn:''}),false);
  assert.equal(isDriverPublishable({...driver,phone:'123'}),false);
});
test('vehicle profile accepts premium capacity and rejects unsafe bounds',()=>{
  assert.equal(isVehiclePublishable(vehicle),true);
  assert.equal(isVehiclePublishable({...vehicle,passengerCapacity:0}),false);
  assert.equal(isVehiclePublishable({...vehicle,passengerCapacity:21}),false);
});
test('passenger capacity excludes the driver and never accepts an extra passenger',()=>{
  assert.equal(canCarryPassengers(6,6),true);
  assert.equal(canCarryPassengers(6,7),false);
  assert.equal(canCarryPassengers(6,0),false);
});
test('tour catalogue requires bilingual copy, two days and 48h notice',()=>{
  const tour={namePt:'Douro',nameEn:'Douro',descriptionPt:'Vinhos',descriptionEn:'Wine',durationDays:2 as const,baseCents:20000,extraPassengerCents:3500,minimumNoticeHours:48};
  assert.equal(isTourPublishable(tour),true);
  assert.equal(isTourPublishable({...tour,durationDays:1}),false);
  assert.equal(isTourPublishable({...tour,minimumNoticeHours:24}),false);
});
