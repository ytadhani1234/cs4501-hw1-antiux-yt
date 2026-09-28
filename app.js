(() => {
  "use strict";

  const STORAGE_KEY = "antiBooking";
  const ROOM_DATA = {
    A: { id: "A", name: "Regret Standard", base: 80, fee: 19, tax: 0.12, code: "A-203-X", description: "A straightforward room with a proudly complicated name." },
    B: { id: "B", name: "Questionable Deluxe", base: 86, fee: 8, tax: 0.08, code: "B-417-K", description: "An unusually deluxe approach to basic temporary occupancy." },
    C: { id: "C", name: "Executive Disappointment", base: 75, fee: 25, tax: 0.10, code: "C-882-P", description: "Executive atmosphere with an administrative emphasis." }
  };
  const EXTRA_NAMES = {
    breakfast: "Breakfast",
    premiumView: "Premium View",
    flexibleCancellation: "Flexible Cancellation",
    luxuryPillow: "Luxury Pillow Package"
  };
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const QUARTER_MONTHS = { Q1: [3, 1, 2], Q2: [6, 4, 5], Q3: [9, 7, 8], Q4: [12, 10, 11] };
  const WEEK_ORDER = [3, 1, 4, 2];

  function emptyBookingState() {
    return {
      location: "", checkIn: "", checkOut: "", guests: 0,
      datePath: { year: "", quarter: "", month: "", week: "", day: "" },
      selectedRoom: "", roomCode: "", codeAcknowledged: false, savedRooms: [],
      extras: { breakfast: false, premiumView: false, flexibleCancellation: false, luxuryPillow: false },
      guest: { firstName: "", lastName: "", email: "", phone: "" },
      confirmationNumber: ""
    };
  }

  function getBookingState() {
    const defaults = emptyBookingState();
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
      return {
        ...defaults, ...stored,
        datePath: { ...defaults.datePath, ...(stored.datePath || {}) },
        extras: { ...defaults.extras, ...(stored.extras || {}) },
        guest: { ...defaults.guest, ...(stored.guest || {}) },
        savedRooms: Array.isArray(stored.savedRooms) ? stored.savedRooms : []
      };
    } catch {
      return defaults;
    }
  }

  function saveBookingState(state) { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function updateBookingState(partial) {
    const current = getBookingState();
    const next = {
      ...current, ...partial,
      datePath: { ...current.datePath, ...(partial.datePath || {}) },
      extras: { ...current.extras, ...(partial.extras || {}) },
      guest: { ...current.guest, ...(partial.guest || {}) }
    };
    saveBookingState(next);
    return next;
  }
  function clearBookingState() { sessionStorage.removeItem(STORAGE_KEY); }
  function goTo(page) { window.location.href = `./${page}.html`; }
  function calculateRoomTotal(room) { return room.base + room.fee + room.base * room.tax; }
  function cheapestRoomId() {
    return Object.values(ROOM_DATA).reduce((lowest, room) => calculateRoomTotal(room) < calculateRoomTotal(lowest) ? room : lowest).id;
  }
  function hasSearch(state) { return Boolean(state.location && state.checkIn && state.checkOut && Number(state.guests)); }
  function hasRoom(state) { return Boolean(ROOM_DATA[state.selectedRoom] && state.roomCode === ROOM_DATA[state.selectedRoom].code && state.codeAcknowledged); }
  function guestErrors(guest) {
    const errors = {};
    if (!String(guest.firstName || "").trim()) errors.firstName = "Enter a fake first name.";
    if (!String(guest.lastName || "").trim()) errors.lastName = "Enter a fake last name.";
    if (!String(guest.email || "").includes("@")) errors.email = "Enter a fake email containing @.";
    if (!String(guest.phone || "").trim()) errors.phone = "Enter a fake phone number.";
    return errors;
  }
  function hasGuest(state) { return Object.keys(guestErrors(state.guest)).length === 0; }
  function requireState(fields) {
    const state = getBookingState();
    if ((fields.includes("search") && !hasSearch(state)) ||
        (fields.includes("room") && !hasRoom(state)) ||
        (fields.includes("guest") && !hasGuest(state)) ||
        (fields.includes("confirmation") && !state.confirmationNumber)) {
      window.location.replace("./index.html");
      return false;
    }
    return true;
  }
  function showError(element, message) { element.textContent = message; element.hidden = false; }
  function hideError(element) { element.textContent = ""; element.hidden = true; }

  let modal;
  let modalTrigger;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("dialog");
    modal.className = "anti-modal";
    modal.setAttribute("aria-labelledby", "modal-title");
    document.body.append(modal);
    modal.addEventListener("close", () => modalTrigger?.focus());
    return modal;
  }
  function showModal(title, message, action) {
    const box = ensureModal();
    modalTrigger = document.activeElement;
    box.replaceChildren();
    const heading = document.createElement("h2");
    heading.id = "modal-title";
    heading.textContent = title;
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    const controls = document.createElement("div");
    controls.className = "modal-controls";
    if (action) {
      const actionButton = document.createElement("button");
      actionButton.type = "button";
      actionButton.textContent = action.label;
      actionButton.addEventListener("click", () => action.run(paragraph));
      controls.append(actionButton);
    }
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => box.close());
    controls.append(closeButton);
    box.append(heading, paragraph, controls);
    box.showModal();
    closeButton.focus();
  }

  function initHome() {
    document.getElementById("begin-booking").addEventListener("click", () => goTo("search"));
    document.querySelectorAll("[data-home-modal]").forEach(button => button.addEventListener("click", () => {
      const premium = button.dataset.homeModal === "premium";
      showModal(premium ? "Premium Traveler Proposal" : "Explore Experiences", premium
        ? "Our premium traveler program offers enhanced terminology and additional opportunities to inspect pillows. No upgrade has been added."
        : "Explore a simulated lobby tour, a hypothetical concierge desk, and an imagined complimentary brochure. Your booking remains unchanged.");
    }));
  }

  function setSelectOptions(select, placeholder, values) {
    select.replaceChildren();
    const blank = new Option(placeholder, "");
    select.add(blank);
    values.forEach(([value, label]) => select.add(new Option(label, String(value))));
    select.disabled = values.length === 0;
  }
  function getDayOptions(year, month, week) {
    const lastDay = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
    if (Number(month) === 11 && Number(week) === 2) return [16, 12, 15, 14, 13];
    const start = (Number(week) - 1) * 7 + 1;
    const days = [];
    for (let day = start; day <= Math.min(start + 6, lastDay); day += 1) days.push(day);
    return days.reverse();
  }
  function initSearch() {
    const form = document.getElementById("search-form");
    const location = document.getElementById("location");
    const guests = document.getElementById("guests");
    const year = document.getElementById("year");
    const quarter = document.getElementById("quarter");
    const month = document.getElementById("month");
    const week = document.getElementById("week");
    const day = document.getElementById("day");
    const error = document.getElementById("search-error");
    const state = getBookingState();
    setSelectOptions(year, "Select year", [[2025, "2025"], [2026, "2026"], [2027, "2027"]]);
    const fillQuarters = () => setSelectOptions(quarter, "Select quarter", year.value ? [["Q1", "Q1"], ["Q2", "Q2"], ["Q3", "Q3"], ["Q4", "Q4"]] : []);
    const fillMonths = () => setSelectOptions(month, "Select month", quarter.value ? QUARTER_MONTHS[quarter.value].map(number => [number, MONTH_NAMES[number - 1]]) : []);
    const fillWeeks = () => setSelectOptions(week, "Select week grouping", month.value ? WEEK_ORDER.map(number => [number, `Week ${number}`]) : []);
    const fillDays = () => setSelectOptions(day, "Select day", week.value ? getDayOptions(year.value, month.value, week.value).map(number => [number, String(number)]) : []);
    year.addEventListener("change", () => { fillQuarters(); fillMonths(); fillWeeks(); fillDays(); hideError(error); });
    quarter.addEventListener("change", () => { fillMonths(); fillWeeks(); fillDays(); hideError(error); });
    month.addEventListener("change", () => { fillWeeks(); fillDays(); hideError(error); });
    week.addEventListener("change", () => { fillDays(); hideError(error); });
    day.addEventListener("change", () => hideError(error));
    location.value = state.location;
    guests.value = state.guests ? String(state.guests) : "";
    const path = state.datePath;
    if (path.year) { year.value = path.year; fillQuarters(); }
    if (path.quarter && !quarter.disabled) { quarter.value = path.quarter; fillMonths(); }
    if (path.month && !month.disabled) { month.value = path.month; fillWeeks(); }
    if (path.week && !week.disabled) { week.value = path.week; fillDays(); }
    if (path.day && !day.disabled) day.value = path.day;

    document.getElementById("reset-search").addEventListener("click", () => {
      clearBookingState();
      form.reset();
      fillQuarters(); fillMonths(); fillWeeks(); fillDays();
      hideError(error);
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (![location, year, quarter, month, week, day, guests].every(select => select.value)) {
        showError(error, "Some accommodation parameters remain unresolved. Check every selection above.");
        return;
      }
      const date = `${year.value}-${month.value.padStart(2, "0")}-${day.value.padStart(2, "0")}`;
      const checkout = new Date(Date.UTC(Number(year.value), Number(month.value) - 1, Number(day.value) + 1)).toISOString().slice(0, 10);
      updateBookingState({
        location: location.value, checkIn: date, checkOut: checkout, guests: Number(guests.value),
        datePath: { year: year.value, quarter: quarter.value, month: month.value, week: week.value, day: day.value },
        confirmationNumber: ""
      });
      goTo("results");
    });
  }

  function roomActionCopy(action, room) {
    switch (action) {
      case "details": return ["Room Details", `${room.name}: ${room.description}`];
      case "policies": return ["Room Policies", `${room.name} follows our simulated one-night policy. No real cancellation or payment occurs.`];
      case "compare": return ["Qualitative Comparison", "Regret Standard is plain; Questionable Deluxe emphasizes decor; Executive Disappointment emphasizes its title. Review the displayed price components yourself."];
      case "benefits": return ["Unrelated Benefits", "Benefits may include elaborate descriptions, ceremonial greetings, and an imaginary brochure. No booking option has changed."];
      case "upgrade": return ["Premium Upgrade Information", "Premium choices are considered on a later screen. Opening this message has not enabled an upgrade."];
      default: return ["Information", "No reservation choice has changed."];
    }
  }
  function initResults() {
    if (!requireState(["search"])) return;
    const panel = document.getElementById("code-panel");
    const codeDisplay = document.getElementById("room-code-display");
    const selectionMessage = document.getElementById("selection-message");
    const error = document.getElementById("results-error");
    const render = () => {
      const state = getBookingState();
      document.querySelectorAll(".room-card").forEach(card => {
        card.classList.toggle("applied-room", card.dataset.room === state.selectedRoom);
        const saveButton = card.querySelector('[data-room-action="save"]');
        const saved = state.savedRooms.includes(card.dataset.room);
        saveButton.setAttribute("aria-pressed", String(saved));
        saveButton.classList.toggle("saved-action", saved);
      });
      const showCode = Boolean(ROOM_DATA[state.selectedRoom] && !state.codeAcknowledged);
      panel.hidden = !showCode;
      codeDisplay.textContent = showCode ? ROOM_DATA[state.selectedRoom].code : "";
      selectionMessage.textContent = state.selectedRoom && state.codeAcknowledged ? "Accommodation configuration acknowledged." : "";
    };
    render();
    document.querySelector(".room-grid").addEventListener("click", event => {
      const button = event.target.closest("button[data-room-action]");
      if (!button) return;
      const card = button.closest(".room-card");
      const room = ROOM_DATA[card.dataset.room];
      const action = button.dataset.roomAction;
      if (action === "apply") {
        updateBookingState({ selectedRoom: room.id, roomCode: room.code, codeAcknowledged: false, confirmationNumber: "" });
        hideError(error);
        render();
        panel.setAttribute("tabindex", "-1");
        panel.focus();
      } else if (action === "save") {
        const savedRooms = [...new Set([...getBookingState().savedRooms, room.id])];
        updateBookingState({ savedRooms });
        render();
        showModal("Saved for Later", `${room.name} is saved for this browsing session. The selected room has not changed.`);
      } else if (action === "share") {
        const link = window.location.href;
        showModal("Share Accommodation Candidate", `Share this simulated candidate page: ${link}`, {
          label: "Copy Link",
          run: async paragraph => {
            try {
              if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
              await navigator.clipboard.writeText(link);
              paragraph.textContent = "Link copied. No booking information was shared automatically.";
            } catch {
              paragraph.textContent = `Clipboard unavailable here. Select and copy this link manually: ${link}`;
            }
          }
        });
      } else {
        const [title, message] = roomActionCopy(action, room);
        showModal(title, message);
      }
    });
    document.getElementById("acknowledge-code").addEventListener("click", () => {
      updateBookingState({ codeAcknowledged: true, confirmationNumber: "" });
      render();
      document.getElementById("proceed-results").focus();
    });
    document.getElementById("cancel-search").addEventListener("click", () => { clearBookingState(); goTo("index"); });
    document.getElementById("proceed-results").addEventListener("click", () => {
      const state = getBookingState();
      if (!state.selectedRoom) { showError(error, "An accommodation candidate must be applied before proceeding."); return; }
      if (!state.codeAcknowledged) { showError(error, "Acknowledge the displayed identifier before proceeding."); panel.focus(); return; }
      goTo("configure");
    });
  }

  function initConfigure() {
    if (!requireState(["search", "room"])) return;
    const form = document.getElementById("configure-form");
    const state = getBookingState();
    const controls = Object.keys(EXTRA_NAMES).map(key => document.getElementById(key));
    const renderRow = control => {
      const row = control.closest(".extra-row");
      row.classList.toggle("extra-on", control.checked);
      row.classList.toggle("extra-off", !control.checked);
    };
    controls.forEach(control => {
      control.checked = Boolean(state.extras[control.name]);
      renderRow(control);
      control.addEventListener("change", () => {
        updateBookingState({ extras: { [control.name]: control.checked }, confirmationNumber: "" });
        renderRow(control);
      });
    });
    form.addEventListener("submit", event => { event.preventDefault(); goTo("guest"); });
    document.getElementById("return-results").addEventListener("click", () => goTo("results"));
  }

  function initGuest() {
    if (!requireState(["search", "room"])) return;
    const form = document.getElementById("guest-form");
    const error = document.getElementById("guest-error");
    const keys = ["firstName", "lastName", "email", "phone"];
    const state = getBookingState();
    const values = () => Object.fromEntries(keys.map(key => [key, document.getElementById(key).value]));
    keys.forEach(key => {
      const input = document.getElementById(key);
      input.value = state.guest[key] || "";
      input.addEventListener("input", () => {
        updateBookingState({ guest: { [key]: input.value }, confirmationNumber: "" });
        input.removeAttribute("aria-invalid");
        document.getElementById(`${key}-error`).textContent = "";
        hideError(error);
      });
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const guest = values();
      const errors = guestErrors(guest);
      keys.forEach(key => {
        const input = document.getElementById(key);
        input.setAttribute("aria-invalid", String(Boolean(errors[key])));
        document.getElementById(`${key}-error`).textContent = errors[key] || "";
      });
      if (Object.keys(errors).length) {
        showError(error, "Identity parameters remain semantically incomplete. Correct the marked fields.");
        document.getElementById(Object.keys(errors)[0]).focus();
        return;
      }
      updateBookingState({ guest: Object.fromEntries(keys.map(key => [key, guest[key].trim()])), confirmationNumber: "" });
      goTo("review");
    });
    document.getElementById("return-configure").addEventListener("click", () => goTo("configure"));
  }

  function readableDate(date) {
    const [year, month, day] = date.split("-").map(Number);
    return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
  }
  function initReview() {
    if (!requireState(["search", "room", "guest"])) return;
    const summary = document.getElementById("review-summary");
    const state = getBookingState();
    const includedExtras = Object.entries(state.extras).filter(([, enabled]) => enabled).map(([key]) => EXTRA_NAMES[key]);
    [
      ["Room", ROOM_DATA[state.selectedRoom].name],
      ["Dates", `${readableDate(state.checkIn)} to ${readableDate(state.checkOut)}`],
      ["Guests", `${state.guests} adult${Number(state.guests) === 1 ? "" : "s"}`],
      ["Configuration", includedExtras.length ? includedExtras.join(", ") : "No optional features included"]
    ].forEach(([label, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label; dd.textContent = value;
      summary.append(dt, dd);
    });
    const error = document.getElementById("review-error");
    const errorText = document.getElementById("review-error-text");
    const errorLink = document.getElementById("review-error-link");
    const showReviewError = (message, page, label) => {
      errorText.textContent = message;
      errorLink.href = `./${page}.html`;
      errorLink.textContent = label;
      error.hidden = false;
      error.focus();
    };
    error.setAttribute("tabindex", "-1");
    document.getElementById("review-form").addEventListener("submit", event => {
      event.preventDefault();
      const current = getBookingState();
      error.hidden = true;
      if (current.location !== "Charlottesville, VA" || current.checkIn !== "2026-11-14" || current.checkOut !== "2026-11-15" || Number(current.guests) !== 2) {
        showReviewError("The declared accommodation parameters do not satisfy the requested location, dates, and occupancy. Revisit parameter assembly.", "search", "Return to Accommodation Parameters");
      } else if (current.selectedRoom !== cheapestRoomId()) {
        showReviewError("The selected accommodation does not satisfy the requested economic criterion. Revisit accommodation comparison.", "results", "Return to Accommodation Candidates");
      } else if (Object.values(current.extras).some(Boolean)) {
        showReviewError("Optional inclusions conflict with the requested no-upgrade configuration.", "configure", "Return to Preference Resolution");
      } else if (!hasGuest(current)) {
        showReviewError("Identity parameters remain semantically incomplete.", "guest", "Return to Occupancy Declaration");
      } else if (document.getElementById("entered-code").value.toUpperCase() !== current.roomCode.toUpperCase()) {
        showReviewError("Transient identifier validation unsuccessful.", "results", "Return to Accommodation Candidates");
      } else {
        updateBookingState({ confirmationNumber: "ANTI-2026-417" });
        goTo("confirmation");
      }
    });
    document.getElementById("abort-review").addEventListener("click", () => goTo("guest"));
  }

  function initConfirmation() {
    if (!requireState(["search", "room", "guest", "confirmation"])) return;
    const state = getBookingState();
    document.getElementById("confirmation-number").textContent = state.confirmationNumber;
    document.getElementById("confirmation-room").textContent = ROOM_DATA[state.selectedRoom].name;
    document.getElementById("start-over").addEventListener("click", () => { clearBookingState(); goTo("index"); });
  }

  const page = document.body.dataset.page;
  if (page === "home") initHome();
  if (page === "search") initSearch();
  if (page === "results") initResults();
  if (page === "configure") initConfigure();
  if (page === "guest") initGuest();
  if (page === "review") initReview();
  if (page === "confirmation") initConfirmation();
})();
