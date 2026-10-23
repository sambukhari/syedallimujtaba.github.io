"""APAEA responsive case study end-to-end tests using real Chrome."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/projects/apaea-research-platform/'
def check(valid,message):
    assert valid,message
    print('PASS:',message,flush=True)
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for width,height in [(320,700),(390,844),(768,1024),(1024,768),(1440,900),(1920,1080)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='no-preference')
   page=context.new_page()
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   response=page.goto(url,wait_until='domcontentloaded')
   check(response.status==200,f'{width}: APAEA route responds successfully')
   check(page.locator('#case-title').is_visible(),f'{width}: project header visible')
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{width}: no horizontal overflow')
   check(page.locator('.cs-module').count()==34,f'{width}: 34 present modules')
   check(page.locator('.cs-excluded details').count()==2,f'{width}: KYC and HR explicitly not found')
   page.wait_for_function("document.querySelector('.cs-hero-visual img').complete&&document.querySelector('.cs-hero-visual img').naturalWidth>0",timeout=7000)
   check(page.locator('.cs-gallery-item').count()==4,f'{width}: all diagrams present')
   check(not errors,f'{width}: JS has no errors: {errors!r}')
   if width in (390,1440):
    check(page.locator('.cs-module:not([hidden])').count()==34,f'{width}: all source-present modules visible initially')
    page.locator('#module-search').fill('PayPal')
    check(page.locator('.cs-module:not([hidden])').count()==2,f'{width}: PayPal feature search returns membership payments and PayPal handler')
    page.locator('#module-search').fill('API for App')
    check(page.locator('.cs-module:not([hidden])').count()==1,f'{width}: limited API found by search')
    check('LIMITED' in page.locator('.cs-module:not([hidden]) .cs-module-status').inner_text(),f'{width}: limited status preserved')
    page.locator('#module-search').fill('')
    page.locator('#module-status').select_option('code')
    check(page.locator('.cs-module:not([hidden])').count()==2,f'{width}: filter isolates 2 limited/unverified entries')
    page.locator('#module-status').select_option('source')
    check(page.locator('.cs-module:not([hidden])').count()==32,f'{width}: filter isolates 32 plain source-present records')
    page.locator('#module-status').select_option('all')
    page.locator('[data-workflow-switch="core"]').click()
    check(page.locator('[data-workflow="core"]').is_visible(),f'{width}: membership workflow visible')
    page.locator('[data-workflow="core"] [data-flow-step="2"]').click()
    check('PayPal' in page.locator('[data-workflow="core"] [data-flow-description]').inner_text(),f'{width}: stage captions derive from manifest')
    page.locator('[data-gallery-open="0"]').click()
    check(page.locator('#case-lightbox').is_visible(),f'{width}: gallery dialog opened')
    page.locator('[data-gallery-next]').click()
    check(page.locator('#case-lightbox-counter').inner_text().startswith('2 /'),f'{width}: gallery navigation')
    page.locator('[data-gallery-close]').click()
    check(not page.locator('#case-lightbox').is_visible(),f'{width}: gallery closed')
   context.close()
  context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=context.new_page()
  page.goto(url,wait_until='domcontentloaded')
  check(page.locator('[data-workflow="main"] .cs-stage').first.is_visible(),'reduced motion keeps workflow accessible')
  check(page.locator('#module-search').is_visible(),'reduced motion keeps search accessible')
  context.close()
  browser.close()
finally:
 server.shutdown()
 server.server_close()
