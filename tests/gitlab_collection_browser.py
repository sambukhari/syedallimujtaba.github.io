"""Playwright smoke tests for the complete GitLab project archive and selected detail pages."""
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
address=f'http://127.0.0.1:{server.server_address[1]}/'
def ok(value,label):
 assert value,label
 print('PASS:',label,flush=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for w,h in [(320,700),(390,844),(768,1024),(1024,768),(1440,900),(1920,1080)]:
   ctx=browser.new_context(viewport={'width':w,'height':h})
   page=ctx.new_page();errors=[]
   page.route('https://fonts.googleapis.com/**',lambda r:r.abort())
   page.route('https://fonts.gstatic.com/**',lambda r:r.abort())
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(address+'projects/',wait_until='domcontentloaded')
   ok(page.locator('.gc-entry').count()==38,f'{w}: full archive has 38 active cards')
   ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{w}: no overflow in archive')
   ok(not errors,f'{w}: no JS errors in archive {errors!r}')
   if w in (390,1440):
    ok(page.locator('.gc-entry:visible').count()==38,f'{w}: all directory cards visible')
    ok(page.locator('[data-filter="Archive only"]').count()==0,f'{w}: archived projects are not in public filters')
    ok(page.locator('.gc-entry:visible').count()==38,f'{w}: only active projects are listed')
    page.locator('[data-filter="All"]').click()
    page.locator('[data-collection-search]').fill('trade core')
    ok(page.locator('.gc-entry:visible').count()==2,f'{w}: trading family searchable')
    page.locator('[data-collection-search]').fill('')
    page.locator('[data-filter="Mobile apps"]').click()
    ok(8<page.locator('.gc-entry:visible').count()<25,f'{w}: mobile category filter')
   page.goto(address+'projects/trade-core-apps/',wait_until='domcontentloaded')
   ok(page.locator('#case-title').is_visible(),f'{w}: project page loads')
   ok(page.locator('.cs-module').count()==5,f'{w}: all source modules present')
   ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{w}: project page fits')
   page.wait_for_function("document.querySelector('.gc-hero-media img').complete&&document.querySelector('.gc-hero-media img').naturalWidth>0",timeout=9000)
   if w in (390,1440):
    page.locator('#module-search').fill('watchlist')
    ok(page.locator('.cs-module:not([hidden])').count()==1,f'{w}: module search works')
    page.locator('#module-search').fill('')
    page.locator('[data-flow-step="2"]').click()
    ok('SIP' in page.locator('[data-flow-description]').inner_text(),f'{w}: workflow text updates')
    page.locator('[data-gallery-open="0"]').click()
    ok(page.locator('#case-lightbox').is_visible(),f'{w}: conceptual gallery opens')
    page.locator('[data-gallery-next]').click()
    ok(page.locator('#case-lightbox-counter').inner_text()=='2 / 2',f'{w}: gallery navigates')
    page.locator('[data-gallery-close]').click()
    ok(not page.locator('#case-lightbox').is_visible(),f'{w}: gallery closes')
   ok(not errors,f'{w}: no project JS errors {errors!r}')
   ctx.close()
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=ctx.new_page()
  page.goto(address+'projects/hc/',wait_until='domcontentloaded')
  ok(page.locator('.gc-no-code').is_visible(),'placeholder clearly labeled as not implemented')
  ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'placeholder mobile no horizontal overflow')
  page.goto(address+'?no3d=1',wait_until='domcontentloaded')
  ok(page.locator('.gc-entry').count()==6,'homepage presents six curated projects')
  ok(page.locator('.gc-explore-link').is_visible(),'homepage links to the complete project directory')
  ok(page.locator('.gc-collection-full').count()==0,'full directory is not duplicated on home')
  ctx.close()
  browser.close()
finally:
 server.shutdown()
 server.server_close()
