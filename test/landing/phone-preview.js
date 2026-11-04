// Landing-page live invitation preview.
// Exposes a hydrated builder state to the invitation iframe without persisting large image data in localStorage.
(function(){
  const STORE_NAME='images';
  let hydratedState=null;
  const scriptUrl=document.currentScript?.src || new URL('landing/phone-preview.js',location.href).toString();

  function baseState(){
    try{return JSON.parse(localStorage.getItem('semblanziaBuilderState')||'{}')}catch(e){return{}}
  }

  function openDb(){return window.SemblanziaMediaStore.open()}

  function readStored(db,key){
    return new Promise((resolve,reject)=>{
      if(!key){resolve(null);return;}
      const tx=db.transaction(STORE_NAME,'readonly');
      const req=tx.objectStore(STORE_NAME).get(key);
      req.onsuccess=()=>resolve(req.result?.blob||req.result||null);
      req.onerror=()=>reject(req.error);
    });
  }

  function asDataUrl(blob){
    return new Promise((resolve,reject)=>{
      if(!blob){resolve('');return;}
      const reader=new FileReader();
      reader.onload=()=>resolve(reader.result||'');
      reader.onerror=()=>reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function hydrate(){
    const s=baseState();
    hydratedState=s;
    try{
      const db=await openDb();
      try{
        if(s.style?.heroImageStoreKey&&!s.style?.heroImageData){
          const blob=await readStored(db,s.style.heroImageStoreKey);
          if(blob)s.style.heroImageData=await asDataUrl(blob);
        }
        for(let i=0;i<(s.venues||[]).length;i++){
          const v=s.venues[i];
          if(!v?.imageStoreKey||v.imageData)continue;
          const blob=await readStored(db,v.imageStoreKey);
          if(blob)v.imageData=await asDataUrl(blob);
        }
      }finally{db.close()}
    }catch(e){
      // The invitation still renders from saved builder data if media storage is unavailable.
    }
    hydratedState=s;
  }

  window.getSemblanziaBuilderState=()=>hydratedState||baseState();
  // Exposed for PLANEA's post-submission preview, without running landing initialization.
  window.hydrateSemblanziaInvitationPreview=hydrate;

  async function boot(){
    const frame=document.querySelector('.phone-shell iframe');
    if(frame){
      await hydrate();
      const url=new URL(frame.getAttribute('src'),location.href);
      url.searchParams.set('t',Date.now().toString());
      frame.src=url.toString();
      const i18n=document.createElement('script');
      i18n.src=new URL('i18n.js?v=20260905-1',scriptUrl).toString();
      i18n.defer=true;
      document.body.appendChild(i18n);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
