"""End-to-end Priority Fix tenant case study regression in Chrome."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/projects/priority-fix/'
def verify(result,name):
    assert result,name
    print('PASS:',name,flush=True)
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for width,height in [(320,700),(390,844),(768,1024),(1024,768),(1440,900),(1920,1080)]:
   context=browser.new_context(viewport={'width':width,'height':height})
   page=context.new_page()
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   response=page.goto(url,wait_until='domcontentloaded')
   verify(response.status==200,f'{width}: Priority Fix detail responds')
   verify(page.locator('#case-title').is_visible(),f'{width}: project hero visible')
   verify(page.evaluate("document.documentElement.scrollWidth<=innerWidth"),f'{width}: no horizontal overflow')
   verify(page.locator('.cs-module').count()==4,f'{width}: 4 listed existing capabilities')
   verify(page.locator('.pf-roadmap-card').count()==4,f'{width}: 4 planned-only roadmap cards')
   verify(page.locator('.pf-roadmap-status').all_inner_texts()==['PROPOSED · NOT BUILT']*4,f'{width}: proposed features not misrepresented')
   page.wait_for_function("document.querySelector('.pf-art img').complete&&document.querySelector('.pf-art img').naturalWidth>0",timeout=9000)
   verify(page.locator('.cs-gallery-item').count()==3,f'{width}: architecture gallery present')
   verify(not errors,f'{width}: no browser exceptions {errors!r}')
   if width in (390,1440):
    page.locator('#module-search').fill('video')
    verify(page.locator('.cs-module:not([hidden])').count()==1,f'{width}: source-feature search')
    page.locator('#module-search').fill('')
    verify(page.locator('.cs-module:not([hidden])').count()==4,f'{width}: all four capabilities restored')
    page.locator('[data-workflow="main"] [data-flow-step="2"]').click()
    verify('contractor' in page.locator('[data-workflow="main"] [data-flow-description]').inner_text().lower(),f'{width}: flow caption changes')
    page.locator('[data-gallery-open="0"]').click()
    verify(page.locator('#case-lightbox').is_visible(),f'{width}: gallery opens')
    page.locator('[data-gallery-next]').click()
    verify(page.locator('#case-lightbox-counter').inner_text().startswith('2 /'),f'{width}: gallery navigates')
    page.locator('[data-gallery-close]').click()
    verify(not page.locator('#case-lightbox').is_visible(),f'{width}: gallery closes')
   context.close()
  context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=context.new_page()
  page.goto(url,wait_until='domcontentloaded')
  verify(page.locator('.pf-roadmap-card').first.is_visible(),'reduced motion keeps planned scope readable')
  verify(page.locator('.cs-stage').first.is_visible(),'reduced motion keeps current journey accessible')
  context.close()
  browser.close()
finally:
 server.shutdown()
 server.server_close()
