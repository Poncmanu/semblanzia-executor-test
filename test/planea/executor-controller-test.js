(() => {
  'use strict';
  const TEST = 'https://vylrliliaojtcrrhvscv.supabase.co';
  const $ = s => document.querySelector(s);
  const buttons = [...document.querySelectorAll('[data-case]')];
  let authorized = false, busy = false;
  function controls() { buttons.forEach(b => b.disabled = !authorized || busy); }
  if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL !== TEST) {
    $('#status').textContent = 'ERROR: esta página no está conectada a TEST.';
    $('#login').hidden = true;
    controls();
    return;
  }
  const c = window.supabase.createClient(TEST, SUPABASE_ANON_KEY, { auth: { flowType: 'pkce' } });
  $('#build').textContent = typeof EXECUTOR_TEST_BUILD === 'string' ? 'Versión: ' + EXECUTOR_TEST_BUILD : 'Arnés TEST local';
  async function rpc(name, args = {}) {
    const { data, error } = await c.rpc(name, args);
    if (error) throw error;
    return data;
  }
  async function init() {
    authorized = false; controls();
    const { data, error } = await c.auth.getSession();
    if (error || !data.session) {
      $('#auth').hidden = false; $('#signout').hidden = true;
      $('#status').textContent = 'Inicia sesión con tu cuenta de operador PLANEA TEST.'; return;
    }
    $('#auth').hidden = true; $('#signout').hidden = false;
    try {
      authorized = await rpc('planea_operator_status') === true;
      $('#status').textContent = authorized ? '✓ Operador autorizado · Conectado sólo a TEST' : 'Tu cuenta no está autorizada como operador TEST.';
    } catch (e) { $('#status').textContent = 'No se pudo verificar la autorización: ' + e.message; }
    controls();
  }
  $('#google').addEventListener('click', async () => {
    $('#message').textContent = 'Abriendo acceso Google de TEST…';
    const redirectTo = new URL('executor-controller-test.html', window.location.href).href;
    const { error } = await c.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) $('#message').textContent = 'No se pudo abrir Google: ' + error.message;
  });
  $('#login').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget;
    $('#message').textContent = 'Iniciando sesión en TEST…';
    try {
      const { error } = await c.auth.signInWithPassword({ email: form.elements.email.value.trim(), password: form.elements.password.value });
      form.elements.password.value = ''; if (error) throw error;
      await init(); $('#message').textContent = '';
    } catch (e) { $('#message').textContent = 'No se pudo iniciar sesión: ' + e.message; }
  });
  $('#signout').addEventListener('click', async () => { await c.auth.signOut(); await init(); });
  function showResult(name, d) {
    const box = $('#result-' + name); box.replaceChildren();
    const verdict = document.createElement('p');
    verdict.className = 'verdict ' + (d.pass ? 'acceptance-pass' : 'acceptance-fail'); verdict.textContent = d.pass ? '✓ PASS' : '✕ FAIL'; box.appendChild(verdict);
    const fields = [ ['Estrategia', d.strategy], ['Executor', d.executor], ['Estado', d.status], ['Acciones humanas', d.human_actions], ['Tareas humanas', d.operator_tasks], ['Respaldo utilizado', d.fallback_used ? 'Sí' : 'No'], ['Error', d.error_code || 'Ninguno'], ['Contacto externo', d.network_called === false ? 'No' : 'REVISAR'], ['Datos sintéticos limpiados', d.artifacts_cleaned === true ? 'Sí' : 'REVISAR'], ['Política manual restaurada', d.policy_restored === true && d.normal_manual_policy === true ? 'Sí' : 'REVISAR'] ];
    const list = document.createElement('dl');
    for (const [label, value] of fields) {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = String(value); list.appendChild(dt); list.appendChild(dd);
    }
    box.appendChild(list);
  }
  buttons.forEach(b => b.addEventListener('click', async () => {
    if (!authorized || busy) return;
    busy = true; controls(); $('#message').textContent = 'Ejecutando prueba sintética…'; $('#result-' + b.dataset.case).textContent = 'Ejecutando…';
    try {
      const d = await rpc('planea_executor_acceptance_v1', { p_case: b.dataset.case }); showResult(b.dataset.case, d);
      $('#message').textContent = d.pass ? '✓ Prueba completada. Puedes repetirla o continuar con el siguiente caso.' : '✕ FAIL — revisar el resultado antes de aceptar.';
    } catch (e) {
      $('#result-' + b.dataset.case).textContent = '✕ ERROR: ' + e.message; $('#message').textContent = 'La prueba no pudo completarse.'; await init();
    } finally { busy = false; controls(); }
  }));
  c.auth.onAuthStateChange(() => { authorized = false; controls(); setTimeout(() => init(), 0); });
  init();
})();
