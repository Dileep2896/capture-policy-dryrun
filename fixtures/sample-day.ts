import type { CaptureEvent } from "../src/lib/source/types";

/**
 * A fictional workday (Tuesday 2026-10-20) for Jordan Rivera, ops analyst at the
 * fictional "Northstar Operations". All names, emails, keys and amounts are made up.
 */
type Opts = Partial<Pick<CaptureEvent, "browser_url" | "incognito" | "sensitivity" | "sensitive_text" | "note">>;

const raw: Omit<CaptureEvent, "id">[] = [];
const DAY = "2026-10-20";

function add(time: string, type: CaptureEvent["type"], app: string, win: string, text: string, o: Opts = {}) {
  raw.push({
    type,
    timestamp: `${DAY}T${time.length === 5 ? `${time}:00` : time}`,
    app_name: app,
    window_name: win,
    text,
    sensitivity: "none",
    ...o,
  });
}
const chrome = (time: string, win: string, url: string, text: string, o: Opts = {}) =>
  add(time, "UI", "Google Chrome", win, text, { browser_url: url, ...o });

// ---- Morning: inbox, Slack, standup ----------------------------------------------------
chrome("08:31", "Inbox (12) - jordan@northstar-ops.example - Northstar Mail", "https://mail.google.com/mail/u/0/#inbox",
  "Inbox: AP batch for Oct 20, Vendor onboarding: Brightline Freight, Re: INV-2287 approval");
chrome("08:34", "Re: INV-2287 approval - Northstar Mail", "https://mail.google.com/mail/u/0/#inbox/FMfcgz",
  "From: priya.shah@northstar-ops.example  Approved, please book it to cost center 4410.");
add("08:38", "UI", "Slack", "#finance - Northstar", "maya: month-end checklist is pinned. jordan: on it, starting with accruals.");
add("08:41", "UI", "Slack", "#ops-standup - Northstar", "Standup in 20 min, bring blockers for the vendor migration.");
chrome("08:45", "AP tracker Q4 - Google Sheets", "https://docs.google.com/spreadsheets/d/1ApTracker",
  "Vendor | Invoice | Status | Owner  Brightline Freight | INV-2287 | Approved | JR");
chrome("08:52", "Linear - Ops board", "https://linear.app/northstar/team/OPS/active",
  "OPS-412 Migrate vendor master to ERP · In progress · Jordan Rivera");
add("09:02", "UI", "1Password", "1Password - Northstar Ops vault",
  "Vault: Northstar Ops  Item: ERP admin  username jrivera  password ••••••••  Reveal",
  { sensitivity: "credential", note: "Password manager vault, item names and reveal control on screen" });
add("09:01", "Audio", "zoom.us", "Zoom Meeting", "Morning everyone, quick round: vendor migration is at sixty percent, no blockers yet.");
add("09:04", "Audio", "zoom.us", "Zoom Meeting", "Maya here, accruals draft lands in the shared drive by noon.");
add("09:07", "Audio", "zoom.us", "Zoom Meeting", "Jordan, can you own the Brightline onboarding checklist this week?");
add("09:10", "Audio", "zoom.us", "Zoom Meeting", "Sure, I'll update the SOP in Notion after this call.");
add("09:12", "UI", "zoom.us", "Zoom Meeting - Ops standup", "Ops standup · 6 participants · Recording off");
add("09:16", "UI", "Notion", "Vendor onboarding SOP - Notion",
  "Step 3: Collect W-9 and banking form. Step 4: Create vendor in ERP. Step 5: Two-person approval.");
add("09:22", "UI", "Notion", "Vendor onboarding SOP - Notion", "Added: Brightline Freight requires a signed rate card before step 4.");
chrome("09:28", "Vendors - Northstar ERP", "https://erp.northstar-ops.example/vendors",
  "Vendors · 214 active · Search: Brightline");
chrome("09:31", "Brightline Freight - Vendor - Northstar ERP", "https://erp.northstar-ops.example/vendors/V-1182",
  "Vendor V-1182 Brightline Freight · Terms Net 30 · Contact: ops@brightline-freight.example");
add("09:37", "UI", "Slack", "DM Maya Chen - Northstar", "maya: did Brightline send the rate card? jordan: yes, attaching now.");

// Repeated tracker / ERP work through the morning (routine automation candidates).
const morningSlots = ["09:45", "09:58", "10:06", "10:14", "10:22", "10:31", "10:47", "10:55"];
morningSlots.forEach((t, i) => {
  if (i % 2 === 0) {
    chrome(t, "AP tracker Q4 - Google Sheets", "https://docs.google.com/spreadsheets/d/1ApTracker",
      `Row ${40 + i}: INV-${2290 + i} | Pending review | JR`);
  } else {
    chrome(t, `INV-${2290 + i} - Invoice - Northstar ERP`, `https://erp.northstar-ops.example/invoices/INV-${2290 + i}`,
      `Invoice INV-${2290 + i} · Status: Pending · Cost center 44${10 + i}`);
  }
});
chrome("10:40", "Business banking - Chase", "https://business.chase.com/payments/ach",
  "Northstar Operations business account · ACH batch 10/20 scheduled · 14 payments");
