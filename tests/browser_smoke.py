"""Offline Chromium checks of real HTML/CSS/behavior and CSS-3D fallback.
Network navigation and WebGL are blocked in the available execution environment.
Only file transport is substituted: local SVG uses become inline paths. No UI
behavior or scene geometry is mocked. This does not certify the Three.js path.
"""
from pathlib import Path
import re,json,xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];OUT=R/'qa-output';OUT.mkdir(exist_ok=True)
ET.register_namespace('', 'http://www.w3.org/2000/svg')
HTML=(R/'index.html').read_text();HTML=re.sub(r'<link[^>]*>','',HTML);HTML=re.sub(r'<script[^>]*>[\s\S]*?</script>','',HTML);HTML=HTML.replace('<head>','<head><base href="https://portfolio.test/">')
symbols={s.attrib['id']:s for s in ET.parse(R/'assets/images/symbols.svg').getroot()}
def inline(m):
 s=symbols[m.group(1)];return '<svg aria-hidden="true" viewBox="'+s.attrib['viewBox']+'">'+''.join(ET.tostring(c,encoding='unicode') for c in s)+'</svg>'
HTML=re.sub(r'<svg[^>]*><use href="assets/images/symbols.svg#([^"]+)"></use></svg>',inline,HTML)
CSS=(R/'assets/css/style.css').read_text();JS=(R/'assets/js/main.js').read_text();results=[]
def check(condition,label):
 if not condition:raise AssertionError(label)
 results.append(label);print(f"PASS {len(results)}: {label}",flush=True)
def mount(browser,width=1440,javascript=True,reduced='reduce'):
 ctx=browser.new_context(viewport={'width':width,'height':1000},java_script_enabled=javascript,reduced_motion=reduced)
 page=ctx.new_page();page.set_default_timeout(6000);page.route('**/*',lambda route:route.abort());errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(HTML.replace('</head>','<style>'+CSS+'</style></head>'),wait_until='domcontentloaded')
 if javascript:
  page.add_script_tag(content=JS)
  # In-memory pages have about:blank origin; preserve hash click behavior without blocked navigation.
  page.evaluate("document.addEventListener('click',e=>{if(e.target.closest('a[href^=\"#\"]'))e.preventDefault()})")
 return page,errors,ctx
