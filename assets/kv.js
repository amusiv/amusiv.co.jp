// KV：絵は最初から全体に出し、左の文も置いたまま。絵の右寄りに 場面1 → 場面2 → 場面3 と重ね、最後は場面を消して絵だけで止める（1回だけ送る）。左下のボタンで場面を移る
// 自動で送る時刻は #kv の data-kv-slots（build_kv2.py が書く）。替わり方と場面の中の動きは kv_time.css
// 動きを減らす設定の人（html に .js-intro が無い）：送らずに絵で止め、ボタンで動きなしに移る
// 書体が読み込まれてから始める（最初の場面を代わりの書体で見せないため。待つのは最長1.5秒）
(function () {
  var root = document.documentElement;
  var hero = document.getElementById('kv');
  if (!hero || !root.classList.contains('kv-js')) return;
  var stage = hero.querySelector('.kv-stage');
  var scenes = Array.prototype.slice.call(hero.querySelectorAll('.kv-sc'));
  var btns = Array.prototype.slice.call(hero.querySelectorAll('.kv-nav button'));
  var wipe = hero.querySelector('.kv-wipe');
  var slots = (hero.getAttribute('data-kv-slots') || '').split(',').map(Number);
  var len = +hero.getAttribute('data-kv-len') || 500;
  var intro = root.classList.contains('js-intro');
  var cur = scenes.length - 1, z = 1, token = 0, timers = [];

  function mark(i) {
    btns.forEach(function (b, j) {
      b.setAttribute('aria-current', j === i ? 'true' : 'false');
      b.classList.toggle('is-cur', j === i);
      b.classList.remove('is-run');
    });
  }
  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  function hide(s) {
    s.classList.remove('on', 'rev', 'out', 'is-in');
    s.setAttribute('aria-hidden', 'true');
    s.inert = true;
  }
  function settle(i) {
    scenes.forEach(function (s, j) { if (j !== i) hide(s); });
    scenes[i].classList.remove('rev'); // 替わり終わったら切り抜きを外す（紙片の影まで見せる）
  }
  function show(i, still) {
    if (i === cur) return;
    var t = ++token, sc = scenes[i], prev = scenes[cur];
    // 場面は下地ごと絵に重なるので、前の場面は帯の前（右）だけを残す。その前の場面はすぐ隠す
    scenes.forEach(function (s, j) { if (j !== i && j !== cur) hide(s); });
    if (prev && !still) { prev.classList.remove('rev'); restart(prev, 'out'); }
    cur = i;
    hero.classList.add('s-live');
    sc.style.zIndex = ++z;
    sc.classList.remove('out');
    sc.classList.add('on');
    sc.removeAttribute('aria-hidden');
    sc.inert = false;
    mark(i);
    if (still) {
      sc.classList.remove('rev', 'is-in');
      settle(i);
      return;
    }
    restart(sc, 'rev');
    restart(sc, 'is-in');
    wipe.style.zIndex = ++z;
    restart(wipe, 'go');
    setTimeout(function () { if (t === token) settle(i); }, len + 60);
  }
  // 自動の送りの間は、今の場面のボタンの線が次の場面までの時間で伸びる
  function run(i, ms) {
    var b = btns[i];
    if (!b) return;
    b.style.setProperty('--dur', ms + 'ms');
    restart(b, 'is-run');
  }
  function stopAuto() {
    timers.forEach(clearTimeout);
    timers = [];
    hero.classList.add('s-manual');
    btns.forEach(function (b) { b.classList.remove('is-run'); });
  }

  btns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      stopAuto();
      stage.setAttribute('aria-live', 'polite');
      show(i, !intro);
    });
    // 左右の矢印でとなりのボタンへ移って、その場面を出す
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var j = (i + d + btns.length) % btns.length;
      btns[j].focus();
      btns[j].click();
    });
  });

  if (!intro) return; // 絵で止まったまま（HTML のまま）

  // 最初は場面を出さず、書体が読めたらすぐ場面1を出す
  scenes[cur].classList.remove('on');
  cur = -1;
  mark(-1);
  var started = false;
  function go() {
    if (started) return;
    started = true;
    hero.classList.add('s-play');
    if (hero.classList.contains('s-manual')) return;
    slots.forEach(function (ms, i) {
      timers.push(setTimeout(function () {
        // 場面1は帯で替えずに最初から出す（中のグラフだけ動く）
        if (i === 0) { show(0, true); restart(scenes[0], 'is-in'); } else show(i);
        if (i < slots.length - 1) run(i, slots[i + 1] - ms);
        else hero.classList.add('s-done');
      }, ms));
    });
  }
  setTimeout(go, 1500);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(go); });
  else go();
})();