add("11:03", "UI", "Visual Studio Code", "reconcile.py - ops-scripts",
  "def reconcile(rows):\n    total = sum(r.amount for r in rows)\n    print(f\"${total}\")  # format check");
add("11:09", "UI", "Visual Studio Code", "reconcile.py - ops-scripts", "for row in ap_rows: match_invoice(row, erp_index)");
add("11:14", "UI", "iTerm2", "ops-scripts - zsh", "$ python reconcile.py --day 2026-10-20\nmatched 212 / 214 rows, 2 unmatched");
chrome("11:20", "Security settings - Northstar Admin", "https://admin.northstar-ops.example/settings/security",
  "Account security\nUsername: jrivera\n[AXSecureTextField] Password: Tr0ub4dor-demo-2026\nSave changes",
  { sensitivity: "credential", sensitive_text: "Tr0ub4dor-demo-2026", note: "Password typed into a settings form, readable via the a11y tree" });
add("11:26", "UI", "Slack", "#finance - Northstar", "jordan: reconcile run shows 2 unmatched rows, investigating INV-2291 and INV-2293.");
chrome("11:34", "INV-2291 - Invoice - Northstar ERP", "https://erp.northstar-ops.example/invoices/INV-2291",
  "Invoice INV-2291 · Brightline Freight · Status: Unmatched · PO missing");
add("11:41", "UI", "Linear", "OPS-418 Unmatched invoices - Linear", "OPS-418 Investigate 2 unmatched AP rows · Assigned: Jordan Rivera");
chrome("11:50", "Workspace admin - Google Workspace", "https://workspace.google.com/dashboard",
  "Northstar Operations · 48 users · Shared drives: Finance, Ops");

// ---- Lunch: personal traps --------------------------------------------------------------
chrome("12:15", "Accounts - Wells Fargo (Incognito)", "https://connect.secure.wellsfargo.com/accounts",
  "Checking ...4417  Available balance  Transfer  Pay bills",
  { incognito: true, sensitivity: "financial", note: "Personal bank in an incognito tab (see #6198)" });
chrome("12:20", "Chase Online - Accounts", "https://online.chase.com/dashboard",
  "Total checking ...2209 · Credit card ...8831 · Statements",
  { sensitivity: "financial", note: "Personal banking on a chase.com subdomain" });
chrome("12:22", "Chase - Secure message center", "https://secure.chase.com/web/auth/messages",
  "Secure messages: Your dispute claim has been updated.",
  { sensitivity: "financial", note: "Personal banking, second chase.com subdomain" });
add("12:30", "UI", "WhatsApp", "WhatsApp - Mom", "Mom: are you coming Sunday? Me: yes, bringing the pie.",
  { sensitivity: "personal", note: "Personal family chat" });
chrome("12:40", "r/personalfinance - Reddit", "https://www.reddit.com/r/personalfinance/",
  "Should I refinance at 6.1%? 312 comments",
  { sensitivity: "personal", note: "Personal browsing at lunch" });
chrome("13:05", "Inbox - jordan.rivera.home@gmail.com - Gmail", "https://mail.google.com/mail/u/1/#inbox",
  "Your lab results are ready · Landlord: lease renewal · Flight confirmation",
  { sensitivity: "personal", note: "Personal Gmail on the same mail.google.com host as work mail" });

// ---- Afternoon: deep work ---------------------------------------------------------------
add("13:20", "UI", "Slack", "#ops-standup - Northstar", "jordan: back. Picking up OPS-418.");
const afternoonSlots = ["13:28", "13:36", "13:44", "13:52", "14:00", "14:08", "14:16", "14:24"];
afternoonSlots.forEach((t, i) => {
  const k = i % 4;
  if (k === 0) chrome(t, "AP tracker Q4 - Google Sheets", "https://docs.google.com/spreadsheets/d/1ApTracker", `Row ${60 + i}: INV-${2300 + i} | Matched | JR`);
  else if (k === 1) chrome(t, `INV-${2300 + i} - Invoice - Northstar ERP`, `https://erp.northstar-ops.example/invoices/INV-${2300 + i}`, `Invoice INV-${2300 + i} · Matched to PO-77${i}`);
  else if (k === 2) add(t, "UI", "Slack", "#finance - Northstar", `jordan: INV-${2300 + i - 2} matched, moving on.`);
  else add(t, "OCR", "Microsoft Excel", "accruals_oct.xlsx", `Accrual line ${i}: freight · cost center 4410 · reviewed`);
});
add("14:30", "UI", "iTerm2", "ops-scripts - zsh",
  "$ export OPENAI_API_KEY=sk-proj-FAKEdemoKEY0000northstar1234\n$ python summarize_vendors.py",
  { sensitivity: "secret", sensitive_text: "sk-proj-FAKEdemoKEY0000northstar1234", note: "API key pasted in a terminal (fictional)" });
