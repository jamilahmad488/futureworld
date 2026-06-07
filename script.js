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
