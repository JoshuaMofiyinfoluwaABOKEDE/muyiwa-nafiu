// Muyiwa Nafiu — shared site script
(function(){
  "use strict";

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector(".nav-burger");
  var mobileNav = document.querySelector(".mobile-nav");
  if(burger && mobileNav){
    burger.addEventListener("click", function(){
      mobileNav.classList.toggle("open");
      burger.setAttribute("aria-expanded", mobileNav.classList.contains("open"));
    });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ mobileNav.classList.remove("open"); });
    });
  }

  /* ---------- nav dropdown (Programs) ---------- */
  document.querySelectorAll(".nav-dropdown").forEach(function(dd){
    var btn = dd.querySelector(".nav-dropdown-btn");
    if(!btn) return;
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var wasOpen = dd.classList.contains("open");
      document.querySelectorAll(".nav-dropdown.open").forEach(function(o){ o.classList.remove("open"); });
      if(!wasOpen){ dd.classList.add("open"); }
    });
  });
  document.addEventListener("click", function(){
    document.querySelectorAll(".nav-dropdown.open").forEach(function(o){ o.classList.remove("open"); });
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      document.querySelectorAll(".nav-dropdown.open").forEach(function(o){ o.classList.remove("open"); });
    }
  });

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

  /* ---------- invite / booking form ---------- */
  var inviteForm = document.querySelector("#invite-form");
  if(inviteForm){
    var out = document.querySelector("#generated-msg");
    var copyBtn = document.querySelector("#copy-msg");
    var copyNote = document.querySelector("#copy-note");

    function niceDate(d){
      if(!d) return "a date to be agreed";
      var dt = new Date(d + "T00:00:00");
      if(isNaN(dt.getTime())) return d;
      return dt.toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" });
    }

    inviteForm.addEventListener("submit", function(e){
      e.preventDefault();
      var name = inviteForm.querySelector("#inv-name").value.trim() || "A warm friend";
      var org = inviteForm.querySelector("#inv-org").value.trim();
      var city = inviteForm.querySelector("#inv-city").value.trim();
      var date = inviteForm.querySelector("#inv-date").value;
      var purpose = inviteForm.querySelector("#inv-purpose").value;
      var notes = inviteForm.querySelector("#inv-notes").value.trim();
      var contact = inviteForm.querySelector("#inv-contact").value.trim();

      var purposeLine = {
        ministration: "to minister in song at an upcoming service or program",
        conference: "to lead worship at a conference or retreat",
        training: "to host a worship/song-leading training session",
        book: "regarding the book \"Serving As A Psalmist\" (bulk copies or a reading/signing)",
        other: "regarding an opportunity to work together"
      }[purpose] || "regarding an opportunity to work together";

      var lines = [];
      lines.push("Dear Muyiwa,");
      lines.push("");
      lines.push("My name is " + name + (org ? (", from " + org) : "") + ". I'm reaching out " + purposeLine + (city ? (" in " + city) : "") + (date ? (", tentatively around " + niceDate(date)) : "") + ".");
      if(notes){ lines.push(""); lines.push(notes); }
      lines.push("");
      lines.push("Please let me know your availability and what you'd need from us to make this happen.");
      lines.push("");
      lines.push(contact ? ("You can reach me at: " + contact) : "Looking forward to hearing from you.");
      lines.push("");
      lines.push("Grace and peace.");

      var message = lines.join("\n");
      out.textContent = message;
      out.classList.add("show");
      copyBtn.hidden = false;
      copyNote.classList.remove("show");
      out.scrollIntoView({ behavior:"smooth", block:"nearest" });
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
