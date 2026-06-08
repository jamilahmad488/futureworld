document.querySelectorAll('.floating-nav a').forEach(link=>{if(link.href===location.href)link.classList.add('active')});

window.addEventListener('load',()=>{document.body.classList.add('loaded')});

const revealObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:.14});
document.querySelectorAll('.dashboard-panel,.page-section,.intel-card,.metric-card,.signal,.mini-widget').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el)});

const translations={
  en:{mode:'Intelligence Mode: Active',grid:'Briefing Grid: Online',signals:'Future Signals: Monitoring',switch:'EN'},
  ur:{mode:'انٹیلی جنس موڈ: فعال',grid:'بریفنگ گرڈ: آن لائن',signals:'مستقبل کے اشارے: زیر نگرانی',switch:'UR'}
};
let lang='en';
function applyLanguage(){
  const t=translations[lang];
  document.querySelectorAll('.system-status span').forEach((item,index)=>{
    const text=[t.mode,t.grid,t.signals][index];
    if(text)item.innerHTML='<b></b> '+text;
  });
  const langBtn=document.querySelector('.lang-toggle');
  if(langBtn)langBtn.textContent=t.switch;
}
function getLoaderLogo(){
  const pageLogo=document.querySelector('.brand-pill img,.connect-logo,.gateway-logo,.hero-orbit img');
  if(pageLogo?.src)return pageLogo.src;
  const scriptBase=new URL('.',document.currentScript?.src||window.location.href);
  return new URL('assets/logo.png',scriptBase).href;
}
function createGlobalInterface(){
  const loader=document.createElement('div');
  loader.className='loading-gateway';
  loader.innerHTML='<div class="loader-core"><img src="'+getLoaderLogo()+'" alt="FutureWorld"><span>FutureWorld Intelligence</span><small>Initializing global intelligence systems</small></div>';
  document.body.prepend(loader);

  const map=document.createElement('div');
  map.className='intelligence-map';
  map.innerHTML='<span class="node n1"></span><span class="node n2"></span><span class="node n3"></span><span class="node n4"></span><span class="node n5"></span><i class="route r1"></i><i class="route r2"></i><i class="route r3"></i>';
  document.body.appendChild(map);

  const dashboard=document.createElement('aside');
  dashboard.className='ai-live-panel';
  dashboard.innerHTML='<strong>AI SIGNALS</strong><p><span></span> Climate Risk Scan</p><p><span></span> Energy Grid Monitor</p><p><span></span> Geopolitical Watch</p><p><span></span> Content System Online</p>';
  document.body.appendChild(dashboard);

  const toggle=document.createElement('button');
  toggle.className='lang-toggle';
  toggle.type='button';
  toggle.textContent='EN';
  toggle.addEventListener('click',()=>{lang=lang==='en'?'ur':'en';applyLanguage()});
  document.body.appendChild(toggle);
}
createGlobalInterface();
applyLanguage();

let tick=0;
setInterval(()=>{
  tick++;
  document.querySelectorAll('.ai-live-panel p').forEach((p,i)=>{
    const level=60+Math.round(Math.abs(Math.sin((tick+i)/5))*39);
    p.style.setProperty('--level',level+'%');
  });
},900);

/* FutureWorld Cookie Consent v1.0 */
(function(){
  const KEY="fwi_cookie_consent_v1";
  const GA_ID="G-Q12FMBHN20";

  function loadAnalytics(){
    if(window.fwiAnalyticsLoaded) return;
    window.fwiAnalyticsLoaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments);}
    const s=document.createElement("script");
    s.async=true;
    s.src="https://www.googletagmanager.com/gtag/js?id="+GA_ID;
    document.head.appendChild(s);
    gtag("js",new Date());
    gtag("config",GA_ID,{anonymize_ip:true});
  }

  function style(){
    const css=document.createElement("style");
    css.textContent=`
    .fwi-cookie{position:fixed;left:18px;right:18px;bottom:18px;z-index:99999;max-width:920px;margin:auto;padding:18px;border:1px solid rgba(77,243,255,.35);border-radius:22px;background:rgba(5,12,30,.96);color:#f8fbff;box-shadow:0 0 40px rgba(0,255,255,.18);font-family:Inter,Arial,sans-serif}
    .fwi-cookie p{margin:6px 0 14px;color:#cfe1f5;font-size:14px;line-height:1.5}
    .fwi-cookie strong{color:#9be7ff}
    .fwi-cookie a{color:#8fffc6}
    .fwi-cookie-actions{display:flex;gap:10px;flex-wrap:wrap}
    .fwi-cookie button{border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 14px;cursor:pointer;font-weight:800;color:white;background:rgba(255,255,255,.08)}
    .fwi-cookie .accept{background:linear-gradient(135deg,rgba(57,255,156,.3),rgba(77,243,255,.18))}
    .fwi-cookie .decline{background:rgba(255,255,255,.08)}
    .fwi-cookie-reset{position:fixed;left:14px;bottom:14px;z-index:99998;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:8px 11px;background:rgba(5,12,30,.72);color:#b9c7d9;font-size:12px;cursor:pointer}
    `;
    document.head.appendChild(css);
  }

  function showReset(){
    if(document.querySelector(".fwi-cookie-reset")) return;
    const b=document.createElement("button");
    b.className="fwi-cookie-reset";
    b.textContent="Cookie settings";
    b.onclick=function(){localStorage.removeItem(KEY);location.reload();};
    document.body.appendChild(b);
  }

  function banner(){
    style();
    const saved=localStorage.getItem(KEY);
    if(saved==="accepted"){loadAnalytics();showReset();return;}
    if(saved==="declined"){showReset();return;}

    const box=document.createElement("div");
    box.className="fwi-cookie";
    box.innerHTML=`<strong>Privacy & Cookie Notice</strong>
      <p>FutureWorld Intelligence uses essential site functions and optional analytics cookies to understand website traffic and improve educational, research and public-interest content. We do not use advertising cookies or sell visitor data.</p>
      <p><a href="/pages/privacy.html">Read Privacy & Cookie Policy</a></p>
      <div class="fwi-cookie-actions">
        <button class="accept">Accept analytics cookies</button>
        <button class="decline">Decline analytics cookies</button>
      </div>`;
    document.body.appendChild(box);

    box.querySelector(".accept").onclick=function(){
      localStorage.setItem(KEY,"accepted");
      box.remove();
      loadAnalytics();
      showReset();
    };
    box.querySelector(".decline").onclick=function(){
      localStorage.setItem(KEY,"declined");
      box.remove();
      showReset();
    };
  }

  if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",banner);}
  else{banner();}
})();
