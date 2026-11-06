// レビューの依頼フォーム：入力の確かめ → Apps Script のウェブアプリへ送る（仕組みはサキミセのフォームと同じ）
(function () {
  var f = document.getElementById('rqf'); if (!f) return;
  var t0 = Date.now();
  var msg = document.getElementById('rqf-msg');
  var btn = document.getElementById('rqf-btn');
  var label = btn.innerHTML;
  var plat = document.getElementById('f-platform');
  var show = function (text) { msg.textContent = text; msg.hidden = false; };
  var platOk = function () { return !!f.querySelector('input[name="platform"]:checked'); };
  f.addEventListener('change', function () {
    if (f.classList.contains('was-validated')) plat.classList.toggle('is-bad', !platOk());
  });
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    msg.hidden = true;
    f.classList.add('was-validated');
    plat.classList.toggle('is-bad', !platOk());
    var bad = f.querySelector(':invalid');
    // 機種の欄（チェックが1つも無い）が、ほかの抜けより上にあれば、そちらを先に知らせる
    if (!platOk() && (!bad || (plat.compareDocumentPosition(bad) & Node.DOCUMENT_POSITION_FOLLOWING))) {
      show('遊べる機種を1つ以上お選びください。');
      plat.querySelector('input').focus();
      return;
    }
    if (bad) {
      if (bad.type === 'email' && bad.value) show('メールアドレスをご確認ください。');
      else if (bad.type === 'url' && bad.value) show('URL は https:// から始まる形でご入力ください。');
      else if (bad.name === 'agree') show('「レビューの決まり」への同意にチェックを入れてください。');
      else show('必須の欄をご入力ください。');
      bad.focus();
      return;
    }
    if (!/^https:\/\/script\.google\.com\//.test(f.action)) { show('ただいまフォームの準備中です。お手数ですが、下のメールアドレスまでご連絡ください。'); return; }
    var data = new URLSearchParams(new FormData(f));
    data.append('elapsed', String(Date.now() - t0));
    btn.disabled = true;
    btn.textContent = '送信しています…';
    fetch(f.action, { method: 'POST', body: data })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || 'error');
        var done = document.getElementById('rqf-done');
        f.hidden = true;
        done.hidden = false;
        done.focus();
        done.scrollIntoView({ block: 'center' });
      })
      .catch(function () {
        show('送信できませんでした。時間をおいてもう一度お試しいただくか、下のメールアドレスまでご連絡ください。');
        btn.disabled = false;
        btn.innerHTML = label;
      });
  });
})();
