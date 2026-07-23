/* FutureWorld Intelligence Planetary Computer map integration v1.3 */
(function(){
  'use strict';

  const STAC_API='https://planetarycomputer.microsoft.com/api/stac/v1';
  const DATA_API='https://planetarycomputer.microsoft.com/api/data/v1';
  const GEOBOUNDARIES_API='https://www.geoboundaries.org/api/current/gbOpen';
  const THEME_BASE='/pages/climate/evidence-explorer/themes/';
  const MAX_LONGITUDE_SPAN=12;
  const MAX_LATITUDE_SPAN=9;
  const REQUEST_TIMEOUT=60000;
  const WORLD_CENTER=[20,0];
  const WORLD_ZOOM=2;

  const COLLECTIONS={
    'sentinel-2-l2a':{label:'Sentinel-2 L2A',cloud:true},
    'landsat-c2-l2':{label:'Landsat Collection 2 Level-2',cloud:true}
  };

  const ADMIN_TERMS={
    USA:{adm1:'State',adm2:'County'},
    CAN:{adm1:'Province / Territory',adm2:'Census division / District'},
    PAK:{adm1:'Province / Territory',adm2:'District'},
    IND:{adm1:'State / Union Territory',adm2:'District'},
    AUS:{adm1:'State / Territory',adm2:'District / Local area'},
    GBR:{adm1:'Country / Region',adm2:'District / Local authority'},
    FRA:{adm1:'Region',adm2:'Department'},
    JPN:{adm1:'Prefecture',adm2:'Municipality / District'},
    DEU:{adm1:'State',adm2:'District'},
    BRA:{adm1:'State',adm2:'Municipality'},
    MEX:{adm1:'State',adm2:'Municipality'},
    CHN:{adm1:'Province / Autonomous Region',adm2:'Prefecture'},
    IDN:{adm1:'Province',adm2:'Regency / City'},
    ZAF:{adm1:'Province',adm2:'District municipality'},
    ESP:{adm1:'Autonomous community',adm2:'Province'},
    ITA:{adm1:'Region',adm2:'Province / Metropolitan city'},
    RUS:{adm1:'Federal subject',adm2:'District'},
    NGA:{adm1:'State',adm2:'Local government area'}
  };

  const LEGENDS={
    ndmi:{title:'Moisture condition (NDMI)',unit:'Index from -1 to +1',rows:[
      {color:'#8c510a',label:'Very low moisture signal',range:'below -0.20'},
      {color:'#d8b365',label:'Low moisture signal',range:'-0.20 to 0.10'},
      {color:'#f6e8c3',label:'Transitional / mixed',range:'0.10 to 0.25'},
      {color:'#5ab4ac',label:'Moderate moisture signal',range:'0.25 to 0.40'},
      {color:'#01665e',label:'High moisture signal',range:'above 0.40'}
    ],howTo:'Brown tones indicate a weaker moisture signal in vegetation or exposed surfaces. Blue-green tones indicate a stronger moisture signal.',warning:'NDMI is a surface and vegetation moisture indicator. It is not, by itself, a declaration of meteorological, agricultural or household water drought.'},
    ndvi:{title:'Vegetation condition (NDVI)',unit:'Index from -1 to +1',rows:[
      {color:'#a50026',label:'Very sparse / non-vegetated',range:'below 0.10'},
      {color:'#f46d43',label:'Sparse vegetation signal',range:'0.10 to 0.25'},
      {color:'#fee08b',label:'Moderate vegetation signal',range:'0.25 to 0.45'},
      {color:'#66bd63',label:'Healthy vegetation signal',range:'0.45 to 0.65'},
      {color:'#006837',label:'Very strong vegetation signal',range:'above 0.65'}
    ],howTo:'Red and orange tones indicate little vegetation response. Green tones indicate a stronger vegetation response for the selected period.',warning:'Low NDVI may reflect season, bare land, settlements, harvested crops, fire, cloud contamination or drought. Field and time-series checks are required.'},
    context:{title:'Satellite context',unit:'Natural-colour imagery',rows:[],howTo:'The map shows the landscape as seen by the selected satellite rendering. Use roads, settlements, vegetation and surface-water features for orientation.',warning:'Natural-colour imagery does not directly measure drought, emissions, vulnerability or policy implementation.'}
  };

  const INDICATORS={
    'water-drought':[
      {key:'ndmi',label:'Moisture condition — NDMI',collection:'sentinel-2-l2a',legend:'ndmi',lockCollection:true,evidenceClass:'Operational satellite indicator',explanation:'NDMI compares near-infrared and short-wave infrared reflectance to show relative moisture conditions in vegetation and exposed surfaces.',render:{name:'Normalized Difference Moisture Index (NDMI)',description:'Sentinel-2 B08 and B11 moisture index',options:'assets=B08&assets=B11&expression=(B08-B11)/(B08+B11)&asset_as_band=true&rescale=-0.8,0.8&colormap_name=BrBG'},requiredEvidence:'Confirm drought with rainfall, climatic water balance, soil moisture, streamflow, groundwater and local water-access evidence.'},
      {key:'ndvi',label:'Vegetation condition — NDVI',collection:'sentinel-2-l2a',legend:'ndvi',lockCollection:true,evidenceClass:'Supporting satellite indicator',explanation:'NDVI compares near-infrared and red reflectance to show vegetation response and possible stress patterns.',render:{name:'Normalized Difference Vegetation Index (NDVI)',description:'Sentinel-2 B08 and B04 vegetation index',options:'assets=B08&assets=B04&expression=(B08-B04)/(B08+B04)&asset_as_band=true&rescale=-0.2,0.9&colormap_name=RdYlGn'},requiredEvidence:'Compare the same season across years and combine with rainfall, land use, fire and field observations.'},
      {key:'context',label:'Natural-colour satellite context',collection:'sentinel-2-l2a',legend:'context',lockCollection:false,evidenceClass:'Visual context',explanation:'A recognisable satellite view for orientation and checking visible land, vegetation and water features.',renderMatcher:/natural color|true color/i,requiredEvidence:'Use an indicator layer for interpretation; natural colour alone does not quantify drought.'}
    ],
    'forests-land-cover':[
      {key:'ndvi',label:'Vegetation condition — NDVI',collection:'sentinel-2-l2a',legend:'ndvi',lockCollection:true,evidenceClass:'Supporting satellite indicator',explanation:'NDVI highlights vegetation response for forest and land-condition inspection.',render:{name:'Normalized Difference Vegetation Index (NDVI)',description:'Sentinel-2 B08 and B04 vegetation index',options:'assets=B08&assets=B04&expression=(B08-B04)/(B08+B04)&asset_as_band=true&rescale=-0.2,0.9&colormap_name=RdYlGn'},requiredEvidence:'Confirm forest change with comparable dates, classification, official boundaries and field evidence.'},
      {key:'context',label:'Natural-colour satellite context',collection:'sentinel-2-l2a',legend:'context',lockCollection:false,evidenceClass:'Visual context',explanation:'A recognisable satellite view for forest and land-cover orientation.',renderMatcher:/natural color|true color/i,requiredEvidence:'Visible differences require seasonal and analytical validation.'}
    ],
    default:[{key:'context',label:'Satellite context',collection:'sentinel-2-l2a',legend:'context',lockCollection:false,evidenceClass:'Visual context only',explanation:'The current public map supplies satellite context while a validated thematic layer is prepared.',renderMatcher:/natural color|true color/i,requiredEvidence:'This theme requires additional authoritative indicator, risk or policy datasets.'}]
  };

  const THEMES={
    'temperature-emissions':{label:'Global temperature and emissions trends',type:'Indicator evidence',note:'Temperature and emissions require authoritative time-series and inventory datasets. The current map supplies geographic context only.'},
    'forests-land-cover':{label:'Forests and land-cover change',type:'Live map indicator',note:'Use vegetation condition and natural-colour context to inspect landscapes; confirm change through validated classification and field evidence.'},
    'water-drought':{label:'Water stress and drought',type:'Live pilot indicator',note:'Use NDMI and NDVI to inspect moisture and vegetation response. A complete drought assessment still requires rainfall, water-balance, hydrology and local evidence.'},
    'wildfires-burned-areas':{label:'Wildfires and burned areas',type:'Thematic layer pathway',note:'Current imagery can support before-and-after inspection. Validated active-fire and burned-area products remain required.'},
    'biodiversity-ecosystems':{label:'Biodiversity and ecosystem condition',type:'Evidence pathway',note:'Imagery supports habitat and vegetation context. Biodiversity conclusions require ecological indicators, species evidence and field verification.'},
    'glaciers-snow-mountains':{label:'Glaciers, snow and mountain systems',type:'Thematic layer pathway',note:'Seasonal imagery supplies context. Glacier and snow trends require dedicated cryosphere time series and elevation data.'},
    'hazards-vulnerability':{label:'Climate hazards and vulnerability',type:'Risk evidence',note:'The map is not an early-warning system. Risk analysis requires hazard, exposure, population, infrastructure and vulnerability datasets.'},
    'commitments-implementation':{label:'International climate commitments and implementation',type:'Policy evidence',note:'This theme is primarily documentary and institutional; use the thematic guide for NDCs, adaptation, finance and implementation evidence.'}
  };

  const boundaryCache=new Map();
  let instanceCounter=0;

  function pad(value){return String(value).padStart(2,'0')}
  function isoDate(date){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`}
  function defaultDates(){const end=new Date();end.setDate(end.getDate()-5);const start=new Date(end);start.setDate(start.getDate()-120);return {start:isoDate(start),end:isoDate(end)}}
  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
  function indicatorList(themeKey){return INDICATORS[themeKey]||INDICATORS.default}
  function indicatorByKey(themeKey,key){return indicatorList(themeKey).find(item=>item.key===key)||indicatorList(themeKey)[0]}
  function featureName(feature){const props=feature?.properties||{};return props.shapeName||props.NAME_1||props.NAME_2||props.name||props.NAME||'Unnamed area'}
  function featureId(feature,index=0){const props=feature?.properties||{};return String(props.shapeID||props.shapeISO||props.GID_2||props.GID_1||`${featureName(feature)}-${index}`)}
  function adminTerms(iso){return ADMIN_TERMS[iso]||{adm1:'State / Province / Region',adm2:'District / County / Municipality'}}

  async function requestJson(url,options={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
    try{
      const response=await fetch(url,{...options,signal:controller.signal});
      if(!response.ok){let detail='';try{detail=(await response.text()).slice(0,240)}catch(error){}throw new Error(`Request failed (${response.status})${detail?`: ${detail}`:''}`)}
      return await response.json();
    }finally{clearTimeout(timer)}
  }

  function populateSelect(select,items,placeholder){
    select.replaceChildren();
    const first=document.createElement('option');
    first.value='';first.textContent=placeholder;select.append(first);
    items.forEach(item=>{const option=document.createElement('option');option.value=item.value;option.textContent=item.label;select.append(option)});
    select.disabled=items.length===0;
  }

  function setLoadingSelect(select,label){populateSelect(select,[],label);select.disabled=true}

  async function boundaryBundle(iso,level){
    const key=`${iso}-${level}`;
    if(boundaryCache.has(key))return boundaryCache.get(key);
    const promise=(async()=>{
      const payload=await requestJson(`${GEOBOUNDARIES_API}/${encodeURIComponent(iso)}/${level}/`);
      const metadata=Array.isArray(payload)?payload[0]:payload;
      if(!metadata)throw new Error(`${level} boundary metadata is unavailable for ${iso}.`);
      const geometryUrl=metadata.simplifiedGeometryGeoJSON||metadata.gjDownloadURL;
      if(!geometryUrl)throw new Error(`${level} boundary geometry is unavailable for ${iso}.`);
      const geojson=await requestJson(geometryUrl);
      if(!geojson||!Array.isArray(geojson.features)||!geojson.features.length)throw new Error(`${level} returned no geographic units for ${iso}.`);
      return {metadata,geojson};
    })();
    boundaryCache.set(key,promise);
    try{return await promise}catch(error){boundaryCache.delete(key);throw error}
  }

  function geometryBbox(geometry){
    const bbox=[Infinity,Infinity,-Infinity,-Infinity];
    (function walk(coords){
      if(!Array.isArray(coords))return;
      if(typeof coords[0]==='number'&&typeof coords[1]==='number'){
        bbox[0]=Math.min(bbox[0],coords[0]);bbox[1]=Math.min(bbox[1],coords[1]);bbox[2]=Math.max(bbox[2],coords[0]);bbox[3]=Math.max(bbox[3],coords[1]);return;
      }
      coords.forEach(walk);
    })(geometry?.coordinates);
    return bbox.every(Number.isFinite)?bbox:null;
  }

  function pointInRing(point,ring){
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];
      const intersects=((yi>point[1])!==(yj>point[1]))&&(point[0]<(xj-xi)*(point[1]-yi)/((yj-yi)||Number.EPSILON)+xi);
      if(intersects)inside=!inside;
    }
    return inside;
  }

  function pointInPolygon(point,polygon){
    if(!polygon?.length||!pointInRing(point,polygon[0]))return false;
    for(let i=1;i<polygon.length;i++)if(pointInRing(point,polygon[i]))return false;
    return true;
  }

  function pointInGeometry(point,geometry){
    if(!geometry)return false;
    if(geometry.type==='Polygon')return pointInPolygon(point,geometry.coordinates);
    if(geometry.type==='MultiPolygon')return geometry.coordinates.some(polygon=>pointInPolygon(point,polygon));
    return false;
  }

  function representativePoints(geometry){
    const bbox=geometryBbox(geometry);const points=[];
    if(bbox)points.push([(bbox[0]+bbox[2])/2,(bbox[1]+bbox[3])/2]);
    const polygons=geometry?.type==='Polygon'?[geometry.coordinates]:geometry?.type==='MultiPolygon'?geometry.coordinates:[];
    polygons.forEach(polygon=>{
      const ring=polygon?.[0]||[];
      if(!ring.length)return;
      let x=0,y=0,count=0;
      const step=Math.max(1,Math.floor(ring.length/40));
      for(let i=0;i<ring.length;i+=step){x+=ring[i][0];y+=ring[i][1];count++}
      if(count)points.push([x/count,y/count]);
      [0,Math.floor(ring.length/4),Math.floor(ring.length/2),Math.floor(ring.length*3/4)].forEach(index=>{if(ring[index])points.push(ring[index])});
    });
    return points;
  }

  function childWithinParent(child,parent){
    const childBbox=geometryBbox(child);const parentBbox=geometryBbox(parent);
    if(!childBbox||!parentBbox)return false;
    if(childBbox[2]<parentBbox[0]||childBbox[0]>parentBbox[2]||childBbox[3]<parentBbox[1]||childBbox[1]>parentBbox[3])return false;
    return representativePoints(child).some(point=>pointInGeometry(point,parent));
  }

  function makeShell(root,id,dates,themeKey){
    const firstIndicator=indicatorList(themeKey)[0];
    root.innerHTML=`<div class="fwi-pc-map-shell">
      <div class="fwi-pc-map-toolbar" aria-label="Climate evidence map controls">
        <label class="fwi-pc-theme-control"><span>Evidence theme</span><select data-pc-control="theme">${Object.entries(THEMES).map(([key,theme])=>`<option value="${key}"${key===themeKey?' selected':''}>${escapeHtml(theme.label)}</option>`).join('')}</select></label>
        <label class="fwi-pc-indicator-control"><span>Indicator</span><select data-pc-control="indicator">${indicatorList(themeKey).map(item=>`<option value="${item.key}">${escapeHtml(item.label)}</option>`).join('')}</select></label>
        <label class="fwi-pc-country-control"><span>Country or Territory</span><select data-pc-control="country" disabled><option>Loading world countries…</option></select></label>
        <label><span data-pc-label="adm1">State / Province / Region</span><select data-pc-control="adm1" disabled><option>Select country first</option></select></label>
        <label><span data-pc-label="adm2">District / County / Municipality</span><select data-pc-control="adm2" disabled><option>Select region first</option></select></label>
        <label><span>Dataset</span><select data-pc-control="collection">${Object.entries(COLLECTIONS).map(([key,item])=>`<option value="${key}">${item.label}</option>`).join('')}</select></label>
        <label><span>From</span><input type="date" data-pc-control="start" value="${dates.start}"></label>
        <label><span>To</span><input type="date" data-pc-control="end" value="${dates.end}"></label>
        <label><span>Maximum cloud <output data-pc-output="cloud">25%</output></span><input type="range" min="0" max="80" step="5" value="25" data-pc-control="cloud"></label>
        <label><span>Rendering</span><select data-pc-control="render"><option value="">Loading options…</option></select></label>
        <label><span>Layer opacity <output data-pc-output="opacity">85%</output></span><input type="range" min="10" max="100" step="5" value="85" data-pc-control="opacity"></label>
        <div class="fwi-pc-theme-guidance" data-pc-theme-guidance></div>
        <div class="fwi-pc-map-actions"><button type="button" class="neon-btn" data-pc-action="load">Load evidence for selected area</button><button type="button" class="ghost-btn" data-pc-action="clear">Clear evidence</button></div>
      </div>
      <div class="fwi-pc-evidence-summary" data-pc-summary>
        <div><small>Selected indicator</small><strong>${escapeHtml(firstIndicator.label)}</strong><span>Select a country or territory to begin.</span></div>
        <div><small>Selected geography</small><strong>No area selected</strong><span>Choose a country, then a first- and second-level administrative area where available.</span></div>
        <div><small>How to use it</small><strong>Interpret with the legend</strong><span>Load the layer and click the map to request a location-specific value.</span></div>
        <div><small>Additional evidence needed</small><strong>Validation required</strong><span>${escapeHtml(firstIndicator.requiredEvidence)}</span></div>
      </div>
      <div class="fwi-pc-map-stage"><div id="${id}" class="fwi-pc-map-canvas" role="application" aria-label="Interactive climate evidence map"></div><aside class="fwi-pc-map-legend" data-pc-legend aria-live="polite"></aside><div class="fwi-pc-map-status" data-pc-status aria-live="polite"><span class="ready"></span><strong>Choose a country or territory.</strong> Administrative boundaries load on demand.</div></div>
      <div class="fwi-pc-map-meta" data-pc-meta><div><small>Evidence theme</small><strong>${escapeHtml(THEMES[themeKey].label)}</strong></div><div><small>Indicator</small><strong>${escapeHtml(firstIndicator.label)}</strong></div><div><small>Administrative geography</small><strong>Not selected</strong></div><div><small>Boundary source</small><strong>geoBoundaries gbOpen</strong></div><div><small>Verification</small><strong>Field and time-series review required</strong></div></div>
      <div class="fwi-pc-map-notice"><strong>Boundary and evidence notice:</strong> administrative boundaries are supplied for geographic analysis and do not imply an FWI position regarding sovereignty, legal status or disputed territories. geoBoundaries attribution and source metadata remain visible. Satellite-derived indicators do not by themselves prove drought, water scarcity, restoration success, hazard severity or causation.</div>
    </div>`;
  }

  function initMap(root){
    if(typeof window.L==='undefined'){root.textContent='The interactive map library could not be loaded.';return}
    const query=new URLSearchParams(location.search);
    const requestedTheme=query.get('theme');
    const themeKey=THEMES[requestedTheme]?requestedTheme:(THEMES[root.dataset.theme]?root.dataset.theme:'water-drought');
    const id=`fwi-pc-map-${++instanceCounter}`;
    makeShell(root,id,defaultDates(),themeKey);

    const controls={
      theme:root.querySelector('[data-pc-control="theme"]'),indicator:root.querySelector('[data-pc-control="indicator"]'),country:root.querySelector('[data-pc-control="country"]'),adm1:root.querySelector('[data-pc-control="adm1"]'),adm2:root.querySelector('[data-pc-control="adm2"]'),collection:root.querySelector('[data-pc-control="collection"]'),start:root.querySelector('[data-pc-control="start"]'),end:root.querySelector('[data-pc-control="end"]'),cloud:root.querySelector('[data-pc-control="cloud"]'),render:root.querySelector('[data-pc-control="render"]'),opacity:root.querySelector('[data-pc-control="opacity"]'),load:root.querySelector('[data-pc-action="load"]'),clear:root.querySelector('[data-pc-action="clear"]'),cloudOutput:root.querySelector('[data-pc-output="cloud"]'),opacityOutput:root.querySelector('[data-pc-output="opacity"]'),adm1Label:root.querySelector('[data-pc-label="adm1"]'),adm2Label:root.querySelector('[data-pc-label="adm2"]'),guidance:root.querySelector('[data-pc-theme-guidance]'),summary:root.querySelector('[data-pc-summary]'),legend:root.querySelector('[data-pc-legend]'),status:root.querySelector('[data-pc-status]'),meta:root.querySelector('[data-pc-meta]')
    };

    const map=L.map(id,{zoomControl:true,preferCanvas:true}).setView(WORLD_CENTER,WORLD_ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
    map.attributionControl.addAttribution('Administrative boundaries: <a href="https://www.geoboundaries.org/" target="_blank" rel="noopener">geoBoundaries</a>');
    L.control.scale({imperial:false}).addTo(map);

    let boundaryLayer=null,imageryLayer=null,renderOptions=[],activePointBase='',activePointParams=null,lastMeta=null;
    let selectedBoundary=null,selectedBoundaryMeta=null,selectedLevel='',selectedPath=[];
    let countryCatalog=new Map(),adm1Features=new Map(),adm2Features=new Map();
    let countryToken=0,adm1Token=0;

    function selectedTheme(){return THEMES[controls.theme.value]||THEMES['water-drought']}
    function selectedIndicator(){return indicatorByKey(controls.theme.value,controls.indicator.value)}
    function selectedLegend(){return LEGENDS[selectedIndicator().legend]||LEGENDS.context}
    function selectedGeographyLabel(){return selectedPath.length?selectedPath.join(' › '):'No area selected'}
    function setStatus(kind,title,message){controls.status.className=`fwi-pc-map-status ${kind||''}`;controls.status.innerHTML=`<span class="${kind||'ready'}"></span><strong>${escapeHtml(title)}</strong>${message?` ${escapeHtml(message)}`:''}`}

    function updateThemeGuidance(){const theme=selectedTheme(),indicator=selectedIndicator();controls.guidance.innerHTML=`<div><small>${escapeHtml(indicator.evidenceClass)}</small><strong>${escapeHtml(indicator.label)}</strong><span>${escapeHtml(indicator.explanation)} ${escapeHtml(theme.note)}</span></div><a href="${THEME_BASE}#${encodeURIComponent(controls.theme.value)}">Open full theme guide</a>`}

    function updateSummary(sample=null){
      const indicator=selectedIndicator();
      const sampleTitle=sample?sample.title:'No location sampled';
      const sampleText=sample?sample.text:'Load the evidence layer, then click the map to request a location-specific value.';
      const boundaryText=selectedBoundaryMeta?`${selectedLevel}; ${selectedBoundaryMeta.boundarySource||'source listed by geoBoundaries'}; represented year ${selectedBoundaryMeta.boundaryYearRepresented||'not stated'}.`:'Select a country or territory to begin.';
      controls.summary.innerHTML=`<div><small>Selected indicator</small><strong>${escapeHtml(indicator.label)}</strong><span>${escapeHtml(indicator.explanation)}</span></div><div><small>Selected geography</small><strong>${escapeHtml(selectedGeographyLabel())}</strong><span>${escapeHtml(boundaryText)}</span></div><div><small>Selected location</small><strong>${escapeHtml(sampleTitle)}</strong><span>${escapeHtml(sampleText)}</span></div><div><small>How to read it</small><strong>Use the map legend</strong><span>${escapeHtml(selectedLegend().howTo)}</span></div><div><small>Additional evidence needed</small><strong>Validation required</strong><span>${escapeHtml(indicator.requiredEvidence)}</span></div>`;
    }

    function renderLegend(loaded=false){
      const legend=selectedLegend();
      controls.legend.innerHTML=`<button type="button" class="fwi-pc-legend-toggle" data-pc-legend-toggle aria-expanded="true">Theme guide & legend</button><div class="fwi-pc-legend-body"><small>${escapeHtml(selectedTheme().label)}</small><h3>${escapeHtml(legend.title)}</h3><p class="fwi-pc-legend-geography">${escapeHtml(selectedGeographyLabel())}</p><p class="fwi-pc-legend-state">${loaded?'Evidence layer loaded':'Select an administrative area, then choose “Load evidence”.'}</p>${legend.rows.length?`<div class="fwi-pc-legend-scale">${legend.rows.map(row=>`<div><i style="--legend-color:${row.color}"></i><span><strong>${escapeHtml(row.label)}</strong><small>${escapeHtml(row.range)}</small></span></div>`).join('')}</div>`:''}<p>${escapeHtml(legend.howTo)}</p><p class="fwi-pc-legend-warning"><strong>Important:</strong> ${escapeHtml(legend.warning)}</p></div>`;
      const toggle=controls.legend.querySelector('[data-pc-legend-toggle]');
      toggle.addEventListener('click',()=>{const collapsed=controls.legend.classList.toggle('collapsed');toggle.setAttribute('aria-expanded',String(!collapsed))});
    }

    function clearPointSampling(){activePointBase='';activePointParams=null}
    function removeImagery(){if(imageryLayer){map.removeLayer(imageryLayer);imageryLayer=null}clearPointSampling();renderLegend(false)}

    function drawBoundary(feature){
      if(boundaryLayer)map.removeLayer(boundaryLayer);
      boundaryLayer=L.geoJSON(feature,{style:{color:'#f2b544',weight:2.2,opacity:1,fillColor:'#4df3ff',fillOpacity:.055,dashArray:'7 5'}}).addTo(map);
      if(boundaryLayer.getBounds().isValid())map.fitBounds(boundaryLayer.getBounds(),{padding:[24,24],maxZoom:11});
      if(imageryLayer)imageryLayer.bringToFront();
      boundaryLayer.bringToFront();
    }

    function updateAdminLabels(iso){const terms=adminTerms(iso);controls.adm1Label.textContent=terms.adm1;controls.adm2Label.textContent=terms.adm2}

    function selectBoundary(feature,metadata,level,path){
      selectedBoundary=feature;selectedBoundaryMeta=metadata;selectedLevel=level;selectedPath=path;
      removeImagery();lastMeta=null;drawBoundary(feature);updateSummary();renderLegend(false);updateMeta(null);updateUrl();
      setStatus('ready',`${path[path.length-1]} selected.`,`Boundary level ${level}. Load evidence when the selected area is sufficiently focused.`);
    }

    function updateMeta(data){
      const boundaryCards=[
        ['Evidence theme',selectedTheme().label],['Indicator',selectedIndicator().label],['Selected geography',selectedGeographyLabel()],['Administrative level',selectedLevel||'Not selected'],['Boundary source',selectedBoundaryMeta?.boundarySource||'geoBoundaries gbOpen'],['Boundary year',selectedBoundaryMeta?.boundaryYearRepresented||'Not stated'],['Boundary licence',selectedBoundaryMeta?.boundaryLicense||'See source metadata']
      ];
      const evidenceCards=data?[[ 'Dataset',data.dataset],['Display mode',data.mode],['Scenes matched',String(data.sceneCount)],['Observation range',data.observationRange],['Rendering',data.rendering],['Upstream provider',data.providers],['Collection licence',data.license],['Verification','Satellite indication; climate and field review required']]:[['Operational status','Select an administrative area and load evidence'],['Verification','Satellite indication; climate and field review required']];
      controls.meta.innerHTML=[...boundaryCards,...evidenceCards].map(([label,value])=>`<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value||'Not stated')}</strong></div>`).join('');
    }

    function updateUrl(){
      const params=new URLSearchParams(location.search);
      params.set('theme',controls.theme.value);params.set('indicator',controls.indicator.value);
      controls.country.value?params.set('country',controls.country.value):params.delete('country');
      controls.adm1.value?params.set('adm1',controls.adm1.value):params.delete('adm1');
      controls.adm2.value?params.set('adm2',controls.adm2.value):params.delete('adm2');
      history.replaceState(null,'',`${location.pathname}?${params.toString()}${location.hash}`);
    }

    async function loadCountries(){
      controls.country.disabled=true;
      try{
        const payload=await requestJson(`${GEOBOUNDARIES_API}/ALL/ADM0/`);
        const countries=(Array.isArray(payload)?payload:[]).filter(item=>item.boundaryISO&&item.boundaryName).sort((a,b)=>itemName(a).localeCompare(itemName(b)));
        countryCatalog=new Map(countries.map(item=>[item.boundaryISO,item]));
        populateSelect(controls.country,countries.map(item=>({value:item.boundaryISO,label:itemName(item)})),'Select a country or territory');
        setStatus('ready','World country list ready.','Select a country or territory to load its boundary and administrative hierarchy.');
      }catch(error){
        populateSelect(controls.country,[],'Country service unavailable');
        setStatus('error','Unable to load countries.',error.name==='AbortError'?'The boundary service timed out. Reload the page to try again.':error.message);
      }
    }

    function itemName(item){return item.boundaryName||item.boundaryCanonical||item.boundaryISO}

    function mapFeatures(features){return new Map(features.map((feature,index)=>[featureId(feature,index),feature]))}

    async function chooseCountry(iso,restoreAdm1='',restoreAdm2=''){
      const token=++countryToken;adm1Token++;
      controls.country.value=iso;
      setLoadingSelect(controls.adm1,'Loading first-level areas…');
      setLoadingSelect(controls.adm2,'Select region first');
      updateAdminLabels(iso);
      adm1Features=new Map();adm2Features=new Map();
      try{
        const countryBundle=await boundaryBundle(iso,'ADM0');
        if(token!==countryToken)return;
        const countryFeature=countryBundle.geojson.features[0];
        selectBoundary(countryFeature,countryBundle.metadata,'ADM0',[itemName(countryCatalog.get(iso)||countryBundle.metadata)]);
        try{
          const adm1Bundle=await boundaryBundle(iso,'ADM1');
          if(token!==countryToken)return;
          adm1Features=mapFeatures(adm1Bundle.geojson.features);
          populateSelect(controls.adm1,[...adm1Features].map(([value,feature])=>({value,label:featureName(feature)})).sort((a,b)=>a.label.localeCompare(b.label)),`Select ${adminTerms(iso).adm1.toLowerCase()}`);
          controls.adm1.dataset.source=JSON.stringify({source:adm1Bundle.metadata.boundarySource,year:adm1Bundle.metadata.boundaryYearRepresented,license:adm1Bundle.metadata.boundaryLicense});
          if(restoreAdm1&&adm1Features.has(restoreAdm1)){controls.adm1.value=restoreAdm1;await chooseAdm1(restoreAdm1,restoreAdm2)}
        }catch(error){populateSelect(controls.adm1,[],`${adminTerms(iso).adm1} unavailable`);setStatus('ready','Country boundary selected.',`${adminTerms(iso).adm1} boundaries are unavailable from the current open source.`)}
      }catch(error){setStatus('error','Unable to load country boundary.',error.message)}
    }

    function metadataForLevel(iso,level,stored){
      let parsed={};try{parsed=stored?JSON.parse(stored):{}}catch(error){}
      return {boundaryISO:iso,boundaryType:level,boundarySource:parsed.source||'geoBoundaries gbOpen',boundaryYearRepresented:parsed.year||'Not stated',boundaryLicense:parsed.license||'See geoBoundaries metadata'};
    }

    async function chooseAdm1(id,restoreAdm2=''){
      const token=++adm1Token;
      controls.adm1.value=id;
      setLoadingSelect(controls.adm2,'Loading second-level areas…');
      const feature=adm1Features.get(id);
      if(!feature)return;
      const iso=controls.country.value;
      const countryName=itemName(countryCatalog.get(iso)||{boundaryName:iso});
      const meta=metadataForLevel(iso,'ADM1',controls.adm1.dataset.source);
      selectBoundary(feature,meta,'ADM1',[countryName,featureName(feature)]);
      try{
        const adm2Bundle=await boundaryBundle(iso,'ADM2');
        if(token!==adm1Token)return;
        const matching=adm2Bundle.geojson.features.filter(child=>childWithinParent(child.geometry,feature.geometry));
        adm2Features=mapFeatures(matching);
        populateSelect(controls.adm2,[...adm2Features].map(([value,item])=>({value,label:featureName(item)})).sort((a,b)=>a.label.localeCompare(b.label)),`Select ${adminTerms(iso).adm2.toLowerCase()}`);
        controls.adm2.dataset.source=JSON.stringify({source:adm2Bundle.metadata.boundarySource,year:adm2Bundle.metadata.boundaryYearRepresented,license:adm2Bundle.metadata.boundaryLicense});
        if(!matching.length)setStatus('ready',`${featureName(feature)} selected.`,'No second-level areas could be matched to this boundary. The first-level area remains available for evidence searches.');
        if(restoreAdm2&&adm2Features.has(restoreAdm2)){controls.adm2.value=restoreAdm2;chooseAdm2(restoreAdm2)}
      }catch(error){populateSelect(controls.adm2,[],`${adminTerms(iso).adm2} unavailable`);setStatus('ready',`${featureName(feature)} selected.`,`${adminTerms(iso).adm2} boundaries are unavailable from the current open source.`)}
    }

    function chooseAdm2(id){
      controls.adm2.value=id;
      const feature=adm2Features.get(id);if(!feature)return;
      const iso=controls.country.value;
      const countryName=itemName(countryCatalog.get(iso)||{boundaryName:iso});
      const adm1Name=featureName(adm1Features.get(controls.adm1.value));
      const meta=metadataForLevel(iso,'ADM2',controls.adm2.dataset.source);
      selectBoundary(feature,meta,'ADM2',[countryName,adm1Name,featureName(feature)]);
    }

    function resetToWorld(){
      countryToken++;adm1Token++;selectedBoundary=null;selectedBoundaryMeta=null;selectedLevel='';selectedPath=[];adm1Features=new Map();adm2Features=new Map();
      if(boundaryLayer){map.removeLayer(boundaryLayer);boundaryLayer=null}removeImagery();map.setView(WORLD_CENTER,WORLD_ZOOM);updateAdminLabels('');populateSelect(controls.adm1,[],'Select country first');populateSelect(controls.adm2,[],'Select region first');updateSummary();updateMeta(null);updateUrl();setStatus('ready','Choose a country or territory.','Administrative boundaries load on demand.');
    }

    function selectedBoundaryBbox(){return selectedBoundary?geometryBbox(selectedBoundary.geometry):null}
    function validateSearch(){
      if(!selectedBoundary)throw new Error('Select a country or territory and, for large countries, a smaller administrative area.');
      if(!controls.start.value||!controls.end.value)throw new Error('Select both start and end dates.');
      if(controls.start.value>controls.end.value)throw new Error('The start date must be before the end date.');
      const bbox=selectedBoundaryBbox();if(!bbox)throw new Error('The selected boundary has no usable geometry.');
      if((bbox[2]-bbox[0])>MAX_LONGITUDE_SPAN||(bbox[3]-bbox[1])>MAX_LATITUDE_SPAN)throw new Error('The selected area is too large for high-resolution evidence. Choose a state, province, region, district, county or municipality.');
    }

    function addTileLayer(tileJson,label){
      if(!tileJson||!Array.isArray(tileJson.tiles)||!tileJson.tiles[0])throw new Error('The tile service returned no usable map tiles.');
      removeImagery();
      imageryLayer=L.tileLayer(tileJson.tiles[0],{minZoom:Number.isFinite(tileJson.minzoom)?tileJson.minzoom:0,maxZoom:Number.isFinite(tileJson.maxzoom)?tileJson.maxzoom:24,opacity:Number(controls.opacity.value)/100,attribution:`${escapeHtml(label)} via <a href="https://planetarycomputer.microsoft.com/" target="_blank" rel="noopener">Microsoft Planetary Computer</a>`}).addTo(map);
      imageryLayer.bringToFront();if(boundaryLayer)boundaryLayer.bringToFront();renderLegend(true);
    }

    function selectBestItem(features){return [...features].sort((a,b)=>{const cloudA=Number(a.properties?.['eo:cloud_cover']??999),cloudB=Number(b.properties?.['eo:cloud_cover']??999);if(cloudA!==cloudB)return cloudA-cloudB;return new Date(b.properties?.datetime||0)-new Date(a.properties?.datetime||0)})[0]}
    function featureDate(feature){return feature?.properties?.datetime||feature?.properties?.start_datetime||''}
    function observationRange(features){const values=features.map(featureDate).filter(Boolean).map(value=>new Date(value)).filter(date=>!Number.isNaN(date.getTime())).sort((a,b)=>a-b);if(!values.length)return `${controls.start.value} to ${controls.end.value}`;return `${isoDate(values[0])} to ${isoDate(values[values.length-1])}`}
    function collectionProviders(collection){const providers=(collection?.providers||[]).map(provider=>provider.name).filter(Boolean);return providers.length?providers.join(', '):'Original dataset provider listed in collection metadata'}

    function setIndicatorOptions(requested=''){
      const items=indicatorList(controls.theme.value);
      controls.indicator.innerHTML=items.map(item=>`<option value="${item.key}">${escapeHtml(item.label)}</option>`).join('');
      controls.indicator.value=items.some(item=>item.key===requested)?requested:items[0].key;
      applyIndicator(false);
    }

    async function applyIndicator(reload=true){
      const indicator=selectedIndicator();controls.collection.value=indicator.collection||'sentinel-2-l2a';controls.collection.disabled=Boolean(indicator.lockCollection);removeImagery();lastMeta=null;updateThemeGuidance();updateSummary();renderLegend(false);await loadRenderOptions();updateMeta(null);updateUrl();if(reload)setStatus('ready',`${indicator.label} selected.`,selectedBoundary?'Load evidence for the selected administrative area.':'Select a country or territory to begin.')
    }

    async function loadRenderOptions(){
      const indicator=selectedIndicator(),collection=controls.collection.value;controls.render.disabled=true;controls.render.innerHTML='<option value="">Loading options…</option>';renderOptions=[];
      if(indicator.render){renderOptions=[indicator.render]}else{
        try{const info=await requestJson(`${DATA_API}/mosaic/info?collection=${encodeURIComponent(collection)}`);renderOptions=(info.renderOptions||[]).filter(option=>option&&option.type==='raster-tile')}catch(error){renderOptions=[]}
        if(indicator.renderMatcher){const matched=renderOptions.filter(option=>indicator.renderMatcher.test(`${option.name||''} ${option.description||''}`));if(matched.length)renderOptions=matched}
      }
      if(!renderOptions.length)renderOptions=[{name:'Collection default',description:'Default visualization supplied by the collection',options:''}];
      controls.render.innerHTML=renderOptions.map((option,index)=>`<option value="${index}">${escapeHtml(option.name||`Rendering ${index+1}`)}</option>`).join('');controls.render.disabled=renderOptions.length===1;
    }

    async function buildMosaic(searchParameters,renderConfig){
      const registered=await requestJson(`${DATA_API}/mosaic/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(searchParameters)});
      const tileLink=(registered.links||[]).find(link=>link.rel==='tilejson')?.href;if(!tileLink)throw new Error('The mosaic service did not return a TileJSON link.');
      const params=new URLSearchParams(renderConfig?.options||'');params.set('collection',controls.collection.value);
      const tileJson=await requestJson(`${tileLink}?${params.toString()}`);
      return {tileJson,pointBase:tileLink.replace(/\/tilejson\.json(?:\?.*)?$/,''),pointParams:params};
    }

    async function buildSingleItem(features,renderConfig){
      const selected=selectBestItem(features);if(!selected?.id)throw new Error('No suitable scene was available for fallback rendering.');
      const params=new URLSearchParams(renderConfig?.options||'');params.set('collection',controls.collection.value);params.set('item',selected.id);
      const tileJson=await requestJson(`${DATA_API}/item/tilejson.json?${params.toString()}`);
      return {tileJson,selected,pointBase:`${DATA_API}/item`,pointParams:params};
    }

    function numericValue(payload){const candidates=[];if(Array.isArray(payload?.values))candidates.push(...payload.values.flat(Infinity));if(Array.isArray(payload?.assets))payload.assets.forEach(asset=>{if(Array.isArray(asset?.values))candidates.push(...asset.values.flat(Infinity))});for(const value of candidates){const number=Number(value);if(Number.isFinite(number))return number}return null}
    function interpretValue(value){const key=selectedIndicator().key;if(key==='ndmi'){if(value<-.2)return 'Very low moisture signal';if(value<.1)return 'Low moisture signal';if(value<.25)return 'Transitional or mixed moisture signal';if(value<.4)return 'Moderate moisture signal';return 'High moisture signal'}if(key==='ndvi'){if(value<.1)return 'Very sparse or non-vegetated signal';if(value<.25)return 'Sparse vegetation signal';if(value<.45)return 'Moderate vegetation signal';if(value<.65)return 'Healthy vegetation signal';return 'Very strong vegetation signal'}return 'Context image; no classified index value'}

    async function samplePoint(latlng,openPopup=true){
      const indicator=selectedIndicator();
      if(!activePointBase||!activePointParams||indicator.key==='context'){
        const text=indicator.key==='context'?'Natural-colour context has no single indicator value. Select NDMI or NDVI for an index.':'Load an operational indicator before sampling a location.';
        if(openPopup)L.popup().setLatLng(latlng).setContent(`<strong>${escapeHtml(indicator.label)}</strong><br>${escapeHtml(text)}`).openOn(map);updateSummary({title:'No numeric value',text});return;
      }
      try{
        const params=new URLSearchParams(activePointParams.toString());const pointUrl=`${activePointBase}/point/${latlng.lng.toFixed(6)},${latlng.lat.toFixed(6)}?${params.toString()}`;
        const payload=await requestJson(pointUrl);const value=numericValue(payload);if(value===null)throw new Error('No valid pixel value was returned for this location.');
        const category=interpretValue(value);updateSummary({title:`${category} (${value.toFixed(3)})`,text:`Location ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)} within ${selectedGeographyLabel()}. ${selectedIndicator().requiredEvidence}`});
        if(openPopup)L.popup({maxWidth:360}).setLatLng(latlng).setContent(`<strong>${escapeHtml(indicator.label)}</strong><br><b>Value:</b> ${value.toFixed(3)}<br><b>Interpretation:</b> ${escapeHtml(category)}<br><b>Area:</b> ${escapeHtml(selectedGeographyLabel())}<br><small>${escapeHtml(selectedLegend().warning)}</small>`).openOn(map);
      }catch(error){const text='The evidence layer loaded, but the public point-sampling service did not return a usable value. Read the colour legend and try another location.';updateSummary({title:'Point value unavailable',text});if(openPopup)L.popup().setLatLng(latlng).setContent(`<strong>${escapeHtml(indicator.label)}</strong><br>${escapeHtml(text)}`).openOn(map)}
    }

    async function loadImagery(){
      try{validateSearch()}catch(error){setStatus('error','Search not started.',error.message);return}
      controls.load.disabled=true;controls.load.textContent='Loading thematic evidence…';setStatus('loading',`Loading ${selectedIndicator().label}…`,`${selectedGeographyLabel()} is being searched through Planetary Computer.`);
      const collectionId=controls.collection.value,collectionConfig=COLLECTIONS[collectionId];
      const searchParameters={collections:[collectionId],intersects:selectedBoundary.geometry,datetime:`${controls.start.value}/${controls.end.value}`,limit:100};
      if(collectionConfig?.cloud)searchParameters.query={'eo:cloud_cover':{lt:Number(controls.cloud.value)}};
      try{
        const [results,collectionMeta]=await Promise.all([requestJson(`${STAC_API}/search`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(searchParameters)}),requestJson(`${STAC_API}/collections/${encodeURIComponent(collectionId)}`).catch(()=>null)]);
        const features=Array.isArray(results.features)?results.features:[];if(!features.length)throw new Error('No matching scenes were found. Expand the date range, increase cloud tolerance or select another area.');
        const selectedRender=renderOptions[Number(controls.render.value)]||renderOptions[0]||{name:'Collection default',options:''};
        let mode='Planetary Computer mosaic',result,selectedItem=null;
        try{result=await buildMosaic(searchParameters,selectedRender)}catch(mosaicError){const fallback=await buildSingleItem(features,selectedRender);result=fallback;selectedItem=fallback.selected;mode='Best single-scene fallback'}
        const datasetName=collectionMeta?.title||COLLECTIONS[collectionId]?.label||collectionId;addTileLayer(result.tileJson,datasetName);activePointBase=result.pointBase;activePointParams=result.pointParams;
        const sceneCount=Number(results.context?.matched??results.numberMatched??features.length);
        lastMeta={dataset:datasetName,mode,sceneCount,observationRange:observationRange(features),rendering:selectedRender.name,providers:collectionProviders(collectionMeta),license:collectionMeta?.license||'See collection metadata'};
        updateMeta(lastMeta);const selectedNote=selectedItem?` Scene: ${selectedItem.id}.`:'';
        setStatus('success','Evidence layer loaded.',`${selectedIndicator().label}; ${selectedGeographyLabel()}; ${mode}; ${sceneCount} matching scene${sceneCount===1?'':'s'}.${selectedNote} Click the map for a location value.`);
        await samplePoint(boundaryLayer?.getBounds().getCenter()||map.getCenter(),false);
      }catch(error){console.error('FWI Planetary Computer map error',error);setStatus('error','Unable to load evidence.',error.name==='AbortError'?'The request timed out. Try a smaller administrative area or shorter date range.':error.message)}finally{controls.load.disabled=false;controls.load.textContent='Load evidence for selected area'}
    }

    controls.theme.addEventListener('change',()=>{setIndicatorOptions();setStatus('ready',`${selectedTheme().label} selected.`,selectedBoundary?'Choose an indicator and load evidence for the selected area.':'Select a country or territory to begin.')});
    controls.indicator.addEventListener('change',()=>applyIndicator(true));
    controls.country.addEventListener('change',()=>controls.country.value?chooseCountry(controls.country.value):resetToWorld());
    controls.adm1.addEventListener('change',()=>{if(controls.adm1.value)chooseAdm1(controls.adm1.value);else if(controls.country.value)chooseCountry(controls.country.value)});
    controls.adm2.addEventListener('change',()=>{if(controls.adm2.value)chooseAdm2(controls.adm2.value);else if(controls.adm1.value)chooseAdm1(controls.adm1.value)});
    controls.collection.addEventListener('change',()=>{removeImagery();lastMeta=null;loadRenderOptions();updateMeta(null);setStatus('ready','Dataset changed.','Load evidence to refresh the selected area.')});
    controls.render.addEventListener('change',()=>{removeImagery();lastMeta=null;setStatus('ready','Rendering changed.','Load evidence to refresh the selected area.')});
    controls.cloud.addEventListener('input',()=>{controls.cloudOutput.textContent=`${controls.cloud.value}%`});
    controls.opacity.addEventListener('input',()=>{controls.opacityOutput.textContent=`${controls.opacity.value}%`;if(imageryLayer)imageryLayer.setOpacity(Number(controls.opacity.value)/100)});
    controls.load.addEventListener('click',loadImagery);
    controls.clear.addEventListener('click',()=>{removeImagery();lastMeta=null;updateSummary();updateMeta(null);setStatus('ready','Evidence cleared.','The selected administrative boundary remains active.')});
    map.on('click',event=>samplePoint(event.latlng,true));

    updateThemeGuidance();updateSummary();renderLegend(false);updateMeta(null);
    const requestedIndicator=query.get('indicator');setIndicatorOptions(requestedIndicator);
    loadCountries().then(async()=>{
      const requestedCountry=query.get('country');
      if(requestedCountry&&countryCatalog.has(requestedCountry)){controls.country.value=requestedCountry;await chooseCountry(requestedCountry,query.get('adm1')||'',query.get('adm2')||'')}
    });
    setTimeout(()=>map.invalidateSize(),250);
  }

  function simplifyThemeNavigation(){document.querySelectorAll('.fwi-theme-nav-menu').forEach(menu=>{const group=menu.closest('.fwi-evidence-nav-group');if(!group)return;const link=group.querySelector(':scope > a');if(link){link.classList.add('fwi-theme-index-link');group.replaceWith(link)}})}
  function init(){simplifyThemeNavigation();document.querySelectorAll('[data-fwi-planetary-map]').forEach(initMap)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();