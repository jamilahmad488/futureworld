/* FutureWorld source-connected AI Signal panel */
(function(){
  function enhanceSignals(){
    var panel=document.querySelector('.ai-live-panel');
    if(!panel) return;
    panel.innerHTML='<button class="fwi-signal-toggle" type="button"><span>Signals</span><b>Open</b></button><strong class="fwi-ai-signal-title">AI SIGNAL</strong>'+
      '<a href="https://www.ipcc.ch/" target="_blank" rel="noopener" title="IPCC climate science and assessment reports"><span class="fwi-signal-dot"></span><b>Climate Signal</b><em>Heatwaves, water stress, ecosystem risk and climate vulnerability.</em><small>Source: IPCC / NASA Climate</small></a>'+
      '<a href="https://www.iea.org/" target="_blank" rel="noopener" title="International Energy Agency energy transition analysis"><span class="fwi-signal-dot"></span><b>Energy Signal</b><em>Energy security, transition pressure, grid resilience and clean-energy integration.</em><small>Source: IEA</small></a>'+
      '<a href="https://www.weforum.org/reports/global-risks-report-2026/" target="_blank" rel="noopener" title="Global risk and geopolitical trend monitoring"><span class="fwi-signal-dot"></span><b>Geopolitical Signal</b><em>Multipolar shifts, regional instability, supply-chain pressure and strategic competition.</em><small>Source: WEF / UN News</small></a>'+
      '<a href="https://www.unesco.org/en/artificial-intelligence/recommendation-ethics" target="_blank" rel="noopener" title="UNESCO recommendation on the ethics of artificial intelligence"><span class="fwi-signal-dot"></span><b>AI Signal</b><em>Productivity, automation, ethical use, skills and responsible innovation.</em><small>Source: UNESCO / OECD</small></a>'+
      '<small class="fwi-signal-note">Curated strategic signals. Each item opens an authoritative public source.</small>';
  }
  function styleSignals(){
    if(document.getElementById('fwi-signals-override-style')) return;
    var css=document.createElement('style');
    css.id='fwi-signals-override-style';
    css.textContent='.ai-live-panel{top:132px!important;left:18px!important;bottom:auto!important;width:184px!important;max-width:calc(100vw - 36px);padding:11px 12px!important;border-radius:18px!important;background:rgba(2,6,23,.86)!important;border:1px solid rgba(77,243,255,.34)!important;box-shadow:0 0 24px rgba(77,243,255,.14)!important;backdrop-filter:blur(16px);animation:fwiFloatPanel 5s ease-in-out infinite;transition:width .24s ease,opacity .24s ease,transform .24s ease,visibility .24s ease,box-shadow .24s ease!important}.ai-live-panel.fwi-signal-hidden{opacity:.86!important;visibility:visible!important;pointer-events:auto!important;transform:none!important}.ai-live-panel.fwi-signal-open{width:224px!important;padding:14px!important;border-radius:22px!important;background:rgba(2,6,23,.94)!important;box-shadow:0 0 34px rgba(77,243,255,.18)!important}.ai-live-panel strong,.ai-live-panel .fwi-ai-signal-title{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;color:#39e8ff!important;margin:0!important;letter-spacing:.12em!important;font-family:var(--font-display)!important;font-size:0!important;-webkit-text-fill-color:#39e8ff!important;cursor:pointer!important}.ai-live-panel strong:before,.ai-live-panel .fwi-ai-signal-title:before{content:"SIGNALS";font-size:.72rem!important}.ai-live-panel strong:after,.ai-live-panel .fwi-ai-signal-title:after{content:"Open"!important;display:inline-block!important;font-size:.58rem!important;color:#c8f8ff!important;border:1px solid rgba(77,243,255,.35)!important;border-radius:999px!important;padding:3px 7px!important;background:rgba(77,243,255,.10)!important;letter-spacing:.08em!important}.ai-live-panel.fwi-signal-open strong:after,.ai-live-panel.fwi-signal-open .fwi-ai-signal-title:after{content:"Close"!important}.ai-live-panel a{position:relative!important;display:none!important;text-decoration:none!important;color:#d8e7ff!important;padding:9px 10px 9px 24px!important;margin:7px 0!important;border-radius:14px!important;border:1px solid rgba(255,255,255,.10)!important;background:rgba(255,255,255,.045)!important;line-height:1.25!important;transition:.2s!important}.ai-live-panel.fwi-signal-open a{display:block!important}.ai-live-panel a:hover{transform:translateX(4px);border-color:rgba(57,255,156,.42)!important;color:#f8fbff!important;background:rgba(57,255,156,.08)!important;box-shadow:0 0 18px rgba(57,255,156,.12)}.ai-live-panel a b{display:block!important;color:#f8fbff!important;font-size:.74rem!important;font-family:var(--font-display)!important;letter-spacing:.04em!important;margin-bottom:3px!important}.ai-live-panel a em{display:block!important;font-style:normal!important;color:#c9d8ea!important;font-size:.64rem!important;line-height:1.35!important}.ai-live-panel a small{display:block!important;color:#89e8ff!important;font-size:.59rem!important;margin-top:4px!important;letter-spacing:.02em!important}.ai-live-panel .fwi-signal-note{display:none!important;color:#89a3bf!important;font-size:.60rem!important;margin-top:8px!important;line-height:1.35!important}.ai-live-panel.fwi-signal-open .fwi-signal-note{display:block!important}.fwi-signal-dot{position:absolute!important;left:9px!important;top:15px!important;display:inline-block!important;width:8px!important;height:8px!important;border-radius:50%!important;background:#39ff9c!important;box-shadow:0 0 9px rgba(57,255,156,.8)!important}@media(min-width:1500px){.ai-live-panel.fwi-signal-open{width:292px!important;padding:16px!important}.ai-live-panel a b{font-size:.76rem!important}.ai-live-panel a em{font-size:.68rem!important}.ai-live-panel a small{font-size:.61rem!important}.ai-live-panel .fwi-signal-note{font-size:.62rem!important}}@keyframes fwiFloatPanel{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@media(max-width:860px){.ai-live-panel{display:none!important}}@media(max-width:380px){.ai-live-panel{display:none!important}}';
    css.textContent += '.ai-live-panel .fwi-signal-toggle{width:100%!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;border:0!important;background:transparent!important;color:#39e8ff!important;font-family:var(--font-display)!important;text-transform:uppercase!important;letter-spacing:.12em!important;cursor:pointer!important;padding:0!important;text-align:left!important}.ai-live-panel .fwi-signal-toggle span{font-size:.72rem!important}.ai-live-panel .fwi-signal-toggle b{font-size:.58rem!important;color:#c8f8ff!important;border:1px solid rgba(77,243,255,.35)!important;border-radius:999px!important;padding:3px 7px!important;background:rgba(77,243,255,.10)!important;letter-spacing:.08em!important}.ai-live-panel strong,.ai-live-panel .fwi-ai-signal-title{display:none!important}.ai-live-panel.fwi-signal-open .fwi-signal-toggle{margin-bottom:10px!important}.ai-live-panel.fwi-signal-open .fwi-signal-toggle b{border-color:rgba(57,255,156,.48)!important;background:rgba(57,255,156,.10)!important}';
    document.head.appendChild(css);
  }
  function syncSignalPanel(){
    var panel=document.querySelector('.ai-live-panel');
    if(!panel) return;
    var threshold=Math.min(520, Math.max(300, window.innerHeight * 0.55));
    if(window.scrollY > threshold){
      panel.classList.remove('fwi-signal-open');
      panel.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-label','Open FutureWorld signals');
    }
    panel.classList.toggle('fwi-signal-hidden', window.scrollY > threshold);
  }
  function init(){
    styleSignals();
    setTimeout(enhanceSignals,250); setTimeout(enhanceSignals,900); setTimeout(enhanceSignals,1500); setTimeout(enhanceSignals,2500);
    syncSignalPanel();
    window.addEventListener('scroll',syncSignalPanel,{passive:true});
    window.addEventListener('resize',syncSignalPanel);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
