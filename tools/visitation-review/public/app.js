const state = {
  items: [],
  decisions: {},
  summary: { total: 0, approved: 0, unclear: 0, remaining: 0 },
  filter: "pending",
  currentId: null,
  manualOpen: false,
};

const byId = (id) => document.getElementById(id);

function decisionFor(item) {
  return state.decisions[item.id] || null;
}

function statusFor(item) {
  return decisionFor(item)?.status || "pending";
}

function filteredItems() {
  return state.items.filter((item) => state.filter === "all" || statusFor(item) === state.filter);
}

function currentItem() {
  const visible = filteredItems();
  return visible.find((item) => item.id === state.currentId) || visible[0] || null;
}

function setText(id, value, fallback = "Not available") {
  byId(id).textContent = value === null || value === undefined || value === "" ? fallback : String(value);
}

function escapeText(value) {
  const node = document.createElement("span");
  node.textContent = String(value ?? "");
  return node.innerHTML;
}

function showToast(message, isError = false) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function setSaveState(text, busy = false) {
  byId("saveState").textContent = text;
  byId("saveState").classList.toggle("busy", busy);
}

function renderOverview() {
  const { total, approved, unclear, remaining } = state.summary;
  setText("totalCount", total, "0");
  setText("approvedCount", approved, "0");
  setText("unclearCount", unclear, "0");
  setText("remainingCount", remaining, "0");
  setText("progressText", `${approved + unclear} / ${total}`, "0 / 0");
  byId("progressBar").style.width = total ? `${((approved + unclear) / total) * 100}%` : "0%";
}

function conditionsText(item) {
  return item.suggestedConditions?.summary?.length
    ? item.suggestedConditions.summary.join(" · ")
    : "No condition suggested";
}

function bundledText(item) {
  const value = item.currentBundledRepresentation;
  if (!value) return "No current bundled match";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function populateForm(item, decision = null) {
  const suggested = item.suggestedConditions || {};
  byId("streetInput").value = decision?.officialStreetName ?? item.suggestedOfficialStreet ?? "";
  byId("districtInput").value = decision?.district ?? item.suggestedDistrict ?? "";
  byId("postcodeInput").value = decision?.postcodeCondition?.join(", ") ?? suggested.postcode ?? "";
  byId("numberFromInput").value = decision?.numberFrom ?? suggested.numberFrom ?? "";
  byId("numberToInput").value = decision?.numberTo ?? suggested.numberTo ?? "";
  byId("parityInput").value = decision?.parity ?? suggested.parity ?? "";
  byId("notesInput").value = decision?.notes ?? "";
}

function renderCurrent() {
  const visible = filteredItems();
  const item = currentItem();
  const empty = !item;
  byId("emptyState").hidden = !empty;
  byId("reviewCard").hidden = empty;
  byId("previousButton").disabled = empty || visible.length < 2;
  byId("nextButton").disabled = empty || visible.length < 2;
  byId("skipButton").disabled = empty || visible.length < 2;
  if (empty) return;

  state.currentId = item.id;
  const decision = decisionFor(item);
  const status = statusFor(item);
  const absoluteIndex = state.items.findIndex((entry) => entry.id === item.id) + 1;
  setText("itemPosition", `Review item ${absoluteIndex} / ${state.items.length}`);
  setText("itemTitle", item.ocrText || item.suggestedOfficialStreet || item.id);
  setText("sourceFile", item.pdfSource);
  setText("sourcePage", item.pdfPage);
  byId("openPdfLink").href = `/source-pdf#page=${item.pdfPage}`;
  byId("rowCrop").src = item.rowCrop;
  byId("rowCropLink").href = item.rowCrop;
  byId("contextCrop").src = item.contextCrop;
  byId("contextCropLink").href = item.contextCrop;
  setText("ocrText", item.ocrText);
  setText("confidence", item.confidence);
  setText("flagReason", item.reasonFlagged);
  setText("bundledRepresentation", bundledText(item));
  setText(
    "suggestedStreet",
    item.suggestedOfficialStreet,
    "None — transcribe visually or choose a fuzzy candidate",
  );
  setText("suggestedDistrict", item.suggestedDistrict, "No suggestion");
  setText("suggestedConditions", conditionsText(item));

  const badge = byId("statusBadge");
  badge.textContent = status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Still unclear";
  badge.className = `status-badge ${status}`;

  const candidateList = byId("candidateList");
  candidateList.replaceChildren();
  const candidates = item.fuzzyCandidates || [];
  if (!candidates.length) {
    const emptyCandidate = document.createElement("span");
    emptyCandidate.className = "muted";
    emptyCandidate.textContent = "No fuzzy candidates";
    candidateList.append(emptyCandidate);
  } else {
    for (const candidate of candidates) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "candidate-chip";
      button.textContent = typeof candidate === "string" ? candidate : candidate.street || candidate.name || JSON.stringify(candidate);
      button.addEventListener("click", () => {
        state.manualOpen = true;
        populateForm(item, decision);
        byId("streetInput").value = button.textContent;
        renderManualState();
        byId("streetInput").focus();
      });
      candidateList.append(button);
    }
  }

  const hasSafeSuggestion = Boolean(item.suggestedOfficialStreet?.trim());
  byId("approveButton").disabled = !hasSafeSuggestion;
  byId("approveButton").title = hasSafeSuggestion
    ? "Approve the displayed suggestion"
    : "No reviewed street suggestion exists; use Correct manually";

  byId("existingDecision").hidden = !decision;
  if (decision) {
    const detail = decision.status === "approved"
      ? `${decision.officialStreetName} → ${decision.district} (${decision.action === "approve_suggestion" ? "suggestion approved" : "manual correction"})`
      : `Still unclear${decision.notes ? ` — ${decision.notes}` : ""}`;
    setText("decisionSummary", detail);
  }
  populateForm(item, decision);
  renderManualState();
}

