/* ============================================================
   NOVA Stopwatch — Full Project Redesign
   - Stopwatch / Timer / Pomodoro
   - Overlays: Focus Mode, Alarm, Shortcuts, Settings, History
   - Mini Widget
   ============================================================ */

(() => {
  "use strict";

  /**
   * Helpers
   */
  const $ = (id) => document.getElementById(id);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatClock(ms, precisionMsDigits = 2) {
    // precisionMsDigits: 2 => .00 (centiseconds), 3 => .000 (milliseconds)
    const totalMs = Math.max(0, ms);
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const remMs = totalMs % 1000;

    if (precisionMsDigits === 3) {
      // show full milliseconds
      return `${pad2(minutes)}:${pad2(seconds)}.${String(remMs).padStart(3, "0")}`;
    }

    const cs = Math.floor(remMs / 10);
    return `${pad2(minutes)}:${pad2(seconds)}.${pad2(cs)}`;
  }

  function formatMMSS(ms) {
    const totalMs = Math.max(0, ms);
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    return `${pad2(minutes)}:${pad2(seconds)}`;
  }

  function formatCentiseconds(ms) {
    const remMs = Math.max(0, ms) % 1000;
    const cs = Math.floor(remMs / 10);
    return pad2(cs);
  }

  function formatDelta(ms) {
    if (!Number.isFinite(ms)) return "—";
    const abs = Math.abs(ms);
    if (abs < 10) return "±0.00";
    const sign = ms >= 0 ? "+" : "-";
    return `${sign}${formatMMSS(abs).replace(":", ":")}.${formatCentiseconds(abs)}`;
  }

  class StorageController {
    constructor() {
      this.key = "nova_stopwatch_sessions_v1";
    }

    loadSessions() {
      try {
        const raw = localStorage.getItem(this.key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    saveSessions(sessions) {
      localStorage.setItem(this.key, JSON.stringify(sessions));
    }

    addSession(session) {
      const sessions = this.loadSessions();
      sessions.unshift(session);
      // cap to keep storage light
      const capped = sessions.slice(0, 50);
      this.saveSessions(capped);
      return capped;
    }

    clearAll() {
      this.saveSessions([]);
    }
  }

  class OverlayController {
    constructor(ui) {
      this.ui = ui;
      this.isOpen = {
        focus: false,
        alarm: false,
        shortcuts: false,
        settings: false,
        history: false,
      };

      this.bind();
    }

    bind() {
      // Focus
      this.ui.focusExitBtn?.addEventListener("click", () => this.close("focus"));

      // Alarm
      this.ui.alarmDismissBtn?.addEventListener("click", () => this.close("alarm"));

      // Shortcuts
      this.ui.shortcutsBtn?.addEventListener("click", () => this.open("shortcuts"));
      this.ui.closeShortcutsBtn?.addEventListener("click", () => this.close("shortcuts"));

      // Settings
      this.ui.settingsToggleBtn?.addEventListener("click", () => this.open("settings"));
      this.ui.closeSettingsBtn?.addEventListener("click", () => this.close("settings"));

      // History
      this.ui.historyBtn?.addEventListener("click", () => this.open("history"));
      this.ui.closeHistoryBtn?.addEventListener("click", () => this.close("history"));

      // Common close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          // close overlays in safe order
          this.closeAll();
        }
      });

      // Click outside close (for overlays that should close)
      for (const name of ["shortcuts", "settings", "history", "focus", "alarm"]) {
        const el = this.ui[`overlay${name[0].toUpperCase()}${name.slice(1)}El`];
        if (!el) continue;
        el.addEventListener("click", (evt) => {
          if (evt.target === el) {
            if (name !== "alarm") this.close(name);
          }
        });
      }
    }

    closeAll() {
      // alarm shouldn't close on background click/escape for safety; keep it closable via button
      this.close("shortcuts");
      this.close("settings");
      this.close("history");
      this.close("focus");
    }

    open(name) {
      const elMap = {
        focus: this.ui.focusOverlay,
        alarm: this.ui.alarmOverlay,
        shortcuts: this.ui.shortcutsModal,
        settings: this.ui.settingsModal,
        history: this.ui.historyModal,
      };
      const el = elMap[name];
      if (!el) return;

      el.classList.add("show");
      el.setAttribute("aria-hidden", "false");
      this.isOpen[name] = true;

      if (name === "shortcuts") {
        this.ui.shortcutsBtn?.setAttribute("aria-expanded", "true");
      }
    }

    close(name) {
      const elMap = {
        focus: this.ui.focusOverlay,
        alarm: this.ui.alarmOverlay,
        shortcuts: this.ui.shortcutsModal,
        settings: this.ui.settingsModal,
        history: this.ui.historyModal,
      };
      const el = elMap[name];
      if (!el) return;

      el.classList.remove("show");
      el.setAttribute("aria-hidden", "true");
      this.isOpen[name] = false;

      if (name === "shortcuts") {
        this.ui.shortcutsBtn?.setAttribute("aria-expanded", "false");
      }
    }
  }

  class UIBinder {
    constructor() {
      // Tabs/buttons
      this.tabStopwatch = $(`tab-stopwatch`);
      this.tabTimer = $(`tab-timer`);
      this.tabPomodoro = $(`tab-pomodoro`);
      this.tabSlider = $(`tab-slider`);

      // Main header
      this.headerStatusDot = $(`header-status-dot`);
      this.headerStatusText = $(`header-status-text`);

      // Primary controls
      this.startBtn = $(`start-btn`);
      this.lapBtn = $(`lap-btn`);
      this.resetBtn = $(`reset-btn`);

      // Dial readout (stopwatch)
      this.readoutStatus = $(`readout-status`);
      this.readoutNumericArea = $(`readout-numeric-area`);
      this.mainTimeDisplay = $(`main-time-display`);
      this.mainMsDisplay = $(`main-ms-display`);
      this.subLapDisplay = $(`sub-lap-display`);
      this.progressMinute = $(`progress-minute`);
      this.progressSecond = $(`progress-second`);
      this.progressMs = $(`progress-ms`);
      this.sweepDot = $(`sweep-dot`);

      // Timer setup panel
      this.timerSetupPanel = $(`timer-setup-panel`);
      this.setupMinEl = $(`setup-min`);
      this.setupSecEl = $(`setup-sec`);

      // Pomodoro setup label
      this.pomodoroSetupPanel = $(`pomodoro-setup-panel`);
      this.pomPhaseLabel = $(`pom-phase-label`);
      this.pomCyclesDisplay = $(`pom-cycles-display`);

      // Pomodoro view (telemetry panel)
      this.pomWorkInput = $(`pom-work-input`);
      this.pomShortInput = $(`pom-short-input`);
      this.pomLongInput = $(`pom-long-input`);
      this.pomSessionsCount = $(`pom-sessions-count`);
      this.pomFocusTime = $(`pom-focus-time`);
      this.pomCycleCount = $(`pom-cycle-count`);

      // Lap table
      this.lapTbody = $(`lap-tbody`);
      this.lapSearchInput = $(`lap-search-input`);

      // Telemetry
      this.statTotalLaps = $(`stat-total-laps`);
      this.statFastestLap = $(`stat-fastest-lap`);
      this.statFastestNum = $(`stat-fastest-num`);
      this.statSlowestLap = $(`stat-slowest-lap`);
      this.statSlowestNum = $(`stat-slowest-num`);
      this.statAverageLap = $(`stat-average-lap`);

      // Actions
      this.clearDataBtn = $(`clear-data-btn`);

      // Exports (optional — implemented as CSV/JSON; PNG/Text degrade gracefully)
      this.exportCsvBtn = $(`export-csv-btn`);
      this.exportJsonBtn = $(`export-json-btn`);
      this.exportPngBtn = $(`export-png-btn`);

      // Timer presets
      this.timerPresetsView = $(`timer-presets-view`);
      this.timerProgressFill = $(`timer-progress-fill`);
      this.presetsButtons = Array.from(document.querySelectorAll(`.preset-btn`));
      this.adjustButtons = Array.from(document.querySelectorAll(`.adjust-btn-sm`));

      // Stopwatch companion in timer presets view
      this.miniStopwatchWidget = $(`mini-stopwatch-widget`);
      this.miniStopwatchStartBtn = $(`mini-stopwatch-start-btn`);
      this.miniStopwatchLapBtn = $(`mini-stopwatch-lap-btn`);
      this.miniStopwatchResetBtn = $(`mini-stopwatch-reset-btn`);
      this.miniStopwatchStatusText = $(`mini-stopwatch-status-text`);
      this.miniStopwatchStatusDot = $(`mini-stopwatch-status-dot`);
      this.miniStopwatchTime = $(`mini-stopwatch-time`);
      this.miniStopwatchJumpBtn = $(`mini-stopwatch-jump-btn`);

      // Pomodoro view in main panel
      this.pomViewEl = $(`pomodoro-view`);
      this.stopwatchPanelEl = $(`stopwatch-telemetry-view`);

      // Overlays
      this.focusOverlay = $(`focus-overlay`);
      this.focusExitBtn = $(`focus-exit-btn`);
      this.focusTimeDisplay = $(`focus-time-display`);
      this.focusStatusText = $(`focus-status-text`);
      this.focusStartBtn = $(`focus-start-btn`);

      this.alarmOverlay = $(`alarm-overlay`);
      this.alarmDismissBtn = $(`alarm-dismiss-btn`);

      this.shortcutsModal = $(`shortcuts-modal`);
      this.shortcutsBtn = $(`shortcuts-btn`);
      this.closeShortcutsBtn = $(`close-shortcuts-btn`);

      this.settingsModal = $(`settings-modal`);
      this.settingsToggleBtn = $(`settings-toggle-btn`);
      this.closeSettingsBtn = $(`close-settings-btn`);

      this.historyModal = $(`history-modal`);
      this.historyBtn = $(`history-btn`);
      this.closeHistoryBtn = $(`close-history-btn`);

      this.historyBody = $(`history-body`);
      this.saveSessionBtn = $(`save-session-btn`);
      this.clearHistoryBtn = $(`clear-history-btn`);

      // Mini widget overlay
      this.miniWidget = $(`mini-widget`);
      this.miniWidgetHandle = $(`mini-widget-handle`);
      this.miniWidgetTime = $(`mini-widget-time`);
      this.miniWidgetStart = $(`mini-widget-start`);
      this.miniWidgetLap = $(`mini-widget-lap`);
      this.miniWidgetClose = $(`mini-widget-close`);

      // Theme and settings controls
      this.soundSelect = $(`sound-mode-select`);
      this.alarmSoundSelect = $(`alarm-sound-select`);
      this.tickingToggle = $(`ticking-toggle`);
      this.particlesToggle = $(`particles-toggle`);
      this.precisionBtns = Array.from(document.querySelectorAll(`.seg-btn`));
      this.themeChips = Array.from(document.querySelectorAll(`.theme-chip`));

      // Timer setup spinner buttons
      this.setupPanel = $(`timer-setup-panel`);
      this.setupAdjustBtns = Array.from(document.querySelectorAll(`.spin-btn`));

      // Pomodoro phases buttons
      this.pomPhaseButtons = Array.from(document.querySelectorAll(`.pom-phase-btn`));

      // Reset hold bar
      this.resetHoldBar = $(`reset-hold-bar`);

      // Main wrapper for workspace to apply alarm shake/state
      this.chronoPanelEl = document.querySelector(`.chrono-panel`);
      this.dialContentBlock = $(`dial-content-block`);

      // Tab content containers
      this.timerPresetsViewEl = $(`timer-presets-view`);
      this.stopwatchTelemetryViewEl = $(`stopwatch-telemetry-view`);

      // For overlays close handlers lookup
      this.overlayFocusEl = this.focusOverlay;
      this.overlayAlarmEl = this.alarmOverlay;
      this.overlayShortcutsEl = this.shortcutsModal;
      this.overlaySettingsEl = this.settingsModal;
      this.overlayHistoryEl = this.historyModal;

      // Keyboard legend depends on these IDs
      this.modes = {
        stopwatch: this.stopwatchTelemetryViewEl,
        timer: this.timerPresetsViewEl,
        pomodoro: this.pomViewEl,
      };

      // Disable search by default; enable when laps exist
      this.lapSearchInput.disabled = true;

      // Precision default
      this.precisionDigits = 2;
    }
  }

  class StopwatchController {
    constructor(ui, overlays) {
      this.ui = ui;
      this.overlays = overlays;

      this.running = false;
      this.elapsedMs = 0;
      this.startEpoch = 0;
      this.raf = null;
      this.lastTickAt = 0;

      this.laps = [];

      // hold-to-reset
      this.resetHoldActive = false;
      this.resetHoldStart = 0;
      this.resetHoldDuration = 800;

      // mini widget state (separate from main stopwatch)
      this.miniRunning = false;
      this.miniElapsedMs = 0;
      this.miniStartEpoch = 0;
      this.miniRaf = null;
      this.miniLaps = [];

      // callback this controller can use to determine which mode is active
      this.getActiveMode = () => "stopwatch";

      this.bind();
      this.syncFromState();
    }

    bind() {
      this.ui.resetBtn?.addEventListener("mousedown", (e) => {
        if (this.getActiveMode() === "stopwatch") this.onResetHoldDown(e);
      });
      this.ui.resetBtn?.addEventListener("touchstart", (e) => {
        if (this.getActiveMode() === "stopwatch") this.onResetHoldDown(e);
      }, { passive: true });
      this.ui.resetBtn?.addEventListener("mouseup", () => {
        if (this.getActiveMode() === "stopwatch") this.onResetHoldUp();
      });
      this.ui.resetBtn?.addEventListener("mouseleave", () => {
        if (this.getActiveMode() === "stopwatch") this.onResetHoldUp();
      });
      this.ui.resetBtn?.addEventListener("touchend", () => {
        if (this.getActiveMode() === "stopwatch") this.onResetHoldUp();
      });

      // Mini widget
      this.ui.miniWidgetStart?.addEventListener("click", () => this.toggleMini());
      this.ui.miniWidgetLap?.addEventListener("click", () => this.addMiniLap());
      this.ui.miniWidgetClose?.addEventListener("click", () => {
        this.ui.miniWidget?.classList.remove("show");
        this.ui.miniWidget?.setAttribute("aria-hidden", "true");
      });

      // Drag mini widget
      this.initMiniDrag();

      // Reset hold bar animation
      this.ui.resetBtn?.addEventListener("keydown", () => {});
    }

    initMiniDrag() {
      const handle = this.ui.miniWidgetHandle;
      const widget = this.ui.miniWidget;
      if (!handle || !widget) return;

      let dragging = false;
      let offsetX = 0;
      let offsetY = 0;

      const onDown = (e) => {
        dragging = true;
        const rect = widget.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        widget.style.left = `${rect.left}px`;
        widget.style.top = `${rect.top}px`;
        widget.style.right = "auto";
        widget.style.bottom = "auto";
      };

      const onMove = (e) => {
        if (!dragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        widget.style.left = `${clientX - offsetX}px`;
        widget.style.top = `${clientY - offsetY}px`;
      };

      const onUp = () => {
        dragging = false;
      };

      handle.addEventListener("mousedown", onDown);
      handle.addEventListener("touchstart", onDown, { passive: true });
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: true });
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchend", onUp);
    }

    toggleMain() {
      if (this.getActiveMode() !== "stopwatch") return;
      if (this.running) this.pauseMain();
      else this.startMain();
    }

    startMain() {
      if (this.getActiveMode() !== "stopwatch") return;
      if (this.running) return;
      this.running = true;
      this.startEpoch = performance.now() - this.elapsedMs;
      this.raf = requestAnimationFrame(() => this.tickMain());
      this.syncFromState();
    }

    pauseMain() {
      if (this.getActiveMode() !== "stopwatch") return;
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
      this.syncFromState();
    }

    resetMain() {
      if (this.getActiveMode() !== "stopwatch") return;
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
      this.elapsedMs = 0;
      this.laps = [];
      this.ui.lapSearchInput.disabled = true;
      this.ui.lapSearchInput.value = "";
      this.syncFromState();
    }

    tickMain() {
      if (!this.running) return;
      this.elapsedMs = performance.now() - this.startEpoch;
      this.updateMainDisplay();
      this.updateMiniCompanionFromMain();
      this.raf = requestAnimationFrame(() => this.tickMain());
    }

    addMainLap() {
      if (this.getActiveMode() !== "stopwatch") return;
      if (!this.running && this.elapsedMs <= 0) return;
      if (!this.running && this.elapsedMs > 0) {
        // allow laps while paused (optional), but keep disabled in UI
      }

      const elapsed = this.elapsedMs;
      const totalPrev = this.laps.reduce((a, b) => a + b, 0);
      const lapMs = elapsed - totalPrev;
      if (lapMs < 0) return;
      this.laps.push(lapMs);

      this.renderLapTable();
      this.updateStats();
      this.updateSubLapInfo();

      this.ui.lapSearchInput.disabled = false;
    }

    renderLapTable() {
      const tbody = this.ui.lapTbody;
      if (!tbody) return;

      tbody.innerHTML = "";

      if (!this.laps.length) {
        tbody.innerHTML = `
          <tr class="empty-row">
            <td colspan="5">
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="empty-icon">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <span>No laps recorded yet.</span>
                <span class="empty-sub">Start and press <kbd>L</kbd> to record a lap.</span>
              </div>
            </td>
          </tr>`;
        return;
      }

      let cumulative = 0;
      const avgAllSoFar = [];

      for (let i = 0; i < this.laps.length; i++) {
        const lapMs = this.laps[i];
        cumulative += lapMs;
        const avg = cumulative / (i + 1);
        avgAllSoFar.push(avg);
      }

      for (let i = 0; i < this.laps.length; i++) {
        const lapMs = this.laps[i];
        const totalMs = this.laps.slice(0, i + 1).reduce((a, b) => a + b, 0);
        const avg = totalMs / (i + 1);
        const delta = lapMs - avg;

        const deltaClass = delta > 0 ? "delta-positive" : delta < 0 ? "delta-negative" : "delta-neutral";
        const tr = document.createElement("tr");
        tr.className = "lap-row-anim";

        // label cell: editable input is present in CSS; implement as static for now
        tr.innerHTML = `
          <td class="lap-num-cell">${i + 1}</td>
          <td class="lap-label-cell">Lap ${i + 1}</td>
          <td class="lap-time-cell mono">${formatMMSS(lapMs)}.${formatCentiseconds(lapMs)}</td>
          <td class="lap-total-cell mono">${formatMMSS(totalMs)}.${formatCentiseconds(totalMs)}</td>
          <td class="lap-delta-cell ${deltaClass}">${delta >= 0 ? "+" : ""}${formatMMSS(Math.abs(delta))}.${formatCentiseconds(Math.abs(delta))}</td>
        `;

        tbody.appendChild(tr);
      }

      // Apply search filter if input has value
      const q = (this.ui.lapSearchInput?.value || "").trim().toLowerCase();
      if (q) this.applyLapSearch(q);
    }

    applyLapSearch(q) {
      if (!this.ui.lapTbody) return;
      const rows = Array.from(this.ui.lapTbody.querySelectorAll("tr"));
      for (const r of rows) {
        if (r.classList.contains("empty-row")) continue;
        const text = r.innerText.toLowerCase();
        r.style.display = text.includes(q) ? "" : "none";
      }
    }

    updateSubLapInfo() {
      if (!this.ui.subLapDisplay) return;
      const lapNum = this.laps.length;
      const lastLap = this.laps[lapNum - 1] || 0;
      this.ui.subLapDisplay.textContent = `LAP ${lapNum} — ${formatMMSS(lastLap)}.${formatCentiseconds(lastLap)}`;
    }

    updateStats() {
      const u = this.ui;
      if (!u.statTotalLaps) return;

      if (!this.laps.length) {
        u.statTotalLaps.textContent = "—";
        u.statFastestLap.textContent = "—";
        u.statFastestNum.textContent = "—";
        u.statSlowestLap.textContent = "—";
        u.statSlowestNum.textContent = "—";
        u.statAverageLap.textContent = "—";
        return;
      }

      const fastestMs = Math.min(...this.laps);
      const slowestMs = Math.max(...this.laps);
      const averageMs = this.laps.reduce((a, b) => a + b, 0) / this.laps.length;

      u.statTotalLaps.textContent = String(this.laps.length);

      u.statFastestLap.textContent = `${formatMMSS(fastestMs)}.${formatCentiseconds(fastestMs)}`;
      const fastestIndex = this.laps.indexOf(fastestMs);
      u.statFastestNum.textContent = fastestIndex >= 0 ? `#${fastestIndex + 1}` : "—";

      u.statSlowestLap.textContent = `${formatMMSS(slowestMs)}.${formatCentiseconds(slowestMs)}`;
      const slowestIndex = this.laps.lastIndexOf(slowestMs);
      u.statSlowestNum.textContent = slowestIndex >= 0 ? `#${slowestIndex + 1}` : "—";

      u.statAverageLap.textContent = `${formatMMSS(averageMs)}.${formatCentiseconds(averageMs)}`;
    }

    updateMainDisplay() {
      // Readout in index.html: main-time-display (00:00) and main-ms-display (.00)
      if (!this.ui.mainTimeDisplay || !this.ui.mainMsDisplay) return;

      const mmss = formatMMSS(this.elapsedMs);
      const fraction =
        this.precisionDigits === 3
          ? String(Math.floor(Math.max(0, this.elapsedMs) % 1000)).padStart(3, "0")
          : formatCentiseconds(this.elapsedMs);

      this.ui.mainTimeDisplay.textContent = mmss;
      this.ui.mainMsDisplay.textContent = `.${fraction}`;
      this.updateRings(this.elapsedMs);

      // Focus overlay sync when open
      if (this.overlays?.isOpen?.focus) {
        const focusTime = this.ui.focusTimeDisplay;
        if (focusTime) {
          focusTime.firstChild && (focusTime.firstChild.textContent = mmss.replace(".", ""));
          // focusTime includes: 00:00<span class="focus-ms">.00</span>
          const span = focusTime.querySelector(".focus-ms");
          if (span) span.textContent = `.${fraction}`;
        }
      }

      // Mini widget sync
      if (this.ui.miniWidget?.classList.contains("show") && this.miniRunning) {
        // handled in mini tick
      }

      // Alarm UI state set via overlays
      if (this.ui.resetHoldBar && this.resetHoldActive) {
        // bar fill handled in hold loop
      }

      this.updateSubLapInfo();
    }

    updateRings(ms) {
      const minuteCirc = 2 * Math.PI * 86;
      const secondCirc = 2 * Math.PI * 93;
      const msCirc = 2 * Math.PI * 100;
      const minuteProgress = (ms % 3600000) / 3600000;
      const secondProgress = (ms % 60000) / 60000;
      const msProgress = (ms % 1000) / 1000;

      if (this.ui.progressMinute) {
        this.ui.progressMinute.style.strokeDashoffset = String(minuteCirc * (1 - minuteProgress));
      }
      if (this.ui.progressSecond) {
        this.ui.progressSecond.style.strokeDashoffset = String(secondCirc * (1 - secondProgress));
      }
      if (this.ui.progressMs) {
        this.ui.progressMs.style.strokeDashoffset = String(msCirc * (1 - msProgress));
      }
      if (this.ui.sweepDot) {
        this.ui.sweepDot.style.opacity = ms > 0 ? "1" : "0";
        this.ui.sweepDot.style.transform = `rotate(${msProgress * 360}deg)`;
      }
    }

    updateMiniCompanionFromMain() {
      // Keep timer-presets-view stopwatch companion aligned with main stopwatch when open
      if (!this.ui.miniStopwatchTime || this.ui.miniStopwatchTime.closest("[hidden]") || this.ui.miniStopwatchTime.offsetParent === null) {
        return;
      }

      this.ui.miniStopwatchTime.textContent = `${formatMMSS(this.elapsedMs)}.${formatCentiseconds(this.elapsedMs)}`;
      if (this.ui.miniStopwatchStatusText && this.ui.miniStopwatchStatusDot) {
        const running = this.running;
        this.ui.miniStopwatchStatusText.textContent = running ? "RUNNING" : "READY";
        this.ui.miniStopwatchStatusDot.className = `mini-status-dot ${running ? "running" : "idle"}`;
      }

      if (this.ui.miniStopwatchLapBtn) {
        this.ui.miniStopwatchLapBtn.disabled = this.elapsedMs <= 0;
      }
      if (this.ui.miniStopwatchResetBtn) {
        this.ui.miniStopwatchResetBtn.disabled = this.elapsedMs <= 0;
      }
    }

    syncFromState() {
      // Buttons
      const u = this.ui;
      if (!u.startBtn || !u.lapBtn || !u.resetBtn) return;

      const canLap = this.elapsedMs > 0;
      u.lapBtn.disabled = !canLap;
      u.resetBtn.disabled = this.elapsedMs <= 0;

      if (u.clearDataBtn) u.clearDataBtn.disabled = this.laps.length === 0;

      // Start/Pause state
      const startText = u.startBtn.querySelector("#start-btn-text");
      const playIcon = u.startBtn.querySelector(".play-icon");
      const pauseIcon = u.startBtn.querySelector(".pause-icon");

      if (this.running) {
        u.startBtn.classList.add("state-pause");
        startText && (startText.textContent = "PAUSE");
        playIcon && playIcon.classList.add("hidden");
        pauseIcon && pauseIcon.classList.remove("hidden");
        this.ui.readoutStatus && (this.ui.readoutStatus.textContent = "RUNNING");
      } else {
        u.startBtn.classList.remove("state-pause");
        startText && (startText.textContent = "START");
        playIcon && playIcon.classList.remove("hidden");
        pauseIcon && pauseIcon.classList.add("hidden");
        this.ui.readoutStatus && (this.ui.readoutStatus.textContent = this.elapsedMs > 0 ? "PAUSED" : "READY");
      }

      // Alarm state attribute (shake) and header status
      if (this.overlays?.isOpen?.alarm) {
        document.documentElement.setAttribute("data-alarm-ringing", "true");
      } else {
        document.documentElement.setAttribute("data-alarm-ringing", "false");
      }

      // Display
      this.updateMainDisplay();
      this.renderLapTable();
      this.updateStats();
      this.updateSubLapInfo();

      // Mini widget availability
      this.updateMiniWidgetUI();
    }

    updateMiniWidgetUI() {
      const u = this.ui;
      if (!u.miniWidget) return;
      if (!u.miniWidgetLap) return;
      u.miniWidgetLap.disabled = this.miniElapsedMs <= 0;
    }

    onResetHoldDown(e) {
      if (this.getActiveMode() !== "stopwatch") return;
      if (this.elapsedMs <= 0) return;
      e.preventDefault?.();

      this.resetHoldActive = true;
      this.resetHoldStart = performance.now();

      const loop = () => {
        if (!this.resetHoldActive) return;
        const elapsed = performance.now() - this.resetHoldStart;
        const progress = clamp(elapsed / this.resetHoldDuration, 0, 1);
        if (this.ui.resetHoldBar) {
          this.ui.resetHoldBar.style.width = `${Math.round(progress * 100)}%`;
        }
        if (progress >= 1) {
          this.resetMain();
          this.resetHoldActive = false;
          if (this.ui.resetHoldBar) this.ui.resetHoldBar.style.width = `0%`;
          return;
        }
        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }

    onResetHoldUp() {
      this.resetHoldActive = false;
      if (this.ui.resetHoldBar) this.ui.resetHoldBar.style.width = `0%`;
    }

    // ===== Mini widget (independent mini stopwatch)
    toggleMini() {
      if (this.miniRunning) this.pauseMini();
      else this.startMini();
    }

    startMini() {
      if (this.miniRunning) return;
      this.miniRunning = true;
      this.miniStartEpoch = performance.now() - this.miniElapsedMs;
      this.miniRaf = requestAnimationFrame(() => this.tickMini());
      this.syncMiniUI();
    }

    pauseMini() {
      this.miniRunning = false;
      if (this.miniRaf) cancelAnimationFrame(this.miniRaf);
      this.miniRaf = null;
      this.syncMiniUI();
    }

    tickMini() {
      if (!this.miniRunning) return;
      this.miniElapsedMs = performance.now() - this.miniStartEpoch;

      if (this.ui.miniWidgetTime) {
        this.ui.miniWidgetTime.textContent = `${formatMMSS(this.miniElapsedMs)}.${formatCentiseconds(this.miniElapsedMs)}`;
      }

      this.ui.miniWidgetStart && this.ui.miniWidgetStart.setAttribute("data-state", this.miniRunning ? "running" : "paused");
      this.miniRaf = requestAnimationFrame(() => this.tickMini());
    }

    addMiniLap() {
      if (this.miniElapsedMs <= 0) return;
      const elapsed = this.miniElapsedMs;
      const totalPrev = this.miniLaps.reduce((a, b) => a + b, 0);
      const lapMs = elapsed - totalPrev;
      if (lapMs < 0) return;
      this.miniLaps.push(lapMs);
    }

    syncMiniUI() {
      const u = this.ui;
      if (!u.miniWidgetTime) return;

      u.miniWidgetLap && (u.miniWidgetLap.disabled = this.miniElapsedMs <= 0);

      // Start button icons swap
      const startBtn = u.miniWidgetStart;
      const playIcon = startBtn?.querySelector(".play-icon");
      const pauseIcon = startBtn?.querySelector(".pause-icon");
      if (this.miniRunning) {
        playIcon && playIcon.classList.add("hidden");
        pauseIcon && pauseIcon.classList.remove("hidden");
      } else {
        playIcon && playIcon.classList.remove("hidden");
        pauseIcon && pauseIcon.classList.add("hidden");
      }

      u.miniWidgetTime.textContent = `${formatMMSS(this.miniElapsedMs)}.${formatCentiseconds(this.miniElapsedMs)}`;
    }
  }

  class TimerController {
    constructor(ui, overlays) {
      this.ui = ui;
      this.overlays = overlays;

      this.mode = "stopwatch";
      this.targetMs = 0;
      this.remainingMs = 0;
      this.running = false;
      this.startEpoch = 0;
      this.raf = null;

      this.precisionDigits = 2;

      this.bind();
    }

    bind() {
      // Switch to timer view: we still reuse main dial for display; timer setup panel exists
      const presets = this.ui.presetsButtons;
      presets.forEach((btn) => {
        btn.addEventListener("click", () => {
          const minutes = Number(btn.dataset.preset || 0);
          this.setTimerMinutes(minutes);
          this.startTimer();
        });
      });

      this.ui.adjustButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const addSec = Number(btn.dataset.add || 0);
          this.adjustTimer(addSec);
        });
      });

      // Timer setup spinner buttons
      this.ui.setupAdjustBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const adj = btn.dataset.adjust;
          this.adjustSpinner(adj);
        });
      });

      // Mini stopwatch companion inside timer presets view can switch tab
      this.ui.miniStopwatchJumpBtn?.addEventListener("click", () => {
        this.ui.tabStopwatch?.click();
      });

      this.ui.clearDataBtn?.addEventListener("click", () => {
        // clear laps only when stopwatch tab active; stopwatch controller handles
      });
    }

    setTimerMinutes(totalMinutes) {
      this.targetMs = totalMinutes * 60 * 1000;
      this.remainingMs = this.targetMs;
      this.syncSetupUI();
    }

    adjustTimer(deltaSeconds) {
      const deltaMs = deltaSeconds * 1000;
      const next = clamp(this.targetMs + deltaMs, 0, 24 * 60 * 60 * 1000);
      this.targetMs = next;
      this.remainingMs = this.targetMs;
      this.stopTimer();
      this.syncSetupUI();
    }

    toggleTimer() {
      if (this.running) {
        this.stopTimer();
        if (this.ui.readoutStatus) this.ui.readoutStatus.textContent = "TIMER PAUSED";
        return;
      }
      this.startTimer();
    }

    resetTimer() {
      this.stopTimer();
      this.remainingMs = this.targetMs;
      this.renderRemaining();
      if (this.ui.readoutStatus) {
        this.ui.readoutStatus.textContent = this.targetMs > 0 ? "TIMER READY" : "READY";
      }
    }

    syncSetupUI() {
      if (!this.ui.setupMinEl || !this.ui.setupSecEl) return;
      const totalSeconds = Math.floor((this.targetMs || 0) / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      this.ui.setupMinEl.textContent = pad2(mins);
      this.ui.setupSecEl.textContent = pad2(secs);
      this.renderRemaining();
    }

    adjustSpinner(adjustKey) {
      if (!this.ui.setupMinEl || !this.ui.setupSecEl) return;

      let min = Number(this.ui.setupMinEl.textContent || "0");
      let sec = Number(this.ui.setupSecEl.textContent || "0");
      if (!Number.isFinite(min)) min = 0;
      if (!Number.isFinite(sec)) sec = 0;

      const bump = (m, s) => {
        min = clamp(m, 0, 99);
        sec = clamp(s, 0, 59);
        this.targetMs = (min * 60 + sec) * 1000;
        this.remainingMs = this.targetMs;
        this.stopTimer();
        this.syncSetupUI();
      };

      switch (adjustKey) {
        case "min-up":
          bump(min + 1, sec);
          break;
        case "min-down":
          bump(min - 1, sec);
          break;
        case "sec-up":
          bump(min, sec + 1);
          break;
        case "sec-down":
          bump(min, sec - 1);
          break;
      }
    }

    startTimer() {
      if (this.running) return;
      if (this.targetMs <= 0) return;

      this.running = true;
      if (this.ui.timerSetupPanel) this.ui.timerSetupPanel.hidden = true;
      if (this.ui.readoutNumericArea) this.ui.readoutNumericArea.hidden = false;
      if (this.ui.subLapDisplay) this.ui.subLapDisplay.hidden = false;
      this.startEpoch = performance.now();
      const startedRemaining = this.remainingMs;
      this.startEpoch = performance.now();

      const tick = () => {
        if (!this.running) return;
        const elapsed = performance.now() - this.startEpoch;
        this.remainingMs = Math.max(0, startedRemaining - elapsed);

        this.renderRemaining();

        if (this.remainingMs <= 0) {
          this.running = false;
          this.raf = null;
          this.onFinish();
          return;
        }

        this.raf = requestAnimationFrame(tick);
      };

      this.raf = requestAnimationFrame(tick);
      // update status
      this.ui.readoutStatus && (this.ui.readoutStatus.textContent = "TIMER");
    }

    stopTimer() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
    }

    renderRemaining() {
      if (!this.ui.mainTimeDisplay || !this.ui.mainMsDisplay) return;
      const mmss = formatMMSS(this.remainingMs);
      const cs = formatCentiseconds(this.remainingMs);
      this.ui.mainTimeDisplay.textContent = mmss;
      this.ui.mainMsDisplay.textContent = `.${cs}`;
      this.updateRings();

      // Progress fill
      if (this.ui.timerProgressFill) {
        const total = this.targetMs || 1;
        const done = (total - this.remainingMs) / total;
        this.ui.timerProgressFill.style.width = `${Math.round(done * 100)}%`;
      }

      if (this.ui.subLapDisplay) this.ui.subLapDisplay.textContent = `REMAINING — ${mmss}.${cs}`;
    }

    updateRings() {
      const minuteCirc = 2 * Math.PI * 86;
      const secondCirc = 2 * Math.PI * 93;
      const msCirc = 2 * Math.PI * 100;
      const total = this.targetMs || 1;
      const elapsed = clamp(total - this.remainingMs, 0, total);
      const progress = elapsed / total;
      const secondProgress = (elapsed % 60000) / 60000;
      const msProgress = (elapsed % 1000) / 1000;

      if (this.ui.progressMinute) {
        this.ui.progressMinute.style.strokeDashoffset = String(minuteCirc * (1 - progress));
      }
      if (this.ui.progressSecond) {
        this.ui.progressSecond.style.strokeDashoffset = String(secondCirc * (1 - secondProgress));
      }
      if (this.ui.progressMs) {
        this.ui.progressMs.style.strokeDashoffset = String(msCirc * (1 - msProgress));
      }
      if (this.ui.sweepDot) {
        this.ui.sweepDot.style.opacity = total > 1 && elapsed > 0 ? "1" : "0";
        this.ui.sweepDot.style.transform = `rotate(${progress * 360}deg)`;
      }
    }

    onFinish() {
      // Alarm overlay
      this.overlays.open("alarm");
      document.documentElement.setAttribute("data-alarm-ringing", "true");
      // stop any lap capture logic: UI reset handled by overlays/stopwatch
    }
  }

  class PomodoroController {
    constructor(ui, overlays) {
      this.ui = ui;
      this.overlays = overlays;

      this.phase = "work"; // work|short|long
      this.running = false;
      this.cycleIndex = 0;
      this.sessionsToday = 0;
      this.focusMs = 0;

      this.raf = null;
      this.remainingMs = 0;
      this.durationMs = 0;
      this.startEpoch = 0;

      this.bind();
      this.resetUI();
    }

    bind() {
      // phase selection buttons
      this.ui.pomPhaseButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.pom;
          this.setPhase(target);
        });
      });

      // Update display via timer tick
    }

    setPhase(target) {
      this.phase = target;
      this.ui.pomPhaseButtons.forEach((b) => {
        const active = b.dataset.pom === target;
        if (active) b.classList.add("active");
        else b.classList.remove("active");
      });

      if (this.ui.pomPhaseLabel) {
        const label = target === "work" ? "WORK TIME" : target === "short" ? "SHORT BREAK" : "LONG BREAK";
        this.ui.pomPhaseLabel.textContent = label;
      }

      // When phase changes, reset timer duration for that phase (doesn't auto-start)
      this.resetPhaseTimer(false);
      this.updatePomCyclesUI();
    }

    getPhaseDurationMs(phase) {
      const workMin = Number(this.ui.pomWorkInput?.value || 25);
      const shortMin = Number(this.ui.pomShortInput?.value || 5);
      const longMin = Number(this.ui.pomLongInput?.value || 15);
      if (phase === "work") return workMin * 60 * 1000;
      if (phase === "short") return shortMin * 60 * 1000;
      return longMin * 60 * 1000;
    }

    resetPhaseTimer(keepRunning) {
      this.durationMs = this.getPhaseDurationMs(this.phase);
      this.remainingMs = this.durationMs;
      this.running = !!keepRunning;
      this.render();
    }

    start() {
      if (this.running) return;
      if (this.remainingMs <= 0) {
        this.remainingMs = this.durationMs;
      }
      this.running = true;
      this.startEpoch = performance.now();
      const startedRemaining = this.remainingMs;

      const tick = () => {
        if (!this.running) return;
        const elapsed = performance.now() - this.startEpoch;
        this.remainingMs = Math.max(0, startedRemaining - elapsed);
        this.render();

        if (this.remainingMs <= 0) {
          this.running = false;
          this.onPhaseFinish();
          return;
        }

        this.raf = requestAnimationFrame(tick);
      };

      this.raf = requestAnimationFrame(tick);
    }

    pause() {
      this.running = false;
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
      this.render();
    }

    reset() {
      this.pause();
      this.phase = "work";
      this.cycleIndex = 0;
      this.sessionsToday = 0;
      this.focusMs = 0;
      this.setPhase("work");
      this.render();
    }

    onPhaseFinish() {
      // Update focus stats for work
      if (this.phase === "work") {
        this.sessionsToday += 1;
        this.focusMs += this.durationMs;
      }

      // Next phase logic
      if (this.phase === "work") {
        this.cycleIndex = this.cycleIndex + 1;
        // cycle: after 4 work sessions => long break, else short break
        const next = this.cycleIndex % 4 === 0 ? "long" : "short";
        this.setPhase(next);
      } else {
        // break -> next work
        this.setPhase("work");
      }

      this.updatePomUIStats();
      this.resetPhaseTimer(true);
      // Auto-start next phase for better UX
      this.start();
    }

    resetUI() {
      this.ui.pomPhaseLabel && (this.ui.pomPhaseLabel.textContent = "WORK TIME");
      this.updatePomUIStats();
      this.setPhase("work");
    }

    updatePomUIStats() {
      if (this.ui.pomSessionsCount) this.ui.pomSessionsCount.textContent = String(this.sessionsToday);
      if (this.ui.pomFocusTime) this.ui.pomFocusTime.textContent = `${Math.round(this.focusMs / 60000)}m`;
      if (this.ui.pomCycleCount) this.ui.pomCycleCount.textContent = `${clamp(this.cycleIndex + 1, 1, 4)} / 4`;
    }

    updatePomCyclesUI() {
      // UI uses dots in pom-cycles-display; we can activate based on cycleIndex
      const container = this.ui.pomCyclesDisplay;
      if (!container) return;
      const dots = Array.from(container.querySelectorAll(".pom-dot"));
      dots.forEach((d, idx) => {
        d.classList.toggle("active", idx === clamp(this.cycleIndex % 4, 0, 3));
      });
    }

    render() {
      if (!this.ui.mainTimeDisplay || !this.ui.mainMsDisplay) return;
      if (!this.ui.readoutStatus) return;

      const mmss = formatMMSS(this.remainingMs);
      const cs = formatCentiseconds(this.remainingMs);

      this.ui.mainTimeDisplay.textContent = mmss;
      this.ui.mainMsDisplay.textContent = `.${cs}`;
      this.ui.readoutStatus.textContent = this.phase === "work" ? "WORK" : "BREAK";
      this.updateRings();

      this.updatePomCyclesUI();
    }

    updateRings() {
      const minuteCirc = 2 * Math.PI * 86;
      const secondCirc = 2 * Math.PI * 93;
      const msCirc = 2 * Math.PI * 100;
      const total = this.durationMs || 1;
      const elapsed = clamp(total - this.remainingMs, 0, total);
      const progress = elapsed / total;
      const secondProgress = (elapsed % 60000) / 60000;
      const msProgress = (elapsed % 1000) / 1000;

      if (this.ui.progressMinute) {
        this.ui.progressMinute.style.strokeDashoffset = String(minuteCirc * (1 - progress));
      }
      if (this.ui.progressSecond) {
        this.ui.progressSecond.style.strokeDashoffset = String(secondCirc * (1 - secondProgress));
      }
      if (this.ui.progressMs) {
        this.ui.progressMs.style.strokeDashoffset = String(msCirc * (1 - msProgress));
      }
      if (this.ui.sweepDot) {
        this.ui.sweepDot.style.opacity = elapsed > 0 ? "1" : "0";
        this.ui.sweepDot.style.transform = `rotate(${progress * 360}deg)`;
      }
    }

    updatePomCyclesUI() {
      const container = this.ui.pomCyclesDisplay;
      if (!container) return;
      const dots = Array.from(container.querySelectorAll(".pom-dot"));
      dots.forEach((d, idx) => {
        d.classList.toggle("active", idx === clamp(this.cycleIndex % 4, 0, 3));
      });
    }
  }

  class App {
    constructor() {
      this.ui = new UIBinder();
      this.storage = new StorageController();

      // Overlay needs UI binder already
      this.overlays = new OverlayController(this.ui);

      // Core controllers
      this.stopwatch = new StopwatchController(this.ui, this.overlays);
      this.timer = new TimerController(this.ui, this.overlays);
      this.pomodoro = new PomodoroController(this.ui, this.overlays);

      this.activeMode = "stopwatch";
      this.stopwatch.getActiveMode = () => this.activeMode;
      this.timer.getActiveMode = () => this.activeMode;
      this.pomodoro.getActiveMode = () => this.activeMode;

      this.bind();
      this.setupLapSearch();
      this.setupClearAndExports();
      this.setupSettings();
      this.setupHistory();
      this.setupTheme();
      this.setupTabs();
      this.setupGlobalShortcuts();
      this.activateTab(this.activeMode);

      // Keep the first screen clear; the header button or M shortcut opens the mini widget.
      this.showMiniWidget(false);

      // Initialize UI states
      this.ui.readoutStatus && (this.ui.readoutStatus.textContent = "READY");
      this.setHeaderStatus("READY", "idle");
      this.stopwatch.syncFromState();
    }

    bind() {
      // Focus mode start button uses main stopwatch logic? We'll run a separate timer based on main elapsed.
      this.ui.focusStartBtn?.addEventListener("click", () => {
        // Toggle main stopwatch while in focus mode
        this.stopwatch.toggleMain();
        this.ui.focusStatusText && (this.ui.focusStatusText.textContent = this.stopwatch.running ? "RUNNING" : "PAUSED");
      });

      // Main reset should also close focus mode
      this.ui.focusExitBtn?.addEventListener("click", () => {
        this.overlays.close("focus");
      });

      // Clear laps
      this.ui.clearDataBtn?.addEventListener("click", () => {
        if (this.activeMode === "stopwatch") this.stopwatch.resetMain();
        else if (this.activeMode === "timer") this.timer.resetTimer();
        else if (this.activeMode === "pomodoro") this.pomodoro.reset();
      });

      // Main controls adapt to active mode
      this.ui.startBtn?.addEventListener("click", () => {
        if (this.activeMode === "stopwatch") this.stopwatch.toggleMain();
        else if (this.activeMode === "timer") this.timer.toggleTimer();
        else if (this.activeMode === "pomodoro") {
          if (this.pomodoro.running) this.pomodoro.pause();
          else this.pomodoro.start();
        }
        this.updateModeUI();
      });

      this.ui.lapBtn?.addEventListener("click", () => {
        if (this.activeMode === "stopwatch") this.stopwatch.addMainLap();
      });

      this.ui.resetBtn?.addEventListener("click", () => {
        if (this.activeMode === "timer") this.timer.resetTimer();
        else if (this.activeMode === "pomodoro") this.pomodoro.reset();
        this.updateModeUI();
      });

      // Mini widget open/close
      this.ui.miniWidget && (this.ui.miniWidget.classList.remove("show"));
      this.ui.miniWidgetBtn = $(`mini-widget-btn`);
      this.ui.miniWidgetBtn?.addEventListener("click", () => {
        this.showMiniWidget(!this.ui.miniWidget?.classList.contains("show"));
      });

      // Focus mode hot key uses overlays
      this.ui.focusModeBtn = $(`focus-mode-btn`);
      this.ui.focusModeBtn?.addEventListener("click", () => this.openFocus());

      // History fill on open
      this.ui.historyBtn?.addEventListener("click", () => this.renderHistory());

      // Mini widget should also be accessible via keyboard M
    }

    showMiniWidget(show) {
      if (!this.ui.miniWidget) return;
      if (show) {
        this.ui.miniWidget.classList.add("show");
        this.ui.miniWidget.setAttribute("aria-hidden", "false");
      } else {
        this.ui.miniWidget.classList.remove("show");
        this.ui.miniWidget.setAttribute("aria-hidden", "true");
      }
    }

    setHeaderStatus(text, dotClass) {
      if (this.ui.headerStatusText) this.ui.headerStatusText.textContent = text;
      if (this.ui.headerStatusDot) {
        this.ui.headerStatusDot.className = `status-dot ${dotClass}`;
      }
    }

    setTimerModeUI() {
      // Show timer setup panel
      if (this.ui.timerSetupPanel) this.ui.timerSetupPanel.hidden = false;
      if (this.ui.pomodoroSetupPanel) this.ui.pomodoroSetupPanel.hidden = true;

      // Enable search disabled while timer tab
      if (this.ui.lapSearchInput) this.ui.lapSearchInput.disabled = true;
    }

    setupTabs() {
      const tabs = [
        { btn: this.ui.tabStopwatch, key: "stopwatch", panelEl: this.ui.stopwatchTelemetryViewEl },
        { btn: this.ui.tabTimer, key: "timer", panelEl: this.ui.timerPresetsViewEl },
        { btn: this.ui.tabPomodoro, key: "pomodoro", panelEl: this.ui.pomViewEl },
      ];

      tabs.forEach(({ btn, key }) => {
        if (!btn) return;
        btn.addEventListener("click", () => this.activateTab(key));
      });

      // slider
      this.updateTabSlider("stopwatch");
    }

    activateTab(key) {
      // Toggle active button
      const all = [this.ui.tabStopwatch, this.ui.tabTimer, this.ui.tabPomodoro].filter(Boolean);
      all.forEach((b) => b.classList.remove("active"));

      if (key === "stopwatch") this.ui.tabStopwatch?.classList.add("active");
      if (key === "timer") this.ui.tabTimer?.classList.add("active");
      if (key === "pomodoro") this.ui.tabPomodoro?.classList.add("active");

      // Show/hide panels
      if (this.ui.stopwatchTelemetryViewEl) this.ui.stopwatchTelemetryViewEl.hidden = key !== "stopwatch";
      if (this.ui.timerPresetsViewEl) this.ui.timerPresetsViewEl.hidden = key !== "timer";
      if (this.ui.pomViewEl) this.ui.pomViewEl.hidden = key !== "pomodoro";

      this.ui.timerSetupPanel && (this.ui.timerSetupPanel.hidden = key !== "timer");
      this.ui.pomodoroSetupPanel && (this.ui.pomodoroSetupPanel.hidden = key !== "pomodoro");

      this.activeMode = key;
      this.updateTabSlider(key);

      // Pause other modes for sanity
      if (key !== "timer") this.timer.stopTimer?.();
      if (key !== "stopwatch") this.stopwatch.pauseMain();
      if (key !== "pomodoro") this.pomodoro.pause?.();

      // Update header label
      this.setHeaderStatus(key.toUpperCase(), key === "stopwatch" ? "idle" : key === "timer" ? "paused" : "running");

      this.updateModeUI();
    }

    updateModeUI() {
      const mode = this.activeMode;
      const u = this.ui;

      if (u.timerSetupPanel) u.timerSetupPanel.hidden = mode !== "timer";
      if (u.pomodoroSetupPanel) u.pomodoroSetupPanel.hidden = mode !== "pomodoro";
      if (u.stopwatchTelemetryViewEl) u.stopwatchTelemetryViewEl.hidden = mode !== "stopwatch";
      if (u.timerPresetsViewEl) u.timerPresetsViewEl.hidden = mode !== "timer";
      if (u.pomViewEl) u.pomViewEl.hidden = mode !== "pomodoro";

      const timerIsAtSetupValue = this.timer.remainingMs === this.timer.targetMs;
      const showTimerSetup = mode === "timer" && !this.timer.running && timerIsAtSetupValue;
      if (u.timerSetupPanel) u.timerSetupPanel.hidden = !showTimerSetup;
      if (u.readoutNumericArea) u.readoutNumericArea.hidden = mode === "timer" && showTimerSetup;
      if (u.subLapDisplay) u.subLapDisplay.hidden = mode === "timer" && showTimerSetup;

      if (u.lapBtn) {
        u.lapBtn.disabled = mode !== "stopwatch" || this.stopwatch.elapsedMs <= 0;
        const lapText = u.lapBtn.querySelector("#lap-btn-text");
        if (lapText) lapText.textContent = mode === "stopwatch" ? "LAP" : "LAP";
      }

      if (u.resetBtn) {
        if (mode === "stopwatch") u.resetBtn.disabled = this.stopwatch.elapsedMs <= 0;
        else if (mode === "timer") u.resetBtn.disabled = this.timer.targetMs <= 0;
        else if (mode === "pomodoro") u.resetBtn.disabled = this.pomodoro.remainingMs <= 0;
        const resetText = u.resetBtn.querySelector("#reset-btn-text");
        if (resetText) resetText.textContent = mode === "stopwatch" ? "HOLD RESET" : "RESET";
      }

      if (u.startBtn) {
        const startText = u.startBtn.querySelector("#start-btn-text");
        const playIcon = u.startBtn.querySelector(".play-icon");
        const pauseIcon = u.startBtn.querySelector(".pause-icon");
        const running = mode === "stopwatch" ? this.stopwatch.running : mode === "timer" ? this.timer.running : this.pomodoro.running;
        if (running) {
          startText && (startText.textContent = "PAUSE");
          playIcon && playIcon.classList.add("hidden");
          pauseIcon && pauseIcon.classList.remove("hidden");
        } else {
          startText && (startText.textContent = "START");
          playIcon && playIcon.classList.remove("hidden");
          pauseIcon && pauseIcon.classList.add("hidden");
        }
      }

      if (u.readoutStatus) {
        if (mode === "stopwatch") {
          u.readoutStatus.textContent = this.stopwatch.running ? "RUNNING" : this.stopwatch.elapsedMs > 0 ? "PAUSED" : "READY";
        } else if (mode === "timer") {
          u.readoutStatus.textContent = this.timer.running ? "TIMER" : this.timer.targetMs > 0 ? "TIMER READY" : "SET TIMER";
        } else if (mode === "pomodoro") {
          u.readoutStatus.textContent = this.pomodoro.phase === "work" ? "WORK" : "BREAK";
        }
      }

      if (mode === "timer") {
        this.timer.syncSetupUI();
      }
      if (mode === "pomodoro") {
        this.pomodoro.render();
      }
      if (mode === "stopwatch") {
        this.stopwatch.updateMainDisplay();
      }
    }

    updateTabSlider(key) {
      if (!this.ui.tabSlider) return;
      const pos = key === "stopwatch" ? 1 : key === "timer" ? 2 : 3;
      this.ui.tabSlider.className = `tab-slider pos-${pos}`;
    }

    setupLapSearch() {
      const input = this.ui.lapSearchInput;
      if (!input) return;
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          // re-render to reset visibility
          this.stopwatch.renderLapTable();
          return;
        }
        this.stopwatch.applyLapSearch(q);
      });
    }

    setupClearAndExports() {
      // CSV/JSON exports for laps
      const exportCsv = this.ui.exportCsvBtn;
      const exportJson = this.ui.exportJsonBtn;
      const exportPng = this.ui.exportPngBtn;

      const buildSession = () => {
        return {
          createdAt: new Date().toISOString(),
          mode: "stopwatch",
          laps: this.stopwatch.laps.slice(),
          stats: {
            totalLaps: this.stopwatch.laps.length,
            fastest: this.stopwatch.laps.length ? Math.min(...this.stopwatch.laps) : null,
            slowest: this.stopwatch.laps.length ? Math.max(...this.stopwatch.laps) : null,
            average: this.stopwatch.laps.length ? this.stopwatch.laps.reduce((a, b) => a + b, 0) / this.stopwatch.laps.length : null,
          },
        };
      };

      const download = (filename, content, mime) => {
        const blob = new Blob([content], { type: mime || "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };

      exportCsv?.addEventListener("click", () => {
        if (!this.stopwatch.laps.length) return;
        const lines = ["lapNumber,lapMs,lapClock"];
        this.stopwatch.laps.forEach((ms, i) => {
          lines.push(`${i + 1},${ms},${formatMMSS(ms)}.${formatCentiseconds(ms)}`);
        });
        download("nova_stopwatch_laps.csv", lines.join("\n"), "text/csv");
      });

      exportJson?.addEventListener("click", () => {
        if (!this.stopwatch.laps.length) return;
        const session = buildSession();
        download("nova_stopwatch_session.json", JSON.stringify(session, null, 2), "application/json");
      });

      exportPng?.addEventListener("click", () => {
        if (!this.stopwatch.laps.length) return;

        const canvas = document.createElement("canvas");
        canvas.width = 1200;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#10131f");
        gradient.addColorStop(0.55, "#151b2e");
        gradient.addColorStop(1, "#090b12");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255, 214, 102, 0.35)";
        ctx.lineWidth = 3;
        ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

        ctx.fillStyle = "#f7d774";
        ctx.font = "700 54px Inter, Arial, sans-serif";
        ctx.fillText("NOVA Stopwatch", 80, 116);

        ctx.fillStyle = "#e9eefc";
        ctx.font = "600 34px Inter, Arial, sans-serif";
        ctx.fillText(`Total Time: ${formatMMSS(this.stopwatch.elapsedMs)}.${formatCentiseconds(this.stopwatch.elapsedMs)}`, 80, 180);
        ctx.fillText(`Total Laps: ${this.stopwatch.laps.length}`, 80, 228);

        const fastest = Math.min(...this.stopwatch.laps);
        const slowest = Math.max(...this.stopwatch.laps);
        const average = this.stopwatch.laps.reduce((a, b) => a + b, 0) / this.stopwatch.laps.length;
        ctx.font = "500 26px Inter, Arial, sans-serif";
        ctx.fillStyle = "#aeb8d4";
        ctx.fillText(`Fastest: ${formatMMSS(fastest)}.${formatCentiseconds(fastest)}`, 80, 288);
        ctx.fillText(`Slowest: ${formatMMSS(slowest)}.${formatCentiseconds(slowest)}`, 80, 326);
        ctx.fillText(`Average: ${formatMMSS(average)}.${formatCentiseconds(average)}`, 80, 364);

        ctx.fillStyle = "#ffffff";
        ctx.font = "600 28px Inter, Arial, sans-serif";
        ctx.fillText("Lap Summary", 80, 438);

        ctx.font = "500 24px Inter, Arial, sans-serif";
        const visibleLaps = this.stopwatch.laps.slice(0, 8);
        visibleLaps.forEach((ms, i) => {
          const y = 492 + i * 34;
          ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)";
          ctx.fillRect(80, y - 25, 520, 30);
          ctx.fillStyle = "#e9eefc";
          ctx.fillText(`#${i + 1}`, 104, y);
          ctx.fillStyle = "#f7d774";
          ctx.fillText(`${formatMMSS(ms)}.${formatCentiseconds(ms)}`, 210, y);
        });

        if (this.stopwatch.laps.length > visibleLaps.length) {
          ctx.fillStyle = "#aeb8d4";
          ctx.fillText(`+ ${this.stopwatch.laps.length - visibleLaps.length} more laps`, 104, 492 + visibleLaps.length * 34);
        }

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "nova_stopwatch_summary.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }, "image/png");
      });

      const syncExportButtons = () => {
        const enabled = this.stopwatch.laps.length > 0;
        for (const b of [this.ui.exportCsvBtn, this.ui.exportJsonBtn, this.ui.exportPngBtn]) {
          if (b) b.disabled = !enabled;
        }
      };

      // Update exports when laps change
      const originalRender = this.stopwatch.renderLapTable.bind(this.stopwatch);
      this.stopwatch.renderLapTable = () => {
        originalRender();
        syncExportButtons();
      };
      syncExportButtons();

      // Clear data button enabled state is updated in stopwatch syncFromState
    }

    setupSettings() {
      // Precision segmented control
      this.ui.precisionBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.ui.precisionBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.stopwatch.precisionDigits = Number(btn.dataset.precision || 2);
        });
      });

      // Theme chips
      this.ui.themeChips.forEach((chip) => {
        chip.addEventListener("click", () => {
          this.ui.themeChips.forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          const val = chip.dataset.themeVal;
          document.documentElement.setAttribute("data-theme", val);
          localStorage.setItem("nova_theme", val);
        });
      });
    }

    setupTheme() {
      const saved = localStorage.getItem("nova_theme");
      const validThemes = new Set(["cyber-gold", "neon-blue", "matrix-green", "crimson-red", "vaporwave", "midnight-eclipse"]);
      const theme = saved && validThemes.has(saved) ? saved : "cyber-gold";
      document.documentElement.setAttribute("data-theme", theme);

      // update chip active
      if (this.ui.themeChips?.length) {
        this.ui.themeChips.forEach((chip) => {
          chip.classList.toggle("active", chip.dataset.themeVal === theme);
        });
      }
    }

    setupHistory() {
      this.ui.saveSessionBtn?.addEventListener("click", () => {
        const laps = this.stopwatch.laps.slice();
        if (!laps.length) return;

        const stats = {
          totalLaps: laps.length,
          fastestMs: Math.min(...laps),
          slowestMs: Math.max(...laps),
          averageMs: laps.reduce((a, b) => a + b, 0) / laps.length,
        };

        const session = {
          id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
          createdAt: new Date().toISOString(),
          laps,
          stats,
        };

        const sessions = this.storage.addSession(session);
        this.renderHistory(sessions);
        this.overlays.open("history");
      });

      this.ui.clearHistoryBtn?.addEventListener("click", () => {
        this.storage.clearAll();
        this.renderHistory([]);
      });
    }

    renderHistory(forceSessions) {
      if (!this.ui.historyBody) return;
      const sessions = forceSessions || this.storage.loadSessions();

      this.ui.historyBody.innerHTML = "";

      if (!sessions.length) {
        this.ui.historyBody.innerHTML = `
          <div class="history-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="history-empty-icon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <p>No saved sessions yet.</p>
            <span>Use "Save Session" after recording laps.</span>
          </div>
        `;
        return;
      }

      for (const s of sessions) {
        const item = document.createElement("div");
        item.className = "session-item";

        const created = new Date(s.createdAt);
        const dateStr = created.toLocaleString();

        item.innerHTML = `
          <div>
            <div class="session-date">${dateStr}</div>
            <div class="session-stats">${s.stats.totalLaps} laps • Avg ${formatMMSS(s.stats.averageMs)}.${formatCentiseconds(s.stats.averageMs)}</div>
          </div>
          <button class="session-delete" title="Delete session" aria-label="Delete session">🗑</button>
        `;

        const delBtn = item.querySelector(".session-delete");
        delBtn?.addEventListener("click", () => {
          const all = this.storage.loadSessions();
          const filtered = all.filter((x) => x.id !== s.id);
          this.storage.saveSessions(filtered);
          this.renderHistory(filtered);
        });

        this.ui.historyBody.appendChild(item);
      }
    }

    openFocus() {
      this.overlays.open("focus");
      this.ui.focusStatusText && (this.ui.focusStatusText.textContent = this.stopwatch.running ? "RUNNING" : "READY");
      this.stopwatch.updateMainDisplay();
    }

    setupGlobalShortcuts() {
      document.addEventListener("keydown", (e) => {
        // ignore typing in inputs
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
        const typing = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
        if (typing) return;

        if (e.code === "Space") {
          e.preventDefault();
          if (this.activeMode === "stopwatch") this.stopwatch.toggleMain();
          else if (this.activeMode === "timer") this.timer.toggleTimer();
          else if (this.activeMode === "pomodoro") {
            if (this.pomodoro.running) this.pomodoro.pause();
            else this.pomodoro.start();
          }
          this.updateModeUI();
        }

        const key = (e.key || "").toLowerCase();

        if (key === "l") {
          e.preventDefault();
          if (this.activeMode === "stopwatch") this.stopwatch.addMainLap();
        }

        if (key === "f") {
          e.preventDefault();
          this.openFocus();
        }

        if (key === "m") {
          e.preventDefault();
          this.showMiniWidget(!this.ui.miniWidget?.classList.contains("show"));
        }

        if (key === "t") {
          e.preventDefault();
          // Cycle themes
          const themes = ["cyber-gold", "neon-blue", "matrix-green", "crimson-red", "vaporwave", "midnight-eclipse"];
          const cur = document.documentElement.getAttribute("data-theme") || "cyber-gold";
          const idx = themes.indexOf(cur);
          const next = themes[(idx + 1 + themes.length) % themes.length];
          document.documentElement.setAttribute("data-theme", next);
          localStorage.setItem("nova_theme", next);
          // update chips
          if (this.ui.themeChips) {
            this.ui.themeChips.forEach((c) => c.classList.toggle("active", c.dataset.themeVal === next));
          }
        }

        if (key === "?" || (e.shiftKey && e.key === "/")) {
          e.preventDefault();
          this.overlays.open("shortcuts");
        }

        if (key === "r") {
          // Hold-to-reset: best-effort; start hold immediately
          e.preventDefault();
          if (this.activeMode === "stopwatch") this.stopwatch.onResetHoldDown(e);
          else if (this.activeMode === "timer") this.timer.resetTimer();
          else if (this.activeMode === "pomodoro") this.pomodoro.reset();
        }
      });

      document.addEventListener("keyup", (e) => {
        const key = (e.key || "").toLowerCase();
        if (key === "r" && this.activeMode === "stopwatch") {
          this.stopwatch.onResetHoldUp();
        }
      });

      // Reset hold bar clearing on blur
      window.addEventListener("blur", () => this.stopwatch.onResetHoldUp());
    }
  }

  // boot
  window.addEventListener("DOMContentLoaded", () => {
    window.novaApp = new App();
  });
})();
