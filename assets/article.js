// 記事ページの動き：読み進みバー・目次の今いる章・リンクのコピー・スマホの目次を閉じる
(function () {
  var prog = document.querySelector('.prog i');
  var doc = document.documentElement;
  function onScroll() {
    if (!prog) return;
    var max = doc.scrollHeight - window.innerHeight;
    var r = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    prog.style.transform = 'scaleX(' + r + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 今いる章：見出しが画面の上 1/3 を過ぎたら、その章を目次で強める
  var links = Array.prototype.slice.call(document.querySelectorAll('.rail-list a, .mtoc-list a'));
  var ids = [];
  links.forEach(function (a) { var id = a.getAttribute('href').slice(1); if (ids.indexOf(id) < 0) ids.push(id); });
  var secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function mark() {
    var cur = null, line = window.innerHeight / 3;
    secs.forEach(function (el) { if (el.getBoundingClientRect().top <= line) cur = el.id; });
    links.forEach(function (a) { a.classList.toggle('is-cur', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', mark, { passive: true });
  mark();

  // 左の目次：KV（冒頭）の下の線を過ぎてから出す
  var rail = document.querySelector('.rail');
  var hero = document.querySelector('.hero');
  function railOn() {
    if (!rail || !hero) return;
    var on = hero.getBoundingClientRect().bottom < 56;
    rail.classList.toggle('is-on', on);
  }
  window.addEventListener('scroll', railOn, { passive: true });
  railOn();

  // 04 の図：見えたら、ピンクが右の図へ流れて埋まる
  var wfig = document.querySelector('.wfig');
  if (wfig) {
    wfig.classList.add('anim');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          // 開いた時から見えている（#s4 で来た等）なら、無色の姿を見せてから始める
          var wait = (performance.now() < 1500) ? 1200 : 0;
          setTimeout(function () { wfig.classList.add('go'); }, wait);
        });
      }, { threshold: 0.45 });
      io.observe(wfig.querySelector('.waffles') || wfig);
    } else { wfig.classList.add('go'); }
  }

  // リンクのコピー
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    var label = b.textContent;
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-copy');
      function done() { b.textContent = 'コピーしました'; b.classList.add('ok'); setTimeout(function () { b.textContent = label; b.classList.remove('ok'); }, 1600); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt('このリンクをコピー', url); });
      } else { window.prompt('このリンクをコピー', url); }
    });
  });

  // スマホの目次：項目を押したら閉じる・外を押しても閉じる
  var mt = document.querySelector('.mtoc');
  if (mt) {
    mt.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mt.removeAttribute('open'); }); });
    document.addEventListener('click', function (e) { if (mt.hasAttribute('open') && !mt.contains(e.target)) mt.removeAttribute('open'); });
  }
})();