function renderManualState() {
  byId("manualForm").hidden = !state.manualOpen;
  byId("manualButton").setAttribute("aria-expanded", String(state.manualOpen));
}

function render() {
  renderOverview();
  renderCurrent();
}

function formPayload(status, action) {
  const valueOrNull = (id) => byId(id).value === "" ? null : Number(byId(id).value);
  return {
    status,
    action,
    officialStreetName: byId("streetInput").value,
    district: byId("districtInput").value,
    postcodeCondition: byId("postcodeInput").value,
    numberFrom: valueOrNull("numberFromInput"),
    numberTo: valueOrNull("numberToInput"),
    parity: byId("parityInput").value,
    notes: byId("notesInput").value,
  };
}

async function saveDecision(payload) {
  const item = currentItem();
  if (!item) return;
  setSaveState("Saving…", true);
  try {
    const response = await fetch(`/api/decisions/${encodeURIComponent(item.id)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to save decision");
    state.decisions = body.decisions;
    state.summary = body.summary;
    state.manualOpen = false;
    setSaveState("Saved to review-decisions.json");
    showToast("Decision saved locally");
    render();
  } catch (error) {
    setSaveState("Save failed");
    showToast(error.message || String(error), true);
  }
}

async function clearDecision() {
  const item = currentItem();
  if (!item) return;
  setSaveState("Clearing…", true);
  try {
    const response = await fetch(`/api/decisions/${encodeURIComponent(item.id)}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to clear decision");
    state.decisions = body.decisions;
    state.summary = body.summary;
    setSaveState("Saved to review-decisions.json");
    showToast("Decision cleared");
    render();
  } catch (error) {
    setSaveState("Save failed");
    showToast(error.message || String(error), true);
  }
}

function navigate(direction) {
  const visible = filteredItems();
  if (!visible.length) return;
  const index = Math.max(0, visible.findIndex((item) => item.id === state.currentId));
  state.currentId = visible[(index + direction + visible.length) % visible.length].id;
  state.manualOpen = false;
  renderCurrent();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function summaryItem(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "summary-item";
  button.innerHTML = `<strong>${escapeText(item.itemNumber)}.</strong><span>${escapeText(item.suggestedOfficialStreet || item.ocrText)}</span><small>p. ${escapeText(item.pdfPage)}</small>`;
  button.addEventListener("click", () => {
    state.filter = "all";
    byId("filterSelect").value = "all";
    state.currentId = item.id;
    byId("summaryDialog").close();
    renderCurrent();
  });
  return button;
}

function openSummary() {
  const { total, approved, unclear, remaining } = state.summary;
  byId("summaryMetrics").innerHTML = `<strong>${approved}</strong> approved · <strong>${unclear}</strong> unclear · <strong>${remaining}</strong> remaining · ${total} total`;
  for (const [status, target] of [["approved", "approvedItems"], ["unclear", "unclearItems"], ["pending", "pendingItems"]]) {
    const container = byId(target);
    container.replaceChildren();
    const items = state.items.filter((item) => statusFor(item) === status);
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "None";
      container.append(empty);
    } else {
      items.forEach((item) => container.append(summaryItem(item)));
    }
  }
  byId("summaryDialog").showModal();
}

async function load() {
  try {
    const response = await fetch("/api/review");
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Unable to load review data");
    state.items = body.manifest.items;
    state.decisions = body.decisions;
    state.summary = body.summary;
    state.currentId = filteredItems()[0]?.id || null;
    render();
  } catch (error) {
    byId("reviewCard").hidden = true;
    byId("emptyState").hidden = false;
    byId("emptyState").innerHTML = `<h2>Reviewer could not load</h2><p>${escapeText(error.message || String(error))}</p>`;
    setSaveState("Reviewer unavailable");
  }
}

byId("previousButton").addEventListener("click", () => navigate(-1));
byId("nextButton").addEventListener("click", () => navigate(1));
byId("skipButton").addEventListener("click", () => navigate(1));
byId("filterSelect").addEventListener("change", (event) => {
  state.filter = event.target.value;
  state.currentId = filteredItems()[0]?.id || null;
  state.manualOpen = false;
  renderCurrent();
});
byId("manualButton").addEventListener("click", () => {
  state.manualOpen = !state.manualOpen;
  renderManualState();
  if (state.manualOpen) byId("streetInput").focus();
});
byId("cancelManualButton").addEventListener("click", () => {
  state.manualOpen = false;
  renderManualState();
});
byId("approveButton").addEventListener("click", () => {
  const item = currentItem();
  if (!item) return;
  populateForm(item, null);
  saveDecision(formPayload("approved", "approve_suggestion"));
});
byId("unclearButton").addEventListener("click", () => saveDecision(formPayload("unclear", "still_unclear")));
byId("manualForm").addEventListener("submit", (event) => {
  event.preventDefault();
  saveDecision(formPayload("approved", "manual_correction"));
});
byId("clearDecisionButton").addEventListener("click", clearDecision);
byId("summaryButton").addEventListener("click", openSummary);
byId("closeSummaryButton").addEventListener("click", () => byId("summaryDialog").close());
document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select") || byId("summaryDialog").open) return;
  if (event.key === "ArrowLeft") navigate(-1);
  if (event.key === "ArrowRight") navigate(1);
});

load();
