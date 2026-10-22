/* AI Poster Generator — client-side engine
 * AI background: Pollinations (free, no API key) with automatic fallback
 * Typography:    canvas layout engine (auto-fit, wrap, CTA pill)
 */
(function () {
  "use strict";

  var FALL_ASLEEP = 0; // (unused, reserved)
  var STYLES = {
    gradient: {
      label: "Gradient",
      palette: ["#312e81", "#be185d"], accent: "#f9a8d4", text: "#ffffff",
      titleFont: function (s) { return "900 " + s + "px 'Arial Black', 'Segoe UI', sans-serif"; },
      imgHint: "abstract gradient mesh background, vibrant purple and pink, smooth waves, poster background, no text, no words"
    },
    minimal: {
      label: "Minimal",
      palette: ["#f5f5f4", "#d6d3d1"], accent: "#111827", text: "#111827",
      titleFont: function (s) { return "800 " + s + "px 'Helvetica Neue', Arial, sans-serif"; },
      imgHint: "minimalist background, soft neutral beige tones, large negative space, gentle light, poster background, no text, no words"
    },
    neon: {
      label: "Neon",
      palette: ["#0f0524", "#1e1b4b"], accent: "#22d3ee", text: "#ffffff",
      titleFont: function (s) { return "900 " + s + "px 'Arial Black', Impact, sans-serif"; },
      imgHint: "dark cyberpunk neon background, glowing magenta and cyan lights, night city bokeh, poster background, no text, no words"
    },
    vintage: {
      label: "Vintage",
      palette: ["#3f2d23", "#78584a"], accent: "#fbbf24", text: "#fff7ed",
      titleFont: function (s) { return "700 " + s + "px Georgia, 'Times New Roman', serif"; },
      imgHint: "vintage paper texture background, warm retro sepia tones, subtle film grain, poster background, no text, no words"
    },
    bold: {
      label: "Bold Sale",
      palette: ["#dc2626", "#f59e0b"], accent: "#111827", text: "#ffffff",
      titleFont: function (s) { return "900 " + s + "px Impact, 'Arial Black', sans-serif"; },
      imgHint: "bold graphic background, dynamic diagonal shapes, energetic red and yellow, pop art poster background, no text, no words"
    },
    pastel: {
      label: "Pastel",
      palette: ["#fce7f3", "#dbeafe"], accent: "#7c3aed", text: "#3b0764",
      titleFont: function (s) { return "800 " + s + "px 'Segoe UI', Arial, sans-serif"; },
      imgHint: "soft pastel background, dreamy gradient of pink and blue, gentle clouds, poster background, no text, no words"
    }
  };

  var SIZES = {
    poster: { w: 1080, h: 1350, genW: 864, genH: 1080 },
    square: { w: 1080, h: 1080, genW: 1024, genH: 1024 },
    story:  { w: 1080, h: 1920, genW: 720,  genH: 1280 },
    wide:   { w: 1920, h: 1080, genW: 1280, genH: 720 }
  };

  var state = { style: "gradient", size: "poster", lastBg: null, lastSeed: 1, busy: false };

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $("canvas"), ctx = canvas.getContext("2d");
  var statusEl = $("status");

  /* ---------- helpers ---------- */

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function wrapText(text, maxW) {
    var words = text.split(/\s+/).filter(Boolean);
    var lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width <= maxW || !line) line = test;
      else { lines.push(line); line = words[i]; }
    }
    if (line) lines.push(line);
    return lines;
  }

  function fitLines(text, fontTpl, maxW, maxLines, startSize, minSize) {
    for (var size = startSize; size >= minSize; size -= Math.max(2, Math.round(startSize * 0.05))) {
      ctx.font = fontTpl(size);
      var lines = wrapText(text, maxW);
      if (lines.length <= maxLines) return { size: size, lines: lines };
    }
    ctx.font = fontTpl(minSize);
    return { size: minSize, lines: wrapText(text, maxW).slice(0, maxLines) };
  }

  function drawCover(img) {
    var W = canvas.width, H = canvas.height;
    var s = Math.max(W / img.width, H / img.height);
    var w = img.width * s, h = img.height * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }

  /* ---------- backgrounds ---------- */

  function proceduralBg(seed, style) {
    var W = canvas.width, H = canvas.height;
    var rnd = mulberry32(seed);
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, style.palette[0]);
    g.addColorStop(1, style.palette[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < 6; i++) {
      ctx.globalAlpha = 0.07 + rnd() * 0.1;
      ctx.fillStyle = i % 2 ? style.accent : "#ffffff";
      ctx.beginPath();
      ctx.arc(rnd() * W, rnd() * H, (0.15 + rnd() * 0.3) * Math.min(W, H), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loadAIImage(prompt, seed, genW, genH) {
    var url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
      "?width=" + genW + "&height=" + genH + "&seed=" + seed + "&nologo=true";
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 28000);
    return fetch(url, { signal: ctrl.signal })
      .then(function (res) { clearTimeout(timer); if (!res.ok) throw new Error(res.status); return res.blob(); })
      .then(function (blob) {
        return new Promise(function (ok, err) {
          var im = new Image();
          im.onload = function () { ok(im); };
          im.onerror = err;
          im.src = URL.createObjectURL(blob);
        });
      });
  }

  /* ---------- poster rendering ---------- */

  function drawPlaceholder() {
    var W = canvas.width, H = canvas.height;
    ctx.fillStyle = "#1c1c29";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#9a9ab0";
    ctx.font = "600 " + Math.round(W * 0.035) + "px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Describe your idea and hit Generate", W / 2, H / 2);
    ctx.textAlign = "start";
  }

  function drawPoster(bgImg, style, seed, usedFallback) {
    var W = canvas.width, H = canvas.height;
    canvas.width = W; canvas.height = H;

    if (bgImg) {
      drawCover(bgImg);
    } else {
      proceduralBg(seed, style);
    }

    // readability scrim over AI artwork (procedural palettes are already safe)
    if (bgImg) {
      var sc = ctx.createLinearGradient(0, 0, 0, H);
      sc.addColorStop(0, "rgba(0,0,0,.25)");
      sc.addColorStop(0.45, "rgba(0,0,0,.15)");
      sc.addColorStop(1, "rgba(0,0,0,.6)");
      ctx.fillStyle = sc;
      ctx.fillRect(0, 0, W, H);
    }

    var title = ($("title-input").value || "").trim();
    var subtitle = ($("subtitle-input").value || "").trim();
    var cta = ($("cta-input").value || "").trim();
    if (!title) {
      var p = ($("prompt").value || "Your Poster").trim();
      title = p.split(/\s+/).slice(0, 3).join(" ");
    }

    var textColor = bgImg ? "#ffffff" : style.text;
    var maxW = W * 0.82;
    var titleStart = W * (H > W ? 0.115 : 0.105);

    var t = fitLines(title.toUpperCase(), style.titleFont, maxW, 4, titleStart, W * 0.05);
    var titleLH = t.size * 1.08;

    var sub = null;
    if (subtitle) {
      var subFont = function (s) { return "500 " + s + "px 'Segoe UI', Arial, sans-serif"; };
      sub = fitLines(subtitle, subFont, maxW, 3, W * 0.042, W * 0.026);
    }
    var subH = sub ? sub.lines.length * sub.size * 1.3 + W * 0.045 : 0;

    var blockH = t.lines.length * titleLH + subH;
    var y = H * (H > W ? 0.42 : 0.45) - blockH / 2;

    // title
    ctx.font = style.titleFont(t.size);
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,.55)";
    ctx.shadowBlur = W * 0.012;
    ctx.shadowOffsetY = W * 0.004;
    for (var i = 0; i < t.lines.length; i++) {
      ctx.fillText(t.lines[i], W / 2, y + titleLH * (i + 0.82));
    }

    // subtitle
    if (sub) {
      ctx.font = subFont(sub.size);
      ctx.fillStyle = bgImg ? "rgba(255,255,255,.92)" : style.text;
      var sy = y + t.lines.length * titleLH + sub.size * 1.15;
      for (var j = 0; j < sub.lines.length; j++) {
        ctx.fillText(sub.lines[j], W / 2, sy + sub.size * 1.3 * j);
      }
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // CTA pill
    if (cta) {
      ctx.font = "700 " + Math.round(W * 0.034) + "px 'Segoe UI', Arial, sans-serif";
      var tw = ctx.measureText(cta).width;
      var padX = W * 0.045, padY = W * 0.022;
      var pw = tw + padX * 2, ph = W * 0.034 * 1.9;
      var px = (W - pw) / 2, py = H - ph - H * 0.09;
      var pill = bgImg ? "#ffffff" : style.accent;
      var pillText = bgImg ? "#111827" : (style.text === "#ffffff" ? "#111827" : style.text);
      if (style.text !== "#ffffff" && !bgImg) pillText = "#ffffff";
      ctx.fillStyle = pill;
      var r = ph / 2;
      ctx.beginPath();
      ctx.moveTo(px + r, py);
      ctx.arcTo(px + pw, py, px + pw, py + ph, r);
      ctx.arcTo(px + pw, py + ph, px, py + ph, r);
      ctx.arcTo(px, py + ph, px, py, r);
      ctx.arcTo(px, py, px + pw, py, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = pillText;
      ctx.fillText(cta, W / 2, py + ph * 0.68);
    }

    // small credit
    ctx.font = "600 " + Math.round(W * 0.02) + "px 'Segoe UI', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.textAlign = "right";
    ctx.fillText("✦ AI Poster Generator", W - W * 0.035, H - H * 0.028);
    ctx.textAlign = "start";
  }

  /* ---------- generate flow ---------- */

  function setStatus(msg) { statusEl.textContent = msg || ""; }

  function generate(newSeed) {
    if (state.busy) return;
    state.busy = true;
    $("generate-btn").disabled = true;
    $("download-btn").disabled = true;

    var seed = newSeed ? Math.floor(Math.random() * 1e6) : Math.floor(Math.random() * 1e6);
    var style = STYLES[state.style];
    var size = SIZES[state.size];
    canvas.width = size.w; canvas.height = size.h;

    var userPrompt = ($("prompt").value || "").trim() || "colorful abstract poster background";
    var imgPrompt = userPrompt + ", " + style.imgHint;

    setStatus("Painting with AI… (usually 5–20s)");
    drawPlaceholder();

    loadAIImage(imgPrompt, seed, size.genW, size.genH)
      .then(function (img) {
        state.lastBg = img; state.lastSeed = seed;
        drawPoster(img, style, seed, false);
        setStatus("Done ✓ Hit Regenerate for a different artwork.");
      })
      .catch(function () {
        state.lastBg = null; state.lastSeed = seed;
        drawPoster(null, style, seed, true);
        setStatus("AI image service is busy — used a smart gradient instead. Try Regenerate.");
      })
      .finally(function () {
        state.busy = false;
        $("generate-btn").disabled = false;
        $("download-btn").disabled = false;
        $("preview-actions").hidden = false;
      });
  }

  function redrawCached() {
    var style = STYLES[state.style];
    var size = SIZES[state.size];
    canvas.width = size.w; canvas.height = size.h;
    drawPoster(state.lastBg, style, state.lastSeed, !state.lastBg);
  }

  function download() {
    canvas.toBlob(function (blob) {
      if (!blob) { setStatus("Export failed — please try again."); return; }
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "poster-" + Date.now() + ".png";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    }, "image/png");
  }

  /* ---------- wiring ---------- */

  document.getElementById("style-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
    chip.classList.add("active");
    state.style = chip.dataset.style;
    if (state.lastBg !== null || document.getElementById("preview-actions").hidden === false) redrawCached();
  });

  $("size-select").addEventListener("change", function (e) {
    state.size = e.target.value;
    if ($("preview-actions").hidden === false) redrawCached();
  });

  $("generate-btn").addEventListener("click", function () { generate(true); });
  $("regenerate-btn").addEventListener("click", function () { generate(true); });
  $("download-btn").addEventListener("click", download);

  // idea buttons: fill form, set style, auto-generate
  document.querySelectorAll(".idea").forEach(function (btn) {
    btn.addEventListener("click", function () {
      $("prompt").value = btn.dataset.prompt;
      $("title-input").value = btn.dataset.title || "";
      $("subtitle-input").value = btn.dataset.subtitle || "";
      $("cta-input").value = btn.dataset.cta || "";
      var chip = document.querySelector('.chip[data-style="' + btn.dataset.style + '"]');
      if (chip) chip.click();
      document.getElementById("tool").scrollIntoView({ behavior: "smooth" });
      generate(true);
    });
  });

  drawPlaceholder();
})();
