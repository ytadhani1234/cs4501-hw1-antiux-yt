"use strict";
(() => {

const missionState = {
  started: false,
  startTime: null,
  timerInterval: null,
  finalTime: null,
  powerComplete: false,
  navigationComplete: false,
  communicationsComplete: false,
  engineComplete: false,
  commStage: "code",
  commCode: "K21-4187-X",
  selectedDestination: null,
  lastSubsystemScreen: "power-screen",
  enginePrimed: false,
  engineArmed: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
let previousFocus = null;

function showScreen(screenId) {
  if (["power-screen", "navigation-screen", "communications-screen", "engine-screen"].includes(screenId)) {
    missionState.lastSubsystemScreen = screenId;
  }
  $$(".screen").forEach((screen) => { screen.hidden = screen.id !== screenId; });
  if (screenId === "intro-screen") {
    $("#begin-repair-label").textContent = missionState.started ? "RESUME REPAIR" : "BEGIN REPAIR";
    $("#intro-timer-note").textContent = missionState.started ? "Mission timer continues while you are here." : "Timer begins when repair starts.";
  }
  window.scrollTo({ top: 0, behavior: "instant" });
}

function formatElapsedTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function updateTimer() {
  if (!missionState.started || missionState.startTime === null) return;
  $("#timer-display").textContent = formatElapsedTime(Date.now() - missionState.startTime);
}

function startTimer() {
  if (missionState.started) return;
  missionState.started = true;
  missionState.startTime = Date.now();
  updateTimer();
  missionState.timerInterval = window.setInterval(updateTimer, 250);
}

function stopTimer() {
  if (missionState.timerInterval !== null) window.clearInterval(missionState.timerInterval);
  missionState.timerInterval = null;
  missionState.finalTime = formatElapsedTime(Date.now() - missionState.startTime);
  $("#timer-display").textContent = missionState.finalTime;
}

function setStatus(id, active, activeText, inactiveText) {
  const element = $(id);
  element.classList.toggle("active", active);
  element.querySelector("strong").textContent = active ? activeText : inactiveText;
}

function setMessage(id, text, positive = false) {
  const element = $(id);
  element.textContent = text;
  element.classList.toggle("positive", positive);
}

function openModal(title, body) {
  previousFocus = document.activeElement;
  $("#modal-title").textContent = title;
  $("#modal-body").textContent = body;
  $("#modal").hidden = false;
  $("#modal-close").focus();
}

function closeModal() {
  $("#modal").hidden = true;
  if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
}

function completePower() {
  if (Number($("#power-allocation").value) === 35 && $("#power-allocation").value.trim() !== "") {
    missionState.powerComplete = true;
    setStatus("#power-status", true, "REACTOR ACTIVE", "REACTOR INACTIVE");
    $("#shutdown-core").hidden = false;
    setMessage("#power-message", "ENERGY CONFIGURATION RESOLVED.", true);
  } else {
    setMessage("#power-message", "ALLOCATION IMBALANCE. ENERGY RESOLUTION REJECTED.");
  }
}

function updateNavigation(changedIndex = 0) {
  const ids = ["galaxy", "region", "stellar", "classification"];
  const wraps = ["region-wrap", "stellar-wrap", "classification-wrap", "destination-wrap"];
  const correct = ["Milky Way", "Orion Spur", "Sol", "Terrestrial Worlds"];
  for (let i = changedIndex + 1; i < ids.length; i += 1) $(`#${ids[i]}`).value = "";
  missionState.selectedDestination = null;
  $$("#destination-options button").forEach((button) => button.classList.remove("selected"));
  missionState.navigationComplete = false;
  setStatus("#navigation-status", false, "EARTH ROUTE LOCKED", "VECTOR NOT LOCKED");
  setMessage("#navigation-message", "");
  wraps.forEach((wrap, index) => {
    $("#" + wrap).hidden = correct.slice(0, index + 1).some((value, i) => $(`#${ids[i]}`).value !== value);
  });
}

function applyNavigationVector() {
  const correctPath = $("#galaxy").value === "Milky Way" && $("#region").value === "Orion Spur" && $("#stellar").value === "Sol" && $("#classification").value === "Terrestrial Worlds" && missionState.selectedDestination === "Earth";
  if (correctPath) {
    missionState.navigationComplete = true;
    setStatus("#navigation-status", true, "EARTH ROUTE LOCKED", "VECTOR NOT LOCKED");
    setMessage("#navigation-message", "TRANSIT VECTOR ACCEPTED.", true);
  } else {
    setMessage("#navigation-message", "VECTOR ACCEPTED BY REGISTRY, BUT MISSION DESTINATION REQUIREMENT NOT SATISFIED.");
  }
}

function showCommunicationCode() {
  missionState.commStage = "code";
  missionState.communicationsComplete = false;
  $("#comm-code-stage").hidden = false;
  $("#comm-transmitter-stage").hidden = true;
  $("#relay-identifier").value = "";
  setStatus("#communications-status", false, "EARTH LINK ACTIVE", "EARTH LINK INACTIVE");
  setMessage("#communications-message", "");
}

function openTransmitter() {
  missionState.commStage = "transmitter";
  $("#comm-code-stage").hidden = true;
  $("#comm-transmitter-stage").hidden = false;
  setMessage("#communications-message", "");
  $("#relay-identifier").focus();
}

function validateCommunicationCode() {
  if ($("#relay-identifier").value.trim().toUpperCase() === missionState.commCode) {
    missionState.communicationsComplete = true;
    setStatus("#communications-status", true, "EARTH LINK ACTIVE", "EARTH LINK INACTIVE");
    setMessage("#communications-message", "EARTH TRANSMISSION ESTABLISHED.", true);
  } else {
    setMessage("#communications-message", "RELAY AUTHENTICATION FAILURE. TRANSMISSION KEY REJECTED.");
  }
}

function primeEngine() {
  missionState.enginePrimed = true;
  missionState.engineArmed = false;
  setMessage("#engine-message", "PRELIMINARY PRIMING ACKNOWLEDGED.", true);
}

function armEngine() {
  if (!missionState.enginePrimed) {
    setMessage("#engine-message", "ARMATURE CONDITION INVALID. PRECURSOR STATE UNRESOLVED.");
    return;
  }
  missionState.engineArmed = true;
  setMessage("#engine-message", "ARMATURE RESOLUTION ACKNOWLEDGED.", true);
}

function executeEngine() {
  if ($("#engine-mode").value === "SAFE-BURN" && $("#thermal-bypass").value === "OFF" && missionState.enginePrimed && missionState.engineArmed) {
    missionState.engineComplete = true;
    setStatus("#engine-status", true, "PROPULSION ACTIVE", "PROPULSION INACTIVE");
    $("#engine-shutdown").hidden = false;
    setMessage("#engine-message", "HELICOCENTRIC TRAJECTORY RECONCILIATION COMPLETE.", true);
  } else {
    setMessage("#engine-message", "ERR-E37 · PHASE INTERLOCK UNSATISFIED · RESOLUTION REQUIRED");
  }
}

function openLaunchControl() {
  if (missionState.powerComplete && missionState.navigationComplete && missionState.communicationsComplete && missionState.engineComplete) {
    showScreen("launch-screen");
  } else {
    openModal("KANISHKOS READINESS FAILURE", "READINESS CONDITION NOT MET. SUBSYSTEM RESTORATION REMAINS INCOMPLETE.");
  }
}

function resetMission() {
  if (missionState.timerInterval !== null) window.clearInterval(missionState.timerInterval);
  Object.assign(missionState, {
    started: false, startTime: null, timerInterval: null, finalTime: null,
    powerComplete: false, navigationComplete: false, communicationsComplete: false, engineComplete: false,
    commStage: "code", selectedDestination: null, lastSubsystemScreen: "power-screen", enginePrimed: false, engineArmed: false
  });
  $("#timer-display").textContent = "00:00";
  $("#final-time").textContent = "00:00";
  $("#power-allocation").value = "";
  [["aux-bias", 43], ["harmonic", 12], ["thermal-delta", 24], ["bus-scaling", 62]].forEach(([id, value]) => {
    $("#" + id).value = value;
    $("#" + id).dispatchEvent(new Event("input"));
  });
  [["shield-reserve", "BALANCED", "shield-readout"], ["flux-coupler", "MODE B", "flux-readout"], ["grid-compensation", "AUTO", "grid-readout"]].forEach(([id, value, readout]) => {
    $("#" + id).value = value;
    $("#" + readout).textContent = value;
  });
  ["galaxy", "region", "stellar", "classification"].forEach((id) => { $("#" + id).value = ""; });
  updateNavigation();
  showCommunicationCode();
  $("#engine-mode").value = "MVR-2";
  $("#thermal-bypass").value = "ON";
  ["field-sync", "aux-dampener", "burn-permission", "safety-suppression"].forEach((id) => { $("#" + id).checked = false; });
  $("#engine-switch-readout").textContent = "FIELD ARRAY / PASSIVE";
  setStatus("#power-status", false, "REACTOR ACTIVE", "REACTOR INACTIVE");
  setStatus("#engine-status", false, "PROPULSION ACTIVE", "PROPULSION INACTIVE");
  $("#shutdown-core").hidden = true;
  $("#engine-shutdown").hidden = true;
  ["power-message", "navigation-message", "communications-message", "engine-message"].forEach((id) => setMessage("#" + id, ""));
  closeModal();
  showScreen("intro-screen");
}

$("#brand-home").addEventListener("click", () => showScreen("intro-screen"));
$("#begin-repair").addEventListener("click", () => { startTimer(); showScreen(missionState.lastSubsystemScreen); });
$$('.system-nav button[data-screen]').forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
$$('.launch-control').forEach((button) => button.addEventListener("click", openLaunchControl));

const helpText = {
  power: "The Power subsystem manages spacecraft power.",
  navigation: "Select an appropriate celestial destination.",
  communications: "Provide the required communication identifier.",
  engine: "Resolve propulsion errors before execution."
};
$$('[data-help]').forEach((button) => button.addEventListener("click", () => openModal("KANISHKOS HELP", helpText[button.dataset.help])));
$$('.upgrade-button').forEach((button) => button.addEventListener("click", () => openModal("PREMIUM SERVICES UNAVAILABLE", "KanishkOS Premium services are unavailable on damaged spacecraft. Benefits remain classified.")));
$("#modal-close").addEventListener("click", closeModal);
$("#modal-dismiss").addEventListener("click", closeModal);
$("#modal").addEventListener("click", (event) => { if (event.target.id === "modal") closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("#modal").hidden) closeModal(); });

$$('[data-output]').forEach((input) => input.addEventListener("input", () => {
  $("#" + input.dataset.output).textContent = input.dataset.thermal ? `+${(Number(input.value) / 10).toFixed(1)}K` : input.value + input.dataset.suffix;
}));
[["shield-reserve", "shield-readout"], ["flux-coupler", "flux-readout"], ["grid-compensation", "grid-readout"]].forEach(([id, readout]) => $("#" + id).addEventListener("change", () => { $("#" + readout).textContent = $("#" + id).value; }));
$("#resolve-power").addEventListener("click", completePower);
$("#shutdown-core").addEventListener("click", () => {
  missionState.powerComplete = false;
  setStatus("#power-status", false, "REACTOR ACTIVE", "REACTOR INACTIVE");
  $("#shutdown-core").hidden = true;
  setMessage("#power-message", "CORE SHUTDOWN CONFIRMED.");
});

["galaxy", "region", "stellar", "classification"].forEach((id, index) => $("#" + id).addEventListener("change", () => updateNavigation(index)));
$$('#destination-options button').forEach((button) => button.addEventListener("click", () => {
  missionState.selectedDestination = button.dataset.destination;
  $$('#destination-options button').forEach((option) => option.classList.toggle("selected", option === button));
  missionState.navigationComplete = false;
  setStatus("#navigation-status", false, "EARTH ROUTE LOCKED", "VECTOR NOT LOCKED");
  setMessage("#navigation-message", "");
}));
$("#apply-vector").addEventListener("click", applyNavigationVector);

$("#proceed-transmitter").addEventListener("click", openTransmitter);
$("#reacquire-relay").addEventListener("click", showCommunicationCode);
$("#establish-relay").addEventListener("click", validateCommunicationCode);
$("#relay-identifier").addEventListener("keydown", (event) => { if (event.key === "Enter") validateCommunicationCode(); });

function invalidateEngineIfNeeded() {
  if (missionState.engineComplete && ($("#engine-mode").value !== "SAFE-BURN" || $("#thermal-bypass").value !== "OFF")) {
    missionState.engineComplete = false;
    setStatus("#engine-status", false, "PROPULSION ACTIVE", "PROPULSION INACTIVE");
    $("#engine-shutdown").hidden = true;
  }
}
$("#engine-mode").addEventListener("change", invalidateEngineIfNeeded);
$("#thermal-bypass").addEventListener("change", invalidateEngineIfNeeded);
$$('.engine-switches input').forEach((input) => input.addEventListener("change", () => {
  $("#engine-switch-readout").textContent = `FIELD ARRAY / ${$$('.engine-switches input:checked').length} AUXILIARY CHANNELS ENGAGED`;
}));
$$('[data-engine-action]').forEach((button) => button.addEventListener("click", () => {
  switch (button.dataset.engineAction) {
    case "calibrate": setMessage("#engine-message", "CALIBRATION MATRIX NORMALIZED.", true); break;
    case "prime": primeEngine(); break;
    case "synchronize": setMessage("#engine-message", "FIELD HARMONICS SYNCHRONIZED.", true); break;
    case "diagnostic": openModal("ENGINE DIAGNOSTIC", "G-PROP telemetry nominal. Phase interlock details remain classified by KanishkOS."); break;
    case "purge": setMessage("#engine-message", "AUXILIARY EXHAUST CHANNEL PURGED.", true); break;
    case "arm": armEngine(); break;
    case "bypass": $("#thermal-bypass").value = $("#thermal-bypass").value === "ON" ? "OFF" : "ON"; invalidateEngineIfNeeded(); setMessage("#engine-message", "THERMAL BYPASS CHANNEL RECONFIGURED.", true); break;
    case "execute": executeEngine(); break;
  }
}));
$("#engine-shutdown").addEventListener("click", () => {
  missionState.engineComplete = false;
  missionState.enginePrimed = false;
  missionState.engineArmed = false;
  setStatus("#engine-status", false, "PROPULSION ACTIVE", "PROPULSION INACTIVE");
  $("#engine-shutdown").hidden = true;
  setMessage("#engine-message", "SAFE SHUTDOWN COMPLETE.");
});

$("#launch-to-earth").addEventListener("click", () => {
  stopTimer();
  $("#final-time").textContent = missionState.finalTime;
  showScreen("success-screen");
});
$("#retry-mission").addEventListener("click", resetMission);
})();
