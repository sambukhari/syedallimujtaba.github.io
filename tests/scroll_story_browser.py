"""End-to-end browser checks for V7's scroll story, graceful exit and motion preferences."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
import threading
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
thread=threading.Thread(target=server.serve_forever,daemon=True)
thread.start()
origin=f'http://127.0.0.1:{server.server_address[1]}/?no3d=1'

def check(condition,message):
    assert condition,message
    print('PASS:',message,flush=True)

def clean_externals(page):
    page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
    page.route('https://fonts.gstatic.com/**',lambda route:route.abort())

def current(page):
    return page.locator('#system-studio').get_attribute('data-step')

try:
    with sync_playwright() as driver:
        browser=driver.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1440,'height':980},reduced_motion='no-preference')
        page=context.new_page()
        clean_externals(page)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(origin,wait_until='domcontentloaded')
        page.wait_for_function("document.documentElement.classList.contains('scroll-story-enabled')",timeout=8000)
        check(page.locator('#story-track').is_visible(),'desktop storytelling loads')
        page.wait_for_function("document.querySelector('#system-studio').dataset.step === '0'",timeout=6000)
        check(current(page)=='0','automatic preview begins with request')
        page.evaluate("""() => {
          const track=document.getElementById('story-track'),sticky=track.querySelector('.story-sticky');
          const top=window.scrollY+track.getBoundingClientRect().top;
          const distance=track.offsetHeight-sticky.offsetHeight;
          window.scrollTo({top:top+distance*.50-90,behavior:'instant'});
        }""")
        page.wait_for_function("document.querySelector('#system-studio').dataset.step === '2'",timeout=4000)
        check(current(page)=='2','scroll progresses to tools and API phase')
        page.evaluate("""() => {
          const track=document.getElementById('story-track'),sticky=track.querySelector('.story-sticky');
          const top=window.scrollY+track.getBoundingClientRect().top;
          const distance=track.offsetHeight-sticky.offsetHeight;
          window.scrollTo({top:top+distance*.91-90,behavior:'instant'});
        }""")
        page.wait_for_function("document.querySelector('#system-studio').dataset.step === '4'",timeout=4000)
        check(page.locator('.story-section').evaluate("(e)=>e.classList.contains('story-finished')"),'final stage reveals next-section direction')
        page.locator('#work').scroll_into_view_if_needed()
        check(page.locator('#work').is_visible(),'normal scrolling reaches projects without being trapped')
        check(not errors,f'desktop JavaScript error free: {errors!r}')
        context.close()

        context=browser.new_context(viewport={'width':390,'height':844},reduced_motion='no-preference')
        page=context.new_page()
        clean_externals(page)
        page.goto(origin,wait_until='domcontentloaded')
        check(page.locator('.story-mobile-chapters').is_visible(),'mobile has accessible stacked workflow chapters')
        page.locator('[data-story-chapter="3"]').scroll_into_view_if_needed()
        page.wait_for_function("document.querySelector('#system-studio').dataset.step === '3'",timeout=4000)
        check(current(page)=='3','mobile scrolling explains human-review phase')
        check(page.evaluate("document.documentElement.scrollWidth <= innerWidth"),'mobile has no horizontal overflow')
        context.close()

        context=browser.new_context(viewport={'width':1440,'height':980},reduced_motion='reduce')
        page=context.new_page()
        clean_externals(page)
        page.goto(origin,wait_until='domcontentloaded')
        check(not page.evaluate("document.documentElement.classList.contains('scroll-story-enabled')"),'reduced-motion skips sticky scroll experience')
        page.locator('[data-stage="4"]').click()
        check(current(page)=='4','manual stage selection remains available with reduced motion')
        check(page.locator('#work').is_visible(),'projects remain discoverable with reduced motion')
        context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
