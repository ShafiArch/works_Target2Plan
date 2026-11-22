/* Target2Plan: theme switch, lightbox, the current section in the top bar (the sequence player,
   DLI readout and calculator blocks are shared with the Kybele page and stay idle here). */
(function () {
  var root = document.documentElement;

  /* themes: Trace, Night, Clay; remembered with the works site's key */
  var btns = [].slice.call(document.querySelectorAll(".themes button"));
  function mark() { btns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.theme === root.dataset.theme ? "true" : "false"); }); }
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      root.dataset.theme = b.dataset.theme; mark();
      try { localStorage.setItem("site-theme", b.dataset.theme); } catch (e) {}
    });
  });
  mark();

  /* sequence players. <div class="seq" id="x" data-labels="A|B|C" data-ms="1400">: every .stack inside
     holds one child per frame. Anything on the page with data-seq="x" data-frame="i" lights up with
     the current frame and jumps the player to its frame when clicked. Always plays while on screen.
     data-build: each frame adds to the one before (the assembly), so earlier frames stay visible
     under the one fading in, and the loop fades the added layers away again. */
  [].slice.call(document.querySelectorAll(".seq")).forEach(function (seq) {
    var labels = (seq.dataset.labels || "").split("|");
    var n = labels.length, i = 0, timer = null, playing = true, visible = false;
    var ms = +seq.dataset.ms || 1400;
    var stacks = [].slice.call(seq.querySelectorAll(".stack"));
    var linked = [].slice.call(document.querySelectorAll('[data-seq="' + seq.id + '"]'));
    var bar = document.createElement("div"); bar.className = "bar";
    var play = document.createElement("button"); play.type = "button"; play.className = "play";
    var steps = document.createElement("div"); steps.className = "steps";
    var now = document.createElement("span"); now.className = "now";
    labels.forEach(function (l, k) {
      var s = document.createElement("button"); s.type = "button"; s.textContent = seq.dataset.short ? seq.dataset.short.split("|")[k] : k + 1;
      s.setAttribute("aria-label", l); s.addEventListener("click", function () { stop(); show(k); });
      steps.appendChild(s);
    });
    bar.appendChild(play); bar.appendChild(steps); bar.appendChild(now); seq.appendChild(bar);
    function show(k) {
      i = (k + n) % n;
      var build = "build" in seq.dataset;
      stacks.forEach(function (st) { [].forEach.call(st.children, function (c, j) { c.classList.toggle("on", build ? j <= i : j === i); }); });
      [].forEach.call(steps.children, function (c, j) { c.classList.toggle("on", j === i); });
      linked.forEach(function (el) { el.classList.toggle("on", +el.dataset.frame === i); });
      now.textContent = labels[i];
    }
    function tick() { show(i + 1); }
    function run() { clearInterval(timer); timer = null; if (playing && visible) timer = setInterval(tick, ms); }
    function setPlay(p) { playing = p; play.textContent = p ? "❚❚" : "▶"; play.setAttribute("aria-label", p ? "Pause" : "Play"); run(); }
    function stop() { setPlay(false); }
    play.addEventListener("click", function () { setPlay(!playing); });
    linked.forEach(function (el) { el.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); stop(); show(+el.dataset.frame); }); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; run(); }, { threshold: 0.25 }).observe(seq);
    } else { visible = true; }
    show(0); setPlay(playing);
  });

  /* lightbox: opens the large copy (data-l) when there is one */
  var lb = document.createElement("div"); lb.className = "lb"; lb.innerHTML = '<div><img alt=""><p></p></div>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("p");
  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest("figure img");
    if (!img || img.closest("[data-seq]")) return;
    var fig = img.closest("figure"), cap = fig.querySelector("figcaption");
    lbImg.src = img.dataset.l || img.currentSrc || img.src; lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : img.alt;
    lb.classList.toggle("scroll", fig.classList.contains("readable"));
    lb.classList.add("open"); lb.scrollTop = 0;
  });
  lb.addEventListener("click", function () { lb.classList.remove("open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });

  /* the section in view, marked in the top bar */
  var links = [].slice.call(document.querySelectorAll(".toc a"));
  if ("IntersectionObserver" in window && links.length) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
  }

  /* DLI charts: move across any of the three to read that day in all of them */
  var dli = document.getElementById("dli"), D = window.KYBELE_DLI;
  if (dli && D) {
    var charts = [].slice.call(dli.querySelectorAll(".dchart")), out = dli.querySelector(".readout");
    var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(d) { var m = 0; while (d > LEN[m]) { d -= LEN[m]; m++; } return MON[m] + " " + d; }
    function move(e) {
      var r = e.currentTarget.getBoundingClientRect(), vb = e.currentTarget.viewBox.baseVal;
      var x = (e.clientX - r.left) / r.width * vb.width, L = 30, R = 4;
      var d = Math.min(365, Math.max(1, Math.round((x - L) / (vb.width - L - R) * 365 + 0.5)));
      var cx = L + (d - 0.5) / 365 * (vb.width - L - R);
      charts.forEach(function (c) { c.classList.add("hover"); var l = c.querySelector(".cursor"); l.setAttribute("x1", cx); l.setAttribute("x2", cx); });
      out.innerHTML = "<b>" + date(d) + "</b> &nbsp; DLI <b>" + D.a[d - 1] + "</b> mol/m\u00b2/day &nbsp; deficit <b>" + D.d[d - 1] + "</b> &nbsp; lamps <b>" + D.h[d - 1] + "</b> h";
    }
    charts.forEach(function (c) {
      c.addEventListener("pointermove", move);
      c.addEventListener("pointerleave", function () { charts.forEach(function (k) { k.classList.remove("hover"); }); out.textContent = ""; });
    });
  }

  /* lux to PPFD: k for a black body source, from the V(lambda) and PAR curves in the chart */
  var S = window.KYBELE_SPEC, cct = document.getElementById("cct");
  if (S && cct) {
    var lux = document.getElementById("lux"), svg = document.getElementById("calcsvg");
    function planck(nm, T) { var l = nm * 1e-9; return 1 / (Math.pow(l, 5) * (Math.exp(1.4388e-2 / (l * T)) - 1)); }
    function calc() {
      var T = +cct.value, E = [], ph = 0, lx = 0, mx = 0, i, nm;
      for (i = 0; i < S.v.length; i++) { nm = 380 + i; E[i] = planck(nm, T); if (E[i] > mx) mx = E[i]; ph += S.p[i] * E[i] * nm * 8.359e-3; lx += 683 * E[i] * S.v[i]; }
      var k = ph / lx;
      document.getElementById("cctv").textContent = T + " K";
      document.getElementById("kv").textContent = (k * 1000).toFixed(1);
      document.getElementById("pv").textContent = Math.round(k * (+lux.value || 0)).toLocaleString("en-US");
      var W = 520, H = 150, L = 4, B = 18, x = function (n) { return L + (n - 380) / 400 * (W - 2 * L); }, y = function (v) { return 6 + (1 - v / mx) * (H - B - 6); };
      var pts = "", par = "";
      for (i = 0; i < E.length; i += 4) { pts += " " + x(380 + i).toFixed(1) + "," + y(E[i]).toFixed(1); }
      var p0 = x(400), p1 = x(700);
      svg.innerHTML = '<rect class="band" x="' + p0 + '" y="6" width="' + (p1 - p0) + '" height="' + (H - B - 6) + '"/>' +
        '<polygon class="spd" points="' + x(380) + ',' + y(0) + pts + ' ' + x(776) + ',' + y(0) + '"/><polyline class="spd-line" points="' + pts + '"/>' +
        '<line class="ax" x1="' + L + '" x2="' + (W - L) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>' +
        [400, 500, 600, 700].map(function (n) { return '<text class="tk" x="' + x(n) + '" y="' + (H - 4) + '" text-anchor="middle">' + n + ' nm</text>'; }).join("");
    }
    cct.addEventListener("input", calc); lux.addEventListener("input", calc); calc();
  }
})();

