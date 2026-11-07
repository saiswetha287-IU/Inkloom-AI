// Inkloom AI prototype v0.1
// Local, deterministic demo checks. No external AI model or backend is connected.

const productions = {
  moon: {
    name: "The Moonlit Crown", lead: "Princess Aarya", date: "18 December",
    platform: "StreamWave", term: "Guardian of Veyra",
    facts: ["The Moonlit Crown", "Princess Aarya", "18 December", "StreamWave", "Guardian of Veyra"]
  },
  echo: {
    name: "Echoes of Tomorrow", lead: "Dr. Mira Sen", date: "07 January",
    platform: "ViewPoint", term: "The Memory Protocol",
    facts: ["Echoes of Tomorrow", "Dr. Mira Sen", "07 January", "ViewPoint", "The Memory Protocol"]
  }
};

const sampleDrafts = {
  moon: "The Moonlit Crown premieres on 25 December! Meet Princess Aarya, the fearless queen who rules the kingdom of Veyra. Watch the exclusive final episode only on StreamWave. #MoonlitCrown",
  echo: "Echoes of Tomorrow premieres on 07 January! Meet Dr. Mira Sen as she unlocks the Memory Protocol. Watch the exclusive first look only on ViewPoint."
};

let findings = [];
let currentReviewId = "INK-0001";
let history = JSON.parse(localStorage.getItem("inkloomHistory") || "[]");
let auditHasRun = false;

const $ = (id) => document.getElementById(id);
const input = $("content-input");
const productionSelect = $("production-select");

function updateCharCount() {
  $("char-count").textContent = `${input.value.length} characters`;
}
input.addEventListener("input", updateCharCount);
updateCharCount();

function updateProductionContext() {
  const p = productions[productionSelect.value];
  $("production-rule-title").textContent = "Production reference";
  $("production-rule-sub").textContent = `${p.name} · Approved pack`;
  $("fact-character").textContent = p.lead;
  $("fact-title").textContent = p.name;
  $("fact-date").textContent = p.date;
  $("fact-platform").textContent = p.platform;
  $("fact-term").textContent = p.term;
  if (!auditHasRun) input.value = sampleDrafts[productionSelect.value];
  updateCharCount();
}
productionSelect.addEventListener("change", updateProductionContext);

function addFinding(id, severity, title, explanation, evidence, suggestion, replacement) {
  findings.push({ id, severity, title, explanation, evidence, suggestion, replacement });
}

