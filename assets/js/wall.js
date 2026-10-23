(function(){
  var cur = window.DONORS_CURRENT || [], prev = window.DONORS_PREVIOUS || [];
  var sortOn = window.WALL_SORT !== false;
  function prep(list){
    var named = list.filter(function(n){ return n && !/^anonymous$/i.test(n.trim()); }).map(function(n){ return n.trim(); });
    var anon = list.length - named.length;
    if (sortOn) named.sort(function(a,b){ return a.localeCompare(b, 'en', { sensitivity: 'base' }); });
    return { named: named, anon: anon };
  }
  function initial(n){ var m = n.match(/[A-Za-z]/); return m ? m[0].toUpperCase() : '#'; }
  function render(ul, data, q){
    ul.innerHTML = '';
    var frag = document.createDocumentFragment(), shown = 0, lastL = '';
    data.named.forEach(function(n){
      if (q && n.toLowerCase().indexOf(q) === -1) return;
      var L = initial(n);
      if (!q && L !== lastL) { var h = document.createElement('li'); h.className = 'wall-letter'; h.textContent = L; h.setAttribute('aria-hidden','true'); frag.appendChild(h); lastL = L; }
      var li = document.createElement('li'); li.className = 'wall-name';
      li.textContent = n; frag.appendChild(li); shown++;
    });
    if (data.anon && (!q || 'anonymous'.indexOf(q) !== -1)) {
      var a = document.createElement('li'); a.className = 'wall-name wall-name--anon';
      a.textContent = data.anon === 1 ? 'Anonymous donor' : data.anon + ' Anonymous donors'; frag.appendChild(a); shown += data.anon;
    }
    ul.appendChild(frag);
    return shown;
  }
  var dc = prep(cur), dp = prep(prev);
  var listC = document.getElementById('listCurrent'), listP = document.getElementById('listPrev');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.wall-tab'));
  var panels = { 'tab-current': document.getElementById('panel-current'), 'tab-prev': document.getElementById('panel-prev') };
  var ink = document.querySelector('.wall-tabs__ink'), search = document.getElementById('wallSearch');
  var shownEl = document.getElementById('wallShown'), emptyEl = document.getElementById('wallEmpty');
  var active = 'tab-current';
  function countUp(el, to){
    if (!el) return; var start = null, dur = 1200;
    function f(t){ if (!start) start = t; var k = Math.min((t-start)/dur, 1); k = 1 - Math.pow(1-k, 3); el.textContent = Math.round(to*k).toLocaleString('en-IN'); if (k < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  countUp(document.getElementById('statCurrent'), dc.named.length + dc.anon);
  countUp(document.getElementById('statPrev'), dp.named.length + dp.anon);
  function moveInk(btn){ if (!ink) return; ink.style.width = btn.offsetWidth + 'px'; ink.style.transform = 'translateX(' + btn.offsetLeft + 'px)'; }
  function refresh(){
    var q = search ? (search.value || '').trim().toLowerCase() : '';
    var n = active === 'tab-current' ? render(listC, dc, q) : render(listP, dp, q);
    shownEl.textContent = n.toLocaleString('en-IN');
    emptyEl.hidden = n !== 0;
  }
  function activate(id){
    active = id;
    tabs.forEach(function(t){ var on = t.id === id; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); if (on) moveInk(t); });
    Object.keys(panels).forEach(function(k){ var on = k === id; panels[k].hidden = !on; panels[k].classList.toggle('is-active', on); });
    refresh();
    if (history.replaceState) history.replaceState(null, '', id === 'tab-prev' ? '#previous' : '#current');
  }
  tabs.forEach(function(t){ t.addEventListener('click', function(){ activate(t.id); }); });
  if (search) search.addEventListener('input', refresh);
  window.addEventListener('resize', function(){ var t = document.getElementById(active); if (t) moveInk(t); });
  activate(location.hash === '#previous' ? 'tab-prev' : 'tab-current');
})();
