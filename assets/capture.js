/* Deal Radar exit-intent capture — toolcompare / devtoolrank / automatecompare.
   One shared file; SITE derives from hostname so staging can never post to the
   wrong list. Desktop only, once per session, suppressed 1yr after subscribe,
   30d after dismiss. Posts urlencoded {email, site} to the chipradar relay
   (per-site isolated lists, allowlist-verified 2026-11-24). */
(function () {
  var HOSTS = {
    "toolcompare.co": "toolcompare",
    "www.toolcompare.co": "toolcompare",
    "devtoolrank.com": "devtoolrank",
    "www.devtoolrank.com": "devtoolrank",
    "automatecompare.com": "automatecompare",
    "www.automatecompare.com": "automatecompare"
  };
  var SITE = HOSTS[location.hostname];
  if (!SITE) return;
  try { if (sessionStorage.getItem('dr_exit_seen')) return; } catch (e) {}
  if (document.cookie.indexOf('dr_subscribed=') > -1 || document.cookie.indexOf('dr_exit_dismissed=') > -1) return;
  if (!window.matchMedia || !window.matchMedia('(min-width: 900px)').matches) return;

  var BRANDING = {
    toolcompare:    { name: 'ToolCompare',      accent: '#2563eb', line: 'Verified SaaS deals + new comparisons, one short Monday email.' },
    devtoolrank:    { name: 'DevToolRank',      accent: '#4f46e5', line: 'Dev & hosting deal intel, verified prices, one Monday email.' },
    automatecompare:{ name: 'AutomateCompare',  accent: '#059669', line: 'Team-automation deals that are actually worth it, weekly.' }
  }[SITE];

  var shown = false;

  function show() {
    if (shown) return;
    shown = true;
    try { sessionStorage.setItem('dr_exit_seen', '1'); } catch (e) {}
    var m = document.getElementById('dr-exit');
    if (m) m.style.display = 'flex';
  }

  function inject() {
    var wrap = document.createElement('div');
    wrap.id = 'dr-exit';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Deal Radar signup');
    wrap.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;align-items:center;justify-content:center;padding:16px;';
    wrap.innerHTML =
      '<div style="background:#fff;border-radius:18px;max-width:440px;width:100%;padding:30px;text-align:center;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.25);">' +
        '<button id="dr-exit-x" aria-label="Close" style="position:absolute;top:6px;right:12px;background:none;border:none;color:#9ca3af;font-size:22px;cursor:pointer;line-height:1;">&times;</button>' +
        '<h3 style="margin:0 0 8px;font-size:1.25rem;color:#111827;">Before you go \uD83D\uDC4B</h3>' +
        '<p style="color:#6b7280;font-size:0.95rem;margin:0 0 16px;">Join the <b>' + BRANDING.name + ' Deal Radar</b> — ' + BRANDING.line + '</p>' +
        '<form id="dr-exit-form" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">' +
          '<input type="email" id="dr-exit-email" placeholder="your@email.com" required style="flex:1;min-width:190px;padding:12px 14px;border:2px solid #e5e7eb;border-radius:10px;font-size:0.95rem;outline:none;font-family:inherit;color:#1f2937;">' +
          '<button type="submit" style="white-space:nowrap;padding:12px 18px;border:none;border-radius:10px;background:' + BRANDING.accent + ';color:#fff;font-weight:700;font-size:0.95rem;cursor:pointer;font-family:inherit;">Subscribe \u2192</button>' +
        '</form>' +
        '<p id="dr-exit-msg" style="display:none;font-size:0.9rem;margin:10px 0 0;"></p>' +
        '<p style="color:#9ca3af;font-size:0.75rem;margin:10px 0 0;">No spam \u00b7 links to live pricing only \u00b7 reply \u201Cunsubscribe\u201D anytime</p>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById('dr-exit-x').addEventListener('click', function () {
      wrap.style.display = 'none';
      document.cookie = 'dr_exit_dismissed=true; max-age=2592000; path=/; SameSite=Lax';
    });

    document.getElementById('dr-exit-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var el = document.getElementById('dr-exit-email');
      var msg = document.getElementById('dr-exit-msg');
      msg.style.display = 'block'; msg.style.color = '#6b7280'; msg.textContent = 'Subscribing...';
      var d = new FormData();
      d.set('email', el.value);
      d.set('site', SITE);
      fetch('https://chipradar.io/api/affiliate/subscribe', { method: 'POST', body: d })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.success) {
            msg.textContent = '\u2705 You are on the list — first Deal Radar lands Monday.';
            msg.style.color = '#065f46';
            el.value = '';
            document.cookie = 'dr_subscribed=true; max-age=31536000; path=/; SameSite=Lax';
            setTimeout(function () { wrap.style.display = 'none'; }, 1400);
          } else {
            msg.textContent = '\u274C ' + ((j && j.message) || 'Something went wrong') + ' — try again.';
            msg.style.color = '#991b1b';
          }
        })
        .catch(function () { msg.textContent = '\u274C Network hiccup — try again in a moment.'; msg.style.color = '#991b1b'; });
    });
  }

  function arm() {
    inject();
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) show();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { var m = document.getElementById('dr-exit'); if (m) m.style.display = 'none'; }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
  else arm();
})();
