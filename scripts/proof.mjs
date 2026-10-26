/* Evidence band: every figure is derived from the reviewed project inventory or the supplied CV timeline. */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=item=>Array.isArray(item.stack)?item.stack.join(' '):String(item.stack||'');
export const STACK_SIGNALS=[
 ['Laravel',/laravel/i],['PHP',/\bphp\b/i],['React Native',/react native/i],['Expo',/\bexpo\b/i],['Redux',/redux/i],
 ['Sanctum / token APIs',/sanctum|passport/i],['Stripe',/stripe/i],['Firebase',/firebase/i],['Inertia',/inertia/i],['TypeScript',/typescript/i]
];
export function proofStats(archive){
 const total=archive.length;
 const mobile=archive.filter(x=>/mobile/i.test(x.category||'')).length;
 const bars=STACK_SIGNALS.map(([label,re])=>({label,count:archive.filter(x=>re.test(text(x))).length})).filter(x=>x.count>0).sort((a,b)=>b.count-a.count).slice(0,8);
 return {total,mobile,bars};
}
export function renderProof(archive,skills){
 const {total,mobile,bars}=proofStats(archive);
 const stats=[[11,'+','Years building software','Feb 2015 – present, from the CV'],[8,'','Teams & employers','Across Pakistan, UK and Singapore work'],[total,'','Source-reviewed projects','Web, mobile, API and package repositories'],[mobile,'','Mobile applications','React Native, Expo and Flutter sources']];
 const marquee=[...skills.map(s=>s.name)].map(n=>`<span>${esc(n)}</span><b aria-hidden="true">✳</b>`).join('');
 return `<section class="section wrap proof" id="proof" aria-labelledby="proof-title">
 <div class="section-top"><p class="eyebrow">/ ENGINEERING AT A GLANCE</p><span class="micro">DERIVED FROM REAL INVENTORIES · NO INVENTED METRICS</span></div>
 <div class="proof-head"><h2 id="proof-title" data-reveal>Years of shipping.<br><span class="muted">Visible in the source.</span></h2><p data-reveal>Every figure below comes from the career timeline or the reviewed repository inventories. Counts describe source breadth, not production traffic, revenue or customers.</p></div>
 <div class="proof-grid">${stats.map(([n,s,l,d],i)=>`<article class="proof-card" data-reveal style="--i:${i}"><div class="proof-num"><span data-count="${n}">${n}</span><i>${s}</i></div><h3>${esc(l)}</h3><p>${esc(d)}</p><span class="proof-sheen" aria-hidden="true"></span></article>`).join('')}</div>
 <div class="proof-stack" data-reveal><div class="proof-stack-head"><div><p class="premium-kicker">STACK FOOTPRINT</p><h3>Where the code actually lives.</h3></div><p>Share of the ${total} reviewed projects whose source uses each technology.</p></div>
 <ul class="proof-bars">${bars.map((b,i)=>{const pct=Math.round(b.count/total*100);return `<li style="--i:${i}"><span class="bar-label">${esc(b.label)}</span><span class="bar-track" role="img" aria-label="${esc(b.label)}: ${b.count} of ${total} projects"><span class="bar-fill" data-bar="${pct}" style="--w:${pct}%"></span></span><span class="bar-value"><span data-count="${b.count}">${b.count}</span><small>/ ${total}</small></span></li>`}).join('')}</ul></div>
 <div class="marquee" aria-hidden="true"><div class="marquee-track"><div>${marquee}</div><div>${marquee}</div></div></div>
</section>`;
}
