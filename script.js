/* FutureWorld Global Interface and Navigation - v2 final polish */
(function(){
  const GA_ID="G-Q12FMBHN20";
  const COOKIE_KEY="fwi_cookie_consent_v1";
  let lang='en';
  const translations={
    en:{mode:'Intelligence Mode: Active',grid:'Briefing Grid: Online',signals:'Future Signals: Monitoring',switch:'EN'},
    ur:{mode:'انٹیلی جنس موڈ: فعال',grid:'بریفنگ گرڈ: آن لائن',signals:'مستقبل کے اشارے: زیر نگرانی',switch:'UR'}
  };

  function injectStyles(){
    if(document.getElementById('fwi-global-polish')) return;
    const css=document.createElement('style');
    css.id='fwi-global-polish';
    css.textContent=`
      .floating-nav{gap:8px;max-width:min(1060px,92vw);padding:11px 13px!important;border:1px solid rgba(77,243,255,.42)!important;background:rgba(2,6,23,.82)!important;box-shadow:0 0 36px rgba(77,243,255,.16), inset 0 0 0 1px rgba(255,255,255,.04)!important}
      .floating-nav .nav-group{position:relative;display:flex;align-items:center}
      .floating-nav a{position:relative;color:#f8fbff!important;-webkit-text-fill-color:#f8fbff!important;font-weight:900!important;text-shadow:0 0 12px rgba(77,243,255,.24);border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.045);letter-spacing:.02em;box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,background .22s ease!important}
      .floating-nav a:hover,.floating-nav a.active,.floating-nav .nav-trigger.active{transform:translateY(-3px) scale(1.08);z-index:3;border-color:rgba(77,243,255,.78)!important;background:linear-gradient(135deg,rgba(77,243,255,.24),rgba(179,140,255,.12))!important;box-shadow:0 0 22px rgba(77,243,255,.28),0 0 42px rgba(77,243,255,.10)}
      .floating-nav .brand-pill{border-color:rgba(77,243,255,.58)!important;background:linear-gradient(135deg,rgba(77,243,255,.22),rgba(57,255,156,.08))!important;box-shadow:0 0 24px rgba(77,243,255,.18)}
      .floating-nav .brand-pill span{color:#f8fbff!important;-webkit-text-fill-color:transparent!important;background-image:var(--startext);-webkit-background-clip:text;background-clip:text}
      .floating-nav .nav-trigger:after{content:'▾';display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;margin-left:8px;border-radius:50%;font-size:.82rem;color:#39e8ff;background:rgba(77,243,255,.18);border:1px solid rgba(77,243,255,.48);box-shadow:0 0 12px rgba(77,243,255,.24);transition:.22s ease}
      .floating-nav .nav-trigger.open:after,.floating-nav .nav-trigger:hover:after,.floating-nav .nav-trigger.active:after{background:rgba(57,255,156,.18);border-color:rgba(57,255,156,.58);color:#9fffc9;transform:rotate(180deg)}
      .floating-nav .nav-menu{position:absolute;top:calc(100% + 12px);left:0;min-width:245px;padding:10px;border:1px solid rgba(77,243,255,.45)!important;border-radius:22px;background:rgba(2,6,23,.97)!important;backdrop-filter:blur(18px);box-shadow:0 20px 70px rgba(0,0,0,.50),0 0 30px rgba(77,243,255,.16)!important;opacity:0;visibility:hidden;transform:translateY(8px);transition:.22s ease}
      .floating-nav .nav-menu-right{left:auto;right:0;min-width:210px}
      .floating-nav .nav-group:hover .nav-menu,.floating-nav .nav-group:focus-within .nav-menu,.floating-nav .nav-group.open .nav-menu{opacity:1;visibility:visible;transform:translateY(0)}
      .floating-nav .nav-menu a{display:block;border-radius:14px;padding:10px 12px;font-size:.76rem;white-space:nowrap}
      .floating-nav .nav-menu a:hover{transform:translateX(5px) scale(1.03)}
      .floating-nav .nav-connect{border:1px solid rgba(57,255,156,.34)!important;background:rgba(57,255,156,.10)!important}
      .fwi-return-home{position:fixed;right:18px;bottom:18px;z-index:8999;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:999px;border:1px solid rgba(77,243,255,.42);background:rgba(2,6,23,.82);backdrop-filter:blur(14px);color:#f8fbff;text-decoration:none;font-family:var(--font-display);font-size:.72rem;box-shadow:0 0 20px rgba(77,243,255,.16);transition:.25s ease}
      .fwi-return-home:hover{transform:translateY(-3px) scale(1.06);border-color:rgba(57,255,156,.62);box-shadow:0 0 24px rgba(57,255,156,.18)}
      .intel-card:has(a),.metric-card:has(a),.signal:has(a),.mini-widget:has(a),.domain-card:has(a),.benefit-card:has(a){cursor:pointer;border-color:rgba(77,243,255,.25)!important}
      .intel-card:has(a):hover,.metric-card:has(a):hover,.signal:has(a):hover,.mini-widget:has(a):hover,.domain-card:has(a):hover,.benefit-card:has(a):hover{border-color:rgba(77,243,255,.58)!important;box-shadow:0 0 30px rgba(77,243,255,.16);transform:translateY(-8px) scale(1.015)}
      .intel-card:has(a)::after,.metric-card:has(a)::after,.signal:has(a)::after,.mini-widget:has(a)::after{content:'Open →';display:inline-block;margin-top:14px;color:#39e8ff;font-family:var(--font-display);font-size:.72rem;letter-spacing:.08em;opacity:.86}
      .intel-card:not(:has(a)),.metric-card:not(:has(a)),.signal:not(:has(a)),.mini-widget:not(:has(a)){cursor:default}
      .intel-card:not(:has(a))::after,.metric-card:not(:has(a))::after,.signal:not(:has(a))::after,.mini-widget:not(:has(a))::after{content:'Info';display:inline-block;margin-top:14px;color:#9fb2ca;font-family:var(--font-display);font-size:.68rem;letter-spacing:.08em;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:4px 8px;background:rgba(255,255,255,.035)}
      .fwi-mobile-nav,.fwi-mobile-sheet{display:none}
      @media(max-width:860px){
        body{padding-bottom:108px}.floating-nav{display:none!important}.ai-live-panel{display:none!important}.fwi-return-home{display:none!important}
        .fwi-mobile-nav{position:fixed;left:14px;right:14px;bottom:14px;z-index:9500;display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:10px;border-radius:28px;border:1px solid rgba(77,243,255,.36);background:linear-gradient(135deg,rgba(5,12,30,.92),rgba(57,255,156,.16));backdrop-filter:blur(20px);box-shadow:0 0 34px rgba(77,243,255,.18), inset 0 0 0 1px rgba(255,255,255,.04)}
        .fwi-mobile-nav a,.fwi-mobile-nav button{border:1px solid rgba(255,255,255,.16);border-radius:22px;min-height:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-decoration:none;color:#eaf8ff;background:rgba(255,255,255,.055);font-family:var(--font-display);font-size:10px;font-weight:900;letter-spacing:.02em;padding:6px;cursor:pointer;transition:.22s ease}
        .fwi-mobile-nav a b,.fwi-mobile-nav button b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(77,243,255,.30);background:rgba(77,243,255,.12);font-size:14px;box-shadow:0 0 12px rgba(77,243,255,.14)}
        .fwi-mobile-nav a.active,.fwi-mobile-nav button.active,.fwi-mobile-nav a:active,.fwi-mobile-nav button:active{transform:translateY(-5px) scale(1.06);border-color:rgba(57,255,156,.52);box-shadow:0 0 20px rgba(57,255,156,.18);background:linear-gradient(135deg,rgba(57,255,156,.18),rgba(77,243,255,.12))}
        .fwi-mobile-sheet{position:fixed;left:16px;right:16px;bottom:102px;z-index:9499;padding:14px;border-radius:24px;border:1px solid rgba(77,243,255,.36);background:rgba(2,6,23,.96);backdrop-filter:blur(18px);box-shadow:0 0 34px rgba(77,243,255,.16);transform:translateY(14px);opacity:0;visibility:hidden;transition:.22s ease}
        .fwi-mobile-sheet.open{display:grid;grid-template-columns:1fr 1fr;gap:10px;transform:translateY(0);opacity:1;visibility:visible}
        .fwi-mobile-sheet a{display:block;text-decoration:none;color:#f8fbff;border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:12px;background:rgba(255,255,255,.055);font-family:var(--font-display);font-size:12px;text-align:center}
        .fwi-mobile-sheet a:active{transform:scale(.98);border-color:rgba(57,255,156,.48)}
        .lang-toggle{top:16px;right:16px}.fwi-cookie-reset{bottom:106px!important;left:12px!important}.fwi-cookie{bottom:104px!important}
      }
    `;
    document.head.appendChild(css);
  }

  function buildTopNav(){
    const nav=document.querySelector('.floating-nav');
    if(!nav) return;
    nav.innerHTML=`
      <a class="brand-pill" href="/"><img src="/assets/logo.png" alt="FutureWorld Intelligence logo"><span>FutureWorld</span></a>
      <div class="nav-group"><a class="nav-trigger" href="/pages/intelligence-index.html">Intelligence</a><div class="nav-menu"><a href="/pages/climate.html">Climate</a><a href="/pages/ai.html">Artificial Intelligence</a><a href="/pages/geopolitics.html">Geopolitics</a><a href="/pages/energy.html">Energy</a><a href="/pages/futures.html">Futures</a><a href="/pages/intelligence-index.html">Intelligence Index</a><a href="/pages/command-center.html">Command Center</a></div></div>
      <a class="nav-simple" href="/pages/resources.html">Resources</a><a class="nav-simple" href="/pages/gallery.html">Gallery</a><a class="nav-simple nav-connect" href="/connect/">Connect</a>
      <div class="nav-group"><a class="nav-trigger" href="/pages/about.html">About</a><div class="nav-menu nav-menu-right"><a href="/pages/intro.html">What is FWI?</a><a href="/pages/about.html">Mission & Values</a><a href="/pages/privacy.html">Privacy & Cookies</a></div></div>`;
    setActiveLinks(nav);
    enableTouchDropdowns(nav);
  }

  function setActiveLinks(root=document){
    const path=location.pathname.replace(/index\.html$/,'');
    root.querySelectorAll('a').forEach(a=>{
      const p=new URL(a.href,location.origin).pathname.replace(/index\.html$/,'');
      if((path==='/'&&p==='/') || (path!=='/' && p===path)) a.classList.add('active');
    });
    root.querySelectorAll('.nav-group').forEach(group=>{
      if(group.querySelector('a.active')) group.querySelector('.nav-trigger')?.classList.add('active');
    });
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
    document.addEventListener('click',e=>{
      if(!e.target.closest('.floating-nav')){
        nav.querySelectorAll('.nav-group.open').forEach(g=>g.classList.remove('open'));
        nav.querySelectorAll('.nav-trigger.open').forEach(t=>t.classList.remove('open'));
      }
    });
  }

  function buildMobileNav(){
    if(document.querySelector('.fwi-mobile-nav')) return;
    const nav=document.createElement('nav');
    nav.className='fwi-mobile-nav';
    nav.setAttribute('aria-label','Mobile navigation');
    nav.innerHTML=`
      <a href="/"><b>⌂</b><span>FutureWorld</span></a>
      <button type="button" data-sheet="intelligence"><b>◎</b><span>Intel</span></button>
      <a href="/pages/resources.html"><b>▣</b><span>Resources</span></a>
      <a href="/connect/"><b>↗</b><span>Connect</span></a>
      <button type="button" data-sheet="about"><b>i</b><span>About</span></button>`;
    document.body.appendChild(nav);

    const intelligence=document.createElement('div');
    intelligence.className='fwi-mobile-sheet';
    intelligence.dataset.sheet='intelligence';
    intelligence.innerHTML=`<a href="/pages/climate.html">Climate</a><a href="/pages/ai.html">AI</a><a href="/pages/geopolitics.html">Geopolitics</a><a href="/pages/energy.html">Energy</a><a href="/pages/futures.html">Futures</a><a href="/pages/intelligence-index.html">Index</a><a href="/pages/command-center.html">Command Center</a>`;
    document.body.appendChild(intelligence);

    const about=document.createElement('div');
    about.className='fwi-mobile-sheet';
    about.dataset.sheet='about';
    about.innerHTML=`<a href="/pages/intro.html">What is FWI?</a><a href="/pages/about.html">Mission & Values</a><a href="/pages/privacy.html">Privacy & Cookies</a>`;
    document.body.appendChild(about);

    setActiveLinks(nav);
    nav.querySelectorAll('button[data-sheet]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const name=btn.dataset.sheet;
        const sheet=document.querySelector('.fwi-mobile-sheet[data-sheet="'+name+'"]');
        const isOpen=sheet.classList.contains('open');
        document.querySelectorAll('.fwi-mobile-sheet.open').forEach(s=>s.classList.remove('open'));
        nav.querySelectorAll('button.active').forEach(b=>b.classList.remove('active'));
        if(!isOpen){sheet.classList.add('open');btn.classList.add('active');}
      });
    });
    document.addEventListener('click',e=>{
      if(!e.target.closest('.fwi-mobile-nav')&&!e.target.closest('.fwi-mobile-sheet')){
        document.querySelectorAll('.fwi-mobile-sheet.open').forEach(s=>s.classList.remove('open'));
        nav.querySelectorAll('button.active').forEach(b=>b.classList.remove('active'));
      }
    });
  }

  function getLoaderLogo(){
    const pageLogo=document.querySelector('.brand-pill img,.connect-logo,.gateway-logo,.hero-orbit img,.intro-logo');
    if(pageLogo?.src)return pageLogo.src;
    const scriptBase=new URL('.',document.currentScript?.src||window.location.href);
    return new URL('assets/logo.png',scriptBase).href;
  }

  function createGlobalInterface(){
    if(!document.querySelector('.loading-gateway')){
      const loader=document.createElement('div');
      loader.className='loading-gateway';
      loader.innerHTML='<div class="loader-core"><img src="'+getLoaderLogo()+'" alt="FutureWorld"><span>FutureWorld Intelligence</span><small>Initializing global intelligence systems</small></div>';
      document.body.prepend(loader);
    }
    if(!document.querySelector('.intelligence-map')){
      const map=document.createElement('div');
      map.className='intelligence-map';
      map.innerHTML='<span class="node n1"></span><span class="node n2"></span><span class="node n3"></span><span class="node n4"></span><span class="node n5"></span><i class="route r1"></i><i class="route r2"></i><i class="route r3"></i>';
      document.body.appendChild(map);
    }
    if(!document.querySelector('.ai-live-panel')){
      const dashboard=document.createElement('aside');
      dashboard.className='ai-live-panel';
      dashboard.innerHTML='<strong>AI SIGNALS</strong><p>Climate Risk Scan</p><p>Energy Grid Monitor</p><p>Geopolitical Watch</p><p>Content System Online</p>';
      document.body.appendChild(dashboard);
    }
    if(!document.querySelector('.lang-toggle')){
      const toggle=document.createElement('button');
      toggle.className='lang-toggle';
      toggle.type='button';
      toggle.textContent='EN';
      toggle.addEventListener('click',()=>{lang=lang==='en'?'ur':'en';applyLanguage();});
      document.body.appendChild(toggle);
    }
  }

  function applyLanguage(){
    const t=translations[lang];
    document.querySelectorAll('.system-status span').forEach((item,index)=>{
      const text=[t.mode,t.grid,t.signals][index];
      if(text)item.innerHTML='<b></b> '+text;
    });
    const langBtn=document.querySelector('.lang-toggle');
    if(langBtn)langBtn.textContent=t.switch;
  }

  function addReturnHome(){
    const path=location.pathname.replace(/index\.html$/,'');
    if(path==='/' || document.querySelector('.fwi-return-home')) return;
    const a=document.createElement('a');
    a.className='fwi-return-home';
    a.href='/';
    a.setAttribute('aria-label','Return to FutureWorld homepage');
    a.textContent='← Main';
    document.body.appendChild(a);
  }

  function makeCardsClickable(){
    const cards=document.querySelectorAll('.intel-card,.metric-card,.signal,.mini-widget,.domain-card,.benefit-card');
    cards.forEach(card=>{
      const link=card.querySelector('a[href]');
      if(!link || card.dataset.fwiCardReady) return;
      card.dataset.fwiCardReady='1';
      card.addEventListener('click',e=>{
        if(e.target.closest('a')) return;
        if(link.target==='_blank') window.open(link.href,'_blank','noopener');
        else location.href=link.href;
      });
    });
  }

  function revealInit(){
    if(!('IntersectionObserver' in window)) return;
    const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');}});},{threshold:.14});
    document.querySelectorAll('.dashboard-panel,.page-section,.intel-card,.metric-card,.signal,.mini-widget').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});
  }

  function loadAnalytics(){
    if(window.fwiAnalyticsLoaded) return;
    window.fwiAnalyticsLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments);};
    const s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;
    document.head.appendChild(s);
    gtag('js',new Date());
    gtag('config',GA_ID,{anonymize_ip:true});
  }

  function cookieConsent(){
    const saved=localStorage.getItem(COOKIE_KEY);
    if(saved==='accepted'){loadAnalytics();showCookieReset();return;}
    if(saved==='declined'){showCookieReset();return;}
    const box=document.createElement('div');
    box.className='fwi-cookie';
    box.innerHTML=`<strong>Privacy & Cookie Notice</strong><p>FutureWorld Intelligence uses essential site functions and optional analytics cookies to understand website traffic and improve educational, research and public-interest content. We do not use advertising cookies or sell visitor data.</p><p><a href="/pages/privacy.html">Read Privacy & Cookie Policy</a></p><div class="fwi-cookie-actions"><button class="accept">Accept analytics cookies</button><button class="decline">Decline analytics cookies</button></div>`;
    document.body.appendChild(box);
    box.querySelector('.accept').onclick=function(){localStorage.setItem(COOKIE_KEY,'accepted');box.remove();loadAnalytics();showCookieReset();};
    box.querySelector('.decline').onclick=function(){localStorage.setItem(COOKIE_KEY,'declined');box.remove();showCookieReset();};
  }

  function showCookieReset(){
    if(document.querySelector('.fwi-cookie-reset')) return;
    const b=document.createElement('button');
    b.className='fwi-cookie-reset';
    b.textContent='Cookie settings';
    b.onclick=function(){localStorage.removeItem(COOKIE_KEY);location.reload();};
    document.body.appendChild(b);
  }

  function analyticsEvents(){
    document.addEventListener('click',function(e){
      const link=e.target.closest('a');
      if(!link) return;
      const href=link.getAttribute('href')||'';
      const label=(link.getAttribute('aria-label')||link.innerText||'').trim();
      if(typeof gtag==='function'){
        if(href.includes('facebook.com')) gtag('event','social_click',{platform:'facebook',link_text:label});
        if(href.includes('instagram.com')) gtag('event','social_click',{platform:'instagram',link_text:label});
        if(href.includes('linkedin.com')) gtag('event','social_click',{platform:'linkedin',link_text:label});
        if(href.includes('youtube.com')) gtag('event','social_click',{platform:'youtube',link_text:label});
        if(href.includes('tiktok.com')) gtag('event','social_click',{platform:'tiktok',link_text:label});
        if(href.includes('substack.com')) gtag('event','newsletter_click',{platform:'substack',link_text:label});
        if(href.includes('wa.me')) gtag('event','contact_click',{platform:'whatsapp',link_text:label});
        if(href.includes('mailto:')) gtag('event','contact_click',{platform:'email',link_text:label});
      }
    });
  }

  function init(){
    injectStyles();
    buildTopNav();
    buildMobileNav();
    createGlobalInterface();
    applyLanguage();
    addReturnHome();
    makeCardsClickable();
    revealInit();
    cookieConsent();
    analyticsEvents();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  window.addEventListener('load',()=>document.body.classList.add('loaded'));
})();