function runAudit() {
  const text = input.value.trim();
  if (!text) {
    showToast("Add promotional content before running the audit.");
    input.focus();
    return;
  }

  findings = [];
  const lower = text.toLowerCase();
  const p = productions[productionSelect.value];

  // Production-specific canonical fact checks
  if (!lower.includes(p.name.toLowerCase())) {
    addFinding("production-title", "high", "Approved production title not found",
      "The submitted copy does not contain the selected production's approved title. Confirm that the correct title is being promoted.",
      `Production reference pack: approved title is “${p.name}”.`,
      `Include the approved title: ${p.name}.`, p.name);
  }

  const dateMatches = [...text.matchAll(/\b\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi)].map(m => m[0]);
  if (dateMatches.length && !dateMatches.some(d => d.toLowerCase() === p.date.toLowerCase())) {
    addFinding("release-date", "high", "Release date mismatch",
      "A date in the draft differs from the release date in the selected production pack. This may be outdated or incorrect campaign information.",
      `Submitted date: ${dateMatches.join(", ")}. Approved release date: “${p.date}”.`,
      `Replace the release date with ${p.date}.`, dateMatches[0]);
  } else if (!dateMatches.length) {
    addFinding("release-date-missing", "low", "Release date not stated",
      "No release date was detected. This is not necessarily an error, but verify whether the selected campaign requires one.",
      `Production reference pack lists the approved release date as “${p.date}”.`,
      `If the campaign requires it, add: ${p.date}.`, "");
  }

  if (!lower.includes(p.lead.toLowerCase())) {
    addFinding("character-name", "medium", "Lead character reference not found",
      "The draft does not mention the lead character recorded in the selected production pack. Check whether the omission is intentional.",
      `Approved lead character: “${p.lead}”.`,
      `If relevant to this campaign, use the approved character name: ${p.lead}.`, "");
  }

  const platforms = ["streamwave", "viewpoint", "netflix", "prime video", "disney+", "hotstar"];
  const mentionedPlatforms = platforms.filter(name => lower.includes(name));
  if (mentionedPlatforms.length && !mentionedPlatforms.includes(p.platform.toLowerCase())) {
    addFinding("platform", "high", "Platform name conflicts with production pack",
      "The draft mentions a platform that does not match the selected production's approved platform reference.",
      `Mentioned: ${mentionedPlatforms.join(", ")}. Approved platform: “${p.platform}”.`,
      `Verify distribution details. The selected pack lists ${p.platform}.`, mentionedPlatforms[0]);
  }

  if (/\b(exclusive|only|number one|#1|guaranteed|biggest ever|worldwide premiere)\b/i.test(text)) {
    const match = text.match(/\b(exclusive|only|number one|#1|guaranteed|biggest ever|worldwide premiere)\b/i)[0];
    addFinding("unverified-claim", "medium", "Potentially unverified promotional claim",
      "This wording can imply exclusivity, ranking or a guarantee. The demo studio policy requires these claims to be supported by an approved campaign brief.",
      `Detected wording: “${match}”. Studio-wide rule: do not use unverified exclusivity or availability claims.`,
      "Use neutral wording unless the campaign brief explicitly approves the claim.", match);
  }

  if (/\b(premieres|premiere|releases|launches)\b/i.test(text) && !dateMatches.length) {
    addFinding("launch-claim", "low", "Launch statement needs a verified date",
      "The draft refers to a premiere or launch but does not include a date. Verify that the campaign brief supports the timing.",
      `Approved release date in the production pack: “${p.date}”.`,
      `If appropriate, specify the approved date: ${p.date}.`, "");
  }

  const hashtagMatches = text.match(/#[A-Za-z0-9_]+/g) || [];
  if (hashtagMatches.some(tag => tag.length > 24)) {
    addFinding("hashtag", "low", "Long campaign hashtag",
      "A long hashtag may be difficult to read. Consider checking it against the campaign's approved hashtag list.",
      `Detected hashtag: ${hashtagMatches.find(tag => tag.length > 24)}.`,
      "Use the campaign-approved hashtag or a shorter readable version.", "");
  }

  if (!findings.length) {
    findings.push({
      id: "clear", severity: "low", title: "No configured rule conflicts detected",
      explanation: "The submitted text passed the checks configured in this local prototype. This does not guarantee factual, legal or brand approval.",
      evidence: "Checked against the selected fictional studio rules and production reference pack.",
      suggestion: "Continue to an authorised human review before publication.", replacement: ""
    });
  }

  auditHasRun = true;
  currentReviewId = `INK-${String(Date.now()).slice(-6)}`;
  $("review-id").textContent = currentReviewId;
  renderFindings();
  $("results-section").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("Governance audit completed.");
}

function renderFindings() {
  $("empty-state").classList.add("hidden");
  $("results-content").classList.remove("hidden");
  const high = findings.filter(f => f.severity === "high").length;
  const medium = findings.filter(f => f.severity === "medium").length;
  const low = findings.filter(f => f.severity === "low").length;
  const issues = findings.filter(f => f.id !== "clear").length;
  $("score-placeholder").textContent = issues ? `${issues} POTENTIAL FINDING${issues === 1 ? "" : "S"}` : "NO CONFIGURED CONFLICTS";
  $("results-subtitle").textContent = `${findings.length} result(s) generated from the active local policy pack.`;
  $("summary-cards").innerHTML = `
    <div class="summary-card"><small>TOTAL FINDINGS</small><strong>${issues}</strong><em>Potential issues</em></div>
    <div class="summary-card"><small>HIGH PRIORITY</small><strong>${high}</strong><em>Needs attention</em></div>
    <div class="summary-card"><small>MEDIUM PRIORITY</small><strong>${medium}</strong><em>Review suggested</em></div>
    <div class="summary-card"><small>LOW PRIORITY</small><strong>${low}</strong><em>Advisory checks</em></div>`;
  if (!issues) {
    $("findings-list").innerHTML = `<div class="no-issues"><strong>✓ No configured rule conflicts detected.</strong><br><br>${escapeHtml(findings[0].explanation)}<br>${escapeHtml(findings[0].suggestion)}</div>`;
    return;
  }
  $("findings-list").innerHTML = findings.map((f, i) => `
    <article class="finding ${f.severity}">
      <div class="finding-top"><div class="finding-name">${escapeHtml(f.title)}</div><span class="severity ${f.severity}">${f.severity.toUpperCase()} PRIORITY</span></div>
      <p>${escapeHtml(f.explanation)}</p>
      <div class="evidence"><b>Evidence / applicable rule:</b> ${escapeHtml(f.evidence)}</div>
      <div class="suggestion-row"><div class="suggestion">✦ ${escapeHtml(f.suggestion)}</div>${f.replacement ? `<button class="apply-fix" data-fix="${i}">Apply suggestion</button>` : ""}</div>
    </article>`).join("");
  document.querySelectorAll("[data-fix]").forEach(btn => btn.addEventListener("click", () => applySuggestion(Number(btn.dataset.fix))));
}

function applySuggestion(index) {
  const f = findings[index];
  if (!f || !f.replacement) return;
  const p = productions[productionSelect.value];
  if (f.id === "release-date") {
    input.value = input.value.replace(new RegExp(escapeRegExp(f.replacement), "i"), p.date);
  } else if (f.id === "platform") {
    input.value = input.value.replace(new RegExp(escapeRegExp(f.replacement), "i"), p.platform);
  } else if (f.id === "unverified-claim") {
    input.value = input.value.replace(new RegExp(`\\b${escapeRegExp(f.replacement)}\\b`, "i"), ""); 
  } else if (f.id === "production-title") {
    input.value = `${p.name} — ${input.value}`;
  } else {
    showToast("Please make this suggested change manually in the draft.");
    return;
  }
  updateCharCount();
  showToast("Suggestion applied to the editable draft. Run the audit again.");
  auditHasRun = false;
}

function recordDecision(decision, reason = "") {
  if (!auditHasRun) {
    showToast("Run the governance audit before recording a decision.");
    return;
  }
  if (decision === "Override" && !reason) {
    reason = prompt("Briefly explain why this content is being overridden:");
    if (reason === null) return;
    if (!reason.trim()) {
      showToast("An override reason is required.");
      return;
    }
  }
  const entry = {
    id: currentReviewId,
    asset: $("asset-title").value.trim() || "Untitled asset",
    production: productions[productionSelect.value].name,
    findings: findings.filter(f => f.id !== "clear").length,
    decision,
    reason,
    time: new Date().toLocaleString()
  };
  history.unshift(entry);
  localStorage.setItem("inkloomHistory", JSON.stringify(history));
  const status = $("decision-status");
  status.textContent = `${decision} recorded for ${currentReviewId}${reason ? ` · Reason: ${reason}` : ""}. This is a demo decision, not a publication action.`;
  status.classList.remove("hidden");
  renderHistory();
  showToast(`Reviewer decision recorded: ${decision}.`);
}

function renderHistory() {
  const body = $("history-body");
  if (!history.length) {
    body.innerHTML = `<tr><td colspan="6" class="no-history">No review decisions recorded yet.</td></tr>`;
    return;
  }
  body.innerHTML = history.map(item => `<tr>
    <td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(item.asset)}</td>
    <td>${escapeHtml(item.production)}</td><td>${item.findings}</td>
    <td><span class="decision-chip ${item.decision.toLowerCase()}">${escapeHtml(item.decision)}</span></td>
    <td>${escapeHtml(item.time)}</td></tr>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Navigation between the three demo screens
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".page-view").forEach(view => view.classList.remove("active"));
    $(`view-${button.dataset.view}`).classList.add("active");
    $("breadcrumb-current").textContent = button.textContent.trim();
  });
});

$("run-audit").addEventListener("click", runAudit);
$("load-sample").addEventListener("click", () => {
  input.value = sampleDrafts[productionSelect.value];
  updateCharCount();
  showToast("Sample promotional draft loaded.");
});
$("approve-review").addEventListener("click", () => recordDecision("Approved"));
$("request-revision").addEventListener("click", () => recordDecision("Revision requested"));
$("override-review").addEventListener("click", () => recordDecision("Override"));
$("clear-history").addEventListener("click", () => {
  if (!confirm("Clear all review history saved in this browser?")) return;
  history = [];
  localStorage.removeItem("inkloomHistory");
  renderHistory();
  showToast("Local review history cleared.");
});

renderHistory();
updateProductionContext();
