/* Spartan – Silent Spire — input / platform layer (touch + keyboard). Game logic stays in game.js. */
(function (g) {
  "use strict";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var DEFAULTS = {
    handed: "right",
    opacity: 0.78,
    sensitivity: 1,
    aimAssist: true,
    colorblind: false,
    reducedMotion: false,
    largeText: false
  };

  function loadSettings() {
    var s = Object.assign({}, DEFAULTS);
    try {
      var raw = lsGet("ss_settings");
      if (raw) {
        var o = JSON.parse(raw);
        Object.keys(DEFAULTS).forEach(function (k) {
          if (o[k] != null) s[k] = o[k];
        });
      }
    } catch (e) {}
    return s;
  }

  function Input(opts) {
    this.el = opts.root;
    this.settings = loadSettings();
    this.move = { x: 0, y: 0, on: false, id: null, sx: 0, sy: 0 };
    this.fire = false;
    this.jump = false;
    this.melee = false;
    this.grenade = false;
    this.crouch = false;
    this.keys = Object.create(null);
    this.events = [];
    this.thruster = 0;
    this._lastTap = 0;
    this._flickArmed = false;
    this._cook = 0;
    this._listeners = [];
    this._bindDom();
    this._bindKeys();
    this._bindGestures();
    this.applySettings();
  }

  Input.prototype.saveSettings = function () {
    lsSet("ss_settings", JSON.stringify(this.settings));
    this.applySettings();
  };

  Input.prototype.applySettings = function () {
    var s = this.settings;
    var root = this.el;
    if (!root) return;
    root.classList.toggle("lefty", s.handed === "left");
    root.style.setProperty("--btn-a", String(s.opacity));
    document.documentElement.classList.toggle("large-text", !!s.largeText);
    document.documentElement.classList.toggle("colorblind", !!s.colorblind);
    document.documentElement.classList.toggle("reduced-motion", !!s.reducedMotion);
  };

  Input.prototype.emit = function (type, data) {
    this.events.push({ type: type, data: data || null });
  };

  Input.prototype.drain = function () {
    var e = this.events;
    this.events = [];
    return e;
  };

  Input.prototype.poll = function () {
    var mx = 0, my = 0, ax = 0, ay = 0;
    var k = this.keys;
    if (k.ArrowLeft || k.a || k.A) mx -= 1;
    if (k.ArrowRight || k.d || k.D) mx += 1;
    if (k.ArrowUp || k.w || k.W) my -= 1;
    if (k.ArrowDown || k.s || k.S) my += 1;
    if (this.move.on) { mx += this.move.x; my += this.move.y; }
    var mag = Math.hypot(mx, my);
    if (mag > 1) { mx /= mag; my /= mag; mag = 1; }

    /* One stick: 360 aim from the same analog. Y pitches only — never fly. */
    if (this.move.on) { ax += this.move.x; ay += this.move.y; }
    else {
      if (Math.abs(mx) > 0.12 || Math.abs(my) > 0.12) { ax += mx; ay += my; }
      if (k.q || k.Q) ay -= 1;
      if (k.e || k.E) ay += 1;
    }
    var am = Math.hypot(ax, ay);
    if (am > 1) { ax /= am; ay /= am; am = 1; }

    this.crouch = my > 0.62 || !!(k.c || k.C);
    var fire = this.fire || !!(k.x || k.X);
    var jump = this.jump || !!(k[" "]);
    var melee = this.melee || !!(k.f || k.F || k.v || k.V);
    var nade = this.grenade || !!(k.g || k.G);
    var thruster = this.thruster;
    this.thruster = 0;
    return {
      mx: mx, my: my, mag: mag,
      ax: ax, ay: ay, am: am,
      fire: fire, jump: jump, melee: melee, grenade: nade,
      crouch: this.crouch, thruster: thruster,
      cook: this._cook
    };
  };

  Input.prototype._on = function (el, ev, fn, opt) {
    if (!el) return;
    el.addEventListener(ev, fn, opt || false);
    this._listeners.push([el, ev, fn, opt || false]);
  };

  Input.prototype._bindGestures = function () {
    function prevent(e) { e.preventDefault(); }
    this._on(document, "touchmove", function (e) {
      e.preventDefault();
    }, { passive: false });
    ["gesturestart", "gesturechange", "gestureend"].forEach(function (ev) {
      document.addEventListener(ev, prevent, { passive: false });
    });
    this._on(document, "dblclick", prevent, { passive: false });
    this._on(document, "contextmenu", prevent, { passive: false });
    var lastTouch = 0;
    this._on(document, "touchend", function () {
      lastTouch = Date.now();
    }, { passive: true });
    this._on(document, "mousedown", function (e) {
      if (Date.now() - lastTouch < 500) e.preventDefault();
    }, { passive: false });
  };

  Input.prototype._stickFrom = function (stick, t, zone, knob, appear) {
    var r = zone.getBoundingClientRect();
    var cx, cy, max;
    if (appear && !stick.on) {
      cx = t.clientX; cy = t.clientY;
      stick.sx = cx - r.left; stick.sy = cy - r.top;
      zone.classList.add("live-stick");
      var base = zone.querySelector(".stick-base");
      if (base) {
        base.style.left = (stick.sx - base.offsetWidth / 2) + "px";
        base.style.top = (stick.sy - base.offsetHeight / 2) + "px";
        base.classList.add("show");
      }
    } else if (appear) {
      var base2 = zone.querySelector(".stick-base");
      var br = base2 ? base2.getBoundingClientRect() : r;
      cx = br.left + br.width / 2; cy = br.top + br.height / 2;
    } else {
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    }
    max = (appear ? 70 : r.width * 0.38) * this.settings.sensitivity;
    var dx = t.clientX - cx, dy = t.clientY - cy;
    var mag = Math.hypot(dx, dy) || 1;
    if (mag > max) { dx = dx / mag * max; dy = dy / mag * max; }
    stick.x = dx / max;
    stick.y = dy / max;
    stick.on = true;
    if (knob) {
      knob.style.transform = "translate(" + dx + "px," + dy + "px)";
    }
    if (stick.y < -0.72) this._flickArmed = true;
  };

  Input.prototype._resetMove = function () {
    var zone = document.getElementById("movePad");
    var knob = document.getElementById("moveKnob");
    if (this._flickArmed && this.move.y < -0.55) {
      this.thruster = 1;
      this.emit("thruster");
    } else if (this.move.y < -0.82) {
      this.thruster = 1;
      this.emit("thruster");
    }
    this._flickArmed = false;
    this.move.x = 0; this.move.y = 0; this.move.on = false; this.move.id = null;
    if (knob) knob.style.transform = "translate(0,0)";
    if (zone) zone.classList.remove("live-stick");
  };

  Input.prototype._bindDom = function () {
    var self = this;
    var movePad = document.getElementById("movePad");
    var fireBtn = document.getElementById("fireBtn");
    var jumpBtn = document.getElementById("jumpBtn");
    var meleeBtn = document.getElementById("meleeBtn");
    var nadeBtn = document.getElementById("nadeBtn");
    var wepBtn = document.getElementById("wepBtn");
    var useBtn = document.getElementById("useBtn");
    var pauseBtn = document.getElementById("pauseBtn");
    var wepHold = 0;

    function tid(e) { return e.changedTouches ? e.changedTouches[0] : e; }

    if (movePad) {
      this._on(movePad, "touchstart", function (e) {
        e.preventDefault();
        var t = e.changedTouches[0];
        var now = performance.now();
        if (now - self._lastTap < 280) {
          self.thruster = 1;
          self.emit("thruster");
        }
        self._lastTap = now;
        self.move.id = t.identifier;
        self._stickFrom(self.move, t, movePad, document.getElementById("moveKnob"), false);
      }, { passive: false });
      this._on(movePad, "touchmove", function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) {
          var t = e.changedTouches[i];
          if (t.identifier === self.move.id) self._stickFrom(self.move, t, movePad, document.getElementById("moveKnob"), false);
        }
      }, { passive: false });
      function endMove(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === self.move.id) self._resetMove();
        }
      }
      this._on(movePad, "touchend", endMove, { passive: false });
      this._on(movePad, "touchcancel", endMove, { passive: false });
    }

    function holdBtn(btn, prop, evName) {
      if (!btn) return;
      var id = null;
      self._on(btn, "touchstart", function (e) {
        e.preventDefault();
        id = e.changedTouches[0].identifier;
        self[prop] = true;
        btn.classList.add("down");
        if (evName) self.emit(evName);
      }, { passive: false });
      function end(e) {
        for (var i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === id) {
            self[prop] = false; id = null; btn.classList.remove("down");
            if (evName === "nadeStart") self.emit("nadeThrow");
          }
        }
      }
      self._on(btn, "touchend", end, { passive: false });
      self._on(btn, "touchcancel", end, { passive: false });
      self._on(btn, "mousedown", function (e) {
        e.preventDefault();
        self[prop] = true;
        btn.classList.add("down");
        if (evName) self.emit(evName);
      });
      self._on(window, "mouseup", function () {
        if (self[prop] && id == null) {
          self[prop] = false;
          btn.classList.remove("down");
          if (evName === "nadeStart") self.emit("nadeThrow");
        }
      });
    }

    holdBtn(fireBtn, "fire", "fire");
    holdBtn(jumpBtn, "jump", "jump");
    holdBtn(meleeBtn, "melee", "melee");
    holdBtn(nadeBtn, "grenade", "nadeStart");

    if (wepBtn) {
      this._on(wepBtn, "touchstart", function (e) {
        e.preventDefault();
        wepHold = performance.now();
        wepBtn.classList.add("down");
      }, { passive: false });
      this._on(wepBtn, "touchend", function (e) {
        e.preventDefault();
        wepBtn.classList.remove("down");
        var held = performance.now() - wepHold;
        if (held > 340) self.emit("wepRadial");
        else self.emit("wepCycle");
      }, { passive: false });
      this._on(wepBtn, "click", function (e) {
        e.preventDefault();
        self.emit("wepCycle");
      });
    }

    if (useBtn) {
      this._on(useBtn, "touchstart", function (e) {
        e.preventDefault();
        self.emit("interact");
      }, { passive: false });
      this._on(useBtn, "click", function (e) {
        e.preventDefault();
        self.emit("interact");
      });
    }

    if (pauseBtn) {
      var lock = 0;
      function pauseTap(e) {
        e.preventDefault();
        var now = performance.now();
        if (now - lock < 350) return;
        lock = now;
        self.emit("pause");
      }
      this._on(pauseBtn, "touchstart", pauseTap, { passive: false });
      this._on(pauseBtn, "click", pauseTap);
    }
  };

  Input.prototype._bindKeys = function () {
    var self = this;
    this._on(window, "keydown", function (e) {
      self.keys[e.key] = true;
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) >= 0) e.preventDefault();
      if (e.key === " " && !e.repeat) self.emit("jump");
      if ((e.key === "f" || e.key === "F" || e.key === "v" || e.key === "V") && !e.repeat) self.emit("melee");
      if ((e.key === "g" || e.key === "G") && !e.repeat) self.emit("nadeStart");
      if (e.key === "e" || e.key === "E") self.emit("interact");
      if (e.key === "p" || e.key === "P" || e.key === "Escape") self.emit("pause");
      if (e.key === "Tab") { e.preventDefault(); self.emit("wepRadial"); }
      if (e.key >= "1" && e.key <= "9") self.emit("wep", parseInt(e.key, 10) - 1);
      if (e.key === "r" || e.key === "R") self.emit("wepCycle");
      self.emit("key", e.key);
    }, { passive: false });
    this._on(window, "keyup", function (e) {
      self.keys[e.key] = false;
      if (e.key === "g" || e.key === "G") self.emit("nadeThrow");
    });
  };

  Input.prototype.setInteract = function (on) {
    var b = document.getElementById("useBtn");
    if (!b) return;
    b.classList.toggle("show", !!on);
  };

  Input.prototype.setLive = function (on) {
    if (this.el) this.el.classList.toggle("live", !!on);
  };

  g.SS = g.SS || {};
  g.SS.Input = Input;
  g.SS.lsGet = lsGet;
  g.SS.lsSet = lsSet;
})(window);
