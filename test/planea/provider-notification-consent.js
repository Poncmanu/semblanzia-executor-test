/* TEST-only provider consent verifier. No outbound notifications or persistence. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PLANEAProviderNotificationConsent=api;
})(typeof window!=='undefined'?window:undefined,function(){
  'use strict';
  const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function normalized(value){
    if(value==null)return {email:null,authorization:'unknown',evidence:null,eligible:false};
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('INVALID_PROVIDER_NOTIFICATION_CONTACT');
    const email=typeof value.email==='string'?value.email.trim().toLowerCase():null;
    const evidence=typeof value.evidence==='string'?value.evidence.trim():null;
    const authorization=value.authorization;
    if((email!==null&&(!emailPattern.test(email)||email.length>254))||
       (evidence!==null&&evidence.length>1000)||
       !['authorized','not_authorized','unknown'].includes(authorization))throw Error('INVALID_PROVIDER_NOTIFICATION_CONTACT');
    if(authorization==='authorized'&&(!email||!evidence))throw Error('PROVIDER_NOTIFICATION_CONSENT_EVIDENCE_REQUIRED');
    return {email,authorization,evidence,eligible:authorization==='authorized'&&!!email&&!!evidence};
  }
  function fromReply(reply){return normalized(reply?.notification_contact);}
  return Object.freeze({normalized,fromReply});
});
