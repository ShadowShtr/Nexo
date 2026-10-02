import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'msedge' });
const routes = ['owner/home','owner/calendar','owner/bookings','owner/customers','owner/drivers','owner/vehicles','owner/tours','owner/finance','owner/settlements','owner/settings','owner/more','driver/home','driver/services','driver/availability','driver/earnings','driver/profile','driver/more','customer/discover','customer/booking','customer/lookup'];
const results = [];
await mkdir('artifacts/checkup', { recursive:true });
for (const width of [320,390,1440]) {
  for (const lang of ['pt-PT','en']) {
    const context = await browser.newContext({ viewport:{width,height:844} });
    const page = await context.newPage();
    for (const route of routes) {
      const errors = [];
      const onError = e => errors.push(e.message);
      page.on('pageerror',onError);
      await page.goto(`http://127.0.0.1:5173/?demo=1&lang=${lang}#/${route}`);
      await page.locator('main h1').first().waitFor();
      await page.waitForTimeout(150);
      await page.evaluate(() => window.scrollTo(0,document.body.scrollHeight));
      const state = await page.evaluate(() => {
        const n = document.querySelector('.pm-bottom-nav');
        const rect = n.getBoundingClientRect();
        return {
          overflow:document.documentElement.scrollWidth > innerWidth + 1,
          navFixed:getComputedStyle(n).position === 'fixed',
          navVisible:rect.top >= 0 && rect.bottom <= innerHeight && rect.height > 0,
          smallInputs:[...document.querySelectorAll('input:not([type=checkbox]),select,textarea')].filter(e=>e.getBoundingClientRect().width>0 && parseFloat(getComputedStyle(e).fontSize)<16).map(e=>({label:e.getAttribute('aria-label')||e.closest('label')?.textContent?.slice(0,70),size:getComputedStyle(e).fontSize})),
          brokenImages:[...document.images].filter(i=>i.getBoundingClientRect().width>0 && i.complete && !i.naturalWidth).map(i=>i.getAttribute('src')),
        };
      });
      results.push({route,width,lang,...state,errors});
      if(width===390 && lang==='pt-PT' && ['owner/home','customer/discover','owner/calendar'].includes(route)) {
        await page.evaluate(()=>window.scrollTo(0,0));
        await page.screenshot({path:`artifacts/checkup/${route.replace('/','-')}.png`,fullPage:true});
      }
      page.off('pageerror',onError);
    }
    await context.close();
  }
}
await browser.close();
await writeFile('artifacts/checkup/routes.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({cases:results.length,errors:results.filter(r=>r.errors.length),overflow:results.filter(r=>r.overflow),navigation:results.filter(r=>r.width<1024&&(!r.navFixed||!r.navVisible)),smallInputs:results.filter(r=>r.width<768&&r.smallInputs.length),brokenImages:results.filter(r=>r.brokenImages.length)},null,2));
