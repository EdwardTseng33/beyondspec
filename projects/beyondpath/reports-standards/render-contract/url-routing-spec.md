# 報告 URL Routing 規格（每份報告獨立 URL）

> **建立日期**：2026-04-21
> **依據**：愛德華指令「報告的連結應該也要不同且獨立的，不需要跳轉分頁來看。且確認每一種類型報告都是如此。」
> **層級**：Render Contract Layer 4 · 所有 5 份報告共用

---

## 一、核心原則

**每份報告 = 一個獨立可分享的 URL**。任何人拿到連結點開，應該：
- ✅ 直接看到**完整報告內容**（不是先進 app → 點連結 → 跳 tab → 才出現）
- ✅ 未登入也能看（如果是對外分享版）
- ✅ 可 bookmark、可 forward、可嵌入 email
- ✅ Refresh 不掉內容
- ✅ 複製貼到群組／信件 → 收到的人點 → **直達那份報告**

---

## 二、URL Pattern 規格

### 2.1 5 種報告的 URL 結構

| 報告類型 | URL Pattern | 範例 |
|---------|------------|------|
| **PATH 診斷** | `/path/report/diagnostic/{reportId}` | `/path/report/diagnostic/abc123` |
| **Lab 分析** | `/path/report/lab/{reportId}` | `/path/report/lab/xyz789` |
| **市場探測** | `/path/report/market-signal/{reportId}` | `/path/report/market-signal/def456` |
| **市場報告** | `/path/report/market/{reportId}` | `/path/report/market/ghi012` |
| **AI 問卷** | `/path/report/survey/{reportId}` | `/path/report/survey/jkl345` |

### 2.2 ID 規則
- 格式：12-16 字元 URL-safe（alphanumeric + dash）
- 生成：Firestore auto-ID or `nanoid(12)`
- 不可猜（防止遍歷）：不用流水號

### 2.3 對外分享專用 URL（公開）
當用戶開啟「對外分享」開關：
```
/share/{reportType}/{publicShareId}
```
- `publicShareId` 與內部 `reportId` **不同**（兩層 ID 隔離，內部 ID 不洩露）
- 對外 URL 可設過期（7 天 / 30 天 / 永久）
- 過期後顯示「此分享已過期，請向分享者索取新連結」

---

## 三、路由行為規格

### 3.1 直接打開（未登入訪客）
```
用戶點 /path/report/diagnostic/abc123 的連結
├─ 若此 report 的 shareLevel == 'public' → 直接顯示對外版
├─ 若此 report 的 shareLevel == 'private' → 跳登入頁（登入後自動回此 URL）
└─ 若 reportId 不存在 → 404 頁「報告不存在或已刪除」
```

### 3.2 登入用戶打開
```
用戶已登入 + 打開 /path/report/diagnostic/abc123
├─ 自己的 report → 直接顯示完整版（含對內敏感欄位）
├─ 別人的 report + shareLevel == 'public' → 顯示對外版
├─ 別人的 report + shareLevel == 'private' → 顯示「沒有權限」
└─ reportId 不存在 → 404
```

### 3.3 匿名分享 URL（`/share/{type}/{publicShareId}`）
```
任何人點此 URL
├─ publicShareId 有效且未過期 → 顯示對外版（含浮水印）
├─ publicShareId 過期 → 「此分享已過期」頁
└─ publicShareId 不存在 → 404
```

---

## 四、技術實作規格（SPA Hash Router 升級）

### 4.1 目前現況（v1.3.19 at diagnosis）
- 應用使用 hash-based SPA router：`/path/app/#/diagnostic-list` 等
- 報告開啟方式：進 app → 點模組 → 點 card → `openSavedReport(id)` → 內部 render
- **問題**：report 沒有獨立 URL，refresh 會掉到 list 頁

### 4.2 v1.4+ 目標
**使用 History API + Hash 雙軌**：
- 對內 app：`/path/app/#/report/diagnostic/abc123` → SPA 內部 route
- 對外分享：`/path/share/diagnostic/abc123` → **獨立靜態 HTML shell**，load 專屬 JS 直 render
- 兩者共用同一組 render component（`.report-*` namespace）

### 4.3 部署架構
```
beyondspec.tw/
├─ path/                          (landing 908 行)
│   └─ index.html                 (landing)
├─ path/app/                      (app SPA)
│   └─ index.html                 (app.html 31k 行)
│       └─ Hash router handles /#/report/{type}/{id}
└─ path/share/                    (對外分享靜態頁 · 新增)
    ├─ diagnostic/                
    │   └─ index.html             (輕量 shell · 500 行 · load 對外 render module)
    ├─ lab/
    ├─ market-signal/
    ├─ market/
    └─ survey/
```

---

## 五、Firestore 資料結構

