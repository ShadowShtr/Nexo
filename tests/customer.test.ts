import test from 'node:test';
import assert from 'node:assert/strict';
import { isCustomerPublishable } from '../src/contracts/customer.ts';

const customer={fullName:'Ana Exemplo',email:'ana@example.invalid',phone:'+351 910 000 010',nif:'123456789',notes:''};
test('customer CRM requires a valid NIF and contact data',()=>{
  assert.equal(isCustomerPublishable(customer),true);
  assert.equal(isCustomerPublishable({...customer,nif:'123'}),false);
  assert.equal(isCustomerPublishable({...customer,email:'bad'}),false);
});
