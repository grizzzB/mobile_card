/* ============================================================
   모바일 청첩장 — 동작
   1) 앞/뒷면 전환 (버튼 · 스와이프 · 좌우 방향키)
   2) 앞면 하늘을 나는 새
   3) 계좌번호 복사
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0) 앞면 글자는 웹폰트가 준비된 뒤에 ────────────────
     Pinyon Script / PT Serif 대신 Times·필기체 기본값이 먼저 번쩍이는 걸 막습니다.
     폰트를 못 받아도 2.5초 뒤에는 반드시 보여줍니다. */
  var fontsShown = false;
  function showPlate() {
    if (fontsShown) return;
    fontsShown = true;
    document.documentElement.classList.add('fonts-ready');
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(showPlate);
  else showPlate();
  setTimeout(showPlate, 2500);

  /* ── 1) 앞/뒷면 전환 ─────────────────────────────────── */
  var flipper = document.getElementById('flipper');
  var faces   = { front: document.getElementById('face-front'), back: document.getElementById('face-back') };
  var btn     = document.getElementById('flip-btn');
  var label   = btn.querySelector('.flip-label');
  var nav     = document.getElementById('switch');
  var showing = 'front';

  nav.removeAttribute('hidden');

  function syncHeight() {
    flipper.style.height = faces[showing].offsetHeight + 'px';
  }

  function render() {
    var isBack = showing === 'back';
    flipper.classList.toggle('flipped', isBack);
    document.body.classList.toggle('is-back', isBack);
    label.textContent = isBack ? '앞면 보기' : '뒷면 보기';
    btn.setAttribute('aria-expanded', String(isBack));

    // 보이지 않는 면은 탭 이동·클릭 대상에서 제외
    faces.front.inert = isBack;
    faces.back.inert  = !isBack;
    faces.front.setAttribute('aria-hidden', String(isBack));
    faces.back.setAttribute('aria-hidden', String(!isBack));

    syncHeight();
  }

  function show(side) {
    if (side === showing) return;
    showing = side;
    render();
    // 이미 맨 위라면 굳이 스크롤을 건드리지 않습니다(사용자 스크롤과 충돌 방지).
    if (window.scrollY > 0)
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  btn.addEventListener('click', function () {
    show(showing === 'front' ? 'back' : 'front');
  });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft')  show('front');
    if (e.key === 'ArrowRight') show('back');
  });

  // 스와이프
  var tx = 0, ty = 0, tracking = false;
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1 || e.target.closest('button')) { tracking = false; return; }
    tracking = true;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    show(dx < 0 ? 'back' : 'front');
  }, { passive: true });

  // 글꼴 로딩·화면 회전 등으로 높이가 바뀌면 맞춰줍니다.
  render();
  window.addEventListener('resize', syncHeight);
  window.addEventListener('load', syncHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeight);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(syncHeight);
    ro.observe(faces.front);
    ro.observe(faces.back);
  }

  /* ── 2) 하늘을 나는 새 ───────────────────────────────── */
  var BIRDS = [
    // top: 화면 높이 기준 위치 — 카드 본문과 겹치지 않는 위·아래 띠에 배치
    { top:  6, size: 30, dur: 34, delay:  -4, bob: 3.4, bobY: 7, op: .40, flap: .70, rev: false },
    { top: 11, size: 20, dur: 43, delay: -19, bob: 4.1, bobY: 5, op: .30, flap: .58, rev: false },
    { top: 17, size: 14, dur: 51, delay: -31, bob: 5.0, bobY: 4, op: .23, flap: .50, rev: true  },
    { top:  4, size: 22, dur: 38, delay: -26, bob: 3.8, bobY: 6, op: .33, flap: .64, rev: true  },
    { top: 84, size: 26, dur: 36, delay: -12, bob: 3.6, bobY: 6, op: .35, flap: .68, rev: true  },
    { top: 90, size: 17, dur: 46, delay: -34, bob: 4.5, bobY: 4, op: .26, flap: .55, rev: false },
    { top: 79, size: 12, dur: 55, delay:  -8, bob: 5.4, bobY: 3, op: .21, flap: .48, rev: false },
    { top: 94, size: 21, dur: 40, delay: -21, bob: 3.9, bobY: 5, op: .29, flap: .62, rev: true  }
  ];

  // 갈매기 실루엣: 몸통에서 시작해 날개 끝이 살짝 젖혀지는 S 곡선
  var WING_L = 'M20 10.6C16.4 10.9 13 9.4 9.6 6.3 7.8 4.7 5.9 3.5 3.4 3.1';
  var WING_R = 'M20 10.6c3.6.3 7-1.2 10.4-4.3 1.8-1.6 3.7-2.8 6.2-3.2';

  if (!reduceMotion) {
    var sky = document.getElementById('sky');
    var html = BIRDS.map(function (b) {
      return '<span class="bird' + (b.rev ? ' rev' : '') + '" style="' +
        'top:' + b.top + '%;' +
        '--size:' + b.size + 'px;' +
        '--dur:' + b.dur + 's;' +
        '--delay:' + b.delay + 's;' +
        '--bob:' + b.bob + 's;' +
        '--bobY:' + b.bobY + 'px;' +
        '--op:' + b.op + ';' +
        '--flap:' + b.flap + 's">' +
        '<span class="bob"><svg viewBox="0 0 40 15">' +
          '<path class="wing wing-l" d="' + WING_L + '"/>' +
          '<path class="wing wing-r" d="' + WING_R + '"/>' +
        '</svg></span></span>';
    }).join('');
    sky.insertAdjacentHTML('afterbegin', html);
  }

  /* ── 3) 계좌번호 복사 ────────────────────────────────── */
  var toast = document.getElementById('toast');
  var toastTimer;

  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(legacyCopy);
    }
    return new Promise(function (resolve, reject) {
      legacyCopy().then(resolve, reject);
    });

    // 구형 브라우저(특히 iOS 13 이하)용 대체 경로.
    // contentEditable + 화면 밖 배치 조합이어야 iOS 에서 선택이 먹습니다.
    function legacyCopy() {
      return new Promise(function (resolve, reject) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.contentEditable = 'true';
        ta.readOnly = false;
        ta.style.cssText = 'position:absolute;left:-9999px;top:' + window.pageYOffset +
                           'px;border:0;padding:0;margin:0;font-size:12pt';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, 999999);
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        ta.remove();
        ok ? resolve() : reject(new Error('copy failed'));
      });
    }
  }

  document.querySelectorAll('.copy').forEach(function (b) {
    var span = b.querySelector('span');
    var original = span.textContent;
    var revert;

    b.addEventListener('click', function () {
      copyText(b.dataset.copy).then(function () {
        say(b.dataset.owner + ' 계좌번호를 복사했습니다');
        b.classList.add('done');
        span.textContent = '복사됨';
        clearTimeout(revert);
        revert = setTimeout(function () {
          b.classList.remove('done');
          span.textContent = original;
        }, 2000);
      }, function () {
        say('복사가 안 되네요. 번호를 길게 눌러 복사해 주세요');
      });
    });
  });
})();
