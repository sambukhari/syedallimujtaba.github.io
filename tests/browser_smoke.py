"""Check exact assets in-memory. Requires Playwright and Chromium.
Set BROWSER_EXECUTABLE to an installed browser. This is not a deployment audit.
"""
from pathlib import Path
import json
import os
import re
import shutil
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'qa-output'
OUT.mkdir(exist_ok=True)
HTML = re.sub(r'<link[^>]+(?:stylesheet|icon)[^>]*>', '', (ROOT / 'index.html').read_text())
HTML = re.sub(r'<script src="[^"]+" defer></script>', '', HTML)
CSS = (ROOT / 'assets/css/style.css').read_text()
JS = (ROOT / 'assets/js/main.js').read_text()
results = []

def mount(browser, width=1440, javascript=True, reduced_motion='no-preference'):
    page = browser.new_page(viewport={'width': width, 'height': 1000}, reduced_motion=reduced_motion)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content(HTML)
    page.add_style_tag(content=CSS)
    if javascript:
        page.add_script_tag(content=JS)
    return page, errors

def check(condition, label):
    assert condition, label
    results.append(label)

def fits(page):
    return page.evaluate('document.documentElement.scrollWidth <= innerWidth')

with sync_playwright() as p:
    executable = os.environ.get('BROWSER_EXECUTABLE') or shutil.which('chromium')
    options = {'headless': True}
    if executable:
        options['executable_path'] = executable
    browser = p.chromium.launch(**options)
    for width in [320, 390, 640, 768, 820, 900, 1024, 1440, 1920]:
        page, errors = mount(browser, width)
        check(fits(page), f'Layout fits {width}px')
        page.locator('details').evaluate_all('(items) => items.forEach(e => e.open = true)')
        check(fits(page), f'Expanded details fit {width}px')
        check(not errors, f'No script errors at {width}px')
        page.close()
    page, errors = mount(browser)
    page.locator('[data-filter="web"]').click()
    check(page.locator('.project-card:visible').count() == 2, 'Web filter')
    check(page.locator('#filter-status').inner_text() == '2 projects shown.', 'Filter announcement')
    page.locator('[data-filter="mobile"]').click()
    check(page.locator('.project-card:visible').count() == 1, 'Mobile filter')
    page.locator('[data-filter="all"]').click()
    check(page.locator('.project-card:visible').count() == 3, 'All filter')
    page.locator('#ezead-marketplace summary').click()
    check(page.locator('#ezead-marketplace details').get_attribute('open') is not None, 'Native details')
    page.locator('#layer-controls [data-layer="systems"]').click()
    check(page.locator('#sculpture').get_attribute('data-layer') == 'systems', '3D layer control')
    check('Laravel' in page.locator('#layer-caption').inner_text(), 'Layer caption')
    page.locator('#motion-toggle').click()
    check(page.locator('#motion-toggle').get_attribute('aria-pressed') == 'false', 'Motion toggle')
    page.locator('#copy-email').click()
    check('Copy is unavailable' in page.locator('#copy-status').inner_text(), 'Honest clipboard failure')
    page.evaluate("Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async s=>{window.copiedEmail=s}}})")
    page.locator('#copy-email').click()
    check(page.evaluate('window.copiedEmail') == 'syedallimujtaba@gmail.com', 'Copied address')
    check(page.locator('#copy-status').inner_text() == 'Email address copied.', 'Copy announcement')
    check(not errors, 'No interaction errors')
    page.close()
    page, errors = mount(browser, 390)
    menu = page.locator('.menu-toggle')
    check(not page.locator('#site-nav').is_visible(), 'Mobile menu collapsed')
    menu.click()
    check(page.locator('#site-nav').is_visible(), 'Menu opens')
    page.keyboard.press('Escape')
    check(menu.get_attribute('aria-expanded') == 'false', 'Escape closes menu')
    check(page.evaluate('document.activeElement.classList.contains("menu-toggle")'), 'Focus returns to menu')
    menu.click()
    page.locator('#site-nav a[href="#projects"]').click()
    check(not page.locator('#site-nav').is_visible(), 'Menu closes on navigation')
    check(page.evaluate('document.activeElement.id') == 'projects', 'Destination receives focus')
    page.close()
    page, errors = mount(browser, 390, reduced_motion='reduce')
    check(page.locator('#motion-toggle').is_disabled(), 'Reduced motion respected')
    check(page.locator('#motion-toggle').get_attribute('aria-pressed') == 'false', 'Motion off under reduced preference')
    check(page.locator('#sculpture').evaluate('e => getComputedStyle(e).transitionDuration') == '0s', 'No reduced-motion transitions')
    page.close()
    for width in [320, 768, 1440]:
        page, errors = mount(browser, width, javascript=False)
        check(page.locator('.project-card').count() == 3, f'No-JS projects at {width}px')
        check(page.locator('#site-nav').is_visible(), f'No-JS navigation at {width}px')
        check(fits(page), f'No-JS layout at {width}px')
        check(not page.locator('#project-filters').is_visible(), f'No-JS filters hidden at {width}px')
        page.close()
    for label, width in [('desktop', 1440), ('tablet', 820), ('mobile', 390)]:
        page, _ = mount(browser, width)
        page.screenshot(path=str(OUT / f'{label}-full.png'), full_page=True)
        page.screenshot(path=str(OUT / f'{label}-hero.png'))
        page.close()
    browser.close()
(OUT / 'browser-results.json').write_text(json.dumps({'checks_passed': len(results), 'checks': results}, indent=2))
print(f'{len(results)} browser checks passed. Screenshots: {OUT}')
