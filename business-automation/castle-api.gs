// ══════════════════════════════════════════════════════════════
// 🏰 移動城堡 API — Google Apps Script Backend (Route C)
// Google Sheets as Database + Web App as REST API
//
// 部署方式：
// 1. 建立新的 Google Spreadsheet
// 2. 建立 3 個工作表（sheet）：deals, tasks, leads
// 3. 開啟 Apps Script（擴充功能 → Apps Script）
// 4. 貼上此程式碼
// 5. 部署 → 新增部署 → 網頁應用程式
//    - 執行身份：自己
//    - 存取權限：擁有 Google 帳號的任何人
// 6. 複製部署 URL，貼到 dashboard 的 API_URL 常數
// ══════════════════════════════════════════════════════════════

// ── 設定 ──
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // ← 換成你的試算表 ID

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

// ── 初始化工作表（首次使用時執行一次）──
function initSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Deals sheet
  let deals = ss.getSheetByName("deals");
  if (!deals) {
    deals = ss.insertSheet("deals");
    deals.appendRow(["id", "name", "company", "contact", "email", "stage", "value", "tier", "notes", "role", "created", "signedDate", "archived", "userId"]);
  }

  // Tasks sheet
  let tasks = ss.getSheetByName("tasks");
  if (!tasks) {
    tasks = ss.insertSheet("tasks");
    tasks.appendRow(["id", "text", "status", "priority", "due", "role", "dealId", "archived", "userId"]);
  }

  // Leads sheet
  let leads = ss.getSheetByName("leads");
  if (!leads) {
    leads = ss.insertSheet("leads");
    leads.appendRow(["id", "name", "title", "company", "channel", "status", "notes", "lastTouch", "role", "archived", "userId"]);
  }

  // Users sheet (for multi-tenant)
  let users = ss.getSheetByName("users");
  if (!users) {
    users = ss.insertSheet("users");
    users.appendRow(["email", "name", "picture", "firstLogin", "lastLogin"]);
  }

  Logger.log("✅ 工作表初始化完成！");
}

// ── Helpers ──
function sheetToJSON(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      // Convert "true"/"false" strings to booleans
      if (row[i] === true || row[i] === "true") obj[h] = true;
      else if (row[i] === false || row[i] === "false") obj[h] = false;
      // Convert numeric strings
      else if (h === "value" && !isNaN(row[i])) obj[h] = Number(row[i]);
      else obj[h] = row[i] === "" ? null : row[i];
    });
    return obj;
  });
}

function findRowIndex(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) return i + 1; // 1-indexed for Sheets
  }
  return -1;
}

