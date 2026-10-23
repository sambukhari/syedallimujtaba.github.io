"""Section-visible, time-based AI concept sequence with accessible controls and responsive layout."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_address[1]}/?no3d=1'
def ok(value,label):
 assert value,label
 print('PASS:',label,flush=True)
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
  for w,h in [(1440,900),(1280,768),(1024,700),(768,1024),(390,844),(320,700),(1920,1080)]:
   ctx=browser.new_context(viewport={'width':w,'height':h})
   page=ctx.new_page()
   errors=[]
   page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
   page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(url,wait_until='domcontentloaded')
   width_check=page.evaluate("""() => ({width:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,offenders:[...document.querySelectorAll('body *')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName,cls:String(el.className||'').slice(0,110),id:el.id,right:Math.round(r.right),left:Math.round(r.left),width:Math.round(r.width),scroll:el.scrollWidth,client:el.clientWidth}}).filter(x=>x.right>innerWidth+3||x.left< -3).sort((a,b)=>b.right-a.right).slice(0,22)})""")
   if width_check['doc']>w:print('OVERFLOW DIAGNOSTICS:',width_check,flush=True)
   ok(width_check['doc']<=w,f'{w}x{h} fits viewport')
   intro=page.locator('#home .hero-intro-layout').bounding_box()
   flow=page.locator('#story-track').bounding_box()
   ok(intro['y']+intro['height']<=flow['y']+15,f'{w}x{h} hero and demo never overlap')
   ok(page.locator('.story-mobile-beat').count()==5,f'{w}x{h} all five stage controls present')
   if w in (1440,390):
    page.locator('#story-track').evaluate("(el)=>el.scrollIntoView({block:'center',behavior:'instant'})")
    page.wait_for_function("document.querySelector('#system-studio').dataset.step==='1'",timeout=6000)
    ok(True,f'{w} section visibility automatically advances past request')
    page.wait_for_function("document.querySelector('#system-studio').dataset.step==='4'",timeout=9000)
    ok(page.locator('#home').evaluate("(el)=>el.classList.contains('story-finished')"),f'{w} section sequence completes smoothly')
    ok(page.locator('[data-story-chapter="4"]').get_attribute('aria-pressed')=='true',f'{w} current stage announced')
    page.locator('[data-story-chapter="2"]').click()
    ok(page.locator('#system-studio').get_attribute('data-step')=='2',f'{w} manual stage selection works')
    page.wait_for_timeout(1600)
    ok(page.locator('#system-studio').get_attribute('data-step')=='2',f'{w} manual control stops automatic playback')
    page.locator('#work').scroll_into_view_if_needed()
    ok(page.locator('#work').is_visible(),f'{w} selected work remains reachable')
   ok(not errors,f'{w} no uncaught JS errors: {errors!r}')
   ctx.close()
  ctx=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
  page=ctx.new_page()
  page.goto(url,wait_until='domcontentloaded')
  page.locator('#story-track').evaluate("(el)=>el.scrollIntoView({block:'center',behavior:'instant'})")
  page.wait_for_function("document.querySelector('#system-studio').dataset.step==='4'",timeout=5000)
  ok(not page.locator('#system-studio').evaluate("(el)=>el.classList.contains('section-flowing')"),'reduced motion skips timed loops')
  page.locator('[data-story-chapter="1"]').click()
  ok(page.locator('#system-studio').get_attribute('data-step')=='1','reduced-motion manual selection remains usable')
  ctx.close();browser.close()
finally:
 server.shutdown();server.server_close()
