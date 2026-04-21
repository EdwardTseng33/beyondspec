# BeyondPath 設計參考 · Maze.co DNA 拆解

> **版本**：v1 · 2026-04-21 · 荒野女巫（Creative Director）
> **狀態**：Chrome MCP 部分實測（Maze 首頁首屏截圖 1 張成功）＋ Opus 4.7 知識庫 ＋ BeyondPath 既有 CSS token 實讀
> **證據標註**：🟢 實測截圖 / 🟡 知識庫推斷 / 🔵 BeyondPath 實測

---

## 〇、研究說明（誠實披露）

Chrome MCP 在 Maze 頁面進入 `document_idle` 卡住（Maze 有持續性 async JS — Lottie / Intercom / Segment），截圖工具第 2 次 navigate 起無法回應。本報告混用三種證據：

1. 🟢 Maze 首頁首屏截圖（唯一一張成功，1400×863 jpeg）
2. 🟡 Opus 4.7 知識庫對 maze.co 的認知（Figma community / Awwwards 2025-Q1 前）
3. 🔵 BeyondPath 自身 CSS token 實讀

所有 hex / px 數字標註來源強度。**若日後 Chrome MCP 恢復，建議補實測 pricing / features 子頁校正**。

---

## 一、Maze 設計 DNA（A-G）

### A. Color 系統

**Maze palette（推估封閉 7 色）**

| Token | Hex approx | 語義 | 證據 |
|-------|-----------|------|------|
| `maze-ink` | `#0A0A0A` / `#111` | nav / CTA / H1 | 🟢 首頁 nav "Contact sales" 實心黑 |
| `maze-cream` | `#F8F5EF` / `#FAF7F0` 暖米白 | body 底 | 🟢 首頁 body 暖米黃底 |
| `maze-coral` | `#FF5A48` / `#F25C54` | 品牌 accent | 🟡 Maze 2024 rebrand 後沿用 |
| `maze-sage` | `#C8D5B9` / `#B8CCA3` | 次要 accent | 🟡 research templates 卡片 |
| `maze-butter` | `#F4D58D` / `#EFC873` | 次要 accent / chip | 🟡 pricing / solutions 頁 |
| `maze-slate` | `#6B6B6B` / `#555` | body secondary | 🟢 nav link 淡灰 |
| `maze-border` | `#E8E4DD` | hairline | 🟡 card 分隔 |

**Maze palette 策略**：暖中性打底 + 1 強色 accent + 2 柔和副版。反冷藍/冷紫——走暖調跟 B2B SaaS 冷感拉開距離。**無 dark mode**——堅持暖米白為品牌 DNA。

**🔵 BeyondPath 對照**：封閉五色（#7C5CFC 冷紫 + teal/gold/rose/slate）—— 工具型「操作類」SaaS。Maze 是敘事型「內容類」SaaS。**兩種定位，工具頁的冷紫封閉五色不該動**。

---

### B. Typography 系統

**Maze 字體系統（推估）**

| 層級 | 字體 | 字重 | 字級 |
|------|------|------|------|
| Display H1 | Serif（`GT Super` / 自訂）| 400-500 | 72-96px clamp |
| H2 section | serif 或 display sans | 500 | 48-56px |
| H3 card | Sans | 600-700 | 22-24px |
| Body | Sans（`Inter` / `GT Walsheim`）| 400 | 16-17px |
| Nav link | Sans | 500 | 13-14px |
| Eyebrow | Sans all-caps + tracking 寬 | 600 | 11-12px |

**Maze 排版三原則**：
1. 大尺寸 display serif 當「品牌話語權」
2. serif 只用在 H1/H2 / 極少引言 — body/nav/button 全 sans
3. uppercase eyebrow 帶寬 tracking（`letter-spacing: 0.6-1.2px`）

**🔵 BeyondPath 對照**：字階上限 22px — **工具型密度優先正確**。但 landing / 問卷結果 / 市場報告屬儀式敘事型，應擴充 display tier。中文字體缺 Noto Serif TC fallback。

---

### C. Layout & Spacing

**Maze 估計**：max-width 1200-1280px、gutter 48-64px、section 96-128px、spacing 8/16/24/32/48/64/96/128。

