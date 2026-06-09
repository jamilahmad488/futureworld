/* FutureWorld source-connected AI Signal panel */
(function(){
  function enhanceSignals(){
    var panel=document.querySelector('.ai-live-panel');
    if(!panel) return;
    panel.innerHTML='<strong>AI SIGNAL</strong>'+
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
    css.textContent='.ai-live-panel{top:132px!important;left:18px!important;bottom:auto!important;width:274px!important;max-width:calc(100vw - 36px);padding:16px!important;border-radius:22px!important;background:rgba(2,6,23,.82)!important;border:1px solid rgba(77,243,255,.34)!important;box-shadow:0 0 30px rgba(77,243,255,.16)!important;backdrop-filter:blur(16px);animation:fwiFloatPanel 5s ease-in-out infinite}.ai-live-panel strong{display:block;color:#39e8ff;margin-bottom:10px;letter-spacing:.12em;font-family:var(--font-display);font-size:.76rem}.ai-live-panel a{position:relative;display:block;text-decoration:none;color:#d8e7ff;padding:9px 10px 9px 24px;margin:7px 0;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);line-height:1.25;transition:.2s}.ai-live-panel a:hover{transform:translateX(4px);border-color:rgba(57,255,156,.42);color:#f8fbff;background:rgba(57,255,156,.08);box-shadow:0 0 18px rgba(57,255,156,.12)}.ai-live-panel a b{display:block;color:#f8fbff;font-size:.76rem;font-family:var(--font-display);letter-spacing:.04em;margin-bottom:3px}.ai-live-panel a em{display:block;font-style:normal;color:#c9d8ea;font-size:.68rem;line-height:1.35}.ai-live-panel a small{display:block;color:#89e8ff;font-size:.61rem;margin-top:4px;letter-spacing:.02em}.ai-live-panel .fwi-signal-note{display:block;color:#89a3bf;font-size:.62rem;margin-top:8px;line-height:1.35}.fwi-signal-dot{position:absolute;left:9px;top:15px;display:inline-block;width:8px;height:8px;border-radius:50%;background:#39ff9c;box-shadow:0 0 9px rgba(57,255,156,.8)}@keyframes fwiFloatPanel{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}@media(max-width:860px){.ai-live-panel{display:none!important}}';
    document.head.appendChild(css);
  }
  function init(){styleSignals(); setTimeout(enhanceSignals,250); setTimeout(enhanceSignals,900); setTimeout(enhanceSignals,1500);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
