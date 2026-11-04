/* Home page: the hero console carousel and the scroll reveals.
   No jQuery, no third-party libraries. */
(function () {
  'use strict';

  var SOURCES = [
    { tab: 'Local files', id: 'dfs',
      note: 'a folder of CSV on your laptop',
      q: '<span class="kw">SELECT</span> `file`, <span class="kw">count</span>(*) <span class="kw">AS</span> rows\n<span class="kw">FROM</span>   <span class="pa">dfs.home.`Downloads/*.csv`</span>\n<span class="kw">GROUP BY</span> `file`;',
      cols: ['file', 'rows'],
      rows: [['sales-2025-q1.csv', '48,210'], ['sales-2025-q2.csv', '51,884'], ['sales-2025-q3.csv', '47,006']],
      time: '0.38',
      foot: '3 files matched &middot; 147,100 rows &middot; 0.38 s' },

    { tab: 'Amazon S3', id: 's3',
      note: 'a prefix full of JSON. no table, no schema',
      q: '<span class="kw">SELECT</span> country, <span class="kw">count</span>(*) <span class="kw">AS</span> hits\n<span class="kw">FROM</span>   <span class="pa">s3.`logs/2025/*.json`</span>\n<span class="kw">GROUP BY</span> country <span class="kw">ORDER BY</span> 2 <span class="kw">DESC</span>;',
      cols: ['country', 'hits'],
      rows: [['United States', '418,203'], ['India', '233,944'], ['Germany', '96,510']],
      time: '1.41',
      foot: '822,845 records scanned &middot; 1.41 s &middot; 6 minor fragments' },

    { tab: 'MongoDB', id: 'mongo',
      note: 'documents, queried without flattening them',
      q: '<span class="kw">SELECT</span> plan, <span class="kw">count</span>(*) <span class="kw">AS</span> users\n<span class="kw">FROM</span>   <span class="pa">mongo.web.users</span>\n<span class="kw">GROUP BY</span> plan;',
      cols: ['plan', 'users'],
      rows: [['free', '61,440'], ['team', '8,902'], ['enterprise', '613']],
      time: '0.74',
      foot: '70,955 documents &middot; 0.74 s &middot; filter pushed into Mongo' },

    { tab: 'Apache Hive', id: 'hive',
      note: 'the metastore, so existing tables just work',
      q: '<span class="kw">SELECT</span> dept, <span class="kw">count</span>(*) <span class="kw">AS</span> staff\n<span class="kw">FROM</span>   <span class="pa">hive.hr.employees</span>\n<span class="kw">GROUP BY</span> dept;',
      cols: ['dept', 'staff'],
      rows: [['Engineering', '1,284'], ['Sales', '613'], ['Support', '402']],
      time: '0.52',
      foot: '3 rows &middot; read through the Hive metastore &middot; 0.52 s' },

    { tab: 'Splunk', id: 'splunk',
      note: 'an index, addressed as a table',
      q: '<span class="kw">SELECT</span> sourcetype, <span class="kw">count</span>(*) <span class="kw">AS</span> events\n<span class="kw">FROM</span>   <span class="pa">splunk.main</span>\n<span class="kw">GROUP BY</span> sourcetype;',
      cols: ['sourcetype', 'events'],
      rows: [['access_combined', '1,204,881'], ['linux_secure', '318,440'], ['cisco:asa', '97,215']],
      time: '2.9',
      foot: 'last 7 days &middot; 1,620,536 events &middot; 2.9 s' },

    { tab: 'REST API', id: 'http',
      note: 'a JSON endpoint, as if someone had loaded it',
      q: '<span class="kw">SELECT</span> code, rate\n<span class="kw">FROM</span>   <span class="pa">http.rates</span>\n<span class="kw">WHERE</span>  code <span class="kw">IN</span> (\'EUR\',\'GBP\',\'JPY\');',
      cols: ['code', 'rate'],
      rows: [['EUR', '0.9214'], ['GBP', '0.7881'], ['JPY', '151.4420']],
      time: '0.21',
      foot: '3 rows &middot; 0.21 s &middot; response parsed, nothing stored' }
  ];

  var PAUSE_SVG = '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1"/><rect x="7" y="1.5" width="3" height="9" rx="1"/></svg>';
  var PLAY_SVG  = '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5l7 4.5-7 4.5z"/></svg>';

  var pane = document.getElementById('drill-pane');
  var pauseBtn = document.getElementById('drill-pause');
  var tabs = document.querySelector('.h-car .tabs');
  var srcLabel = document.getElementById('drill-src');
  if (!pane || !tabs || !pauseBtn) { return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var at = 1, timer = null, stopped = false;
  var DWELL = 5500;   // keep in step with the .timing transition in _home2.scss

  SOURCES.forEach(function (src, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.textContent = src.tab;
    b.setAttribute('aria-selected', String(i === at));
    b.addEventListener('click', function () { halt(); show(i); });
    tabs.appendChild(b);
  });

  function show(i) {
    at = i;
    var s = SOURCES[i];
    var body = '';
    for (var r = 0; r < s.rows.length; r++) {
      body += '<tr><td>' + s.rows[r][0] + '</td><td class="n">' + s.rows[r][1] + '</td></tr>';
    }
    pane.innerHTML =
      '<div class="pane">' +
        '<div class="ed">' +
          '<pre><span class="cm">-- ' + s.note + '</span>\n' + s.q + '</pre>' +
          '<div class="run"><button type="button">Run</button>' +
            '<em>Completed in ' + s.time + ' s</em></div>' +
        '</div>' +
        '<table><thead><tr><th>' + s.cols[0] + '</th>' +
          '<th class="n">' + s.cols[1] + '</th></tr></thead><tbody>' + body + '</tbody></table>' +
        '<div class="foot">' + s.foot + '</div>' +
      '</div>';
    if (srcLabel) { srcLabel.textContent = s.id; }
    for (var n = 0; n < tabs.children.length; n++) {
      tabs.children[n].setAttribute('aria-selected', String(n === i));
      tabs.children[n].classList.remove('timing');
    }
    armProgress();
  }

  // Fill the active tab over the dwell time so the cycle is visible.
  function armProgress() {
    var active = tabs.children[at];
    if (!active) { return; }
    active.classList.remove('timing');
    if (stopped || reduce.matches || !timer) { return; }
    void active.offsetWidth;            // force a reflow so the transition restarts
    active.classList.add('timing');
  }

  function tick()  { show((at + 1) % SOURCES.length); }

  function start() {
    if (stopped || reduce.matches || timer) { return; }
    timer = setInterval(tick, DWELL);
    armProgress();
  }

  function halt() {
    clearInterval(timer);
    timer = null;
    var active = tabs.children[at];
    if (active) { active.classList.remove('timing'); }
  }

  pauseBtn.addEventListener('click', function () {
    stopped = !stopped;
    if (stopped) {
      halt();
      pauseBtn.setAttribute('aria-label', 'Play the examples');
      pauseBtn.innerHTML = PLAY_SVG;
    } else {
      start();
      pauseBtn.setAttribute('aria-label', 'Pause the examples');
      pauseBtn.innerHTML = PAUSE_SVG;
    }
  });

  var card = document.querySelector('.h-hero .h-ui');
  if (card) {
    card.addEventListener('mouseenter', halt);
    card.addEventListener('mouseleave', start);
    card.addEventListener('focusin', halt);
  }
  tabs.addEventListener('focusin', halt);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { halt(); } else { start(); }
  });

  show(at);
  start();

  // scroll reveals
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    var items = document.querySelectorAll('.h-rz');
    for (var i = 0; i < items.length; i++) {
      items[i].style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(items[i]);
    }
  } else {
    var fallback = document.querySelectorAll('.h-rz');
    for (var j = 0; j < fallback.length; j++) { fallback[j].classList.add('in'); }
  }
})();