**🔵 BeyondPath 對照**：`--space-7:48px` 上限—對工具頁夠，**敘事頁不夠**。需擴 72/96/128 作 section separator。

---

### D. Motion & Interaction

**Maze 互動特色**：
1. scroll reveal **非常克制**（只對 section headline + 主圖）
2. **no parallax**
3. **hover = subtle shadow + 2px lift**（不做 glow / neon）
4. cursor 尊重 OS 預設

**🔵 BeyondPath 對照**：motion token 齊全（80-400ms 區間一致）。**問題在「實際使用紀律」**——landing 有 4 個無限動畫（shimmer/pulse/badge/btn-shimmer），分散焦點，要降噪。

---

### E. Component Patterns

**Button — Maze 只做實心黑 CTA（不用 coral）**，品牌色只當裝飾。**BeyondPath 工具型不學**（紫色 CTA 是功能辨識），但 landing hero 可考慮實心黑儀式感。

**Card — Maze 用 border 不用 shadow**：hairline `#E8E4DD`、radius 16-20px、padding 32-40px。Hover 只變 border color + 1-2px translateY。

**🔵 BeyondPath 對照**：`.ai-feat-card:hover` 做 purple shadow glow—工具頁 OK，敘事卡太「工具感」。**需新增 `.card-editorial` variant**：border 加深 hover，不做 shadow glow。

**Form input — Maze 底線式（border-bottom）**，focus 底線加粗換 coral。工具型方框式仍對；只限 editorial 區塊用底線。

**Hero — 大尺寸 serif H1（clamp 48-96px）+ sub + 2 CTA 橫排 + lo-fi product screenshot**。BeyondPath landing H1 目前 font-weight:900 + 紫色 gradient text + 無限動畫——**活力引擎感 vs Maze 雜誌手作感，兩種品牌語言**。

---

### F. Illustration & Imagery

**Maze 視覺配圖策略**：
1. 手繪感 flat illustration（非 3D）
2. 人物照片 **duotone 處理**（暖米白/墨黑 2 色化）
3. Product screenshot 刻意 lo-fi（簡化線稿非寫實 UI）
4. 大量留白當「配圖」

**🔵 BeyondPath 現況**：只有 CSS 漸層 orb + dot-grid。**差距巨大**，需設計資產投入（下輪）。

---

### G. Density & Rhythm

Maze **明顯稀疏** — 每個 section 只 1 個訊息（headline + 段落 + visual + CTA），整頁 scroll 長、節奏緩。

**🔵 BeyondPath**：landing 4 column grid 比 Maze 密。工具頁該密；**landing 可學 Maze 節奏**，每個 scroll section 只 1 個重點。

---

## 二、BeyondPath vs Maze 三分法

### ✅ 已做到的

1. 首頁 warm-serif + 琥珀 DNA（Georgia italic + `#D4712A` / `#3D2E1A`）—— 方向對
2. `--space` / `--motion` / `--shadow` token 已齊全
3. 封閉 5 色 palette（與 Maze 封閉 7 色同哲學）
4. Landing `reveal` stagger 系統（與 Maze scroll reveal 同思路）
5. Card 用 hairline border 不用重 shadow（對）

### ❌ 還差的

1. **沒有 display 字階**（最大 22px，儀式頁撐不起雜誌感）→ 擴 `--text-display-lg: 48px` / `--text-display-md: 36px`
2. **沒有 section-scale spacing**（最大 48px）→ 擴 `--space-8: 72px` / `--space-9: 96px` / `--space-10: 128px`
3. **Landing H1 紫色 gradient + 無限動畫**（分散焦點）→ H1 改實色，gradient 保留 hover；動畫 one-shot
4. **中文 serif fallback 缺**（`Georgia italic` 中文 fallback 到系統 sans）→ `font-family: Georgia, 'Noto Serif TC', serif`
5. **Card hover purple glow 在敘事區太工具感** → `.card-editorial` variant：只變 border
6. **無 editorial 底線式 form input** → `.input-editorial`
7. **Landing 無 illustration / 無人物感** → 下輪素材投資

### 🚫 不該學的

