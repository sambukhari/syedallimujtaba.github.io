"""Real Chrome source and UI checks for only the 3 distinct Ashiq project case studies."""
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/'
def verify(value,label):
 assert value,label
 print('PASS:',label,flush=True)
try:
 with sync_playwright() as browser_tool:
  browser=browser_tool.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for width,height in [(320,700),(390,844),(768,1024),(1440,900)]:
   context=browser.new_context(viewport={'width':width,'height':height})
   page=context.new_page()
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(url+'projects/',wait_until='domcontentloaded')
   verify(page.locator('.gc-entry').count()==38,f'{width}: exactly 38 active project cards')
   verify(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{width}: archive fits width')
   if width in (390,1440):
    page.locator('[data-filter="Developer tools"]').click()
    verify(page.locator('.gc-entry:visible').count()==1,f'{width}: legacy PHP utility category')
    verify('PHP Class Utilities' in page.locator('.gc-entry:visible').inner_text(),f'{width}: correct utility card')
    page.locator('[data-filter="All"]').click()
    page.locator('[data-collection-search]').fill('swagify')
    verify(page.locator('.gc-entry:visible').count()==1,f'{width}: one Swagify product despite two repositories')
    page.locator('[data-collection-search]').fill('')
   for slug,count,term in [('boxes-by-swagify',8,'logo-related'),('resume-ezead',4,'testimonial'),('php-class-utilities',3,'friend')]:
    response=page.goto(url+'projects/'+slug+'/',wait_until='domcontentloaded')
    verify(response.status==200,f'{width}: {slug} page available')
    verify(page.locator('#case-title').is_visible(),f'{width}: {slug} heading')
    verify(page.locator('.cs-module').count()==count,f'{width}: {slug} source modules')
    verify(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'{width}: {slug} no overflow')
    page.wait_for_function("document.querySelector('.gc-hero-media img').complete&&document.querySelector('.gc-hero-media img').naturalWidth>0",timeout=8000)
    if slug=='boxes-by-swagify':
     verify(page.locator('.gc-companions').is_visible(),f'{width}: frontend/backend grouped visibly')
     verify(page.locator('.gc-companions a').count()==4,f'{width}: two source repositories and inventories')
     for src in ('sources/frontend/PROJECT_MODULES_AND_FEATURES.md','sources/backend/PROJECT_MODULES_AND_FEATURES.md'):
      verify(page.request.get(url+'projects/'+slug+'/'+src).status==200,f'{width}: original '+src+' accessible')
    if width in (390,1440):
     page.locator('#module-search').fill(term)
     verify(page.locator('.cs-module:not([hidden])').count()==1,f'{width}: {slug} search')
     page.locator('#module-search').fill('')
     page.locator('[data-gallery-open="0"]').click()
     verify(page.locator('#case-lightbox').is_visible(),f'{width}: {slug} gallery opens')
     page.locator('[data-gallery-next]').click()
     verify(page.locator('#case-lightbox-counter').inner_text()=='2 / 2',f'{width}: {slug} gallery navigation')
     page.locator('[data-gallery-close]').click()
     verify(not page.locator('#case-lightbox').is_visible(),f'{width}: {slug} gallery closes')
   verify(not errors,f'{width}: no JS exceptions {errors!r}')
   context.close()
  context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='reduce')
  page=context.new_page();page.goto(url+'?no3d=1',wait_until='domcontentloaded')
  verify(page.locator('.gc-entry').count()==6,'homepage contains six curated case studies')
  verify(page.locator('.gc-explore-link').is_visible(),'deduplicated project directory has visible entry point')
  page.goto(url+'projects/boxes-by-swagify/',wait_until='domcontentloaded')
  verify(page.locator('.gc-companions').is_visible(),'reduced motion keeps grouped source links')
  context.close();browser.close()
finally:
 server.shutdown()
 server.server_close()
