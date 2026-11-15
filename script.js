// Muyiwa Nafiu — shared site script
(function(){
  "use strict";

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector(".nav-burger");
  var mobileNav = document.querySelector(".mobile-nav");
  function setMenu(open){
    if(!burger || !mobileNav) return;
    mobileNav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
  }
  if(burger && mobileNav){
    burger.addEventListener("click", function(e){
      e.stopPropagation();
      setMenu(!mobileNav.classList.contains("open"));
    });
    mobileNav.addEventListener("click", function(e){ e.stopPropagation(); });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setMenu(false); });
    });
    document.addEventListener("click", function(){ if(mobileNav.classList.contains("open")) setMenu(false); });
    window.addEventListener("resize", function(){ if(window.innerWidth > 1080) setMenu(false); });
  }

  /* ---------- nav dropdown (Programs) ---------- */
  function closeDropdowns(except){
    document.querySelectorAll(".nav-dropdown.open").forEach(function(o){
      if(o === except) return;
      o.classList.remove("open");
      var b = o.querySelector(".nav-dropdown-btn"); if(b) b.setAttribute("aria-expanded", "false");
    });
  }
  document.querySelectorAll(".nav-dropdown").forEach(function(dd){
    var btn = dd.querySelector(".nav-dropdown-btn");
    if(!btn) return;
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var open = !dd.classList.contains("open");
      closeDropdowns(dd);
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    dd.querySelectorAll(".nav-dropdown-menu a").forEach(function(a){
      a.addEventListener("click", function(){ closeDropdowns(); dd.classList.add("hover-off"); });
    });
    dd.addEventListener("mouseleave", function(){ closeDropdowns(); dd.classList.remove("hover-off"); });
  });
  document.addEventListener("click", function(){ closeDropdowns(); });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      closeDropdowns();
      if(mobileNav && mobileNav.classList.contains("open")){ setMenu(false); if(burger) burger.focus(); }
    }
  });

  /* ---------- highlight where you are ---------- */
  (function(){
    var page = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
    function mark(sel){ document.querySelectorAll(sel).forEach(function(a){ a.classList.add("active"); a.setAttribute("aria-current", "page"); }); }
    if(page === "resources"){ mark('.primary-nav a[href="resources.html"], .mobile-nav a[href="resources.html"]'); return; }
    if(page === "teenagers-worship-experience"){
      document.querySelectorAll(".nav-dropdown").forEach(function(d){ d.classList.add("is-current"); });
      mark('.nav-dropdown-menu a[href="teenagers-worship-experience.html"], .mobile-nav a[href="teenagers-worship-experience.html"]');
      return;
    }
    if(!("IntersectionObserver" in window)) return;
    var map = { music:"#music", watch:"#music", moments:"#music", book:"#book", programs:"#programs", resources:"resources.html", about:"#about", invite:"#invite" };
    var links = document.querySelectorAll(".primary-nav > a, .mobile-nav > a:not(.mobile-book)");
    var progBtn = document.querySelector(".nav-dropdown-btn");
    var visible = {};
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var best = null, bestR = 0;
      Object.keys(visible).forEach(function(id){ if(visible[id] > bestR){ bestR = visible[id]; best = id; } });
      var target = best ? map[best] : null;
      links.forEach(function(a){
        var on = target && a.getAttribute("href") === target;
        a.classList.toggle("active", !!on);
      });
      if(progBtn) progBtn.classList.toggle("active", best === "programs");
    }, { rootMargin:"-80px 0px -45% 0px", threshold:[0, .15, .35, .6] });
    Object.keys(map).forEach(function(id){ var el = document.getElementById(id); if(el) io.observe(el); });
  })();

  /* ---------- theme toggle ---------- */
  var toggle = document.querySelector(".theme-toggle");
  function currentTheme(){
    return document.documentElement.getAttribute("data-theme");
  }
  function applyStoredTheme(){
    try{
      var stored = localStorage.getItem("mn-theme");
      if(stored){ document.documentElement.setAttribute("data-theme", stored); }
    }catch(e){ /* storage unavailable */ }
  }
  applyStoredTheme();
  if(toggle){
    toggle.addEventListener("click", function(){
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var now = currentTheme() || (prefersDark ? "dark" : "light");
      var next = now === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try{ localStorage.setItem("mn-theme", next); }catch(e){}
    });
  }

  /* ---------- seeded RNG + adire-style canvas motifs ---------- */
  function mulberry32(seed){
    return function(){
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawPattern(canvas, seedNum, palette){
    if(!canvas) return;
    function size(){
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr,0,0,dpr,0,0);
      return { w:r.width, h:r.height, ctx:ctx };
    }
    var dims = size();
    var ctx = dims.ctx, w = dims.w, h = dims.h;
    var rng = mulberry32(seedNum);

    // background
    var bg = ctx.createLinearGradient(0,0,w,h);
    bg.addColorStop(0, palette.bg0);
    bg.addColorStop(1, palette.bg1);
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,w,h);

    var cell = Math.max(w,h) / (5 + Math.floor(rng()*3));
    var motifs = ["rings","dots","spiral","ladder","leaf","cross","waves"];

    for(var y = -cell; y < h + cell; y += cell){
      for(var x = -cell; x < w + cell; x += cell){
        var motif = motifs[Math.floor(rng()*motifs.length)];
        ctx.save();
        ctx.translate(x + cell/2, y + cell/2);
        ctx.globalAlpha = 0.55 + rng()*0.35;
        ctx.strokeStyle = palette.line;
        ctx.fillStyle = palette.line;
        ctx.lineWidth = Math.max(1, cell*0.025);
        var r = cell*0.32;

        if(motif === "rings"){
          for(var i=3;i>0;i--){ ctx.beginPath(); ctx.arc(0,0,r*(i/3),0,Math.PI*2); ctx.stroke(); }
        } else if(motif === "dots"){
          var n = 8;
          for(var a=0;a<n;a++){
            var ang = (a/n) * Math.PI*2;
            ctx.beginPath();
            ctx.arc(Math.cos(ang)*r*0.7, Math.sin(ang)*r*0.7, cell*0.035, 0, Math.PI*2);
            ctx.fill();
          }
        } else if(motif === "spiral"){
          ctx.beginPath();
          for(var t=0; t<Math.PI*6; t+=0.2){
            var rad = (t/(Math.PI*6)) * r;
            var px = Math.cos(t)*rad, py = Math.sin(t)*rad;
            if(t===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
          }
          ctx.stroke();
        } else if(motif === "ladder"){
          ctx.beginPath(); ctx.moveTo(-r,-r); ctx.lineTo(-r,r); ctx.moveTo(r,-r); ctx.lineTo(r,r); ctx.stroke();
          for(var s=-r; s<=r; s+= r/2.2){ ctx.beginPath(); ctx.moveTo(-r,s); ctx.lineTo(r,s); ctx.stroke(); }
        } else if(motif === "leaf"){
          ctx.beginPath();
          ctx.moveTo(0,-r); ctx.quadraticCurveTo(r*0.8,0,0,r); ctx.quadraticCurveTo(-r*0.8,0,0,-r);
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(0,r); ctx.stroke();
        } else if(motif === "cross"){
          ctx.beginPath();
          ctx.moveTo(0,-r); ctx.lineTo(0,r); ctx.moveTo(-r,0); ctx.lineTo(r,0);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(0,0,r*0.18,0,Math.PI*2); ctx.fill();
        } else if(motif === "waves"){
          ctx.beginPath();
          for(var wx=-r; wx<=r; wx+=r/6){
            var wy = Math.sin(wx/r*Math.PI*2) * r*0.25;
            if(wx===-r) ctx.moveTo(wx,wy); else ctx.lineTo(wx,wy);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // soft vignette
    var vg = ctx.createRadialGradient(w/2,h/2, Math.min(w,h)*0.2, w/2,h/2, Math.max(w,h)*0.75);
    vg.addColorStop(0,"rgba(0,0,0,0)");
    vg.addColorStop(1, palette.vignette);
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,w,h);
  }

  var palettes = {
    emerald: { bg0:"#4A0D02", bg1:"#270902", line:"rgba(255,223,132,0.55)", vignette:"rgba(39,9,2,0.55)" },
    marigold: { bg0:"#7a2331", bg1:"#4c1420", line:"rgba(250,246,239,0.5)", vignette:"rgba(20,8,10,0.45)" },
    ochre: { bg0:"#B52D02", bg1:"#7E1902", line:"rgba(250,246,239,0.5)", vignette:"rgba(39,9,2,0.45)" }
  };

  function paintAll(){
    document.querySelectorAll("[data-pattern]").forEach(function(canvas){
      var seed = parseInt(canvas.getAttribute("data-seed") || "7", 10);
      var pal = palettes[canvas.getAttribute("data-pattern")] || palettes.emerald;
      drawPattern(canvas, seed, pal);
    });
  }
  window.addEventListener("resize", debounce(paintAll, 200));
  document.addEventListener("DOMContentLoaded", paintAll);

  function debounce(fn, wait){
    var t;
    return function(){
      clearTimeout(t);
      var args = arguments;
      t = setTimeout(function(){ fn.apply(null, args); }, wait);
    };
  }

  /* ---------- invite / booking form: builds the invitation and opens WhatsApp ---------- */
  var inviteForm = document.querySelector("#invite-form");
  if(inviteForm){
    var WA_NUMBER = "2348136785140";
    var out = document.querySelector("#generated-msg");
    var copyBtn = document.querySelector("#copy-msg");
    var copyNote = document.querySelector("#copy-note");
    var errBox = document.querySelector("#form-error");
    var $ = function(id){ return inviteForm.querySelector(id); };
    var venue = $("#inv-venue"), venueLabel = $("#inv-venue-label");
    var dateIn = $("#inv-date"), endIn = $("#inv-end"), endField = $("#inv-end-field"), multi = $("#inv-multi"), dateLabel = $("#inv-date-label");
    var REQ = ' <span class="req" aria-hidden="true">*</span>';

    function radio(name){ var r = inviteForm.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ""; }
    function iso(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
    function longDate(v){
      var dt = new Date(v + "T00:00:00");
      if(isNaN(dt.getTime())) return v;
      return dt.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
    }
    function clock(v){
      if(!v) return "";
      var p = v.split(":"), h = +p[0], m = p[1];
      return ((h % 12) || 12) + ":" + m + (h < 12 ? " AM" : " PM");
    }

    // dates can't be in the past; the last day can't be before the first
    var today = iso(new Date());
    dateIn.min = today; endIn.min = today;
    dateIn.addEventListener("change", function(){
      endIn.min = dateIn.value || today;
      if(endIn.value && dateIn.value && endIn.value < dateIn.value) endIn.value = "";
    });

    multi.addEventListener("change", function(){
      endField.hidden = !multi.checked;
      endIn.required = multi.checked;
      dateLabel.innerHTML = (multi.checked ? "First day" : "Date") + REQ;
      if(!multi.checked) endIn.value = "";
    });

    inviteForm.querySelectorAll('input[name="inv-mode"]').forEach(function(r){
      r.addEventListener("change", function(){
        var virtual = radio("inv-mode") === "virtual";
        venueLabel.innerHTML = (virtual ? "Platform and link: where it will stream" : "Venue address: where it will hold") + REQ;
        venue.placeholder = virtual ? "e.g. Zoom, Google Meet, YouTube or Facebook Live, with the link if you have it" : "Venue name, street, city and state";
      });
    });

    inviteForm.addEventListener("input", function(){ errBox.hidden = true; });
    inviteForm.addEventListener("change", function(){ errBox.hidden = true; });

    function fail(msg, el){
      errBox.textContent = msg; errBox.hidden = false;
      if(el){ el.focus(); el.scrollIntoView({ block:"center", behavior:"smooth" }); }
      return false;
    }
    function validate(){
      errBox.hidden = true;
      if(!$("#inv-name").value.trim()) return fail("Please add your name.", $("#inv-name"));
      if(!venue.value.trim()) return fail(radio("inv-mode") === "virtual" ? "Please add the platform it will stream on." : "Please add the venue address where it will hold.", venue);
      if(!dateIn.value) return fail(multi.checked ? "Please choose the first day." : "Please choose the date.", dateIn);
      if(multi.checked && !endIn.value) return fail("Please choose the last day of the program.", endIn);
      if(multi.checked && endIn.value < dateIn.value) return fail("The last day can't be before the first day.", endIn);
      if(!radio("inv-time")) return fail("Please choose morning, afternoon or night.", inviteForm.querySelector('input[name="inv-time"]'));
      if(!radio("inv-team")) return fail("Please say whether he should come with his team or alone.", inviteForm.querySelector('input[name="inv-team"]'));
      if(!$("#inv-contact").value.trim()) return fail("Please add a phone number or email so Muyiwa Nafiu can reach you back.", $("#inv-contact"));
      return true;
    }

    inviteForm.addEventListener("submit", function(e){
      e.preventDefault();
      if(!validate()) return;

      var name = $("#inv-name").value.trim();
      var org = $("#inv-org").value.trim();
      var purposeSel = $("#inv-purpose");
      var purpose = purposeSel.value;
      var purposeText = purposeSel.options[purposeSel.selectedIndex].text;
      var mode = radio("inv-mode");
      var notes = $("#inv-notes").value.trim();
      var contact = $("#inv-contact").value.trim();
      var timeOfDay = radio("inv-time");
      var start = clock($("#inv-clock").value);
      var team = radio("inv-team") === "team" ? "With your team (band and backup vocalists)" : "Alone (solo ministration)";

      var ask = {
        ministration: "to minister in song at our church service",
        conference: "to minister at our conference / retreat",
        concert: "to minister at our gospel concert",
        crusade: "to minister in song at our crusade",
        training: "to train our worship leaders and music team",
        book: "regarding the book Serving As A Psalmist",
        other: "to minister with us"
      }[purpose] || "to minister with us";

      var when = longDate(dateIn.value);
      if(multi.checked && endIn.value && endIn.value !== dateIn.value){
        var days = Math.round((new Date(endIn.value) - new Date(dateIn.value)) / 86400000) + 1;
        when = longDate(dateIn.value) + " to " + longDate(endIn.value) + " (" + days + " days)";
      }

      var lines = [];
      lines.push("Dear Minister Muyiwa Nafiu,");
      lines.push("");
      lines.push("My name is " + name + (org ? (", from " + org) : "") + ". We would love to invite you " + ask + ".");
      lines.push("");
      lines.push("*Invitation:* " + purposeText);
      lines.push("*Format:* " + (mode === "virtual" ? "Virtual (online)" : "Physical (in person)"));
      lines.push((mode === "virtual" ? "*Platform:* " : "*Venue:* ") + venue.value.trim().replace(/\s*\n\s*/g, ", "));
      lines.push("*Date:* " + when);
      lines.push("*Time:* " + timeOfDay + (start ? (", starting " + start) : ""));
      lines.push("*Ministering:* " + team);
      if(notes){ lines.push(""); lines.push(notes); }
      lines.push("");
      lines.push("You can reach me on " + contact + ".");
      lines.push("");
      lines.push("Grace and peace.");

      var message = lines.join("\n");
      var waUrl = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
      out.textContent = message.replace(/\*/g, "");
      out.classList.add("show");
      copyBtn.hidden = false;
      copyNote.classList.remove("show");
      var again = document.querySelector("#wa-again");
      if(again){ again.href = waUrl; again.hidden = false; }
      // go straight to Muyiwa Nafiu's WhatsApp with the invitation filled in
      var win = window.open(waUrl, "_blank");
      if(!win){ window.location.href = waUrl; }
    });

    if(copyBtn){
      copyBtn.addEventListener("click", function(){
        var text = out.textContent;
        function shown(){
          copyNote.classList.add("show");
          setTimeout(function(){ copyNote.classList.remove("show"); }, 2200);
        }
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(text).then(shown).catch(function(){ fallbackCopy(text, shown); });
        } else {
          fallbackCopy(text, shown);
        }
      });
    }
    function fallbackCopy(text, cb){
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.focus(); ta.select();
      try{ document.execCommand("copy"); cb(); }catch(e){}
      document.body.removeChild(ta);
    }

    // "Order for your team" on the book card pre-selects the book option
    document.querySelectorAll("[data-purpose]").forEach(function(a){
      a.addEventListener("click", function(){
        var sel = inviteForm.querySelector("#inv-purpose");
        if(sel) sel.value = a.getAttribute("data-purpose");
      });
    });

    // allow ?purpose=book deep-links
    var params = new URLSearchParams(window.location.search);
    if(params.get("purpose")){
      var sel = inviteForm.querySelector("#inv-purpose");
      if(sel) sel.value = params.get("purpose");
    }
  }

  /* ---------- resources filter (resources.html) ---------- */
  var filterRow = document.querySelector(".filter-row");
  if(filterRow){
    var cards = document.querySelectorAll("[data-category]");
    var countEl = document.querySelector(".resources-count");
    function applyFilter(cat){
      var shown = 0;
      cards.forEach(function(c){
        var match = cat === "all" || c.getAttribute("data-category") === cat;
        c.style.display = match ? "" : "none";
        if(match) shown++;
      });
      if(countEl){ countEl.textContent = "Showing " + shown + " of " + cards.length + " resources"; }
    }
    filterRow.querySelectorAll(".filter-btn").forEach(function(btn){
      btn.addEventListener("click", function(){
        filterRow.querySelectorAll(".filter-btn").forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");
        applyFilter(btn.getAttribute("data-filter"));
      });
    });
    applyFilter("all");

    /* open the article named in the address (#slug), e.g. from the home-page carousel */
    function openFromHash(){
      var id = decodeURIComponent((location.hash || "").slice(1));
      if(!id) return;
      var target = document.getElementById(id);
      if(!target || !target.classList.contains("resource-card")) return;
      var more = target.querySelector("details");
      if(more) more.open = true;
      document.querySelectorAll(".resource-card.is-target").forEach(function(c){ c.classList.remove("is-target"); });
      target.classList.add("is-target");
      setTimeout(function(){ target.scrollIntoView({block:"start"}); }, 60);
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  /* ---------- gallery lightbox ---------- */
  var galleryGrid = document.querySelector(".gallery-grid");
  if(galleryGrid){
    var lightbox = document.querySelector(".lightbox");
    var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
    galleryGrid.querySelectorAll("img").forEach(function(img){
      img.addEventListener("click", function(){
        if(!lightbox || !lightboxImg) return;
        lightboxImg.src = img.getAttribute("src");
        lightboxImg.alt = img.getAttribute("alt") || "";
        lightbox.classList.add("open");
      });
    });
    if(lightbox){
      lightbox.addEventListener("click", function(e){
        if(e.target === lightbox || e.target.classList.contains("lightbox-close")){
          lightbox.classList.remove("open");
          lightboxImg.src = "";
        }
      });
      document.addEventListener("keydown", function(e){
        if(e.key === "Escape"){ lightbox.classList.remove("open"); lightboxImg.src = ""; }
      });
    }
  }

  /* ---------- carousels (ported from the STRONGS site) ---------- */
  function initCarousels(){
    document.querySelectorAll("[data-carousel]").forEach(function(c){
      var t = c.querySelector("[data-carousel-track]");
      if(!t) return;
      var prev = c.querySelector("[data-carousel-prev]");
      var next = c.querySelector("[data-carousel-next]");
      var cnt = c.querySelector("[data-carousel-count]");
      function step(){ return Math.max(t.clientWidth * 0.85, 220); }
      function upd(){
        var atStart = t.scrollLeft <= 4;
        var atEnd = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
        if(prev) prev.disabled = atStart;
        if(next) next.disabled = atEnd;
        if(t.scrollWidth > t.clientWidth + 4){ c.setAttribute("data-overflow", ""); }
        else { c.removeAttribute("data-overflow"); }
        c.toggleAttribute("data-at-end", atEnd);
      }
      if(prev) prev.addEventListener("click", function(){ t.scrollBy({ left: -step(), behavior: "smooth" }); });
      if(next) next.addEventListener("click", function(){ t.scrollBy({ left: step(), behavior: "smooth" }); });
      t.addEventListener("scroll", upd, { passive: true });
      window.addEventListener("resize", upd);
      t.querySelectorAll("img").forEach(function(img){ img.addEventListener("load", upd); });
      if(cnt){ cnt.textContent = "· " + t.children.length + " in all"; }
      c.setAttribute("data-ready", "");
      upd();
      setTimeout(upd, 600);
    });
  }
  initCarousels();

  /* ---------- release cards: play inline when a YouTube video id is set ---------- */
  document.querySelectorAll("[data-yt]").forEach(function(card){
    var btn = card.querySelector("[data-yt-play]");
    if(!btn) return;
    btn.addEventListener("click", function(){
      var art = card.querySelector(".release-art");
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(card.getAttribute("data-yt")) + "?autoplay=1&rel=0";
      frame.title = (card.querySelector("h3") || {}).textContent + " on YouTube";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      art.innerHTML = "";
      art.appendChild(frame);
      btn.remove();
    });
  });

  /* ---------- video grid: play inline, expand list ---------- */
  document.querySelectorAll(".video-tile").forEach(function(tile){
    tile.addEventListener("click", function(){
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(tile.getAttribute("data-vid")) + "?autoplay=1&rel=0";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      frame.title = "YouTube video";
      tile.innerHTML = "";
      tile.appendChild(frame);
      tile.style.cursor = "default";
    });
  });
  var vwrap = document.querySelector("[data-video-wrap]");
  var vtoggle = document.querySelector("[data-video-toggle]");
  if(vwrap && vtoggle){
    vwrap.setAttribute("data-collapsed", "true");
    vtoggle.addEventListener("click", function(){
      var collapsed = vwrap.getAttribute("data-collapsed") === "true";
      vwrap.setAttribute("data-collapsed", collapsed ? "false" : "true");
      vtoggle.textContent = collapsed ? "Show fewer" : "Show all " + vtoggle.getAttribute("data-count") + " videos";
    });
  }

  /* ---------- music players: load the real player only when pressed ---------- */
  document.querySelectorAll("[data-embed]").forEach(function(box){
    var btn = box.querySelector("[data-embed-load]");
    if(!btn) return;
    btn.addEventListener("click", function(){
      var f = document.createElement("iframe");
      f.src = box.getAttribute("data-embed");
      f.title = box.getAttribute("data-embed-title") || "Music player";
      f.allow = box.getAttribute("data-embed-allow") || "autoplay; encrypted-media; fullscreen";
      f.setAttribute("allowfullscreen", "");
      box.innerHTML = "";
      box.appendChild(f);
    });
  });

  /* ---------- video thumbnails: show the branded slot if a thumbnail can't load ---------- */
  document.querySelectorAll(".video-tile img").forEach(function(img){
    var tile = img.closest(".video-tile");
    function fail(){ tile.classList.add("noimg"); }
    img.addEventListener("error", fail);
    img.addEventListener("load", function(){ if(img.naturalWidth && img.naturalWidth <= 120){ fail(); } });
    if(img.complete && img.naturalWidth === 0){ fail(); }
  });

  /* ---------- lazy-load embeds (perf) ---------- */
  document.querySelectorAll("iframe[data-src]").forEach(function(frame){
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            frame.src = frame.getAttribute("data-src");
            io.unobserve(frame);
          }
        });
      }, { rootMargin: "200px" });
      io.observe(frame);
    } else {
      frame.src = frame.getAttribute("data-src");
    }
  });

})();
