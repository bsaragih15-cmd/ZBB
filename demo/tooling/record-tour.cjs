const { chromium } = require('playwright-core')
const OUT = '/tmp/claude-0/-home-user-ZBB/598c1678-2c91-5280-81fb-6d99501cc51d/scratchpad/vid2'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function setup(page){
  await page.addStyleTag({ content:`
    #democursor{position:fixed;z-index:99999;left:0;top:0;width:26px;height:26px;margin:-4px 0 0 -4px;
      pointer-events:none;transition:left .9s cubic-bezier(.4,0,.2,1),top .9s cubic-bezier(.4,0,.2,1);
      filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))}
    #democursor.click{animation:dclick .4s ease}
    @keyframes dclick{0%{transform:scale(1)}40%{transform:scale(.7)}100%{transform:scale(1)}}
    #demoring{position:fixed;z-index:99998;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
      border:2px solid var(--teal,#2DD4BF);opacity:0;pointer-events:none;left:0;top:0}
    #demoring.pulse{animation:dring .6s ease}
    @keyframes dring{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.6)}}
    #democap{position:fixed;z-index:99999;left:50%;bottom:5vh;transform:translateX(-50%) translateY(10px);
      max-width:64vw;background:rgba(8,16,14,.9);border:1px solid rgba(45,212,191,.35);
      backdrop-filter:blur(8px);color:#DDE7E4;font-family:Inter,system-ui,sans-serif;font-size:23px;line-height:1.4;
      padding:14px 22px;border-radius:12px;opacity:0;transition:opacity .45s ease,transform .45s ease;
      box-shadow:0 12px 50px rgba(0,0,0,.5)}
    #democap.show{opacity:1;transform:translateX(-50%) translateY(0)}
    #democap .k{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#2DD4BF;display:block;margin-bottom:6px}
  `})
  await page.evaluate(() => {
    const cur = document.createElement('div'); cur.id='democursor'
    cur.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M4 2 L4 20 L9 15 L12.5 22 L15 21 L11.5 14 L19 14 Z" fill="#5EEAD4" stroke="#04120f" stroke-width="1.2"/></svg>'
    const ring = document.createElement('div'); ring.id='demoring'
    const cap = document.createElement('div'); cap.id='democap'
    document.body.append(ring, cur, cap)
    window.__cur = cur; window.__ring = ring; window.__cap = cap
    window.__moveCur = (x,y) => { cur.style.left=x+'px'; cur.style.top=y+'px'; ring.style.left=x+'px'; ring.style.top=y+'px'; }
    window.__click = () => { cur.classList.remove('click'); void cur.offsetWidth; cur.classList.add('click'); ring.classList.remove('pulse'); void ring.offsetWidth; ring.classList.add('pulse'); }
    window.__cap2 = (kicker,text) => { cap.innerHTML = (kicker?('<span class="k">'+kicker+'</span>'):'') + text; cap.classList.add('show') }
    window.__capHide = () => cap.classList.remove('show')
    window.__moveCur(960, 600)
  })
}

async function caption(page, kicker, text){ await page.evaluate(([k,t]) => window.__cap2(k,t), [kicker, text]) }
async function hideCap(page){ await page.evaluate(() => window.__capHide()) }
async function moveTo(page, sel, nth=0){
  const el = page.locator(sel).nth(nth)
  const box = await el.boundingBox()
  if(!box) return null
  const x = Math.round(box.x + box.width/2), y = Math.round(box.y + box.height/2)
  await page.evaluate(([x,y]) => window.__moveCur(x,y), [x,y])
  await sleep(950)
  return { el, x, y }
}
async function clickFx(page){ await page.evaluate(() => window.__click()); await sleep(120) }
async function moveToLoc(page, loc){
  const box = await loc.boundingBox(); if(!box) return false
  await page.evaluate(([x,y]) => window.__moveCur(x,y), [Math.round(box.x + box.width/2), Math.round(box.y + box.height/2)])
  await sleep(900); return true
}

