(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PLANEACandidateCorrelation=api;})(typeof window==='object'?window:globalThis,function(){
'use strict';
function reference(value){if(!value||typeof value.provider_name!=='string'||typeof value.service_category!=='string'||!value.provider_name.replace(/^ +| +$/g,'')||!value.service_category)throw new Error('INVALID_CANDIDATE_REFERENCE');return {provider_name:value.provider_name.replace(/^ +| +$/g,'').toLowerCase(),service_category:value.service_category};}
const key=value=>JSON.stringify(reference(value));
function verifyMapping(pkg,mapping){if(!Array.isArray(mapping))throw new Error('CANDIDATE_MAPPING_REQUIRED');for(const c of pkg.candidates){const matches=mapping.filter(m=>key(m.candidate_ref)===key(c));if(matches.length!==1||!matches[0].candidate_id)throw new Error('CANDIDATE_MAPPING_REQUIRED');}return mapping;}
function response(pkg,request,candidateId,mapping){
 if(pkg?.contract!=='planea.provider_response.v1'||pkg?.version!==1)throw new Error('INVALID_PROVIDER_RESPONSE_CONTRACT');
 if(pkg.request_ref!==request)throw new Error('PROVIDER_RESPONSE_REFERENCE_MISMATCH');
 if(pkg.candidate_ref){if(Object.keys(pkg.candidate_ref).some(k=>!['provider_name','service_category'].includes(k)))throw new Error('INVALID_CANDIDATE_REFERENCE');if(!Array.isArray(mapping))throw new Error('CANDIDATE_MAPPING_REQUIRED');const matches=mapping.filter(m=>key(m.candidate_ref)===key(pkg.candidate_ref));if(matches.length!==1||matches[0].candidate_id!==candidateId||(pkg.candidate_id&&pkg.candidate_id!==candidateId))throw new Error('PROVIDER_RESPONSE_REFERENCE_MISMATCH');return {...pkg,candidate_ref:reference(pkg.candidate_ref)};}
 if(pkg.candidate_id!==candidateId)throw new Error('PROVIDER_RESPONSE_REFERENCE_MISMATCH');return pkg;
}
return {reference,key,verifyMapping,response};
});