1. 實心黑 CTA（BeyondPath 紫色 CTA 是品牌資產）
2. Maze 無 dark mode（工程師晚上要用）
3. Maze coral 強色（BeyondPath 封閉五色憲法級）
4. 極度稀疏 section（工具頁密度優先）
5. 無限動畫裝飾（再更克制）
6. 底線式 form（限 editorial，工具頁方框）

---

## 三、具體 Action 清單

### Action 1：擴充 Display 字階 token

```css
/* 新增 display 字階 — 僅限 landing / 問卷結果 / 市場報告 / 年度回顧等儀式型頁面 */
--text-display-xl: 72px;
--text-display-lg: 48px;
--text-display-md: 36px;
--text-display-sm: 28px;

/* 新增 section-scale spacing */
--space-8: 72px;
--space-9: 96px;
--space-10: 128px;

/* 新增中文 serif fallback */
--font-serif: Georgia, 'Noto Serif TC', 'Source Han Serif TC', serif;
--font-sans: 'Inter', 'Noto Sans TC', -apple-system, system-ui, sans-serif;
```

### Action 2：新增 `.card-editorial` variant

```css
.card-editorial{
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius:var(--r-lg);
  padding:var(--space-6) var(--space-5);
  box-shadow:none;
  transition:border-color var(--motion-normal) var(--ease-out),
             transform var(--motion-normal) var(--ease-out);
}
.card-editorial:hover{
  border-color:var(--ink);
  transform:translateY(-2px);
}
```

### Action 3：Landing Hero 動畫降噪

```css
/* 改為：入場 one-shot 或 prefers-reduced-motion 尊重 */
.hero h1 .line-gradient{ animation:gradient-text 4s ease 1; }
@media (prefers-reduced-motion: reduce){
  .hero h1 .line-gradient,
  .hero::before,
  .hero-badge .badge-dot,
  .btn-login::after{ animation:none }
}
```

### Action 4：`.input-editorial` 底線式

```css
.input-editorial{
  border:none;
  border-bottom:1px solid var(--border);
  border-radius:0;
  padding:var(--space-3) 0;
  background:transparent;
}
.input-editorial:focus{
  outline:none;
  border-bottom-width:2px;
  border-bottom-color:var(--ink);
}
```

### Action 5：Section separator 規範化

```css
.l-section{ padding:var(--space-9) var(--space-6); }
.l-section.spacious{ padding:var(--space-10) var(--space-6); }
.l-section + .l-section{ border-top:none; }
```

---

## 四、下一輪重修 · 3 個設計優先級

### 🥇 P1：擴充 Typography + Spacing token（Action 1）

**為什麼第一**：所有後續設計的底層依賴。純 CSS 變數，動工成本最低、影響最廣。
**執行粒度**：1 次 `:root` 編輯 + 更新 CLAUDE.md 設計規範。

### 🥈 P2：Landing 降噪 + `.card-editorial`（Action 2+3）

**為什麼第二**：Landing 第一印象；4 個無限動畫削弱「可信任」感受；`.card-editorial` 為敘事頁準備。
**執行粒度**：Landing CSS 約 15 行 + 新增 card variant 約 12 行。

### 🥉 P3：中文 Serif Fallback + `.input-editorial`（Action 1 下半 + Action 4）

**為什麼第三**：`Georgia italic` 中文 fallback 不精緻；`.input-editorial` 為問卷結果 / 訂閱頁儀式感元件。
**執行粒度**：加 Noto Serif TC Google Font + `.welcome-banner` 改用 `var(--font-serif)` + 新增 `.input-editorial`。

---

## 五、結語

1. **Chrome MCP 在 Maze 實測失敗** —— 建議日後手動補 pricing / features / research-templates 子頁實測
2. **100% 不動憲法規則**：封閉五色 / 工具頁 sans + 方框 form / 首頁 warm-serif DNA / `.page-title-area` 規範
3. **只新增敘事型頁面的設計 token**，為問卷結果 / 市場探測 / 戰情室 UIUX 做底層準備
4. **Action 1 可今晚直接上**（純 token 擴充、零風險）；Action 2/3 等戰情室或問卷結果頁動工時一起做

*— 荒野女巫，2026-04-21 · Opus 4.7 深度推理 + 混合證據*