def fits(p):return p.evaluate('document.documentElement.scrollWidth<=innerWidth')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],headless=True)
 for width in [320,360,390,620,768,1024,1280,1440,1920]:
  page,errors,ctx=mount(browser,width)
  check(fits(page),f'{width}px: no horizontal overflow')
  page.locator('details').evaluate_all('(items)=>items.forEach(e=>e.open=true)')
  check(fits(page),f'{width}px: expanded details fit')
  check(page.locator('.skill').count()==29,f'{width}px: all skill entries present')
  check(not errors,f'{width}px: no behavior exceptions');ctx.close()
 page,errors,ctx=mount(browser)
 for kind,count in [('ai',3),('backend',7),('frontend',9),('cloud',10),('all',29)]:
  page.locator(f'[data-filter="{kind}"]').click()
  check(page.locator('.skill:visible').count()==count,f'{kind}: correct filter count')
  check(str(count) in page.locator('#skill-status').inner_text(),f'{kind}: result announced')
 page.locator('[data-mode="web"]').last.click();check('boundaries' in page.locator('#stage-title').inner_text(),'Web mode explains API boundaries')
 page.locator('[data-mode="mobile"]').last.click();check('React Native' in page.locator('#stage-description').inner_text(),'Mobile mode explains delivery')
 page.locator('.segmented [data-mode="ai"]').click()
 for stage in range(5):
  page.locator(f'[data-stage="{stage}"]').click();check(page.locator('#system-studio').get_attribute('data-step')==str(stage),f'System stage {stage} selectable')
 page.locator('#play-flow').click();check(page.locator('#system-studio').get_attribute('data-step')=='3','Reduced motion jumps to review without autoplay')
 check('Approve' in page.locator('#play-flow').inner_text(),'Flow requires explicit human approval')
 page.locator('#play-flow').click();check(page.locator('#system-studio').get_attribute('data-step')=='4','Approval reaches delivery')
 check('No external action' in page.locator('#model-status').inner_text(),'Simulation does not claim real actions')
 page.locator('#rotate-model').click();check('14deg' in (page.locator('.model-assembly').get_attribute('style')or''),'Model rotation control changes geometry orientation')
 check(page.locator('#motion-toggle').is_disabled(),'OS reduced-motion preference enforced')
 page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}})")
 page.locator('#copy-email').click();page.wait_for_timeout(80);check('unavailable' in page.locator('#copy-status').inner_text().lower(),'Clipboard refusal reported honestly')
 page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>window.copied=s}})")
 page.locator('#copy-email').click();page.wait_for_timeout(80);check(page.evaluate('window.copied')=='syedallimujtaba@gmail.com','Correct contact address copied')
 page.locator('#copy-inquiry').click();page.wait_for_timeout(80);check(page.locator('#inquiry-name').evaluate('(e)=>!e.validity.valid'),'Empty inquiry fails native validation')
 page.locator('#inquiry-name').fill('Test Person');page.locator('#inquiry-email').fill('person@example.org');page.locator('#inquiry-message').fill('A useful workflow for our engineering team & its customers.')
 page.locator('#copy-inquiry').click();page.wait_for_timeout(80);check('A useful workflow' in page.evaluate('window.copied'),'Inquiry copies actual message')
 check('person@example.org' in page.evaluate('window.copied'),'Inquiry includes reply address')
 page.evaluate("Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}})")
 page.locator('#copy-inquiry').click();page.wait_for_timeout(80);check(page.locator('#copy-fallback').is_visible(),'Manual copy fallback appears on permission denial')
 check('copy it manually' in page.locator('#form-status').inner_text(),'Manual fallback explains action')
 mail_status=page.evaluate("() => { document.querySelector('#contact-form').requestSubmit(); return document.querySelector('#form-status').textContent; }");check('Nothing was sent by this website' in mail_status,'Mailto action never reports delivery')
 check(not errors,'Full behavior pass: no uncaught script exceptions');ctx.close()
 page,errors,ctx=mount(browser,390)
 check(page.locator('#navigation').is_hidden(),'Mobile navigation initially collapsed')
 page.locator('.menu-toggle').click();check(page.locator('#navigation').is_visible(),'Mobile navigation opens')
 page.keyboard.press('Escape');check(page.locator('#navigation').is_hidden(),'Escape closes mobile menu')
 check(page.locator('.menu-toggle').evaluate('(e)=>document.activeElement===e'),'Escape restores trigger focus')
 page.locator('.menu-toggle').click();page.locator('#navigation a[href="#work"]').click();check(page.locator('#navigation').is_hidden(),'Menu selection closes disclosure')
 check(page.evaluate('document.activeElement.id')=='work','Selected destination receives focus')
 check(page.locator('#inquiry-email').evaluate('(e)=>getComputedStyle(e).fontSize')=='16px','Mobile form uses readable non-zooming text size');ctx.close()
 page,errors,ctx=mount(browser,reduced='no-preference')
 page.locator('#play-flow').click();page.wait_for_timeout(3500)
 check(page.locator('#system-studio').get_attribute('data-step')=='3','Animated sequence stops at human checkpoint')
 page.locator('.segmented [data-mode="web"]').click();check('Play' in page.locator('#play-flow').inner_text(),'Mode switch cancels pending approval')
 page.locator('#play-flow').click();page.locator('#contact').scroll_into_view_if_needed();page.wait_for_timeout(100)
 check('Play' in page.locator('#play-flow').inner_text(),'Flow stops when offscreen')
 page.locator('#motion-toggle').click();check(page.locator('#motion-toggle').get_attribute('aria-pressed')=='false','Visitor can disable motion')
 check(not errors,'Animation lifecycle: no behavior errors');ctx.close()
 for width in [360,768,1440]:
  page,errors,ctx=mount(browser,width,javascript=False)
  check(fits(page),f'{width}px no-JS layout fits')
  check(page.locator('#navigation').is_visible(),f'{width}px no-JS navigation remains visible')
  check(page.locator('.case-study').count()==3,f'{width}px no-JS project details are native HTML')
  check(page.locator('#system-view .scene-fallback').is_visible(),f'{width}px no-JS architectural model visible')
  check(page.locator('#inquiry-name').is_hidden(),f'{width}px no-JS composer cannot submit data accidentally');ctx.close()
 for width,name in [(1440,'desktop'),(768,'tablet'),(390,'mobile')]:
  page,errors,ctx=mount(browser,width);page.wait_for_timeout(300)
  page.screenshot(path=str(OUT/f'{name}-hero.png'));page.screenshot(path=str(OUT/f'{name}-full.png'),full_page=True)
  if name=='desktop':
   for section in ['stack','work','contact']:
    page.locator('#'+section).screenshot(path=str(OUT/f'{section}.png'))
  ctx.close()
 browser.close()
(OUT/'browser-results.json').write_text(json.dumps({'passed':len(results),'checks':results,'limits':['Offline in-memory transport; no deployed HTTP test','CSS-3D fallback exercised; WebGL unavailable','No Lighthouse/field performance or WCAG certification']},indent=2))
print(f'{len(results)} browser checks passed')
