/* Local presentation only: no auth/network/storage actions. */
(()=>{'use strict';const input=document.getElementById('customer-password'),button=document.getElementById('password-reveal');if(!input||!button)return;let timer;
function show(on){clearTimeout(timer);input.type=on?'text':'password';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'Ocultar contraseña':'Mostrar contraseña');}
const hide=()=>show(false);
button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();show(true);if(button.setPointerCapture)button.setPointerCapture(e.pointerId);});
for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(event,hide);
button.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();show(true);}if(e.key==='Escape')hide();});
button.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();hide();}});
// Assistive technology can activate click without down/up. Reveal briefly, then
// automatically hide; a second activation, blur, hidden tab or submit hides sooner.
button.addEventListener('click',e=>{e.preventDefault();if(e.detail!==0)return;const visible=input.type==='text';show(!visible);if(!visible)timer=setTimeout(hide,5000);});
input.addEventListener('blur',hide);window.addEventListener('blur',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});input.form?.addEventListener('submit',hide);
})();
