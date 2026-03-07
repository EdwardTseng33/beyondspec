/**
 * ============================================
 * Beyond Spec 自動回信系統
 * ============================================
 *
 * 功能：Google Form 提交後自動寄送感謝信 + 預約連結
 *
 * 設定步驟：
 * 1. 在 Google Sheets（表單回覆的那個）打開 Extensions > Apps Script
 * 2. 貼上這段程式碼
 * 3. 執行一次 setup() 函式來建立觸發器
 * 4. 授權 Gmail 權限
 */

// ========== 設定區（請根據實際情況修改）==========

const CONFIG = {
  // 你的品牌名
  brandName: '規格外工作室 Beyond Spec',

  // 你的 email
  senderName: 'Edward from Beyond Spec',

  // Google Calendar 預約連結（替換成你的）
  bookingUrl: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ1234567890',

  // 表單欄位名稱（必須與 Google Form 欄位名稱完全一致）
  fields: {
    name: '您的姓名',
    company: '公司 / 團隊名稱',
    role: '您的角色',
    email: 'Email',
    need: '目前最需要協助的是？',
    budget: '預算範圍',
    detail: '簡單描述您的需求（選填）',
    contact: '偏好聯繫方式'
  }
};

// ========== 自動回信主程式 ==========

function onFormSubmit(e) {
  try {
    const responses = e.namedValues;

    const name = responses[CONFIG.fields.name]?.[0] || '朋友';
    const company = responses[CONFIG.fields.company]?.[0] || '';
    const email = responses[CONFIG.fields.email]?.[0];
    const need = responses[CONFIG.fields.need]?.[0] || '';
    const detail = responses[CONFIG.fields.detail]?.[0] || '';

    if (!email) {
      Logger.log('錯誤：沒有 email，無法回信');
      return;
    }

    // 發送自動回信
    const subject = `${name} 你好！收到你的洽詢了 — ${CONFIG.brandName}`;
    const htmlBody = generateEmailHtml(name, company, need, detail);

    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      name: CONFIG.senderName
    });

    // 記錄到 Sheet（在最後一欄標記已回信）
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const lastRow = sheet.getLastRow();
    const statusCol = sheet.getLastColumn() + 1;

    // 確保有「自動回信狀態」欄位
    if (sheet.getRange(1, statusCol).getValue() !== '自動回信狀態') {
      // 找到或建立狀態欄
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const existingCol = headers.indexOf('自動回信狀態');
      if (existingCol === -1) {
        sheet.getRange(1, statusCol).setValue('自動回信狀態');
        sheet.getRange(lastRow, statusCol).setValue('✅ 已回信 ' + new Date().toLocaleString('zh-TW'));
      } else {
        sheet.getRange(lastRow, existingCol + 1).setValue('✅ 已回信 ' + new Date().toLocaleString('zh-TW'));
      }
    }

    Logger.log(`成功回信給 ${name} (${email})`);

  } catch (error) {
    Logger.log('自動回信錯誤：' + error.toString());
  }
}

// ========== Email HTML 模板 ==========

function generateEmailHtml(name, company, need, detail) {
  const companyLine = company ? `<p style="color:#666;font-size:14px;">公司：${company}</p>` : '';
  const needLine = need ? `<p style="color:#666;font-size:14px;">需求方向：${need}</p>` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC','Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

    <!-- Header -->
    <div style="background:#1a1a2e;padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.02em;">
        規格外工作室 <span style="font-weight:300;opacity:.5;margin:0 8px;">/</span>
        <span style="font-family:monospace;font-size:14px;font-weight:500;opacity:.6;letter-spacing:.08em;">BEYOND SPEC</span>
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h2 style="margin:0 0 24px;color:#1a1a2e;font-size:22px;font-weight:700;">
        ${name}，你好！
      </h2>

      <p style="color:#333;font-size:15px;line-height:1.8;margin:0 0 16px;">
        感謝你對 Beyond Spec 的信任。我們已經收到你的洽詢：
      </p>

      <div style="background:#f8f8fc;border-radius:8px;padding:20px;margin:24px 0;">
        ${companyLine}
        ${needLine}
        ${detail ? `<p style="color:#666;font-size:14px;">補充說明：${detail}</p>` : ''}
      </div>

      <p style="color:#333;font-size:15px;line-height:1.8;margin:0 0 8px;">
        接下來，我想邀請你安排一場 <strong>30 分鐘的免費探索會議</strong>。
      </p>
      <p style="color:#333;font-size:15px;line-height:1.8;margin:0 0 24px;">
        我們會聊聊你的產品方向，不推銷、沒合作也帶走具體建議。
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${CONFIG.bookingUrl}"
           style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:100px;font-size:15px;font-weight:600;letter-spacing:.02em;">
          立刻預約時間 →
        </a>
      </div>

      <p style="color:#999;font-size:13px;line-height:1.6;margin:24px 0 0;text-align:center;">
        或直接回覆這封信，我通常在 24 小時內回覆。
      </p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #eee;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">
        規格外工作室 Beyond Spec — 3 週，想法變規格。
      </p>
      <p style="margin:8px 0 0;color:#bbb;font-size:11px;">
        edwardt0303@gmail.com
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ========== 初始設定（執行一次即可）==========

function setup() {
  // 移除舊觸發器
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 建立新觸發器：表單提交時觸發
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();

  Logger.log('✅ 觸發器設定完成！表單提交時會自動寄信。');
}

// ========== 測試用 ==========

function testEmail() {
  const testData = {
    namedValues: {
      '您的姓名': ['測試用戶'],
      '公司 / 團隊名稱': ['測試公司'],
      '您的角色': ['PM'],
      'Email': ['edwardt0303@gmail.com'],  // 改成你要測試的 email
      '目前最需要協助的是？': ['0→1 產品規劃'],
      '預算範圍': ['NT$ 15-30 萬'],
      '簡單描述您的需求（選填）': ['我想做一個教育類 App'],
      '偏好聯繫方式': ['Email']
    }
  };

  onFormSubmit(testData);
  Logger.log('測試信已發送，請檢查信箱。');
}
