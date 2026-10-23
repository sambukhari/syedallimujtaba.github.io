"""Real Chrome checks for source-backed EzeAD project detail pages."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/projects/ezead-marketplace/'
def check(value,name):
 assert value,name
 print('PASS:',name,flush=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for width,height in [(320,700),(390,844),(768,1024),(1024,768),(1440,900),(1920,1080)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
   page=context.new_page()
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(url,wait_until='domcontentloaded')
   check(page.locator('#case-title').is_visible(),f'{width}: case study hero is visible')
   check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'),f'{width}: no horizontal overflow')
   check(page.locator('.cs-module').count()==79,f'{width}: all 79 main and core source module records available')
   check(page.locator('.cs-hero-visual img').evaluate('(e)=>e.complete&&e.naturalWidth>0'),f'{width}: architecture art loaded')
   check(not errors,f'{width}: no JS errors: {errors!r}')
   if width in [390,1440]:
    main=page.locator('.cs-module:not([hidden])')
    check(main.count()==60,f'{width}: main app modules initially displayed')
    page.locator('[data-scope-switch="core"]').click()
    check(page.locator('.cs-module:not([hidden])').count()==19,f'{width}: separate storefront shows 19 modules')
    page.locator('#module-search').fill('Stripe')
    check(page.locator('.cs-module:not([hidden])').count()==1,f'{width}: Stripe search stays in separate storefront')
    page.locator('#module-search').fill('')
    page.locator('[data-scope-switch="main"]').click()
    check(page.locator('.cs-module:not([hidden])').count()==60,f'{width}: main source modules restored')
    page.locator('[data-workflow-switch="core"]').click()
    check(page.locator('[data-workflow="core"]').is_visible(),f'{width}: independent storefront pipeline')
    page.locator('[data-gallery-open="0"]').click()
    check(page.locator('#case-lightbox').is_visible(),f'{width}: gallery opens')
    page.locator('[data-gallery-next]').click()
    check(page.locator('#case-lightbox-counter').inner_text().startswith('2 /'),f'{width}: gallery next works')
    page.locator('[data-gallery-close]').click()
    check(not page.locator('#case-lightbox').is_visible(),f'{width}: gallery closes')
   context.close()
  context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=context.new_page();page.goto(url,wait_until='domcontentloaded')
  check(page.locator('.cs-stage').first.is_visible(),'reduced motion keeps workflow explanations')
  check(page.locator('[data-scope-switch="core"]').is_visible(),'reduced motion keeps module filters')
  context.close()
  browser.close()
finally:
 server.shutdown()
 server.server_close()
