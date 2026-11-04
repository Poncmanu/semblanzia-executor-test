'use strict';
// Pure client-side ranking validation. Server persistence must independently
// authorize customer ownership and published quote membership before acceptance.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PLANEACustomerRanking=api;
})(typeof window!=='undefined'?window:null,function(){
  function validate(publishedQuoteIds,rankedQuoteIds){
    if(!Array.isArray(publishedQuoteIds)||!Array.isArray(rankedQuoteIds))throw new Error('INVALID_RANKING');
    if(!publishedQuoteIds.length||publishedQuoteIds.length>10)throw new Error('INVALID_RANKING');
    if(publishedQuoteIds.some(id=>typeof id!=='string'||!id)||new Set(publishedQuoteIds).size!==publishedQuoteIds.length)throw new Error('INVALID_PUBLISHED_QUOTES');
    if(rankedQuoteIds.length!==publishedQuoteIds.length||new Set(rankedQuoteIds).size!==rankedQuoteIds.length)throw new Error('INCOMPLETE_RANKING');
    const published=new Set(publishedQuoteIds);
    if(rankedQuoteIds.some(id=>!published.has(id)))throw new Error('UNPUBLISHED_QUOTE');
    return rankedQuoteIds.slice();
  }
  function move(order,index,direction){
    if(!Array.isArray(order)||!Number.isInteger(index)||index<0||index>=order.length||![1,-1].includes(direction))throw new Error('INVALID_MOVE');
    const target=index+direction;
    if(target<0||target>=order.length)return order.slice();
    const copy=order.slice();[copy[index],copy[target]]=[copy[target],copy[index]];
    return copy;
  }
  return Object.freeze({validate,move});
});