;(async () => {
  const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--no-proxy-server'] })
  const ctx = await b.newContext({ viewport:{width:1920,height:1080}, recordVideo:{ dir: OUT, size:{width:1920,height:1080} } })
  const page = await ctx.newPage()
  await page.goto('http://localhost:5050/', { waitUntil:'load' })
  await page.waitForSelector('.scard'); await sleep(900)
  await setup(page)

  // 1 — intro
  await caption(page, 'MPI Cost Cockpit', 'Zero-based budgeting for a fleet of power plants — controllable O&amp;M, benchmarked.')
  await sleep(3200)

  // 2 — headline / entity cards
  await caption(page, '01 · Cross-asset', 'Two of three plants run above MRPR’s $45 / kW-yr best.')
  await moveTo(page, '.scard', 1)
  await sleep(2400)

  // 2b — like-for-like benchmark toggle
  await caption(page, 'Like-for-like', 'Normalize for plant size — strip the scale advantage out of the gap.')
  { const lf = page.locator('.seg button', { hasText: 'Like-for-like' }); await moveToLoc(page, lf); await clickFx(page); await lf.click() }
  await sleep(3000)

  // 3 — ambition + live dial
  await caption(page, 'Ambition', 'Set the ambition — capture the full gap to best.')
  { const s = page.locator('.seg button', { hasText: 'Stretch' }); await moveToLoc(page, s); await clickFx(page); await s.click() }
  await sleep(2200)
  await caption(page, 'Ambition', 'Or dial any capture share — the numbers update live.')
  { const base = page.locator('.seg button', { hasText: 'Base' }); await moveToLoc(page, base); await clickFx(page); await base.click() }
  await sleep(800)
  { await moveTo(page, 'input[type=range]')
    for (const v of [55,68,80,66,50]) {
      await page.evaluate((val) => { const r=document.querySelector('input[type=range]'); const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; set.call(r,val); r.dispatchEvent(new Event('input',{bubbles:true})) }, v)
      await sleep(360)
    } }
  await sleep(1200)

  // 4 — L3–L4 granularity
  await caption(page, '02 · L3–L4 per asset', 'Drill any plant — every cost block, decomposed and benchmarked to fleet best.')
  { const m = await moveTo(page, '.scard', 1); await clickFx(page); if(m) await m.el.click(); }
  await page.waitForSelector('tr.clickable'); await sleep(2400)
  await caption(page, 'L4 families', 'Expand a block to its driver families — the groupings each line rolls up to.')
  { const m = await moveTo(page, 'tr.clickable', 0); await clickFx(page); if(m) await m.el.click(); }
  await sleep(2600)

  // 5 — L5 granularity (booked vs should-cost)
  await caption(page, '03 · L5 per asset', 'Down to L5: Qty × Freq × Unit-rate × FX — booked vs should-cost, line by line.')
  { const t = page.locator('.tab', { hasText: 'L5 per asset' }); await moveToLoc(page, t); await clickFx(page); await t.click() }
  await page.waitForSelector('table'); await sleep(2800)
  await caption(page, 'Budget-ready', 'The granularity you’ll budget to — bottom-up, tied to SCM &amp; IPM.')
  await moveTo(page, 'table tbody tr', 1)
  await sleep(3000)

  // 6 — Challenge + write-back export
  await caption(page, '04 · Challenge', 'Log the call — accept, cut or defer with a ZBB lever.')
  { const t = page.locator('.tab', { hasText: 'Challenge' }); await moveToLoc(page, t); await clickFx(page); await t.click() }
  await page.waitForSelector('select'); await sleep(2400)
  { const lg = page.locator('button', { hasText: 'Log decision' }).first(); await moveToLoc(page, lg); await clickFx(page); await lg.click() }
  await sleep(1600)
  await caption(page, 'Write-back', 'Committed savings export to the IPM / SCM tracker, keyed on budget code.')
  { const ex = page.locator('button', { hasText: 'export write-back' }); await moveToLoc(page, ex) }
  await sleep(2600)

  // 7 — AI copilot
  await caption(page, '05 · AI Copilot', 'Ask the budget. The Copilot reasons over the real numbers.')
  { const t = page.locator('.tab', { hasText: 'Cross-asset' }); await moveToLoc(page, t); await clickFx(page); await t.click() }
  await sleep(900)
  await page.locator('.copilot button.pill', { hasText:'largest gap' }).scrollIntoViewIfNeeded()
  await sleep(500)
  { const m = await moveTo(page, '.copilot button.pill', 0); await clickFx(page); if(m) await m.el.click(); }
  await sleep(8500)

  // 8 — outro
  await caption(page, 'Backed · shared · live', 'Supabase · Claude · Vercel — the MPI Cost Cockpit.')
  await page.evaluate(() => window.__moveCur(960, 980))
  await sleep(3200)
  await hideCap(page); await sleep(600)

  const vpath = await page.video().path()
  await ctx.close(); await b.close()
  console.log('VIDEO=' + vpath)
})()
