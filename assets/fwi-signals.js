/* FutureWorld functional desktop signal panel override */
(function(){
  function enhanceSignals(){
    var panel=document.querySelector('.ai-live-panel');
    if(!panel) return;
    panel.innerHTML='<strong>LIVE SOURCE SIGNALS</strong>'+
      '<a href="https://climate.nasa.gov/" target="_blank" rel="noopener"><span class="fwi-signal-dot"></span>Climate risk · NASA</a>'+
      '<a href="https://www.iea.org/" target="_blank" rel="noopener"><span class="fwi-signal-dot"></span>Energy systems · IEA</a>'+
      '<a href="https://public.wmo.int/" target="_blank" rel="noopener"><span class="fwi-signal-dot"></span>Weather & climate · WMO</a>'+
      '<a href="https://news.un.org/" target="_blank" rel="noopener"><span class="fwi-signal-dot"></span>Global updates · UN News</a>'+
      '<small>External free-source monitor. Opens trusted public sources in a new tab.</small>';
  }
  function styleSignals(){
    if(document.getElementById('fwi-signals-override-style')) return;
    var css=document.createElement('style');
    css.id='fwi-signals-override-style';
    css.textContent='.ai-live-panel{top:132px!important;left:18px!important;bottom:auto!important;width:228px!important;max-width:calc(100vw - 36px);padding:16px!important;border-radius:22px!important;background:rgba(2,6,23,.78)!important;border:1px solid rgba(77,243,255,.34)!important;box-shadow:0 0 30px rgba(77,243,255,.16)!important;backdrop-filter:blur(16px);animation:fwiFloatPanel 5s ease-in-out infinite}.ai-live-panel strong{display:block;color:#39e8ff;margin-bottom:10px;letter-spacing:.12em;font-family:var(--font-display);font-size:.76rem}.ai-live-panel a{display:block;text-decoration:none;color:#d8e7ff;padding:8px 9px;margin:7px 0;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);font-size:.78rem;line-height:1.25;transition:.2s}.ai-live-panel a:hover{transform:translateX(4px);border-color:rgba(57,255,156,.42);color:#f8fbff;background:rgba(57,255,156,.08);box-shadow:0 0 18px rgba(57,255,156,.12)}.ai-live-panel small{display:block;color:#89a3bf;font-size:.64rem;margin-top:8px;line-height:1.35}.fwi-signal-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;background:#39ff9c;box-shadow:0 0 9px rgba(57,255,156,.8)}@keyframes fwiFloatPanel{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@media(max-width:860px){.ai-live-panel{display:none!important}}';
    document.head.appendChild(css);
  }
  function init(){styleSignals(); setTimeout(enhanceSignals,250); setTimeout(enhanceSignals,900);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
