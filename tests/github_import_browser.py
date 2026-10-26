"""Chrome regression: two distinct GitHub projects added without duplicate portfolio cards."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
srv=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
addr=f'http://127.0.0.1:{srv.server_address[1]}/'
def ok(x,statement):
 assert x,statement
 print('PASS:',statement,flush=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for width,height in [(320,700),(390,844),(768,1024),(1440,900)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
   page=ctx.new_page(); errors=[]
   page.route('https://fonts.googleapis.com/**',lambda r:r.abort())
   page.route('https://fonts.gstatic.com/**',lambda r:r.abort())
   page.on('pageerror',lambda exc:errors.append(str(exc)))
   page.goto(addr+'projects/',wait_until='domcontentloaded')
   ok(page.locator('.gc-entry').count()==38,f'{width}: exactly 38 active project cards')
   ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{width}: collection fits viewport')
   for slug in ('eze-auction','learn-skill-pro'):
    page.goto(addr+'projects/'+slug+'/',wait_until='domcontentloaded')
    ok(page.locator('#case-title').is_visible(),f'{width}: {slug} header visible')
    ok(page.locator('.cs-module').count()==5,f'{width}: {slug} five documented feature modules')
    ok(page.locator('.gc-audit-row').count()==4,f'{width}: {slug} four evidence categories')
    ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{width}: {slug} no overflow')
    page.wait_for_function("document.querySelector('.gc-hero-media img').complete&&document.querySelector('.gc-hero-media img').naturalWidth>0",timeout=8000)
    if width in (390,1440):
     term='bidding' if slug=='eze-auction' else 'protected'
     page.locator('#module-search').fill(term)
     ok(page.locator('.cs-module:not([hidden])').count()==1,f'{width}: {slug} searchable evidence')
     page.locator('#module-search').fill('')
     page.locator('[data-gallery-open="0"]').click()
     ok(page.locator('#case-lightbox').is_visible(),f'{width}: {slug} gallery opened')
     page.locator('[data-gallery-next]').click()
     ok(page.locator('#case-lightbox-counter').inner_text()=='2 / 2',f'{width}: {slug} gallery works')
     page.locator('[data-gallery-close]').click()
     ok(not page.locator('#case-lightbox').is_visible(),f'{width}: {slug} gallery closes')
   ok(not errors,f'{width}: no JS crashes {errors!r}')
   ctx.close()
  ctx=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=ctx.new_page()
  page.goto(addr+'?no3d=1',wait_until='domcontentloaded')
  ok(page.locator('.gc-entry').count()==6,'homepage shows six thoughtfully selected previews')
  ok(page.locator('.gc-explore-link').is_visible(),'full directory remains one click away')
  page.goto(addr+'projects/learn-skill-pro/',wait_until='domcontentloaded')
  ok(page.locator('.cs-module').first.is_visible(),'reduced motion keeps modules accessible')
  ctx.close()
  browser.close()
finally:
 srv.shutdown()
 srv.server_close()
