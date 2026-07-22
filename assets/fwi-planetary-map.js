/* FutureWorld Intelligence Planetary Computer map integration v1.0 */
(function(){
  'use strict';

  const STAC_API='https://planetarycomputer.microsoft.com/api/stac/v1';
  const DATA_API='https://planetarycomputer.microsoft.com/api/data/v1';
  const MAX_LONGITUDE_SPAN=12;
  const MAX_LATITUDE_SPAN=9;
  const REQUEST_TIMEOUT=45000;

  const PRESETS={
    global:{label:'Global view',center:[20,0],zoom:2,bbox:[-179,-75,179,75]},
    pakistan:{label:'Pakistan',center:[30.4,69.3],zoom:5,bbox:[60.8,23.6,77.9,37.1]},
    kp:{label:'Khyber Pakhtunkhwa',center:[34.2,71.7],zoom:7,bbox:[69.15,31.0,74.15,36.95]},
    merged:{label:'Merged Districts',center:[33.5,70.6],zoom:8,bbox:[69.15,31.0,72.65,35.35]},
    bajaur:{label:'Bajaur pilot extent',center:[34.72,71.54],zoom:10,bbox:[71.10,34.45,71.95,35.05]}
  };

  const COLLECTIONS={
    'sentinel-2-l2a':{label:'Sentinel-2 L2A',cloud:true},
    'landsat-c2-l2':{label:'Landsat Collection 2 Level-2',cloud:true}
  };

  let instanceCounter=0;

  function pad(value){return String(value).padStart(2,'0')}
  function isoDate(date){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`}
  function defaultDates(){
    const end=new Date();
    end.setDate(end.getDate()-5);
    const start=new Date(end);
    start.setDate(start.getDate()-120);
    return {start:isoDate(start),end:isoDate(end)};
  }

  function escapeHtml(value){
    return String(value??'').replace(/[&<>'"]/g,function(char){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char];
    });
  }

  async function requestJson(url,options={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
    try{
      const response=await fetch(url,{...options,signal:controller.signal});
      if(!response.ok){
        let detail='';
        try{detail=(await response.text()).slice(0,240)}catch(error){}
        throw new Error(`Request failed (${response.status})${detail?`: ${detail}`:''}`);
      }
      return await response.json();
    }finally{
      clearTimeout(timer);
    }
  }

  function makeShell(root,id,dates){
    root.innerHTML=`
      <div class="fwi-pc-map-shell">
        <div class="fwi-pc-map-toolbar" aria-label="Planetary Computer map controls">
          <label><span>Geography</span><select data-pc-control="geography">
            ${Object.entries(PRESETS).map(([key,preset])=>`<option value="${key}">${preset.label}</option>`).join('')}
          </select></label>
          <label><span>Dataset</span><select data-pc-control="collection">
            ${Object.entries(COLLECTIONS).map(([key,item])=>`<option value="${key}">${item.label}</option>`).join('')}
          </select></label>
          <label><span>From</span><input type="date" data-pc-control="start" value="${dates.start}"></label>
          <label><span>To</span><input type="date" data-pc-control="end" value="${dates.end}"></label>
          <label><span>Maximum cloud <output data-pc-output="cloud">25%</output></span><input type="range" min="0" max="80" step="5" value="25" data-pc-control="cloud"></label>
          <label><span>Rendering</span><select data-pc-control="render"><option value="">Loading options…</option></select></label>
          <label><span>Imagery opacity <output data-pc-output="opacity">85%</output></span><input type="range" min="10" max="100" step="5" value="85" data-pc-control="opacity"></label>
          <div class="fwi-pc-map-actions"><button type="button" class="neon-btn" data-pc-action="load">Load imagery for current view</button><button type="button" class="ghost-btn" data-pc-action="clear">Clear imagery</button></div>
        </div>
        <div class="fwi-pc-map-stage">
          <div id="${id}" class="fwi-pc-map-canvas" role="application" aria-label="Interactive climate evidence map"></div>
          <div class="fwi-pc-map-status" data-pc-status aria-live="polite"><span class="ready"></span><strong>Map ready.</strong> Select a focused area or zoom in, then load imagery.</div>
        </div>
        <div class="fwi-pc-map-meta" data-pc-meta>
          <div><small>Operational status</small><strong>Live STAC interface</strong></div>
          <div><small>Evidence class</small><strong>Remote-sensing visualization</strong></div>
          <div><small>Source platform</small><strong>Microsoft Planetary Computer</strong></div>
          <div><small>Verification</small><strong>Field review required</strong></div>
        </div>
        <div class="fwi-pc-map-notice"><strong>Use responsibly:</strong> geography presets are viewing extents, not authoritative administrative boundaries. Imagery may contain clouds, haze, seasonal differences, terrain effects or gaps. Do not treat visual change as proof of causation or intervention success without field and documentary verification.</div>
      </div>`;
  }

  function initMap(root){
    if(typeof window.L==='undefined'){
      root.textContent='The interactive map library could not be loaded.';
      return;
    }

    const id=`fwi-pc-map-${++instanceCounter}`;
    const dates=defaultDates();
    makeShell(root,id,dates);

    const presetKey=PRESETS[root.dataset.preset]?root.dataset.preset:'bajaur';
    const controls={
      geography:root.querySelector('[data-pc-control="geography"]'),
      collection:root.querySelector('[data-pc-control="collection"]'),
      start:root.querySelector('[data-pc-control="start"]'),
      end:root.querySelector('[data-pc-control="end"]'),
      cloud:root.querySelector('[data-pc-control="cloud"]'),
      render:root.querySelector('[data-pc-control="render"]'),
      opacity:root.querySelector('[data-pc-control="opacity"]'),
      load:root.querySelector('[data-pc-action="load"]'),
      clear:root.querySelector('[data-pc-action="clear"]'),
      cloudOutput:root.querySelector('[data-pc-output="cloud"]'),
      opacityOutput:root.querySelector('[data-pc-output="opacity"]'),
      status:root.querySelector('[data-pc-status]'),
      meta:root.querySelector('[data-pc-meta]')
    };

    controls.geography.value=presetKey;
    const initial=PRESETS[presetKey];
    const map=L.map(id,{zoomControl:true,preferCanvas:true}).setView(initial.center,initial.zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.control.scale({imperial:false}).addTo(map);

    let extentLayer=null;
    let imageryLayer=null;
    let renderOptions=[];

    function setStatus(kind,title,message){
      controls.status.className=`fwi-pc-map-status ${kind||''}`;
      controls.status.innerHTML=`<span class="${kind||'ready'}"></span><strong>${escapeHtml(title)}</strong>${message?` ${escapeHtml(message)}`:''}`;
    }

    function drawExtent(preset){
      if(extentLayer)map.removeLayer(extentLayer);
      const [west,south,east,north]=preset.bbox;
      extentLayer=L.rectangle([[south,west],[north,east]],{
        color:'#f2b544',weight:1.5,opacity:.9,fillOpacity:.035,dashArray:'7 6',interactive:false
      }).addTo(map);
    }

    function applyPreset(key){
      const preset=PRESETS[key]||PRESETS.bajaur;
      const [west,south,east,north]=preset.bbox;
      map.fitBounds([[south,west],[north,east]],{padding:[18,18],animate:true});
      drawExtent(preset);
      setStatus('ready','View updated.',`${preset.label} is a search extent; zoom or pan before loading if needed.`);
    }

    function currentBbox(){
      const bounds=map.getBounds();
      return [bounds.getWest(),bounds.getSouth(),bounds.getEast(),bounds.getNorth()].map(value=>Number(value.toFixed(6)));
    }

    function validateSearch(bbox){
      const [west,south,east,north]=bbox;
      if(!controls.start.value||!controls.end.value)throw new Error('Select both start and end dates.');
      if(controls.start.value>controls.end.value)throw new Error('The start date must be before the end date.');
      if((east-west)>MAX_LONGITUDE_SPAN||(north-south)>MAX_LATITUDE_SPAN||map.getZoom()<5){
        throw new Error('The current view is too large for high-resolution imagery. Choose Khyber Pakhtunkhwa, Merged Districts or Bajaur, or zoom in further.');
      }
    }

    function updateMeta(data){
      const cards=[
        ['Dataset',data.dataset],
        ['Display mode',data.mode],
        ['Scenes matched',String(data.sceneCount)],
        ['Observation range',data.observationRange],
        ['Rendering',data.rendering],
        ['Upstream provider',data.providers],
        ['Collection licence',data.license],
        ['Verification','Remote-sensing indication; field review required']
      ];
      controls.meta.innerHTML=cards.map(([label,value])=>`<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value||'Not stated')}</strong></div>`).join('');
    }

    function removeImagery(){
      if(imageryLayer){map.removeLayer(imageryLayer);imageryLayer=null;}
    }

    function addTileLayer(tileJson,label){
      if(!tileJson||!Array.isArray(tileJson.tiles)||!tileJson.tiles[0])throw new Error('The tile service returned no usable map tiles.');
      removeImagery();
      imageryLayer=L.tileLayer(tileJson.tiles[0],{
        minZoom:Number.isFinite(tileJson.minzoom)?tileJson.minzoom:0,
        maxZoom:Number.isFinite(tileJson.maxzoom)?tileJson.maxzoom:24,
        opacity:Number(controls.opacity.value)/100,
        attribution:`${escapeHtml(label)} via <a href="https://planetarycomputer.microsoft.com/" target="_blank" rel="noopener">Microsoft Planetary Computer</a>`
      }).addTo(map);
      imageryLayer.bringToFront();
      if(extentLayer)extentLayer.bringToFront();
    }

    function selectBestItem(features){
      return [...features].sort((a,b)=>{
        const cloudA=Number(a.properties?.['eo:cloud_cover']??999);
        const cloudB=Number(b.properties?.['eo:cloud_cover']??999);
        if(cloudA!==cloudB)return cloudA-cloudB;
        return new Date(b.properties?.datetime||0)-new Date(a.properties?.datetime||0);
      })[0];
    }

    function featureDate(feature){
      return feature?.properties?.datetime||feature?.properties?.start_datetime||'';
    }

    function observationRange(features){
      const dates=features.map(featureDate).filter(Boolean).map(value=>new Date(value)).filter(date=>!Number.isNaN(date.getTime())).sort((a,b)=>a-b);
      if(!dates.length)return `${controls.start.value} to ${controls.end.value}`;
      return `${isoDate(dates[0])} to ${isoDate(dates[dates.length-1])}`;
    }

    function collectionProviders(collection){
      const providers=(collection?.providers||[]).map(provider=>provider.name).filter(Boolean);
      return providers.length?providers.join(', '):'Original dataset provider listed in collection metadata';
    }

    async function loadRenderOptions(){
      const collection=controls.collection.value;
      controls.render.disabled=true;
      controls.render.innerHTML='<option value="">Loading options…</option>';
      try{
        const info=await requestJson(`${DATA_API}/mosaic/info?collection=${encodeURIComponent(collection)}`);
        renderOptions=(info.renderOptions||[]).filter(option=>option&&option.type==='raster-tile');
      }catch(error){
        renderOptions=[];
      }
      if(!renderOptions.length){
        renderOptions=[{name:'Collection default',description:'Default visualization supplied by the collection',options:''}];
      }
      controls.render.innerHTML=renderOptions.map((option,index)=>`<option value="${index}">${escapeHtml(option.name||`Rendering ${index+1}`)}</option>`).join('');
      controls.render.disabled=false;
    }

    async function buildMosaic(searchParameters,renderConfig){
      const registered=await requestJson(`${DATA_API}/mosaic/register`,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(searchParameters)
      });
      const tileLink=(registered.links||[]).find(link=>link.rel==='tilejson')?.href;
      if(!tileLink)throw new Error('The mosaic service did not return a TileJSON link.');
      const params=new URLSearchParams(renderConfig?.options||'');
      params.set('collection',controls.collection.value);
      return await requestJson(`${tileLink}?${params.toString()}`);
    }

    async function buildSingleItem(features){
      const selected=selectBestItem(features);
      const href=selected?.assets?.tilejson?.href;
      if(!href)throw new Error('No matching scene includes a public TileJSON visualization.');
      const tileJson=await requestJson(href);
      return {tileJson,selected};
    }

    async function loadImagery(){
      const bbox=currentBbox();
      try{validateSearch(bbox)}catch(error){setStatus('error','Search not started.',error.message);return;}

      controls.load.disabled=true;
      controls.load.textContent='Loading satellite evidence…';
      setStatus('loading','Searching Planetary Computer…','This may take several seconds.');

      const collectionId=controls.collection.value;
      const collectionConfig=COLLECTIONS[collectionId];
      const searchParameters={
        collections:[collectionId],
        bbox,
        datetime:`${controls.start.value}/${controls.end.value}`,
        limit:100
      };
      if(collectionConfig?.cloud){searchParameters.query={'eo:cloud_cover':{lt:Number(controls.cloud.value)}};}

      try{
        const [results,collectionMeta]=await Promise.all([
          requestJson(`${STAC_API}/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(searchParameters)}),
          requestJson(`${STAC_API}/collections/${encodeURIComponent(collectionId)}`).catch(()=>null)
        ]);
        const features=Array.isArray(results.features)?results.features:[];
        if(!features.length)throw new Error('No matching scenes were found. Expand the date range, increase cloud tolerance or move the map.');

        const selectedRender=renderOptions[Number(controls.render.value)]||renderOptions[0]||{name:'Collection default',options:''};
        let mode='Planetary Computer mosaic';
        let tileJson;
        let selectedItem=null;
        try{
          tileJson=await buildMosaic(searchParameters,selectedRender);
        }catch(mosaicError){
          const fallback=await buildSingleItem(features);
          tileJson=fallback.tileJson;
          selectedItem=fallback.selected;
          mode='Best single-scene fallback';
        }

        const datasetName=collectionMeta?.title||COLLECTIONS[collectionId]?.label||collectionId;
        addTileLayer(tileJson,datasetName);
        const sceneCount=Number(results.context?.matched??results.numberMatched??features.length);
        updateMeta({
          dataset:datasetName,
          mode,
          sceneCount,
          observationRange:observationRange(features),
          rendering:mode.includes('fallback')?'Collection default':selectedRender.name,
          providers:collectionProviders(collectionMeta),
          license:collectionMeta?.license||'See collection metadata'
        });
        const selectedNote=selectedItem?` Scene: ${selectedItem.id}.`:'';
        setStatus('success','Imagery loaded.',`${mode}; ${sceneCount} matching scene${sceneCount===1?'':'s'}.${selectedNote}`);
      }catch(error){
        console.error('FWI Planetary Computer map error',error);
        setStatus('error','Unable to load imagery.',error.name==='AbortError'?'The request timed out. Please try a smaller area.':error.message);
      }finally{
        controls.load.disabled=false;
        controls.load.textContent='Load imagery for current view';
      }
    }

    controls.geography.addEventListener('change',event=>applyPreset(event.target.value));
    controls.collection.addEventListener('change',()=>{removeImagery();loadRenderOptions();setStatus('ready','Dataset changed.','Load imagery to refresh the map.');});
    controls.cloud.addEventListener('input',()=>{controls.cloudOutput.textContent=`${controls.cloud.value}%`;});
    controls.opacity.addEventListener('input',()=>{
      controls.opacityOutput.textContent=`${controls.opacity.value}%`;
      if(imageryLayer)imageryLayer.setOpacity(Number(controls.opacity.value)/100);
    });
    controls.load.addEventListener('click',loadImagery);
    controls.clear.addEventListener('click',()=>{
      removeImagery();
      setStatus('ready','Imagery cleared.','The base map remains active.');
    });
    map.on('moveend',()=>{
      const selected=PRESETS[controls.geography.value];
      if(selected){
        const center=map.getCenter();
        if(Math.abs(center.lat-selected.center[0])>.7||Math.abs(center.lng-selected.center[1])>.7)controls.geography.value='';
      }
    });

    applyPreset(presetKey);
    loadRenderOptions();
    setTimeout(()=>map.invalidateSize(),250);
  }

  function init(){document.querySelectorAll('[data-fwi-planetary-map]').forEach(initMap)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
