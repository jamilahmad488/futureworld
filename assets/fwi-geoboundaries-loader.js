/* FutureWorld Intelligence — geoBoundaries Git LFS compatibility loader v1.0 */
(function(){
  'use strict';

  if(typeof window.fetch!=='function'||window.__FWI_GEOBOUNDARIES_FETCH_FIX__)return;
  window.__FWI_GEOBOUNDARIES_FETCH_FIX__=true;

  const nativeFetch=window.fetch.bind(window);

  function toMediaUrl(value){
    let url;
    try{url=new URL(value,window.location.href)}catch(error){return value}

    const host=url.hostname.toLowerCase();
    let parts;

    if(host==='github.com'){
      parts=url.pathname.split('/').filter(Boolean);
      if(parts.length>=5&&parts[0]==='wmgeolab'&&parts[1]==='geoBoundaries'&&parts[2]==='raw'){
        const ref=parts[3];
        const path=parts.slice(4).join('/');
        return `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/${encodeURIComponent(ref)}/${path}`;
      }
    }

    if(host==='raw.githubusercontent.com'){
      parts=url.pathname.split('/').filter(Boolean);
      if(parts.length>=4&&parts[0]==='wmgeolab'&&parts[1]==='geoBoundaries'){
        const ref=parts[2];
        const path=parts.slice(3).join('/');
        return `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/${encodeURIComponent(ref)}/${path}`;
      }
    }

    return value;
  }

  window.fetch=function(input,init){
    const originalUrl=typeof input==='string'||input instanceof URL?String(input):input instanceof Request?input.url:'';
    const replacement=originalUrl?toMediaUrl(originalUrl):originalUrl;

    if(!replacement||replacement===originalUrl)return nativeFetch(input,init);

    if(input instanceof Request){
      return nativeFetch(new Request(replacement,input),init);
    }

    return nativeFetch(replacement,init);
  };
})();
