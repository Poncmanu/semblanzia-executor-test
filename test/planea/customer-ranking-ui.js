'use strict';
// Customer-only ranking panel. No vendor dispatch or private data disclosure.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.PLANEACustomerRankingUI=api;})(typeof window!=='undefined'?window:null,function(root){
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const details=s=>String(s??'').replace(/https?:\/\/\S+|\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|(?:\+?\d[\d\s().-]{7,}\d)/gi,'[dato reservado]').slice(0,500);
 const money=(a,c)=>{try{return new Intl.NumberFormat('es-MX',{style:'currency',currency:c||'MXN'}).format(a);}catch(_){return String(a)+' '+(c||'');}};
 async function mount(data,{container,rpc,notice}){
  const comparison=(data.comparisons||[]).find(c=>c.status==='published');
  if(!comparison||!Array.isArray(comparison.comparison_data?.offers)||!comparison.comparison_data.offers.length)return false;
  const offers=comparison.comparison_data.offers;
  const ids=offers.map(o=>o.quote_id);
  if(!root.PLANEACustomerRanking)throw new Error('Ranking no disponible: falta el módulo de validación.');
  const engine=root.PLANEACustomerRanking;
  let saved=await rpc('planea_customer_ranking_v1',{p_request:data.request.id});
  const previouslySelected=(data.selections||[]).find(s=>s.status==='selected'&&ids.includes(s.quote_id));
  const initialIds=previouslySelected?[previouslySelected.quote_id,...ids.filter(id=>id!==previouslySelected.quote_id)]:ids;
  let order=engine.validate(ids,saved?.comparison_id===comparison.id&&Array.isArray(saved?.ordered_quote_ids)?saved.ordered_quote_ids:initialIds);
  let dirty=false,permission=false;
  function paint(){
   const locked=saved?.coordinate_contact===true;
   const accepted=saved?.comparison_id===comparison.id&&!dirty;
   const rankingCards=order.map((id,index)=>{
    const original=ids.indexOf(id),o=offers[original],p=o.offer||{};
    const parts=[
     p.capacity&&'<p><b>Capacidad:</b> '+safe(details(p.capacity))+'</p>',
     Array.isArray(p.inclusions)&&p.inclusions.length&&'<p><b>Incluye:</b> '+safe(details(p.inclusions.join(' · ')))+'</p>',
     Array.isArray(p.restrictions)&&p.restrictions.length&&'<p><b>Condiciones:</b> '+safe(details(p.restrictions.join(' · ')))+'</p>',
     Array.isArray(p.missing_information)&&p.missing_information.length&&'<p><b>Por confirmar:</b> '+safe(details(p.missing_information.join(' · ')))+'</p>'
    ].filter(Boolean).join('');
    return '<section class="ranking-item" data-rank-index="'+index+'">'+
     '<div class="ranking-item-main"><span class="ranking-number" aria-label="Prioridad '+(index+1)+'">'+(index+1)+'</span>'+
     '<div class="ranking-item-info"><b>Propuesta '+(original+1)+'</b><strong class="ranking-price">'+safe(money(o.amount,o.currency))+'</strong></div>'+
     (locked?'':'<div class="ranking-actions" aria-label="Cambiar orden de Propuesta '+(original+1)+'">'+
      '<button type="button" class="ranking-arrow" data-rank-move="-1" data-rank-index="'+index+'" '+(index===0?'disabled':'')+' aria-label="Subir propuesta '+(original+1)+'">↑</button>'+
      '<button type="button" class="ranking-arrow" data-rank-move="1" data-rank-index="'+index+'" '+(index===order.length-1?'disabled':'')+' aria-label="Bajar propuesta '+(original+1)+'">↓</button></div>')+
     '</div><details class="ranking-details"><summary>Ver más detalles</summary><div class="ranking-details-body">'+
     (parts||'<p>Consulta el precio publicado y solicita aclaraciones durante la coordinación.</p>')+
     '</div></details></section>';
   }).join('');
   const confirmation='<div class="ranking-confirmed" role="status"><span class="ranking-confirmed-icon" aria-hidden="true">✓</span>'+
    '<div><strong>Solicitud recibida</strong><p>Tu orden de preferencia está confirmado. Semblanzia coordinará las oportunidades siguiendo ese orden.</p>'+
    '<small>Tu información personal sigue protegida. No necesitas hacer nada más por ahora.</small></div></div>';
   container.innerHTML='<article class="ranking-panel"><div class="ranking-intro"><p class="ranking-kicker">TUS PROPUESTAS</p>'+
    '<h2>'+(locked?'Tus preferencias confirmadas':'Elige el orden de tus propuestas favoritas')+'</h2>'+
    (locked?'<p>Este es el orden que elegiste. Ya no puedes modificarlo ni enviar otra solicitud.</p>':
    '<p>Ordena tus propuestas de la que más te interesa a la que menos. Semblanzia seguirá este orden al gestionar el contacto con proveedores.</p>'+
    '<p class="ranking-disclaimer">Comparar y ordenar no te compromete a contratar ni genera ningún pago.</p>')+'</div>'+
    '<div class="ranking-list">'+rankingCards+'</div>'+
    (locked?confirmation:
     '<div class="ranking-next"><button id="save-customer-ranking" type="button">Confirmar orden de preferencia</button>'+
     (accepted?'<p class="ranking-inline-status" role="status">✓ Orden guardado. Tu primera opción es Propuesta '+(ids.indexOf(order[0])+1)+'.</p>':
      '<p class="ranking-hint">Revisa el orden antes de continuar.</p>')+'</div>'+
     '<section class="ranking-contact"><h3>¿Quieres que Semblanzia gestione el contacto?</h3>'+
     '<p>Con tu autorización gestionaremos oportunidades con los proveedores en el orden que elegiste. Esto no envía mensajes automáticamente ni comparte tu teléfono o correo personal.</p>'+
     '<label class="ranking-consent"><input id="ranking-coordinate-consent" type="checkbox" '+(!accepted?'disabled':'')+'><span>Autorizo a Semblanzia a gestionar el contacto con estos proveedores. Mis datos personales solo podrán compartirse con mi autorización posterior.</span></label>'+
     '<button id="ranking-coordinate-submit" type="button" '+(!accepted||!permission?'disabled':'')+'>Solicitar conexión con mis proveedores</button>'+
     '</section>')+'</article>';
   if(locked)return;
   container.querySelectorAll('[data-rank-move]').forEach(btn=>btn.addEventListener('click',()=>{
    if(saved?.coordinate_contact)return;
    order=engine.move(order,Number(btn.dataset.rankIndex),Number(btn.dataset.rankMove));
    dirty=true;permission=false;paint();
   }));
   container.querySelector('#save-customer-ranking').addEventListener('click',()=>commit(false));
   container.querySelector('#ranking-coordinate-consent').addEventListener('change',event=>{
    permission=event.target.checked;
    container.querySelector('#ranking-coordinate-submit').disabled=!permission||!saved||dirty||!!saved.coordinate_contact;
   });
   container.querySelector('#ranking-coordinate-submit').addEventListener('click',()=>{
    if(saved?.coordinate_contact)return;
    if(!permission||dirty){notice('Primero confirma el orden y marca la autorización.',true);return;}
    commit(true);
   });
  }
  async function commit(authorize){
   if(saved?.coordinate_contact){notice('El orden ya está confirmado y no se puede modificar.',true);return;}
   const btn=container.querySelector(authorize?'#ranking-coordinate-submit':'#save-customer-ranking');btn.disabled=true;
   try{
    if(authorize&&!permission)throw Error('Se requiere tu autorización expresa.');
    order=engine.validate(ids,order);
    saved=await rpc('planea_save_customer_ranking_v1',{p_request:data.request.id,p_comparison:comparison.id,p_quotes:order,p_contact_permission:authorize});
    dirty=false;permission=false;paint();
    // Persistent in-card status instead of duplicate error-looking toast.
   }catch(e){btn.disabled=false;notice(e.message||'No se pudo guardar tu decisión.',true);}
  }
  paint();return true;
 }
 return {mount};
});