### 5.1 `reports` collection
```yaml
{
  id: "abc123",                    # Firestore auto-ID or nanoid
  type: "diagnostic",              # diagnostic | lab | market-signal | market | survey
  ownerId: "edward-uid",           # 建立者 UID
  createdAt: serverTimestamp,
  updatedAt: serverTimestamp,
  shareLevel: "private",           # private | public
  publicShareId: null,             # 只在 shareLevel=public 時存在
  publicShareExpires: null,        # timestamp or null (永久)
  content: { ... },                # 報告完整 JSON（依 5 種 schema 之一）
  meta: {
    title: "你的 PATH 診斷結果",
    snapshot: { ... },             # 預覽用縮略
    version: "1.0"                 # 規格版本
  }
}
```

### 5.2 Firestore Rules 擴充
```
match /reports/{reportId} {
  // 本人讀寫
  allow read, write: if request.auth.uid == resource.data.ownerId;
  
  // 任何人可讀 public 版本
  allow read: if resource.data.shareLevel == 'public' 
    && (resource.data.publicShareExpires == null 
        || resource.data.publicShareExpires > request.time);
}
```

---

## 六、5 種報告獨立 URL 驗收 checklist（Gate 測試）

每種報告必須全部 ✅：

| 驗收項 | PATH | Lab | 市場探測 | 市場報告 | AI 問卷 |
|-------|:----:|:---:|:------:|:-------:|:-----:|
| 有獨立 URL 可複製 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| URL refresh 不掉內容 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 貼到新瀏覽器可開 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 未登入 + public → 可看對外版 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 未登入 + private → 跳登入頁 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 不存在 ID → 404 頁 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 過期 shareId → 過期提示 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Mobile 375px 直接打開可看 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Bookmark / Email 分享能成功 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| 分享連結含 OG image / title | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**任一項 ⬜ 未打勾 → 不 PASS**

---

## 七、OG Card 規格（分享到社群 / 貼到 Slack 的預覽）

每份報告分享時，URL 若被 crawl 應產生：

```html
<meta property="og:title" content="{report.title}">
<meta property="og:description" content="{report.tldr}">
<meta property="og:image" content="{cloudflare-worker 動態生成 1200x630 預覽圖}">
<meta property="og:url" content="{完整 URL}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
```

**OG image 動態生成**：Cloudflare Worker endpoint `/api/og/{reportId}` → 渲染含 verdict + 3 KPI 的預覽圖。

---

## 八、實作優先級（卡西法工時配置）

| 項目 | 工時 | 優先 |
|------|------|------|
| Firestore `reports` collection schema | 2h | P0 |
| 對內 SPA router `/#/report/{type}/{id}` 支援 | 4h | P0 |
| 對外 static shell `path/share/{type}/index.html` × 5 | 8h | P0 |
| 對外版 renderer（用 `.report-*` namespace）| 6h | P0 |
| PublicShareId 生成 + 過期機制 | 3h | P1 |
| Firestore Rules 擴充（已完成 `applications`，此為新增）| 2h | P0 |
| 分享/複製連結 UI | 3h | P1 |
| OG card 動態生成（Cloudflare Worker）| 6h | P1 |
| 404 頁 + 過期提示頁 | 2h | P1 |
| 5 種報告獨立 URL 驗收測試 | 4h | P0 |

**P0 合計：26h · P1 合計：14h**

---

## 九、憲法對應

- **Edward 指令 v1.3.20+**：每份報告有獨立 URL，可 forward、可 bookmark
- **蕪菁頭 UX rubric G7**：「獨立 shareable URL」是 95 分必備
- **霍爾 content rubric 第十二章 #2**：分享鏈隱私風險 → T 類 5 格（PII 遮蔽 / 浮水印 / 過期）
- **女巫 visual rubric 第九章**：放行條件之一「尾部 CTA trio（分享/儲存/下載）」

---

## 十、對照其他類似產品

| 產品 | URL 模式 | 備註 |
|------|---------|------|
| **Notion** | `notion.so/{workspace}/{pageId}` | 可 public share |
| **Figma** | `figma.com/file/{fileId}/...` | 獨立 URL，權限控制 |
| **Maze** | `app.maze.co/report/{reportId}` | SPA 內部但可分享 |
| **Dovetail** | `dovetailapp.com/p/{projectId}/reports/{reportId}` | 巢狀 URL |
| **BeyondPath（本規範）** | `beyondspec.tw/path/report/{type}/{id}` + `/path/share/{type}/{shareId}` | **雙軌：內部 SPA + 外部靜態 shell** |

---

*v1.0 建立：2026-04-21 · 作者：蘇菲（回應愛德華「獨立 URL」指令）*
*待卡西法 bg agent 回來後可深化技術實作細節*