function jsonResponse(data, status) {
  return ContentService.createTextOutput(JSON.stringify({ ok: status !== "error", data, status: status || "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

// ── CORS: handle preflight ──
function doOptions(e) {
  return jsonResponse("ok");
}

// ── GET handler ──
function doGet(e) {
  try {
    const action = e.parameter.action;
    const userId = e.parameter.userId;

    if (!userId) return jsonResponse("userId required", "error");

    if (action === "ping") {
      return jsonResponse({ message: "🏰 移動城堡 API 運作中", timestamp: new Date().toISOString() });
    }

    if (action === "getAll") {
      const deals = sheetToJSON(getSheet("deals")).filter(d => d.userId === userId);
      const tasks = sheetToJSON(getSheet("tasks")).filter(t => t.userId === userId);
      const leads = sheetToJSON(getSheet("leads")).filter(l => l.userId === userId);
      return jsonResponse({ deals, tasks, leads });
    }

    if (action === "getDeals") {
      const deals = sheetToJSON(getSheet("deals")).filter(d => d.userId === userId);
      return jsonResponse(deals);
    }

    if (action === "getTasks") {
      const tasks = sheetToJSON(getSheet("tasks")).filter(t => t.userId === userId);
      return jsonResponse(tasks);
    }

    if (action === "getLeads") {
      const leads = sheetToJSON(getSheet("leads")).filter(l => l.userId === userId);
      return jsonResponse(leads);
    }

    return jsonResponse("unknown action", "error");
  } catch (err) {
    return jsonResponse(err.message, "error");
  }
}

// ── POST handler ──
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action, userId, data } = payload;

    if (!userId) return jsonResponse("userId required", "error");

    // ── User login tracking ──
    if (action === "login") {
      const usersSheet = getSheet("users");
      const users = sheetToJSON(usersSheet);
      const existing = users.find(u => u.email === data.email);
      if (existing) {
        // Update lastLogin
        const idx = findRowIndex(usersSheet, data.email);
        // email is col 1, lastLogin is col 5
        if (idx > 0) usersSheet.getRange(idx, 5).setValue(new Date().toISOString());
      } else {
        usersSheet.appendRow([data.email, data.name, data.picture, new Date().toISOString(), new Date().toISOString()]);
      }
      return jsonResponse({ message: "logged in" });
    }

    // ── DEALS ──
    if (action === "addDeal") {
      const sheet = getSheet("deals");
      const id = data.id || generateId();
      sheet.appendRow([id, data.name, data.company, data.contact, data.email, data.stage || "inquiry", data.value || 0, data.tier || "Tier 1", data.notes || "", data.role || "howl", data.created || new Date().toISOString().split("T")[0], data.signedDate || "", false, userId]);
      return jsonResponse({ id, message: "deal added" });
    }

    if (action === "updateDeal") {
      const sheet = getSheet("deals");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowIdx = findRowIndex(sheet, data.id);
      if (rowIdx < 0) return jsonResponse("deal not found", "error");

      // Update each field
      headers.forEach((h, i) => {
        if (h !== "id" && h !== "userId" && data[h] !== undefined) {
          sheet.getRange(rowIdx, i + 1).setValue(data[h]);
        }
      });
      return jsonResponse({ message: "deal updated" });
    }

    if (action === "archiveDeal") {
      const sheet = getSheet("deals");
      const rowIdx = findRowIndex(sheet, data.id);
      if (rowIdx < 0) return jsonResponse("deal not found", "error");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const archivedCol = headers.indexOf("archived") + 1;
      sheet.getRange(rowIdx, archivedCol).setValue(true);
      return jsonResponse({ message: "deal archived" });
    }

    // ── TASKS ──
    if (action === "addTask") {
      const sheet = getSheet("tasks");
      const id = data.id || generateId();
      sheet.appendRow([id, data.text, data.status || "todo", data.priority || "medium", data.due || "", data.role || "howl", data.dealId || "", false, userId]);
      return jsonResponse({ id, message: "task added" });
    }

    if (action === "updateTask") {
      const sheet = getSheet("tasks");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowIdx = findRowIndex(sheet, data.id);
      if (rowIdx < 0) return jsonResponse("task not found", "error");
      headers.forEach((h, i) => {
        if (h !== "id" && h !== "userId" && data[h] !== undefined) {
          sheet.getRange(rowIdx, i + 1).setValue(data[h]);
        }
      });
      return jsonResponse({ message: "task updated" });
    }

    if (action === "archiveTask") {
      const sheet = getSheet("tasks");
      const rowIdx = findRowIndex(sheet, data.id);
      if (rowIdx < 0) return jsonResponse("task not found", "error");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const archivedCol = headers.indexOf("archived") + 1;
      sheet.getRange(rowIdx, archivedCol).setValue(true);
      return jsonResponse({ message: "task archived" });
    }

    // ── LEADS ──
    if (action === "addLead") {
      const sheet = getSheet("leads");
      const id = data.id || generateId();
      sheet.appendRow([id, data.name, data.title, data.company, data.channel || "", data.status || "new", data.notes || "", data.lastTouch || new Date().toISOString().split("T")[0], data.role || "howl", false, userId]);
      return jsonResponse({ id, message: "lead added" });
    }

    if (action === "updateLead") {
      const sheet = getSheet("leads");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowIdx = findRowIndex(sheet, data.id);
      if (rowIdx < 0) return jsonResponse("lead not found", "error");
      headers.forEach((h, i) => {
        if (h !== "id" && h !== "userId" && data[h] !== undefined) {
          sheet.getRange(rowIdx, i + 1).setValue(data[h]);
        }
      });
      return jsonResponse({ message: "lead updated" });
    }

    if (action === "archiveLead") {
      const sheet = getSheet("leads");
      const rowIdx = findRowIndex(sheet, data.id);
      if (rowIdx < 0) return jsonResponse("lead not found", "error");
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const archivedCol = headers.indexOf("archived") + 1;
      sheet.getRange(rowIdx, archivedCol).setValue(true);
      return jsonResponse({ message: "lead archived" });
    }

    // ── BULK SYNC (for offline → online merge) ──
    if (action === "syncAll") {
      const { deals, tasks, leads } = data;

      if (deals && deals.length) {
        const sheet = getSheet("deals");
        deals.forEach(d => {
          const rowIdx = findRowIndex(sheet, d.id);
          if (rowIdx < 0) {
            sheet.appendRow([d.id, d.name, d.company, d.contact, d.email, d.stage, d.value, d.tier, d.notes, d.role, d.created, d.signedDate || "", d.archived || false, userId]);
          }
        });
      }

      if (tasks && tasks.length) {
        const sheet = getSheet("tasks");
        tasks.forEach(t => {
          const rowIdx = findRowIndex(sheet, t.id);
          if (rowIdx < 0) {
            sheet.appendRow([t.id, t.text, t.status, t.priority, t.due, t.role, t.dealId || "", t.archived || false, userId]);
          }
        });
      }

      if (leads && leads.length) {
        const sheet = getSheet("leads");
        leads.forEach(l => {
          const rowIdx = findRowIndex(sheet, l.id);
          if (rowIdx < 0) {
            sheet.appendRow([l.id, l.name, l.title, l.company, l.channel, l.status, l.notes, l.lastTouch, l.role, l.archived || false, userId]);
          }
        });
      }

      return jsonResponse({ message: "sync complete" });
    }

    return jsonResponse("unknown action", "error");
  } catch (err) {
    return jsonResponse(err.message, "error");
  }
}
