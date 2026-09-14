import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { chromium } from '@playwright/test';
import pg from 'pg';

const status=JSON.parse(execFileSync(process.execPath,['node_modules/supabase/dist/supabase.js','status','-o','json'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
assert.equal(status.API_URL,'http://127.0.0.1:55421');
const dbUrl=new URL(status.DB_URL);assert.equal(dbUrl.hostname,'127.0.0.1');assert.equal(dbUrl.port,'55422');
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(status.API_URL,status.SERVICE_ROLE_KEY,options);
const db=new pg.Client({connectionString:status.DB_URL});
const organization=randomUUID();
const password=`Local-ui-${randomUUID()}!`;
const users=[];
let server,browser;

async function actor(role) {
  const email=`ui-${role}-${randomUUID()}@example.invalid`;
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true});
  assert.equal(created.error,null);users.push(created.data.user.id);
  await db.query('insert into public.memberships(organization_id,user_id,role) values($1,$2,$3)',[organization,created.data.user.id,role]);
  if(role==='driver')await db.query("insert into public.driver_profiles(organization_id,user_id,display_name,status) values($1,$2,'UI Driver','draft')",[organization,created.data.user.id]);
  return {email,id:created.data.user.id};
}
async function waitForServer(url) {
  for(let attempt=0;attempt<60;attempt++){
    try{if((await fetch(url)).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error('AUTH_UI_SERVER_TIMEOUT');
}
async function login(page,url,email) {
  await page.goto(url);
  await page.getByLabel('Email',{exact:true}).fill(email);
  await page.getByLabel('Palavra-passe',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Entrar',exact:true}).click();
}
async function verifyLogin(url,email,heading,verifySignOut=false) {
  const context=await browser.newContext();
  try { const page=await context.newPage();await login(page,url,email);await page.getByRole('heading',{name:heading}).waitFor();if(verifySignOut){await page.getByRole('button',{name:'Terminar sessão'}).click();await page.getByRole('heading',{name:'Entrar'}).waitFor();} }
  finally { await context.close(); }
}

try{
  await db.connect();
  await db.query('insert into public.organizations(id,name) values($1,$2)',[organization,'UI auth test']);
  const owner=await actor('owner');const driver=await actor('driver');
  server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5174','--strictPort'],{
    env:{...process.env,VITE_SUPABASE_URL:status.API_URL,VITE_SUPABASE_PUBLISHABLE_KEY:status.PUBLISHABLE_KEY},stdio:'ignore',windowsHide:true,
  });
  await waitForServer('http://127.0.0.1:5174');
  browser=await chromium.launch({channel:'msedge'});
  await verifyLogin('http://127.0.0.1:5174/#/owner/home',owner.email,'Tudo preparado para começar.',true);
  await verifyLogin('http://127.0.0.1:5174/#/owner/home',driver.email,'Área sem acesso');
  await verifyLogin('http://127.0.0.1:5174/#/driver/services',driver.email,'Meus serviços');
  console.log('AUTH_UI_OK owner allowed; driver isolated; driver area allowed');
}finally{
  if(browser)await browser.close();
  if(server){server.kill();await new Promise(resolve=>server.once('exit',resolve));}
  if(db){
    await db.query('delete from public.driver_profiles where organization_id=$1',[organization]).catch(()=>undefined);
    await db.query('delete from public.memberships where organization_id=$1',[organization]).catch(()=>undefined);
    await db.query('delete from public.organizations where id=$1',[organization]).catch(()=>undefined);
    await db.end().catch(()=>undefined);
  }
  for(const id of users)await admin.auth.admin.deleteUser(id);
}
