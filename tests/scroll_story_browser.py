"""Chapter-driven scrolling, manual compact controls and responsive layout in Chrome."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading

from playwright.sync_api import expect, sync_playwright

root = Path(__file__).resolve().parents[1]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_address[1]}/?no3d=1'
# Include both sides of the width AND height cutoffs for the sticky scroll experience.
viewports = [(1440, 900), (1280, 768), (1024, 700), (768, 1024), (390, 844),
             (320, 700), (1920, 1080), (980, 800), (981, 800), (1200, 639), (1200, 640)]
titles = ['Understand the problem first.', 'Design the system, not just the screen.',
          'Build across web and mobile.', 'Integrate, then verify.', 'Lead and ship.']


def ok(value, label):
    assert value, label
    print('PASS:', label, flush=True)


def chapter(page, stage):
    return page.locator(f'[data-story-chapter="{stage}"]')


def assert_stage(page, stage):
    # Observer delivery and smooth scrolling are asynchronous. Check the public UI,
    # including main.js's caption, so a dataset-only update cannot satisfy the test.
    expect(page.locator('#system-studio')).to_have_attribute('data-step', str(stage))
    expect(page.locator('#scroll-story-step')).to_have_text(f'{stage + 1:02d} / 05')
    expect(page.locator('#stage-title')).to_have_text(titles[stage])
    for i in range(5):
        selected = str(i == stage).lower()
        expect(chapter(page, i)).to_have_attribute('aria-pressed', selected)
        expect(chapter(page, i)).to_have_attribute('data-current', selected)
        expect(chapter(page, i)).to_have_attribute('data-past', str(i < stage).lower())
        expect(page.locator(f'#story-track [data-stage="{i}"]')).to_have_attribute('aria-pressed', selected)
    ok(page.locator('#home').evaluate('(el)=>el.classList.contains("story-finished")') == (stage == 4),
       f'stage {stage + 1} caption, controls and completion state agree')


def scroll_to_chapter(page, stage):
    chapter(page, stage).evaluate("(el)=>el.scrollIntoView({block:'center',behavior:'instant'})")
    assert_stage(page, stage)


def wait_for_chapter_center(page, stage):
    # A chip updates main.js immediately; also require its scroll to reach the chapter.
    page.wait_for_function("""stage => {
        const el = document.querySelector(`[data-story-chapter="${stage}"]`);
        const r = el.getBoundingClientRect(), root = getComputedStyle(document.documentElement);
        // scrollIntoView centers within the scrollport after the fixed-header padding.
        const center = (innerHeight + parseFloat(root.scrollPaddingTop || 0)
                        - (parseFloat(root.scrollPaddingBottom) || 0)) / 2;
        return Math.abs(r.top + r.height / 2 - center) < 10;
    }""", arg=stage)


def stays_at_stage(page, stage):
    # Deliberate idle interval: merely entering the story must never start a timer.
    page.wait_for_timeout(2200)
    assert_stage(page, stage)


def exercise_story(page, wide):
    assert_stage(page, 0)
    if wide:
        for stage in range(5):
            scroll_to_chapter(page, stage)
            if stage == 1:
                stays_at_stage(page, stage)
        # Scroll backwards as well: completion must clear and earlier stages return.
        for stage in range(3, -1, -1):
            scroll_to_chapter(page, stage)
        ok(page.locator('.story-sticky').evaluate('(el)=>getComputedStyle(el).position') == 'sticky',
           'wide diagram remains sticky')
        chapter(page, 2).click()
        wait_for_chapter_center(page, 2)
        assert_stage(page, 2)
        page.locator('#story-track [data-stage="1"]').click()
        wait_for_chapter_center(page, 1)
        assert_stage(page, 1)
    else:
        page.locator('#story-track').evaluate("(el)=>el.scrollIntoView({block:'center',behavior:'instant'})")
        stays_at_stage(page, 0)
        for stage in range(5):
            chapter(page, stage).click()
            assert_stage(page, stage)
        chapter(page, 2).focus()
        chapter(page, 2).press('Enter')
        assert_stage(page, 2)
        chapter(page, 4).evaluate("(el)=>el.scrollIntoView({block:'center',behavior:'instant'})")
        stays_at_stage(page, 2)
        page.locator('#story-track [data-stage="1"]').click()
        assert_stage(page, 1)
    page.locator('#work').scroll_into_view_if_needed()
    expect(page.locator('#work')).to_be_in_viewport()


try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel='chrome', headless=True, args=['--no-sandbox'])
        for reduced, sizes in [(False, viewports), (True, [(1440, 900), (390, 844)])]:
            for w, h in sizes:
                name = f'{w}x{h}' + (' reduced motion' if reduced else '')
                print('CHECK:', name, flush=True)
                ctx = browser.new_context(viewport={'width': w, 'height': h},
                                          reduced_motion='reduce' if reduced else 'no-preference')
                page = ctx.new_page()
                errors = []
                page.route('https://fonts.googleapis.com/**', lambda route: route.abort())
                page.route('https://fonts.gstatic.com/**', lambda route: route.abort())
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(url, wait_until='load')
                ok(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'{name} fits viewport')
                intro = page.locator('#home .hero-intro-layout').bounding_box()
                flow = page.locator('#story-track').bounding_box()
                ok(intro['y'] + intro['height'] <= flow['y'] + 15, f'{name} hero and demo never overlap')
                ok(page.locator('.story-mobile-beat').count() == 5, f'{name} all five stage controls present')
                exercise_story(page, w >= 981 and h >= 640)
                if reduced:
                    ok(chapter(page, 1).evaluate('(el)=>getComputedStyle(el).transitionDuration') == '0s',
                       f'{name} chapter transitions disabled')
                # Exercise disconnect/reconnect on a live page, rather than only fresh loads.
                if (w, h) == (1440, 900) and not reduced:
                    page.set_viewport_size({'width': 390, 'height': 844})
                    chapter(page, 2).click()
                    assert_stage(page, 2)
                    chapter(page, 4).evaluate("(el)=>el.scrollIntoView({block:'center',behavior:'instant'})")
                    stays_at_stage(page, 2)
                    page.set_viewport_size({'width': 1440, 'height': 900})
                    scroll_to_chapter(page, 0)
                    scroll_to_chapter(page, 3)
                    ok(True, 'resizing restores scroll-driven progression')
                ok(not errors, f'{name} no uncaught JS errors: {errors!r}')
                ctx.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
