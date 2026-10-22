"""Portrait layout, asset integrity and motion regression in Chrome."""
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/?no3d=1'
def check(yes,message):
 assert yes,message
 print('PASS:',message,flush=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for width,height in [(320,700),(390,844),(768,1024),(1024,768),(1280,900),(1440,900),(1920,1080)]:
   context=browser.new_context(viewport={'width':width,'height':height})
   page=context.new_page()
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda err:errors.append(str(err)))
   page.goto(url,wait_until='domcontentloaded')
   page.wait_for_function("(() => { const p=document.querySelector('.hero-portrait-image');return p&&p.complete&&p.naturalWidth>0; })()",timeout=12000)
   head=page.locator('#home .hero-copy').bounding_box()
   portrait=page.locator('.hero-portrait-card').bounding_box()
   scene=page.locator('#system-studio').bounding_box()
   check(portrait['width']>180 and portrait['height']>220,f'{width}px portrait is visible')
   check(page.evaluate("document.documentElement.scrollWidth <= innerWidth"),f'{width}px has no horizontal overflow')
   check(portrait['y']+portrait['height']<=scene['y']+15,f'{width}px portrait ends before workflow')
   if width>=901:
    check(portrait['x']>head['x']+head['width']-18,f'{width}px portrait positioned right of heading')
   else:
    check(portrait['y']>=head['y']+head['height']-10,f'{width}px portrait follows heading on smaller screens')
   check(page.locator('#system-studio').get_attribute('data-step')=='0',f'{width}px scroll workflow still starts at stage one')
   check(not errors,f'{width}px JavaScript error-free: {errors!r}')
   context.close()
  context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
  page=context.new_page()
  page.goto(url,wait_until='domcontentloaded')
  check(page.locator('.hero-portrait-card').evaluate("(e)=>getComputedStyle(e).transitionDuration==='0s'"),'reduced-motion portrait stops tilting')
  context.close()
  browser.close()
finally:
 server.shutdown()
 server.server_close()
