"""Regression tests for responsive layout and scroll-only workflow (Chrome)."""
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/?no3d=1'
def yes(value,message):assert value,message;print('PASS:',message,flush=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for w,h in [(1440,900),(1280,768),(1024,700),(768,1024),(390,844),(320,700),(1920,1080)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},reduced_motion='no-preference')
   page=ctx.new_page();errors=[]
   page.route('https://fonts.googleapis.com/**',lambda r:r.abort())
   page.route('https://fonts.gstatic.com/**',lambda r:r.abort())
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url,wait_until='domcontentloaded')
   yes(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{w}x{h} fits viewport')
   intro=page.locator('#home .hero-copy').bounding_box()
   scene=page.locator('#system-studio').bounding_box()
   first=page.locator('[data-story-chapter="0"]').bounding_box()
   yes(intro['y']+intro['height']<=min(scene['y'],first['y'])+10,f'{w}x{h} intro does not overlap scene')
   yes(page.locator('#system-studio').get_attribute('data-step')=='0',f'{w}x{h} starts at request')
   if w==1440:
    page.wait_for_timeout(2300)
    yes(page.locator('#system-studio').get_attribute('data-step')=='0','no automatic advancement without scroll')
    for stage in [1,2,3,4]:
     page.locator(f'[data-story-chapter="{stage}"]').evaluate("(e)=>e.scrollIntoView({block:'center',behavior:'instant'})")
     page.wait_for_function(f"document.querySelector('#system-studio').dataset.step==='{stage}'",timeout=5000)
     yes(page.locator('#system-studio').get_attribute('data-step')==str(stage),f'scroll drives stage {stage}')
    yes(page.locator('#home').evaluate("(e)=>e.classList.contains('story-finished')"),'completion after final scroll')
    page.locator('#work').scroll_into_view_if_needed()
    yes(page.locator('#work').is_visible(),'projects reachable normally')
   if w==390:
    page.locator('[data-story-chapter="3"]').evaluate("(e)=>e.scrollIntoView({block:'center',behavior:'instant'})")
    page.wait_for_function("document.querySelector('#system-studio').dataset.step==='3'",timeout=5000)
    yes(page.locator('[data-story-chapter="3"]').get_attribute('data-current')=='true','mobile scroll stage updates')
   yes(not errors,f'{w}x{h} no JS errors: {errors!r}')
   ctx.close()
  ctx=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce');page=ctx.new_page()
  page.goto(url,wait_until='domcontentloaded')
  page.locator('[data-story-chapter="2"]').evaluate("(e)=>e.scrollIntoView({block:'center',behavior:'instant'})")
  page.wait_for_function("document.querySelector('#system-studio').dataset.step==='2'",timeout=5000)
  yes(True,'reduced motion still updates text as user scrolls')
  ctx.close();browser.close()
finally:server.shutdown();server.server_close()
