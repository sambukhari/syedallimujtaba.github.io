"""Shared site navigation, coherent detail chrome and active-only project library across responsive sizes."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
addr=f'http://127.0.0.1:{server.server_address[1]}/'
def ok(x,desc):
 assert x,desc
 print('PASS:',desc,flush=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for w,h in [(320,700),(390,844),(768,1024),(1440,900)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
   page=ctx.new_page()
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   for slug in ['', 'projects/', 'projects/apaea-research-platform/', 'projects/priority-fix/', 'projects/boxes-by-swagify/', 'projects/php-class-utilities/']:
    response=page.goto(addr+slug+'?no3d=1',wait_until='domcontentloaded')
    ok(response.status==200,f'{w}px: {slug or "homepage"} loads')
    ok(page.locator('[data-site-header]').count()==1,f'{w}px: {slug or "homepage"} has shared navigation')
    ok(page.locator('[data-site-footer]').count()==1,f'{w}px: {slug or "homepage"} has shared footer')
    ok(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{w}px: {slug or "homepage"} no overflow')
    if w<=768:
     toggle=page.locator('[data-site-menu]')
     ok(toggle.is_visible(),f'{w}px: mobile menu available')
     ok(page.locator('#navigation').is_hidden(),f'{w}px: menu starts collapsed')
     toggle.click()
     ok(page.locator('#navigation').is_visible(),f'{w}px: menu expands')
     page.keyboard.press('Escape')
     ok(page.locator('#navigation').is_hidden(),f'{w}px: Escape closes menu')
     ok(toggle.get_attribute('aria-expanded')=='false',f'{w}px: aria state resets')
    else:ok(page.locator('.universal-nav').is_visible(),f'{w}px: desktop nav visible')
   page.goto(addr+'projects/',wait_until='domcontentloaded')
   ok(page.locator('.gc-entry').count()==38,f'{w}px: current directory has 38 entries')
   ok(page.locator('[data-filter="Archive only"]').count()==0,f'{w}px: no archive category in active work')
   if w in (390,1440):
    page.locator('[data-collection-search]').fill('Swagify')
    ok(page.locator('.gc-entry:visible').count()==1,f'{w}px: one Swagify product')
    page.locator('[data-collection-search]').fill('')
    page.locator('[data-filter="Developer tools"]').click()
    ok(page.locator('.gc-entry:visible').count()==1,f'{w}px: developer tools accurately categorized')
   page.goto(addr+'projects/hc/',wait_until='domcontentloaded')
   ok(page.locator('meta[name="robots"]').get_attribute('content')=='noindex,follow',f'{w}px: placeholder excluded from indexing')
   ok(not errors,f'{w}px: no script errors {errors!r}')
   ctx.close()
  browser.close()
finally:
 server.shutdown()
 server.server_close()
