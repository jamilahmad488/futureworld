/* FutureWorld Intelligence — responsive Leaflet viewport repair v1.0 */
(function(){
  'use strict';

  if(typeof window.L==='undefined'||!window.L.Map||window.__FWI_LEAFLET_RESIZE_FIX__)return;
  window.__FWI_LEAFLET_RESIZE_FIX__=true;

  const L=window.L;
  const originalInitialize=L.Map.prototype.initialize;
  const originalRemove=L.Map.prototype.remove;
  const stateByMap=new WeakMap();

  function redrawGridLayers(map){
    map.eachLayer(function(layer){
      if(layer instanceof L.GridLayer&&typeof layer.redraw==='function')layer.redraw();
    });
  }

  function scheduleRepair(map,forceRedraw){
    const state=stateByMap.get(map);
    if(!state||!map._container)return;
    window.clearTimeout(state.timer);
    state.timer=window.setTimeout(function(){
      if(!map._loaded||!map._container.isConnected)return;
      map.invalidateSize({pan:false,debounceMoveend:true});
      window.requestAnimationFrame(function(){
        if(!map._loaded||!map._container.isConnected)return;
        map.invalidateSize({pan:false,debounceMoveend:true});
        if(forceRedraw)redrawGridLayers(map);
      });
    },80);
  }

  L.Map.prototype.initialize=function(){
    const result=originalInitialize.apply(this,arguments);
    const map=this;
    const container=map._container;
    const state={timer:0,observer:null,onWindowResize:null};
    stateByMap.set(map,state);

    if(container&&typeof window.ResizeObserver==='function'){
      let width=0;
      let height=0;
      state.observer=new window.ResizeObserver(function(entries){
        const rect=entries[0]&&entries[0].contentRect;
        const nextWidth=Math.round((rect&&rect.width)||container.clientWidth||0);
        const nextHeight=Math.round((rect&&rect.height)||container.clientHeight||0);
        if(!nextWidth||!nextHeight||(nextWidth===width&&nextHeight===height))return;
        width=nextWidth;
        height=nextHeight;
        scheduleRepair(map,true);
      });
      state.observer.observe(container);
    }

    state.onWindowResize=function(){scheduleRepair(map,true)};
    window.addEventListener('resize',state.onWindowResize,{passive:true});
    window.addEventListener('orientationchange',state.onWindowResize,{passive:true});
    window.addEventListener('pageshow',state.onWindowResize,{passive:true});

    if(document.fonts&&document.fonts.ready){
      document.fonts.ready.then(function(){scheduleRepair(map,true)}).catch(function(){});
    }

    [100,350,800,1600].forEach(function(delay){
      window.setTimeout(function(){scheduleRepair(map,true)},delay);
    });

    return result;
  };

  L.Map.prototype.remove=function(){
    const state=stateByMap.get(this);
    if(state){
      window.clearTimeout(state.timer);
      if(state.observer)state.observer.disconnect();
      if(state.onWindowResize){
        window.removeEventListener('resize',state.onWindowResize);
        window.removeEventListener('orientationchange',state.onWindowResize);
        window.removeEventListener('pageshow',state.onWindowResize);
      }
      stateByMap.delete(this);
    }
    return originalRemove.apply(this,arguments);
  };
})();
