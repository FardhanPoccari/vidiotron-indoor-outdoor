/* =====================================================================
   Cahaya Mustika Internesia — main.js (JavaScript murni, tanpa library)
   Isi: preloader, tema, navbar & menu mobile, dropdown produk, animasi scroll,
        slideshow hero, FAQ, filter katalog, garis progres proses.
   ===================================================================== */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  var pre = $("#preloader"), preStart = performance.now(), MIN_MS = 900, FADE_MS = 500;
  if (pre) root.style.overflow = "hidden";
  function hidePre() {
    if (!pre || pre.hasAttribute("data-hiding")) return;
    var wait = Math.max(0, MIN_MS - (performance.now() - preStart));
    setTimeout(function () {
      pre.removeAttribute("data-boot"); pre.setAttribute("data-hiding", "");
      root.style.overflow = "";
      setTimeout(function () { if (pre.parentNode) pre.parentNode.removeChild(pre); }, FADE_MS);
    }, wait);
  }
  if (doc.readyState === "complete") hidePre(); else window.addEventListener("load", hidePre, { once: true });
  setTimeout(hidePre, 8000); // pengaman
  window.addEventListener("pageshow", function (e) { if (e.persisted && pre) { pre.remove(); root.style.overflow = ""; } });

  /* ---------- Tema terang / gelap ---------- */
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    $$("[data-theme-toggle]").forEach(function (b) { var l = t === "dark" ? "Mode Terang" : "Mode Gelap"; b.setAttribute("aria-label", "Ganti ke " + l); b.setAttribute("title", l); });
  }
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () { setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"); });
  });
  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  /* ---------- Navbar: bayangan saat scroll + menu mobile ---------- */
  var hdr = $("#hdr");
  function onScroll() { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var menuBtn = $("[data-menu-toggle]");
  function setMenu(open) {
    if (!hdr || !menuBtn) return;
    hdr.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width:1280px)").addEventListener && window.matchMedia("(min-width:1280px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ---------- Dropdown "Produk" (desktop) ---------- */
  var pm = $("[data-pm]");
  if (pm) {
    var pmBtn = $(".pm-btn", pm), items = function () { return $$("[data-menu-item]", pm); };
    var setPm = function (o) { pm.classList.toggle("open", o); pmBtn.setAttribute("aria-expanded", String(o)); };
    pm.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") setPm(true); });
    pm.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") setPm(false); });
    pmBtn.addEventListener("click", function () { setPm(!pm.classList.contains("open")); });
    doc.addEventListener("pointerdown", function (e) { if (!pm.contains(e.target)) setPm(false); });
    pm.addEventListener("focusout", function (e) { if (!pm.contains(e.relatedTarget)) setPm(false); });
    pm.addEventListener("keydown", function (e) {
      var l = items(), i = l.indexOf(doc.activeElement), open = pm.classList.contains("open");
      if (e.key === "Escape" && open) { e.preventDefault(); setPm(false); pmBtn.focus(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (!open) { setPm(true); setTimeout(function () { l[0] && l[0].focus(); }, 30); } else l[(i + 1) % l.length].focus(); }
      else if (e.key === "ArrowUp" && open) { e.preventDefault(); if (i <= 0) pmBtn.focus(); else l[i - 1].focus(); }
    });
  }

  /* ---------- Animasi muncul saat scroll ---------- */
  var targets = $$(".rv, .tr");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target, once = el.hasAttribute("data-once");
        var vis = en.isIntersecting && (en.intersectionRatio >= 0.12 || en.intersectionRect.height >= window.innerHeight * 0.5);
        if (vis) { el.classList.add("in"); if (once) io.unobserve(el); }
        else if (!once && !en.isIntersecting) el.classList.remove("in");
      });
    }, { threshold: [0, 0.12, 0.5] });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Slideshow hero ---------- */
  var heroEl = $("[data-hero='grid']");
  if (heroEl) {
    var SLIDE_MS = 3000;
    var slides = $$("[data-slide]", heroEl), btns = $$("[data-slide-btn]"), labels = [];
    try { labels = JSON.parse(heroEl.getAttribute("data-slides") || "[]"); } catch (e) {}
    var hp = $("[data-hp]"), hn = $("[data-hp-n]"), hl = $("[data-hp-l]"), active = 0, timer = null;
    if (hp) hp.style.setProperty("--slide-ms", SLIDE_MS + "ms");
    var load = function (i) { var im = $(".hs-img", slides[i]); if (im && !im.getAttribute("src") && im.getAttribute("data-src")) im.setAttribute("src", im.getAttribute("data-src")); };
    var paint = function () {
      btns.forEach(function (b, i) { b.classList.remove("done", "act"); if (i < active) b.classList.add("done"); });
      var cur = btns[active]; if (cur) { void cur.offsetWidth; cur.classList.add("act"); }
      btns.forEach(function (b, i) { if (i === active) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      if (hn) hn.textContent = String(active + 1).padStart(2, "0");
      if (hl) hl.textContent = labels[active] || "";
    };
    var go = function (i) {
      if (i === active && slides[i].classList.contains("is-active")) return;
      var prev = active; active = i;
      load(i); load((i + 1) % slides.length);
      slides.forEach(function (s) { s.classList.remove("is-prev"); });
      slides[prev].classList.remove("is-active"); slides[prev].classList.add("is-prev"); slides[prev].setAttribute("aria-hidden", "true");
      slides[i].classList.add("is-active"); slides[i].setAttribute("aria-hidden", "false");
      setTimeout(function () { slides[prev] && slides[prev].classList.remove("is-prev"); }, 1700);
      paint(); schedule();
    };
    var schedule = function () { clearTimeout(timer); timer = setTimeout(function () { go((active + 1) % slides.length); }, SLIDE_MS); };
    btns.forEach(function (b, i) { b.addEventListener("click", function () { go(i); }); });
    setTimeout(function () { load(1); }, 1200);
    paint(); if (slides.length > 1) schedule();
    // parallax halus saat scroll
    if (!reduce) window.addEventListener("scroll", function () { if (window.scrollY < 900) heroEl.style.transform = "translateY(" + Math.round(window.scrollY * 0.08) + "px)"; }, { passive: true });
  }

  /* ---------- FAQ (accordion, satu terbuka) ---------- */
  var faqBtns = $$(".faq-btn");
  faqBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      faqBtns.forEach(function (o) { o.setAttribute("aria-expanded", "false"); $("#" + o.getAttribute("aria-controls")).classList.remove("is-open"); });
      if (!open) { b.setAttribute("aria-expanded", "true"); $("#" + b.getAttribute("aria-controls")).classList.add("is-open"); }
    });
  });

  /* ---------- Filter brand di katalog ---------- */
  var chips = $$("[data-chip]"), panels = $$("[data-fp]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var id = c.getAttribute("data-chip");
      chips.forEach(function (o) { var on = o === c; o.classList.toggle("is-on", on); o.setAttribute("aria-pressed", String(on)); });
      panels.forEach(function (p) {
        var on = p.getAttribute("data-fp") === id;
        p.hidden = !on; p.classList.toggle("is-on", on);
        p.classList.remove("fade"); if (on) { void p.offsetWidth; p.classList.add("fade"); }
      });
    });
  });

  /* ---------- Garis progres "Proses Pemesanan" ---------- */
  var pr = $("[data-process]");
  if (pr) {
    var upd = function () {
      var r = pr.getBoundingClientRect(), vh = window.innerHeight;
      var p = reduce ? 1 : (vh * 0.75 - r.top) / (vh * 0.2 + r.height);
      pr.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
    };
    window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
  }
})();
