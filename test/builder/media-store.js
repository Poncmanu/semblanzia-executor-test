// Shared TEST media schema. A reader must initialize the store too: opening a
// nonexistent IndexedDB database creates it even when the caller only reads.
(function(){
  const PRIMARY='semblanziaBuilderMedia';
  const RECOVERY='semblanziaBuilderMediaTestRecovery';
  const STORE='images';
  function open(name){
    return new Promise((resolve,reject)=>{
      const request=indexedDB.open(name);
      request.onupgradeneeded=()=>{
        if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE);
      };
      request.onerror=()=>reject(request.error||new Error('Could not open media database'));
      request.onsuccess=()=>{
        const db=request.result;
        db.onversionchange=()=>db.close();
        resolve(db);
      };
    });
  }
  window.SemblanziaMediaStore={async open(){
    const db=await open(PRIMARY);
    if(db.objectStoreNames.contains(STORE))return db;
    db.close();
    // Legacy landing/public readers could create version 1 without `images`.
    // Do not delete or upgrade that same-origin database: production still opens
    // version 1. TEST alone uses a recovery database with the original slot keys.
    const recovery=await open(RECOVERY);
    if(recovery.objectStoreNames.contains(STORE))return recovery;
    recovery.close();
    throw new Error('TEST media recovery database is missing its images store');
  }};
})();
