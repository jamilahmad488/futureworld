/* FutureWorld homepage dropdown button polish */
(function(){
  function injectNavPolish(){
    if(document.getElementById('fwi-nav-polish-style')) return;
    var css=document.createElement('style');
    css.id='fwi-nav-polish-style';
    css.textContent='.floating-nav .nav-group>.nav-trigger{display:inline-flex!important;align-items:center!important}.floating-nav .nav-group>.nav-trigger:after{content:"▾"!important;display:inline-grid!important;place-items:center!important;width:26px!important;height:26px!important;min-width:26px!important;margin-left:9px!important;border-radius:50%!important;font-size:.84rem!important;line-height:1!important;color:#dffcff!important;background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.24),rgba(77,243,255,.26),rgba(57,255,156,.09))!important;border:1px solid rgba(77,243,255,.72)!important;box-shadow:0 0 18px rgba(77,243,255,.42),inset 0 0 12px rgba(255,255,255,.08)!important;text-shadow:0 0 8px rgba(77,243,255,.9)!important;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,background .22s ease!important}.floating-nav .nav-group>.nav-trigger:hover:after,.floating-nav .nav-group>.nav-trigger.active:after,.floating-nav .nav-group>.nav-trigger.open:after{transform:rotate(180deg) scale(1.16)!important;border-color:rgba(57,255,156,.82)!important;background:radial-gradient(circle at 35% 25%,rgba(255,255,255,.30),rgba(57,255,156,.28),rgba(77,243,255,.12))!important;box-shadow:0 0 24px rgba(57,255,156,.46),0 0 42px rgba(77,243,255,.16),inset 0 0 14px rgba(255,255,255,.09)!important}.floating-nav .nav-group:hover>.nav-trigger:after{transform:rotate(180deg) scale(1.16)!important;border-color:rgba(57,255,156,.82)!important}';
    document.head.appendChild(css);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectNavPolish); else injectNavPolish();
})();