add("14:36", "UI", "iTerm2", "ops-scripts - zsh", "summarized 214 vendors -> vendor_summary.md");
add("14:42", "UI", "Notion", "Vendor summary - Notion", "Top 10 vendors by spend, 3 with expiring contracts in Q1.");
chrome("14:50", "Brightline rate card.pdf - Google Drive", "https://drive.google.com/file/d/1RateCard",
  "Brightline Freight rate card 2026 · LTL per cwt · fuel surcharge table");
add("14:58", "UI", "Slack", "DM Priya Shah - Northstar", "priya: call me at (415) 555-0134 if the rate card has issues. jordan: will do.");
add("15:04", "UI", "Linear", "OPS-412 Migrate vendor master - Linear", "OPS-412 progress 70% · 150 of 214 vendors migrated");
add("15:30", "Audio", "Microsoft Teams", "HR 1:1", "I wanted to talk about the leave request and the accommodation paperwork.",
  { sensitivity: "personal", note: "Confidential HR 1:1 audio" });
add("15:34", "Audio", "Microsoft Teams", "HR 1:1", "Everything you share here stays between us and the benefits team.",
  { sensitivity: "personal", note: "Confidential HR 1:1 audio" });
add("15:50", "UI", "Slack", "#finance - Northstar", "maya: accruals reviewed, thanks. jordan: sending invoices for approval next.");
chrome("16:10", "INV-2311 - Invoice - Northstar ERP", "https://erp.northstar-ops.example/invoices/INV-2311",
  "Invoice INV-2311 · Harbor Analytics · Consulting retainer · Total due $4,900.00 · Net 30",
  { sensitivity: "financial", sensitive_text: "$4,900.00", note: "Confidential contract amount (only financial_amount catches it)" });
chrome("16:16", "Approvals - Northstar ERP", "https://erp.northstar-ops.example/approvals", "3 invoices waiting for two-person approval");

const lateSlots = ["16:22", "16:30", "16:38", "16:46", "16:54", "17:02", "17:10"];
lateSlots.forEach((t, i) => {
  if (i % 3 === 0) add(t, "UI", "Notion", "Month-end checklist - Notion", `Checklist item ${i + 1} done: ${["accruals", "AP cutoff", "vendor sync"][i % 3]}`);
  else if (i % 3 === 1) chrome(t, "AP tracker Q4 - Google Sheets", "https://docs.google.com/spreadsheets/d/1ApTracker", `Summary: ${200 + i} matched, ${2 - (i % 2)} open`);
  else add(t, "UI", "Linear", "Ops board - Linear", `OPS-${420 + i} created: automate AP row matching`);
});
add("17:20", "UI", "Microsoft Remote Desktop", "Remote Desktop - payroll-vm",
  "PAYROLL RUN 10/31 · Employee  Gross  Net · A. Lee 6,120.00 · B. Okafor 7,480.00",
  { sensitivity: "financial", note: "Payroll VM over RDP, window filters are often bypassed here (see #4508)" });
add("17:30", "UI", "Slack", "#finance - Northstar", "jordan: logging off soon, OPS-418 resolved.");
add("17:42", "UI", "Linear", "OPS-418 Unmatched invoices - Linear", "OPS-418 · Done");
chrome("17:50", "Inbox - jordan@northstar-ops.example - Northstar Mail", "https://mail.google.com/mail/u/0/#inbox", "Sent: AP batch summary for Oct 20");

// ---- After hours ------------------------------------------------------------------------
chrome("19:10", "Lo-fi beats - YouTube", "https://www.youtube.com/watch?v=demo",
  "lofi hip hop radio · beats to relax to", { sensitivity: "personal", note: "Personal browsing after work hours" });
chrome("19:25", "Your orders - Amazon", "https://www.amazon.com/gp/your-account/order-history",
  "Order #112-555 · Delivered · Running shoes", { sensitivity: "personal", note: "Personal shopping after work hours" });

// ---- Background filler: ambient UI frames across the workday -----------------------------
const filler: [string, string, string][] = [
  ["Slack", "#random - Northstar", "lunch spot recs?"],
  ["Finder", "Downloads", "rate_card_v2.pdf · W9_brightline.pdf"],
  ["Calendar", "Tuesday, October 20", "09:00 Ops standup · 15:30 1:1 · 16:30 Close review"],
  ["Notion", "Team wiki - Notion", "Ops team rituals and owners"],
  ["Linear", "My issues - Linear", "4 in progress · 2 in review"],
  ["Microsoft Excel", "accruals_oct.xlsx", "Freight accruals subtotal reviewed"],
];
const fillerTimes: string[] = [];
for (let m = 8 * 60 + 33; m < 17 * 60 + 58; m += 11) fillerTimes.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:30`);
fillerTimes.forEach((t, i) => {
  const [app, win, text] = filler[i % filler.length];
  add(t, i % 4 === 0 ? "OCR" : "UI", app, win, text);
});

export const sampleDay: CaptureEvent[] = raw
  .map((e, i) => ({ ...e, _i: i }))
  .sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a._i - b._i)
  .map(({ _i, ...e }, i) => ({ ...e, id: `evt-${String(i + 1).padStart(3, "0")}` }));
