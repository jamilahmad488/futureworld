/* FutureWorld Global Interface and Navigation - public site navigation */
(function(){
  const SITE='https://futureworldintelligence.org/';
  const url=(path='')=>new URL(path,SITE).href;
  const navItems={
    home:url(),
    course:url('courses/practical-ai-website-building/'),
    climate:url('pages/climate.html'),
    ai:url('pages/ai.html'),
    geopolitics:url('pages/geopolitics.html'),
    energy:url('pages/energy.html'),
    futures:url('pages/futures.html'),
    index:url('pages/intelligence-index.html'),
    command:url('pages/command-center.html'),
    resources:url('pages/resources.html'),
    gallery:url('pages/gallery.html'),
    connect:url('connect/'),
    intro:url('pages/intro.html'),
    about:url('pages/about.html'),
    privacy:url('pages/privacy.html'),
    logo:url('assets/logo.png')
  };

  function injectStyles(){
    if(document.getElementById('fwi-global-polish')) return;
    const css=document.createElement('style');
    css.id='fwi-global-polish';
    css.textContent=`
      .floating-nav{gap:8px;max-width:min(1080px,92vw);padding:11px 13px!important;border:1px solid rgba(77,243,255,.42)!important;background:rgba(2,6,23,.82)!important;box-shadow:0 0 36px rgba(77,243,255,.16),inset 0 0 0 1px rgba(255,255,255,.04)!important}
      .floating-nav .nav-group{position:relative;display:flex;align-items:center}.floating-nav a{position:relative;color:#f8fbff!important;-webkit-text-fill-color:#f8fbff!important;font-weight:900!important;text-shadow:0 0 12px rgba(77,243,255,.24);border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.045);letter-spacing:.02em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,background .22s ease!important}.floating-nav a:hover,.floating-nav a.active,.floating-nav .nav-trigger.active{transform:translateY(-3px) scale(1.08);z-index:3;border-color:rgba(77,243,255,.78)!important;background:linear-gradient(135deg,rgba(77,243,255,.24),rgba(179,140,255,.12))!important;box-shadow:0 0 22px rgba(77,243,255,.28),0 0 42px rgba(77,243,255,.10)}.floating-nav .brand-pill{border-color:rgba(77,243,255,.58)!important;background:linear-gradient(135deg,rgba(77,243,255,.22),rgba(57,255,156,.08))!important;box-shadow:0 0 24px rgba(77,243,255,.18)}.floating-nav .brand-pill span{color:#f8fbff!important;-webkit-text-fill-color:transparent!important;background-image:var(--startext);-webkit-background-clip:text;background-clip:text}.floating-nav .nav-trigger:after{content:'▾';display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;margin-left:8px;border-radius:50%;font-size:.82rem;color:#39e8ff;background:rgba(77,243,255,.18);border:1px solid rgba(77,243,255,.48);box-shadow:0 0 12px rgba(77,243,255,.24);transition:.22s ease}.floating-nav .nav-trigger.open:after,.floating-nav .nav-trigger:hover:after,.floating-nav .nav-trigger.active:after{background:rgba(57,255,156,.18);border-color:rgba(57,255,156,.58);color:#9fffc9;transform:rotate(180deg)}.floating-nav .nav-menu{position:absolute;top:calc(100% + 12px);left:0;min-width:245px;padding:10px;border:1px solid rgba(77,243,255,.45)!important;border-radius:22px;background:rgba(2,6,23,.97)!important;backdrop-filter:blur(18px);box-shadow:0 20px 70px rgba(0,0,0,.50),0 0 30px rgba(77,243,255,.16)!important;opacity:0;visibility:hidden;transform:translateY(8px);transition:.22s ease}.floating-nav .nav-menu-right{left:auto;right:0;min-width:210px}.floating-nav .nav-group:hover .nav-menu,.floating-nav .nav-group:focus-within .nav-menu,.floating-nav .nav-group.open .nav-menu{opacity:1;visibility:visible;transform:translateY(0)}.floating-nav .nav-menu a{display:block;border-radius:14px;padding:10px 12px;font-size:.76rem;white-space:nowrap}.floating-nav .nav-menu a:hover{transform:translateX(5px) scale(1.03)}.floating-nav .nav-connect{border:1px solid rgba(57,255,156,.34)!important;background:rgba(57,255,156,.10)!important}.fwi-return-home{position:fixed;right:18px;bottom:18px;z-index:8999;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;border:1px solid rgba(77,243,255,.42);background:rgba(2,6,23,.82);backdrop-filter:blur(14px);color:#f8fbff;text-decoration:none;font-family:var(--font-display);font-size:.72rem;box-shadow:0 0 20px rgba(77,243,255,.16);transition:.25s ease}.fwi-return-home:hover{transform:translateY(-3px) scale(1.06);border-color:rgba(57,255,156,.62);box-shadow:0 0 24px rgba(57,255,156,.18)}
      .intel-card:has(a),.metric-card:has(a),.signal:has(a),.mini-widget:has(a),.domain-card:has(a),.benefit-card:has(a){cursor:pointer;border-color:rgba(77,243,255,.25)!important}.intel-card:has(a):hover,.metric-card:has(a):hover,.signal:has(a):hover,.mini-widget:has(a):hover,.domain-card:has(a):hover,.benefit-card:has(a):hover{border-color:rgba(77,243,255,.58)!important;box-shadow:0 0 30px rgba(77,243,255,.16);transform:translateY(-8px) scale(1.015)}.intel-card:has(a)::after,.metric-card:has(a)::after,.signal:has(a)::after,.mini-widget:has(a)::after{content:'Open →';display:inline-block;margin-top:14px;color:#39e8ff;font-family:var(--font-display);font-size:.72rem;letter-spacing:.08em;opacity:.86}
      .fwi-mobile-nav,.fwi-mobile-sheet{display:none}@media(max-width:860px){body{padding-bottom:108px}.floating-nav{display:none!important}.ai-live-panel{display:none!important}.fwi-return-home{display:none!important}.fwi-mobile-nav{position:fixed;left:14px;right:14px;bottom:14px;z-index:9500;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:10px;border-radius:28px;border:1px solid rgba(77,243,255,.36);background:linear-gradient(135deg,rgba(5,12,30,.92),rgba(57,255,156,.16));backdrop-filter:blur(20px);box-shadow:0 0 34px rgba(77,243,255,.18),inset 0 0 0 1px rgba(255,255,255,.04)}.fwi-mobile-nav a,.fwi-mobile-nav button{border:1px solid rgba(255,255,255,.16);border-radius:22px;min-height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-decoration:none;color:#eaf8ff;background:rgba(255,255,255,.055);font-family:var(--font-display);font-size:10px;font-weight:900;letter-spacing:.02em;padding:6px;cursor:pointer}.fwi-mobile-nav a b,.fwi-mobile-nav button b{font-size:1.1rem}.fwi-mobile-sheet{position:fixed;left:16px;right:16px;bottom:102px;z-index:9499;padding:14px;border-radius:24px;border:1px solid rgba(77,243,255,.36);background:rgba(2,6,23,.96);backdrop-filter:blur(18px);box-shadow:0 0 34px rgba(77,243,255,.16);transform:translateY(14px);opacity:0;visibility:hidden;transition:.22s ease}.fwi-mobile-sheet.open{display:grid;grid-template-columns:1fr 1fr;gap:10px;transform:translateY(0);opacity:1;visibility:visible}.fwi-mobile-sheet a{display:block;text-decoration:none;color:#f8fbff;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:12px;background:rgba(255,255,255,.055);font-family:var(--font-display);font-size:12px;text-align:center}}
    `;
    document.head.appendChild(css);
  }

  function buildTopNav(){
    const nav=document.querySelector('.floating-nav');
    if(!nav) return;
    nav.innerHTML=`
      <a class="brand-pill" href="${navItems.home}"><img src="${navItems.logo}" alt="FutureWorld Intelligence logo"><span>FutureWorld</span></a>
      <div class="nav-group"><a class="nav-trigger" href="${navItems.index}">Intelligence</a><div class="nav-menu"><a href="${navItems.climate}">Climate</a><a href="${navItems.ai}">Artificial Intelligence</a><a href="${navItems.geopolitics}">Geopolitics</a><a href="${navItems.energy}">Energy</a><a href="${navItems.futures}">Futures</a><a href="${navItems.index}">Intelligence Index</a><a href="${navItems.command}">Command Center</a></div></div>
      <a class="nav-simple" href="${navItems.course}">Course</a><a class="nav-simple" href="${navItems.resources}">Resources</a><a class="nav-simple" href="${navItems.gallery}">Gallery</a><a class="nav-simple nav-connect" href="${navItems.connect}">Connect</a>
      <div class="nav-group"><a class="nav-trigger" href="${navItems.about}">About</a><div class="nav-menu nav-menu-right"><a href="${navItems.intro}">What is FWI?</a><a href="${navItems.about}">Mission & Values</a><a href="${navItems.privacy}">Privacy & Cookies</a></div></div>`;
    setActiveLinks(nav);
    enableTouchDropdowns(nav);
  }

  function setActiveLinks(root=document){
    const path=location.pathname.replace(/index\.html$/,'');
    root.querySelectorAll('a').forEach(a=>{
      const p=new URL(a.href).pathname.replace(/index\.html$/,'');
      if((path==='/'&&p==='/') || (path!=='/' && p===path)) a.classList.add('active');
    });
    root.querySelectorAll('.nav-group').forEach(group=>{if(group.querySelector('a.active')) group.querySelector('.nav-trigger')?.classList.add('active');});
  }

  function enableTouchDropdowns(nav){
    nav.querySelectorAll('.nav-trigger').forEach(trigger=>{
      trigger.addEventListener('click',e=>{
        if(window.matchMedia('(hover: none), (max-width: 860px)').matches){
          e.preventDefault();
          const group=trigger.closest('.nav-group');
          nav.querySelectorAll('.nav-group.open').forEach(g=>{if(g!==group)g.classList.remove('open');});
          nav.querySelectorAll('.nav-trigger.open').forEach(t=>{if(t!==trigger)t.classList.remove('open');});
          group.classList.toggle('open');
          trigger.classList.toggle('open');
        }
      });
    });
    document.addEventListener('click',e=>{if(!e.target.closest('.floating-nav')) nav.querySelectorAll('.open').forEach(el=>el.classList.remove('open'));});
  }

  function buildMobileNav(){
    if(document.querySelector('.fwi-mobile-nav')) return;
    const nav=document.createElement('nav');
    nav.className='fwi-mobile-nav';
    nav.setAttribute('aria-label','Mobile navigation');
    nav.innerHTML=`<a href="${navItems.home}"><b>⌂</b><span>Home</span></a><button type="button" data-sheet="intelligence"><b>✦</b><span>Intel</span></button><a href="${navItems.course}"><b>AI</b><span>Course</span></a><a href="${navItems.resources}"><b>□</b><span>Resources</span></a><a href="${navItems.connect}"><b>↗</b><span>Connect</span></a>`;
    document.body.appendChild(nav);
    const intelligence=document.createElement('div');
    intelligence.className='fwi-mobile-sheet';
    intelligence.dataset.sheet='intelligence';
    intelligence.innerHTML=`<a href="${navItems.climate}">Climate</a><a href="${navItems.ai}">AI</a><a href="${navItems.geopolitics}">Geopolitics</a><a href="${navItems.energy}">Energy</a><a href="${navItems.futures}">Futures</a><a href="${navItems.index}">Index</a><a href="${navItems.command}">Command Center</a><a href="${navItems.about}">About</a>`;
    document.body.appendChild(intelligence);
    nav.querySelectorAll('button[data-sheet]').forEach(btn=>btn.addEventListener('click',()=>{intelligence.classList.toggle('open');btn.classList.toggle('active');}));
  }

  function makeCardsClickable(){
    document.querySelectorAll('.intel-card,.metric-card,.signal,.mini-widget,.domain-card,.benefit-card').forEach(card=>{
      const link=card.querySelector('a[href]');
      if(!link || card.dataset.fwiCardReady) return;
      card.dataset.fwiCardReady='1';
      card.addEventListener('click',e=>{if(!e.target.closest('a')) location.href=link.href;});
    });
  }

  function addReturnHome(){
    if(location.pathname==='/' || document.querySelector('.fwi-return-home')) return;
    const a=document.createElement('a');
    a.className='fwi-return-home';
    a.href=navItems.home;
    a.textContent='← Main';
    document.body.appendChild(a);
  }

  function fixCourseLinks(){
    document.querySelectorAll('a[href*="courses/practical-ai-website-building"]').forEach(a=>{a.href=navItems.course;});
  }

  function init(){
    injectStyles();
    buildTopNav();
    buildMobileNav();
    makeCardsClickable();
    addReturnHome();
    fixCourseLinks();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  window.addEventListener('load',()=>document.body.classList.add('loaded'));
})();
