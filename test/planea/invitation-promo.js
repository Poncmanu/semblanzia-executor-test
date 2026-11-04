/* PLANEA customer-only, TEST-only invitation cross-promotion. No send or tracking. */
(function(){
  'use strict';
  let overlay=null;
  let opener=null;
  let active=false;

  function create(){
    if(overlay)return overlay;
    const el=document.createElement('div');
    el.className='planea-invitation-promo';
    el.hidden=true;
    el.innerHTML=`<section class="planea-invitation-promo-dialog" role="dialog" aria-modal="true" aria-labelledby="planea-invite-title" aria-describedby="planea-invite-copy" tabindex="-1">
      <button type="button" class="planea-invitation-promo-x" data-promo-close aria-label="Cerrar invitación promocional">×</button>
      <div class="planea-invitation-promo-content">
        <div class="planea-invitation-promo-copy">
          <p class="planea-invitation-promo-eyebrow">SEMBLANZIA · INVITA</p>
          <h2 id="planea-invite-title">¡Recibimos tu solicitud!</h2>
          <p id="planea-invite-copy">Estamos buscando opciones para tu evento. Mientras preparamos tus propuestas, puedes crear tu invitación digital gratis.</p>
          <p class="planea-invitation-promo-note">Personalízala a tu estilo y comparte tu celebración.</p>
          <div class="planea-invitation-promo-actions">
            <a class="button" href="../builder/?from=planea" id="planea-invite-builder">Crear mi invitación gratis →</a>
            <button type="button" class="secondary" data-promo-close>Ahora no, ver mi solicitud</button>
          </div>
        </div>
        <div class="planea-invitation-promo-visual">
          <div class="planea-invitation-promo-phone" aria-label="Vista previa de invitación digital">
            <div class="planea-invitation-promo-speaker" aria-hidden="true"></div>
            <iframe title="Vista previa de invitación Semblanzia" tabindex="-1" aria-hidden="true" loading="lazy"></iframe>
          </div>
          <p class="planea-invitation-promo-caption">Vista previa ilustrativa: usa la invitación guardada en este navegador cuando está disponible.</p>
        </div>
      </div>
    </section>`;
    el.addEventListener('click',e=>{if(e.target===el||e.target.closest('[data-promo-close]'))close();});
    el.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();close();return;}
      if(e.key!=='Tab')return;
      const controls=[...el.querySelectorAll('a[href],button:not([disabled])')];
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    document.body.appendChild(el);
    overlay=el;
    return overlay;
  }
  function close(){
    if(!overlay||!active)return;
    active=false;
    overlay.hidden=true;
    document.body.classList.remove('planea-invitation-promo-open');
    const frame=overlay.querySelector('iframe');
    if(frame)frame.removeAttribute('src');
    if(opener?.isConnected)opener.focus({preventScroll:true});
    opener=null;
  }
  async function open(){
    const el=create();
    if(active)return;
    active=true;
    opener=document.activeElement;
    el.hidden=false;
    document.body.classList.add('planea-invitation-promo-open');
    el.querySelector('[data-promo-close]').focus({preventScroll:true});
    // Same-origin preview uses the *existing* invitation runtime and saved browser draft;
    // large local photos are hydrated by the same helper as the Semblanzia landing.
    try{await window.hydrateSemblanziaInvitationPreview?.();}
    catch(_){/* Safe fallback: preview runtime reads localStorage itself. */}
    if(!active)return;
    const frame=el.querySelector('iframe');
    frame.src=new URL('../invitation/?preview=landing',location.href).toString();
  }
  window.SemblanziaPlaneaInvitationPromo={open,close};
})();
