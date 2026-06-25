/**
 * BeyondSpec × 綠界 — 資料層介面 + 記憶體 mock（Firestore 邊界）
 * ------------------------------------------------------------------
 * 為什麼有這支：
 *   webhook 解鎖 / cancel / 收據都要「寫 Firestore」。但本批【不接真 Firebase】
 *   （真金鑰 / 服務帳號留 Edward）。所以把所有資料存取收斂成一個 interface，
 *   單元測試用 InMemoryStore 跑（可驗 idempotent / 解鎖 / 收據落點），
 *   真上線時 Worker 再注入一個「FirestoreStore」實作（REST / Admin SDK）即可，
 *   webhook / cancel / receipt 邏輯【一行不用改】。
 *
 * 沙利曼 spec 對應：
 *   - A3：billing 權威狀態在 Firestore，只由 Worker 寫（本介面就是那個寫入點）。
 *   - 紅線 3：財會憑證（receipts / transactions）獨立 collection + legalRetention，
 *           與產品資料分離 → 本 store 把它們放在不同 path 並標記。
 *   - idempotent（§2.3）：processedWebhooks 一張表，webhook 用它防重放。
 *
 * 資料路徑約定（對齊沙利曼 spec / 技術計畫 Step5）：
 *   users/{uid}/billing/state                       ← 訂閱權威狀態（單一 doc）
 *   users/{uid}/billing/receipts/{receiptNo}        ← 收據（legalRetention）
 *   users/{uid}/billing/transactions/{tradeNo}      ← 交易紀錄（legalRetention）
 *   processedWebhooks/{idempotencyKey}              ← 已處理通知（防重放）
 *
 * 介面（任何實作都要提供這些 method，全 async）：
 *   getBilling(uid)                         → 訂閱狀態 doc | null
 *   setBilling(uid, data)                   → 覆寫/合併訂閱狀態（merge）
 *   getProcessedWebhook(key)                → 已處理紀錄 | null
 *   markProcessedWebhook(key, meta)         → 記一筆已處理（idempotent 用）
 *   saveReceipt(uid, receiptNo, data)       → 寫收據（獨立 collection）
 *   getReceipt(uid, receiptNo)              → 收據 | null
 *   saveTransaction(uid, tradeNo, data)     → 寫交易紀錄
 *
 * 執行環境：Worker（現代 JS）。前端不引用本檔。
 */

'use strict';

/**
 * 抽象基底——只是把「該有哪些 method」寫清楚 + 預設丟 not implemented。
 * 真實 FirestoreStore（Worker 端，留 Edward 接服務金鑰）會繼承並實作這些。
 */
class BillingStore {
  /* eslint-disable no-unused-vars */
  async getBilling(uid) { throw new Error('not implemented'); }
  async setBilling(uid, data) { throw new Error('not implemented'); }
  async getProcessedWebhook(key) { throw new Error('not implemented'); }
  async markProcessedWebhook(key, meta) { throw new Error('not implemented'); }
  async saveReceipt(uid, receiptNo, data) { throw new Error('not implemented'); }
  async getReceipt(uid, receiptNo) { throw new Error('not implemented'); }
  async saveTransaction(uid, tradeNo, data) { throw new Error('not implemented'); }
  /* eslint-enable no-unused-vars */
}

/**
 * 記憶體實作——單元測試 + 本地 dry-run 用。
 * 用巢狀 Map 模擬 Firestore 文件樹；deep-clone 進出，避免測試誤改內部狀態。
 *
 * ⚠️ 這【不是 production store】。production 要換成真 Firestore 寫入
 *    （見 ../WORKER-INTEGRATION.md「FirestoreStore 待 Edward 接」）。
 */
class InMemoryStore extends BillingStore {
  constructor() {
    super();
    this._billing = new Map();          // uid → state object
    this._processed = new Map();        // idempotencyKey → meta
    this._receipts = new Map();         // `${uid}/${receiptNo}` → receipt
    this._transactions = new Map();     // `${uid}/${tradeNo}` → tx
  }

  _clone(o) {
    if (o === null || o === undefined) return o;
    // structuredClone 在 Node ≥ 17 / Worker 都有；保險用 JSON fallback。
    if (typeof structuredClone === 'function') return structuredClone(o);
    return JSON.parse(JSON.stringify(o));
  }

  async getBilling(uid) {
    return this._billing.has(uid) ? this._clone(this._billing.get(uid)) : null;
  }

  /** merge 寫入（模擬 Firestore set({merge:true})）：保留舊欄位、覆寫新欄位。 */
  async setBilling(uid, data) {
    const prev = this._billing.get(uid) || {};
    const next = Object.assign({}, prev, this._clone(data));
    this._billing.set(uid, next);
    return this._clone(next);
  }

  async getProcessedWebhook(key) {
    return this._processed.has(key) ? this._clone(this._processed.get(key)) : null;
  }

  /**
   * 記一筆「已處理」。
   * 回傳 { created:true } 表示這次是新寫入；{ created:false } 表示已存在（重放）。
   * 這個回傳語意讓 webhook 能用「單一原子操作」判 idempotent（見 webhook.js 註）。
   */
  async markProcessedWebhook(key, meta) {
    if (this._processed.has(key)) {
      return { created: false, existing: this._clone(this._processed.get(key)) };
    }
    this._processed.set(key, this._clone(meta || {}));
    return { created: true };
  }

  async saveReceipt(uid, receiptNo, data) {
    const k = uid + '/' + receiptNo;
    const rec = Object.assign({ legalRetention: true }, this._clone(data));
    this._receipts.set(k, rec);
    return this._clone(rec);
  }

  async getReceipt(uid, receiptNo) {
    const k = uid + '/' + receiptNo;
    return this._receipts.has(k) ? this._clone(this._receipts.get(k)) : null;
  }

  async saveTransaction(uid, tradeNo, data) {
    const k = uid + '/' + tradeNo;
    const tx = Object.assign({ legalRetention: true }, this._clone(data));
    this._transactions.set(k, tx);
    return this._clone(tx);
  }

  // —— 測試輔助（非介面的一部分，僅 InMemoryStore 提供）——
  _dump() {
    return {
      billing: Object.fromEntries(this._billing),
      processed: Object.fromEntries(this._processed),
      receipts: Object.fromEntries(this._receipts),
      transactions: Object.fromEntries(this._transactions),
    };
  }
}

const _api = { BillingStore, InMemoryStore };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = _api;
}

export { BillingStore, InMemoryStore };
