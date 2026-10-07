(() => {
'use strict';
const TEST='https://vylrliliaojtcrrhvscv.supabase.co',$=s=>document.querySelector(s),buttons=[...document.querySelectorAll('[data-case]')];
let authorized=false,busy=false,policies=[];
const strategyLabel={manual:'Human',ai_assisted:'AI-assisted',automated:'Automatic',api:'API'};
function controls(){buttons.forEach(b=>b.disabled=!authorized||busy);$('#refresh').disabled=!authorized||busy;}
if(typeof SUPABASE_URL==='undefined'||SUPABASE_URL!==TEST){$('#status').textContent='ERROR: esta página no está conectada a TEST.';$('#login').hidden=true;controls();return;}
const c=window.supabase.createClient(TEST,SUPABASE_ANON_KEY,{auth:{flowType:'pkce'}});
$('#build').textContent=typeof EXECUTOR_TEST_BUILD==='string'?'Versión: '+EXECUTOR_TEST_BUILD:'Control Center TEST';
async function rpc(name,args={}){const {data,error}=await c.rpc(name,args);if(error)throw error;return data;}
function policyCard(p){
 const article=document.createElement('article');article.className='card action-card';article.dataset.action=p.action_key;
 const head=document.createElement('div');head.className='action-head';
 const title=document.createElement('div');title.innerHTML='<p class="action-key"></p><h3></h3><p class="muted purpose"></p>';title.querySelector('.action-key').textContent=p.action_key;title.querySelector('h3').textContent=p.display_name;title.querySelector('.purpose').textContent=p.purpose||'';
 const badge=document.createElement('span');badge.className='strategy-badge';badge.textContent=strategyLabel[p.executor_strategy]||p.executor_strategy;head.append(title,badge);
 const form=document.createElement('form');form.className='policy-form';
 const label=document.createElement('label');label.textContent='Responsable / modo';
 const select=document.createElement('select');select.name='strategy';[['manual','Human'],['ai_assisted','AI-assisted'],['automated','Automatic'],['api','API']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;o.selected=p.executor_strategy===v;select.append(o);});label.append(select);
 const meta=document.createElement('div');meta.className='policy-meta';meta.innerHTML='<span>Executor: <strong></strong></span><span>Fallback: <strong></strong></span><span>Estado: <strong></strong></span>';const ss=meta.querySelectorAll('strong');ss[0].textContent=p.executor_key;ss[1].textContent=strategyLabel[p.fallback_strategy]||p.fallback_strategy;ss[2].textContent=p.enabled?'Activo':'Desactivado';
 const save=document.createElement('button');save.type='submit';save.textContent='Guardar cambio';save.disabled=!p.operator_editable;
 form.append(label,meta,save);article.append(head,form);
 form.addEventListener('submit',async e=>{e.preventDefault();if(!authorized||busy)return;const next=select.value;if(next===p.executor_strategy){$('#message').textContent='No hay cambios que guardar en '+p.display_name+'.';return;}if(!window.confirm('Cambiar '+p.display_name+' de '+(strategyLabel[p.executor_strategy]||p.executor_strategy)+' a '+strategyLabel[next]+' en TEST?')){select.value=p.executor_strategy;return;}busy=true;controls();save.disabled=true;$('#message').textContent='Guardando política TEST…';try{await rpc('planea_executor_policy_set_v1',{p_action_key:p.action_key,p_strategy:next,p_executor_key:null,p_fallback_strategy:null,p_enabled:null});await loadPolicies();$('#message').textContent='✓ Política TEST actualizada. PROD no fue modificado.';}catch(err){select.value=p.executor_strategy;$('#message').textContent='No se pudo guardar: '+err.message;}finally{busy=false;controls();}});
 return article;
}
async function loadPolicies(){policies=await rpc('planea_executor_policies_v1');const list=$('#action-list');list.replaceChildren();policies.forEach(p=>list.append(policyCard(p)));$('#control-center').hidden=false;}
async function init(){authorized=false;controls();const {data,error}=await c.auth.getSession();if(error||!data.session){$('#auth').hidden=false;$('#signout').hidden=true;$('#control-center').hidden=true;$('#status').textContent='Inicia sesión con tu cuenta de operador PLANEA TEST.';return;}$('#auth').hidden=true;$('#signout').hidden=false;try{authorized=await rpc('planea_operator_status')===true;$('#status').textContent=authorized?'✓ Operador autorizado · Control Center conectado sólo a TEST':'Tu cuenta no está autorizada como operador TEST.';if(authorized)await loadPolicies();}catch(e){$('#status').textContent='No se pudo verificar la autorización: '+e.message;}controls();}
$('#refresh').addEventListener('click',async()=>{if(!authorized)return;try{await loadPolicies();$('#message').textContent='✓ Controles actualizados.';}catch(e){$('#message').textContent='No se pudo actualizar: '+e.message;}});
$('#google').addEventListener('click',async()=>{const redirectTo=new URL('executor-controller-test.html',window.location.href).href;const {error}=await c.auth.signInWithOAuth({provider:'google',options:{redirectTo}});if(error)$('#message').textContent='No se pudo abrir Google: '+error.message;});
$('#login').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;try{const {error}=await c.auth.signInWithPassword({email:f.elements.email.value.trim(),password:f.elements.password.value});f.elements.password.value='';if(error)throw error;await init();}catch(err){$('#message').textContent='No se pudo iniciar sesión: '+err.message;}});
$('#signout').addEventListener('click',async()=>{await c.auth.signOut();await init();});
function showResult(name,d){const box=$('#result-'+name);box.replaceChildren();const v=document.createElement('p');v.className='verdict '+(d.pass?'acceptance-pass':'acceptance-fail');v.textContent=d.pass?'✓ PASS':'✕ FAIL';box.append(v);const p=document.createElement('p');p.textContent=(strategyLabel[d.strategy]||d.strategy)+' · '+d.status+' · '+d.operator_tasks+' tarea(s)';box.append(p);}
buttons.forEach(b=>b.addEventListener('click',async()=>{if(!authorized||busy)return;busy=true;controls();try{const d=await rpc('planea_executor_acceptance_v1',{p_case:b.dataset.case});showResult(b.dataset.case,d);$('#message').textContent=d.pass?'✓ Diagnóstico completado.':'✕ Diagnóstico falló.';}catch(e){$('#result-'+b.dataset.case).textContent='✕ ERROR: '+e.message;}finally{busy=false;controls();}}));
c.auth.onAuthStateChange(()=>{authorized=false;controls();setTimeout(()=>init(),0);});init();
})();