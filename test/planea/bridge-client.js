/* PLANEA AI Bridge v1. No UI or automatic network work. TEST-only integration boundary. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SemblanziaPlaneaBridge=factory();})(typeof window==='object'?window:this,function(){'use strict';
const TEST='https://vylrliliaojtcrrhvscv.supabase.co';
function create(client){
 if(!client||client.supabaseUrl!==TEST||typeof client.rpc!=='function')throw new Error('PLANEA_BRIDGE_TEST_CLIENT_REQUIRED');
 async function call(name,args){const {data,error}=await client.rpc(name,args);if(error)throw error;return data;}
 function parse(value){if(typeof value==='string'){if(new TextEncoder().encode(value).length>131072)throw new Error('BRIDGE_INVALID_DOCUMENT');value=JSON.parse(value);}if(!value||Array.isArray(value)||typeof value!=='object')throw new Error('BRIDGE_INVALID_DOCUMENT');return value;}
 return Object.freeze({
  sourcing:(request,count=3)=>call('planea_bridge_sourcing_v1',{p_request:request,p_desired_provider_count:count}),
  copyText:async(request,count=3)=>JSON.stringify(await call('planea_bridge_sourcing_v1',{p_request:request,p_desired_provider_count:count}),null,2),
  importQuote:(request,document,reviewed=false)=>{if(typeof reviewed!=='boolean')throw new Error('BRIDGE_REVIEW_BOOLEAN_REQUIRED');return call('planea_bridge_import_quote_v1',{p_request:request,p_package:parse(document),p_reviewed:reviewed});},
  validate:document=>call('planea_bridge_validate_v1',{p_document:parse(document)}),
  contract:name=>call('planea_bridge_contract_v1',{p_contract:name})
 });
}
return Object.freeze({TEST,create});
});
