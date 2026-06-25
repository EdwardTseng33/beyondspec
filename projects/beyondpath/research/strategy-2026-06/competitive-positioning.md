# BeyondSpec 競品全景 · 市場定位 · 產品定位 · 護城河

> **文件性質**：正式策略資產（給創辦人 Edward）
> **作者**：霍爾（CPO / 策略長）
> **日期**：2026-06-20
> **資料新鮮度**：2026-06（競品定價/AI 動態以本月 WebSearch 重抓，非記憶）
> **產品基準**：BeyondSpec v1.11.2（已從 BeyondPath 改名，線上 https://beyondspec.tw/）
> **前置研究（站在肩膀上，未重做）**：
> - `projects/beyondpath/research/competitive-deep-dive.md`（霍爾 2026-04 競品研究）
> - `projects/beyondpath/research/market-deep-dive.md`（蘇菲 2026-04 市場研究）
> - `beyond-spec-ssot-strategy.md`（Edward 舊顧問生意 SSOT，理解「賣服務→賣產品」脈絡）

---

## TL;DR（30 秒版）

到 2026 年中，競爭地形又動了一輪：**所有人都把 AI 從 add-on 收進主方案、開始用 credits 計費（Notion / Attio / ClickUp），AI 不再是差異點，而是入場券。** 真正的戰場移到三個地方：(1) 誰能給「驗證→營運」的**全閉環**而不是又一個單點工具；(2) 誰能在 AI agent 吃掉「賣 seat」的 SaaSpocalypse（2026 上半軟體業市值蒸發約 $2 兆）裡找到**不被 unbundle 的差異化**；(3) 在台灣，誰能真正服務「1-3 人 AI native 小團隊」這個被鼎新（打製造業中型）和 Zoho（美式大雜燴）兩頭都漏掉的縫。

**BeyondSpec 的位置依然清楚，但敘事要升級**：它不是「便宜版 HoneyBook」也不是「中文版 Notion」，它是**華語區唯一一個「驗證到收錢全閉環 + 由 AI native 小團隊高速迭代」的商業引擎**——而且這個「由小團隊用 AI 低成本造、快速更版、敢客製」的開發模式本身，就是定價和護城河的來源。

**最該擔心的不是任何一個競品，是 BeyondSpec 自己也是一個「賣訂閱 seat 的 SaaS」**——而這正是 2026 年 AI agent 正在顛覆的那一類。這個張力必須正面處理（見 §5.6）。

---

## 一、既有研究盤點：哪些還能用、哪些過時

先誠實交代我站在什麼肩膀上，避免重複勞動。

| 既有結論 | 現狀判定 | 處置 |
|---|---|---|
| 「驗證+營運閉環」獨佔競爭地圖右上空白帶 | ✅ 仍成立，且更強（AI 普及後閉環更稀缺） | 沿用，升級敘事 |
| 五大護城河（閉環/在地訊號/Claude 雙軸/中文母語/品牌溫度） | ✅ 骨架對，但要補「AI native 小團隊開發模式」這條 Edward 親述的軸心 | §5 重寫 |
| HoneyBook 漲價真空、Notion AI 綁 $20、Attio MCP | ⚠️ 方向對但數字過時 | §2 用 6 月證據重抓 |
| 競品只點到 Notion/Monday/ClickUp/HoneyBook/Attio/Folk + Awoo/OpView/KEYPO | ❌ **完全沒碰鼎新 ERP / Zoho / 台灣垂直營運 SaaS** | §2.3 補齊（本次最大缺口） |
| 市場 TAM/SAM/SOM 框架（蘇菲） | ✅ 框架可用 | 定價錨點要從 NT$290/890 改成 NT$599/1299，單位經濟重算 |
| 產品叫 BeyondPath、定位「華語區唯一驗證+在地訊號」 | ❌ 已改名 **BeyondSpec**、定位語升級「從驗證到收到錢」 | 全文用新名 |
| 舊 SSOT：「AI 是內部工具，對外不講」 | ❌ 180 度反轉——現在 AI 是核心賣點 | §4 定位敘事處理這個轉向 |

**一句話**：4 月那份的競爭結構判讀沒錯，但 (a) 數字要更新、(b) 台灣本地對手要補、(c) Edward 的「AI native 小團隊開發模式」軸心當時還沒進框架，這次補進來——它其實是整套護城河論述的引擎。

---

## 二、主要競業深度（2026-06 最新證據）

### 競爭圈層結構

```
第 1 圈 · 通用工作平台（你已經用了，難搬家）
  Notion · Monday.com · ClickUp · Zoho One
第 2 圈 · 客戶閉環/clientflow（最接近，但只做客戶確定後）
  HoneyBook · Attio · Folk
第 3 圈 · 台灣本地營運系統（在地信任，但打中型/製造業）
  鼎新 Digiwin · 台灣垂直 SaaS（恆遠/秒站類）
第 4 圈 · 產品驗證工具（次要競業，BeyondSpec 前半段）
  Synthetic Users · Maze · Dovetail · Sprig
```

BeyondSpec 的怪異之處（也是它的機會）：**它同時站在這四圈的交集**，但每一圈裡的對手都只佔一塊。沒有任何一個對手同時做「驗證 + 全營運閉環 + 台灣在地 + AI native」。

---

### 第 1 圈：通用工作平台

#### 2.1 Notion + Notion AI

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | "Your connected workspace, now with agents"——從文件工具進化成 AI agent 平台 |
| 核心功能 | 文件/Wiki/資料庫/專案，無報價、無收款、無 CRM 閉環、無產品驗證 |
| 最新 AI 能力 | Notion Agent、AI Meeting Notes、Enterprise Search 全綁進 Business + Enterprise；**Custom Agents 2026-05-04 起改 credits 計費，$10 / 1,000 credits、按工作區池化、不滾存** |
| 定價 | Free / Plus $10 / **Business $15-20**（AI 全綁此層）/ Enterprise |
| 目標客群 | Solo 到大企業，超廣 |
| 優勢 | 生態系、模板海、極高彈性、「給你積木自己蓋」 |
| 罩門 | (1) 對 1-3 人團隊太空——要自己搭，學習曲線陡 (2) **credits 計費讓成本不可預測**，小團隊最怕的就是「這個月 AI 帳單多少不知道」 (3) 沒有營運閉環，報價/收款/算薪都要外接 (4) 中文是介面翻譯不是母語設計 |
| 對台灣小團隊適配度 | **中低**——能用但要大量自搭，且 AI credits 對價格敏感的台灣小團隊是心理障礙 |
| BeyondSpec 怎麼贏 | 我們給「開箱即用的閉環」對上「積木 + 不可預測帳單」。話術：「Notion 給你材料，BeyondSpec 直接給你跑好的生意。」 |

> **關鍵信號（更新）**：4 月以為 Notion 把 Business 鎖 $20，6 月發現它其實**把價格壓到 $15 但改用 credits 計費**——這對小團隊更不友善，因為「池化、不滾存、用多少算多少」正是價格敏感客群最焦慮的計費方式。BeyondSpec 的「一個人駕馭整套、不限人數、固定月費」反而是反向賣點。

來源：[Notion AI Pricing 2026 - costbench](https://costbench.com/software/ai-productivity/notion-ai/) · [Notion Complete Guide 2026](https://smartproductivitytools.com/notion-complete-guide/)

#### 2.2 Monday.com

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | Work OS / AI Work Platform |
| 定價 | Basic $9/seat → Pro $19/seat（年繳），**3 seat 起跳**，AI 是 add-on |
| 最新 AI 能力 | AI 以 add-on 形式掛在各方案上，非原生內建 |
| 優勢 | 視覺化專案管理成熟、自動化強 |
| 罩門 | 重、3 seat 起跳對單人不友善、AI 要另外加錢、無驗證、無收款閉環、無中文母語 |
| 對台灣小團隊適配度 | **中低**——1 人團隊被 3 seat 門檻擋住 |
| BeyondSpec 怎麼贏 | 單人就能用、AI 內含不另計、有驗證 + 收款。「Monday 是給有 PM 的團隊，BeyondSpec 是給沒有 PM 的小團隊。」 |

來源：[Monday vs ClickUp 2026](https://monday.com/blog/project-management/monday-com-vs-clickup/)

#### 2.3 ClickUp

| 項目 | 內容（2026-06） |
|---|---|
| 定價 | Free / Unlimited $7 / Business $12 / Business Plus $19 + **ClickUp Brain AI $7-9/seat add-on** |
| 罩門 | 功能多到臃腫、AI 要加錢、學習曲線、無驗證閉環、無中文母語 |
| BeyondSpec 怎麼贏 | 輕、專注、AI 內建、繁中母語。打「ClickUp 什麼都能做但你要花一週設定」。 |

來源：[ClickUp Pricing 2026 - Quackback](https://quackback.io/blog/clickup-pricing)

#### 2.4 Zoho One ⭐（4 月研究漏掉、本次補上的關鍵對手）

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | 「一個帳號 50+ 個 app」的全套企業軟體 suite |
| 核心功能 | CRM / 報價 / 收款 / 專案 / HR / 會計 / 行銷……幾乎全有，**功能覆蓋是所有對手裡最廣的** |
| 最新 AI 能力 | Zia AI 全產品內建（lead scoring、deal prediction、異常偵測、email 情緒分析、對話式助理），Enterprise/Ultimate/Zoho One 不另收費 |
| 定價 | Zoho One **$37/user/月**（年繳）含 50+ app + Zia；單買 Zoho CRM Standard ~$14、Ultimate ~$52 |
| 目標客群 | 從 spreadsheet 升級的小企業 → 中型銷售團隊，全球 |
| 優勢 | 功能最全、AI 內含、價格中等、品牌成熟、有台灣代理 |
| 罩門 | (1) **「美式大雜燴」UX**——50 app 拼裝，模組間風格與邏輯不一致，對 1-3 人團隊是學習災難 (2) 中文是英翻中、非母語設計 (3) **完全沒有「產品驗證」這一段**——它假設你已經知道要做什麼 (4) 為大公司設計的治理/權限框架對小團隊是過度工程 (5) AI 是「掛在既有 CRM 上」，不是「AI native 從頭設計」 |
| 對台灣小團隊適配度 | **中**——便宜全套是真的，但「全套」對 1-3 人是負擔不是優勢；他們要的不是 50 個 app，是「一套剛好夠、不用學」 |
| BeyondSpec 怎麼贏 | **這是定位的關鍵對照組。** Zoho 證明「全套營運工具」有市場、且能賣 $37。但 Zoho 是「給你 50 個 app 自己組」，BeyondSpec 是「為 AI native 小團隊從頭設計、剛好夠用、開箱即跑、還幫你先驗證方向」。話術：「Zoho 給你一整間五金行，BeyondSpec 直接給你蓋好的房子——而且還先幫你看過這塊地該不該蓋。」 |

> **為什麼 Zoho 是最被低估的對手**：它在「功能覆蓋 × 價格」上其實離 BeyondSpec 最近（都是「全套 + 中等價」）。BeyondSpec 不能只說「我功能全」——Zoho 也全且更全。**差異必須打在「AI native 設計哲學 + 為小團隊剛好夠 + 驗證前置 + 繁中母語 + 快速迭代/敢客製」**，不是功能數量。

來源：[Zoho One Review 2026](https://aiproductivity.ai/guides/zoho-one-bundle-review-2026/) · [Zoho CRM Zia 22 Features 2026](https://www.theravenlabs.com/zoho-crm-zia-ai-features-2026-22-capabilities-explained/)

---

### 第 2 圈：客戶閉環 / clientflow

#### 2.5 HoneyBook（功能最接近的對手）

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | "All-in-one clientflow platform for independent businesses" |
| 核心功能 | 線索表單 / 報價 / 合約 e-sign / 線上收款 / 排程 / 自動跟進——**營運閉環 6/6 完整**，6 年領先 |
| 最新 AI 能力 | **AI 已全面下放到所有方案（含 Starter）**：AI 草擬客戶回覆（依你的語氣）、優先線索辨識、自動會議記錄、每日行動計畫；唯一鎖在高階的是「AI 自動化流程建構器」 |
| 定價 | Starter $29 / Essentials $49 / Premium $109（年繳；月繳 $36/$59/$129），2025 初漲價 63-89% 後維持 |
| 目標客群 | 美國獨立服務業（攝影、設計、活動、顧問） |
| 優勢 | clientflow 體驗成熟、AI 普及、品牌信任 |
| 罩門 | (1) **中文化零** (2) **無產品驗證**——只服務「客戶已經確定」之後 (3) 收款綁美國金流，台灣不可用 (4) 漲價後激怒原本的小客戶 |
| 對台灣小團隊適配度 | **低**（語言 + 金流硬傷），但**敘事與功能是 BeyondSpec 後半段的最佳臨摹對象** |
| BeyondSpec 怎麼贏 | 三刀：(1) 繁中 + 台幣 + 台灣金流 (2) 有「驗證方向」前置段（HoneyBook 完全沒有）(3) AI 普及這點 HoneyBook 已追上，所以**不能再打「我有 AI 他沒有」，要打「我有驗證 + 在地 + 全閉環不只 clientflow」** |

> **關鍵信號（更新）**：4 月把 HoneyBook 當「最大外部機會窗口」（漲價難民）。6 月看：HoneyBook AI 已全面下放、體驗更成熟，**「AI 有無」的差距消失了**。剩下的真實差異是**語言/金流/在地（硬傷他補不了）+ 驗證前置（他沒有）**。機會還在，但理由要從「他貴」換成「他不在地、不幫你驗證」。

來源：[HoneyBook Pricing 2026 - solofinancehub](https://solofinancehub.com/blog/honeybook-review-2026/) · [HoneyBook 89.5% Hike - taskip](https://taskip.net/honeybook-pricing/)

#### 2.6 Attio（AI-native CRM 新星，最該盯的對手）

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | "The AI-native CRM"——CRM 從頭為 AI 重做 |
| 核心功能 | CRM 資料模型 + workflows + sequences + enrichment，**只做 CRM，不做報價/收款/驗證/任務** |
| 最新 AI 能力 | Ask Attio、AI Attributes（Summarize Record / Web Research Agent）、**Lead Enrichment MCP 已 live**——AI agent 可透過 MCP 直接接 Attio 資料；App SDK + webhooks + MCP server 完整 |
| 定價 | Free（3 seat）/ Plus **$29** / Pro **$69**（4 月還是 $59，已漲）/ Enterprise；AI 用 seat credits + workspace credits 雙軌計費 |
| 目標客群 | 成長期團隊、data team、GTM team，全球偏歐美 |
| 優勢 | **AI agent / MCP 整合是全競品最深**、資料模型工程強、設計現代 |
| 罩門 | (1) 只有 CRM——缺任務/報價/收款/驗證的閉環 (2) Pro $69/seat 對台灣小團隊偏貴 (3) 中文化弱 (4) credits 計費成本不可預測 (5) 「給工程腦的 CRM」對非技術小團隊主理人偏硬 |
| 對台灣小團隊適配度 | **中低**（貴 + 偏工程 + 只有 CRM） |
| BeyondSpec 怎麼贏 | 完整閉環（他們只 CRM）+ 繁中 + 價格 + 驗證前置。**但要承認 Attio 的 MCP / AI agent 整合領先**——這是 BeyondSpec v2.0 的目標，不是現在能贏的點。話術：「你需要的是一個 CRM，還是需要把整間生意跑起來？」 |

> **關鍵信號（更新）**：Attio 的 MCP / AI agent 戰略 6 月比 4 月更成熟（Lead Enrichment MCP 已 live、不只是 roadmap）。**這是 BeyondSpec 唯一「對手領先我們」的維度**——Attio 已經讓外部 AI agent 透過 MCP 接它的資料，BeyondSpec 還沒。這條要列入 v2.0 必追項，而且要誠實在策略文件裡標記「這裡我們落後」。

來源：[Attio Pricing 2026 - MarketBetter](https://marketbetter.ai/blog/attio-crm-pricing-breakdown-2026/) · [Attio Review 2026 - SyncGTM](https://syncgtm.com/blog/attio-review)

#### 2.7 Folk

| 項目 | 內容 |
|---|---|
| 定價 | Standard $20 / Premium $40 |
| 威脅 | 低——輕量 CRM，無閉環無驗證。同樣用「你需要 CRM 還是需要生意」拆解。 |

---

### 第 3 圈：台灣本地營運系統 ⭐（4 月研究最大缺口，本次補齊）

#### 2.8 鼎新 Digiwin（台灣本土 ERP 龍頭，已轉型 GenAI 平台商）

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | 台灣最大本土 ERP，2026 公開轉型為「GenAI 平台商」 |
| 核心功能 | ERP（進銷存/財會/製造/供應鏈）+ SmartERP 中小企業版 |
| 最新 AI 能力 | **已推 6 款 AI 助理**（知識助理 / 行政助理 / 生單助理 / 設備助理 / 數智助理 / 決策助理），把 GenAI 三能力（訂單生成、文件總結、報表分析）封進 ERP 核心 |
| 定價 | 專案制，不公開（ERP 導入通常 NT$ 數十萬起 + 年維護費） |
| 目標客群 | **製造業 / 有 IT 人員 / 有實體進銷存的中型企業**——不是 1-20 人服務型小團隊 |
| 優勢 | 台灣在地信任最強、政府關係、製造業 know-how 深、本地服務團隊 |
| 罩門 | (1) **DNA 是製造業 ERP，不是服務型小團隊工具**——進銷存/工單導向，對顧問/設計/行銷工作室過重 (2) 導入成本高、需要 IT (3) 介面老派、非 AI native 設計 (4) **完全沒有「產品驗證」概念** (5) 賣的是「導入專案」不是「自助訂閱」，1-3 人團隊根本進不去 |
| 對台灣小團隊適配度 | **低**（為製造業中型設計，1-20 人服務團隊用不上 ERP） |
| BeyondSpec 怎麼贏 | **這是區隔，不是正面對決。** 鼎新打「有實體庫存/IT 的中型製造業」，BeyondSpec 打「沒有 IT 的 1-20 人 AI native 服務型小團隊」。兩者客群幾乎不重疊。話術：「鼎新是給工廠的，BeyondSpec 是給用 AI 開公司的人的。」**鼎新的存在反而證明『台灣本地營運軟體 + AI』是真需求、有人付錢**——只是沒人服務最小、最 AI native 的那一端。 |

> **戰略意涵**：鼎新轉 GenAI 平台是**對 BeyondSpec 的利多訊號**，不是威脅。它教育了台灣市場「營運軟體要有 AI」，但它的 DNA（製造業、ERP、導入制、要 IT）讓它永遠下不到 1-3 人服務型小團隊。這正是 BeyondSpec 的真空帶。

來源：[鼎新轉型 GenAI 平台商 - iThome](https://www.ithome.com.tw/news/166101) · [2026 中小企業 ERP 選型 - 鼎新數智](https://www.digiwin.com.tw/blog/erp/3623.html)

#### 2.9 台灣垂直 SaaS（恆遠 / 秒站類「AI 自動報價 CRM」）

| 項目 | 內容（2026-06） |
|---|---|
| 定位 | 針對台灣中小企業的單點/輕量 CRM + 自動報價工具 |
| 核心功能 | 3 分鐘 AI 生成專業報價單、客戶已讀追蹤、基礎 CRM |
| 罩門 | **單點工具或純 CRM**——有報價有 CRM，但沒有「驗證→營運」全閉環、沒有收款/算薪/戰情室、沒有「AI native 小團隊持續更版」的產品敘事；多為網頁公司順手做的附加產品，非主力 SaaS |
| 對台灣小團隊適配度 | 中（在地、便宜、解單一痛點） |
| BeyondSpec 怎麼贏 | 他們證明「台灣小團隊要 AI 報價」是真需求，但他們只解一個點。BeyondSpec 是「報價只是其中一個模組，前面有驗證、後面有收款/算薪/戰情室、整套一個 AI 跑」。 |

> **市場痛點金句（可進 landing）**：台灣有調查指出 **87% 中小企業主在系統開發後發現實際費用超出原始報價 30%+**。這條直接命中 Edward 的核心軸心——傳統開發又貴又超支，而 BeyondSpec 用 AI native 小團隊開發模式把這個成本結構打掉。

來源：[中小企業 CRM 自動報價 - 恆遠](https://foreverwebs.com/blog/sme-crm-auto-quotation-system) · [系統開發費用拆解 2026 - 恆遠](https://foreverwebs.com/blog/software-development-cost-breakdown-2026)

---

## 三、次要競業：產品驗證領域（BeyondSpec 前半段）

| 對手 | 定位 / 最新 | 定價 | 罩門 | BeyondSpec 怎麼贏 |
|---|---|---|---|---|
| **Synthetic Users** | AI 合成訪談，「discovery co-pilot, not replacement」，主動揭短 | **$2-27 / 合成用戶**（+$5 RAG），按訪談計費非 seat | 純研究端、英文、與營運脫節、學術嚴謹但不接生意 | 中文合成 + 與診斷/問卷/探測/營運閉環。**他們的「誠實度框敘事」要學**（見 §4.3） |
| **Maze** | AI-moderated 真人訪談平台，理性大人人格，主動列「什麼不該用 AI」 | 按 seat / 方案 | 只做真人研究、英文、不做合成、不接營運 | 學它的人格與誠實邊界；功能上我們是「合成跑廣度 + 真人跑深度」兩層都給 |
| **Dovetail** | 研究分析平台 | $300-500+/月 enterprise | 太貴、打不到小團隊、純分析 | 作為「研究工具多貴」的價格錨點 |
| **Sprig** | AI-native 問卷 | 方案制 | 單點、英文 | 作為單點價格錨點 |

> **驗證領域的戰略定位**：BeyondSpec **不打合成訪談的學術深度**（Synthetic Users 有 peer-review，打不贏也不必打）。BeyondSpec 的價值是「**把驗證接到營運**」——別人做完研究給你報告就結束，BeyondSpec 是「驗證完方向，同一個平台直接幫你把客戶/報價/收款跑起來」。驗證在 BeyondSpec 不是終點，是**漏斗的入口**。

來源：[Synthetic Users Pricing 2026](https://www.syntheticusers.com/pricing) · [AI User Research Tools 2026 - Maze](https://maze.co/blog/ai-tools-user-research/)

---

## 四、市場定位

### 4.1 定位地圖（兩軸）

**主軸圖：驗證能力 × 營運閉環完整度**

```
高營運閉環
  │
  │  Zoho One ●            鼎新 ●（製造業向）
  │  HoneyBook ●
  │                            ★ BeyondSpec
  │  Monday ● ClickUp ●        （驗證 + 全閉環 + AI native）
  │  Attio ● Folk ●
  │  Notion ●
  │                    ● 台灣垂直報價SaaS
  │
  │              Maze ●  Synthetic Users ●
  │                        Dovetail ●  Sprig ●
低營運閉環 ──────────────────────────────→ 高驗證能力
（左下=純研究 / 左上=純營運 / 右上=BeyondSpec 獨佔）
```

BeyondSpec **獨佔右上角**：唯一同時有「強驗證 + 全營運閉環」的。所有對手要嘛只在上半（營運，無驗證）、要嘛只在右下（驗證，無營運）。

**輔助圖：國際大牌 ↔ 台灣在地 × 通用 ↔ 為 AI native 小團隊設計**

```
為「AI native 小團隊」設計
  │
  │                    ★ BeyondSpec
  │                  （繁中母語 + 小團隊剛好夠 + AI 苦工）
  │
  │  Attio ●（AI native 但偏工程/歐美/貴）
  │
  │  HoneyBook ●（小團隊但美國/英文）
  │            Notion ● ClickUp ●（通用，要自搭）
  │  Zoho ●（全套但大雜燴/英翻中）
  │                                    ● 鼎新（在地但製造業/中型/要IT）
通用 / 大企業向 ──────────────────────────→
（橫軸：國際大牌 → 台灣在地）
```

BeyondSpec 卡在一個**沒人佔的甜蜜點**：既「為 AI native 小團隊設計」又「台灣在地繁中母語」。Attio 是 AI native 但歐美/工程/貴；鼎新是在地但製造業/中型/要 IT。中間這格空著。

### 4.2 一句話定位：站在哪、為什麼

BeyondSpec 在競爭地圖上的座標：

> **「華語區唯一一個『從驗證方向到收到錢』全閉環、且為 AI native 小團隊量身設計的商業引擎——不是給你工具自己組，是給你一套跑好的生意。」**

為什麼站這裡（三個支撐）：
1. **右上空白是真空且難複製**——做「驗證+全閉環」要橫跨研究工具 + clientflow + ERP 三個品類的能力，任何單一對手補齊都要數年。
2. **台灣 AI native 小團隊這一格沒人服務**——鼎新太重、Zoho 太雜、國際工具不在地、垂直 SaaS 只解一個點。
3. **這個位置正好對齊 Edward 的開發模式**——「驗證+全閉環」之所以 BeyondSpec 能做、大牌不願做，是因為 BeyondSpec 用 1-3 人 AI native 團隊低成本造、快速迭代（見 §5）。定位和生產方式是同一件事。

---

## 五、產品定位聲明（3 個候選 + 護城河）

### 5.1 定位聲明：3 個候選給 Edward 選

我的工作是給你選項 + 說清楚每個的策略後果，不是塞一個答案給你。

---

**候選 A（軸心型 · 主打「AI native 開發模式」）**
> **「BeyondSpec：用 AI 開公司的人，用 BeyondSpec 跑公司。從驗證方向到收到錢，一套 AI 把整間公司跑起來——而我們自己，就是一支 3 人的 AI native 團隊做給你看。」**

- **策略邏輯**：把「我們怎麼做出來的」變成賣點本身。Edward 的軸心（小團隊 + AI + 低成本 + 快迭代）直接上前台。
- **贏在哪**：最難被複製（大牌的組織結構造不出這個敘事）、最對齊真實能力、吸引同類 AI native 創辦人共鳴。
- **風險**：「我們是 3 人小團隊」可能觸發「那你們穩定嗎、會不會倒」的信任疑慮（見 §5.6 脆弱點）。需要用「正因為小+AI，我們更新比誰都快、敢客製誰都不敢」把小團隊從劣勢翻成優勢。

---

**候選 B（閉環型 · 主打「驗證到收錢全閉環」）**
> **「BeyondSpec：從『這方向值得做嗎』到『錢收到了嗎』，一個平台、一套 AI，把整間公司跑起來。人做決策，AI 做苦工。」**

- **策略邏輯**：主打結構性差異（全閉環），這是地圖上最硬的護城河、最好懂。
- **贏在哪**：最容易解釋、最好對比競品（「Notion 缺收款、HoneyBook 缺驗證、Attio 只有 CRM」）、最穩。
- **風險**：「全閉環/all-in-one」這個敘事 Zoho 也能講（它也全），需要靠「驗證前置 + AI native + 繁中」補差異。偏功能導向，少了 Edward 軸心的靈魂。

---

**候選 C（在地型 · 主打「台灣 AI native 小團隊的引擎」）**
> **「BeyondSpec：台灣小團隊的 AI 商業引擎。不是 ERP、不是國外工具——為用 AI 開公司的台灣 1-20 人團隊，從頭設計。」**

- **策略邏輯**：主打「在地 + 為小團隊」雙重區隔，直接卡掉鼎新（製造業中型）和國際大牌（不在地）。
- **贏在哪**：對台灣目標客群最有歸屬感、最好做在地行銷、區隔最清楚。
- **風險**：「在地」天花板是台灣市場規模；若未來要打港澳/新馬/出海，這個定位要再升級。格局上比 A/B 小一點。

---

**霍爾的建議**：**主敘事用 B（最穩、最好懂、護城河最硬），靈魂用 A（軸心是真正不可複製的部分），行銷落地用 C（在地最有共鳴）。**

具體配法：
- **官網主標 = B 的骨架**（「從驗證到收到錢，一套 AI 把公司跑起來」——線上已經是這個方向，對）
- **品牌故事 / 創辦人敘事 = A**（「我們是一支 3 人 AI native 團隊，做給跟我們一樣的人用」——這是融資和社群傳播的靈魂）
- **台灣在地行銷 / SEO = C**（「台灣小團隊」「不是 ERP 不是國外工具」——打在地歸屬）

三個不衝突，是同一件事的三個臉。B 是身體、A 是靈魂、C 是聲音。

---

### 5.2 護城河（圍繞 Edward 軸心：AI native 小團隊 · 低成本 · 快應變）

Edward 親述的核心競爭力是引擎，以下 5 條護城河都從它長出來：

> 「我們用 1-3 人的 AI native worker 小團隊，用 AI 開發降低大量產品開發成本，同時降低人力成本，可以快速應變市場、加速營運變革與發展。用更低負擔的方式輔助中小企業與新創在營運軟體上的各種問題與期待——發展更多模組、更快的更版服務、甚至更快的客製化。」

---

#### 護城河 #1：「驗證 → 營運」全閉環（結構唯一）

- **內容**：產品力診斷 / Lab 合成訪談 / 問卷 / 市場探測 / 市場報告（驗證）→ 任務 / CRM / 報價 / 收款 / 算薪出缺勤 / 會議 / 文件 / 戰情室（營運），同一個平台、同一套 AI、同一份資料貫穿。
- **為什麼大牌做不到 / 不願做**：
  - Notion/Monday/ClickUp 是通用 workspace，做閉環要犧牲通用性，不願意
  - HoneyBook/Attio/Folk 只服務「客戶已確定後」，補「驗證前置」要進不熟的研究品類
  - Synthetic Users/Maze/Dovetail 只做研究端，補營運要進不熟的 clientflow/ERP 品類
  - 鼎新/Zoho 有營運但無驗證概念，且 DNA（製造業/大雜燴）改不動
  - **要同時跨「研究工具 + clientflow + ERP」三個品類，對任何聚焦型對手都是數年工程 + 違反它現有商業模式**
- **延續性**：模組互相餵養（驗證資料 → 客戶 → 報價 → 收款 → 戰情室），補一整圈要 3-5 年
- **破解條件**：某個全能平台（Notion 級）真的決定做產品驗證——機率低，因為不符它的通用定位

#### 護城河 #2：AI native 小團隊的「開發成本結構」差異（Edward 軸心核心）⭐

- **內容**：BeyondSpec 用 1-3 人 AI native 團隊 + Claude Code/Cowork 開發，把「做一個模組/更一次版/接一個客製」的邊際成本壓到傳統團隊的零頭。
- **為什麼大牌做不到 / 不願做**：
  - **這是組織結構問題，不是技術問題**——Notion/Monday/Zoho 有數百到數千人，它們的成本結構、決策層級、QA 流程、法務審查讓「快速更版 + 敢客製」結構上不可能。一個 200 人團隊改一行字要過 5 個會
  - 大牌的單位經濟建立在「標準化、不客製、慢迭代」上——客製對它們是反商業模式
  - 產業數據佐證這個成本差是真的：2026 年 AI 讓團隊用**少 30-40% 工程工時**交付同樣產出、小團隊 **3-6 週**能做出 production-ready 產品、「一人公司用 $150/月 tech stack 取代整個團隊」
- **延續性**：只要 BeyondSpec 保持小 + AI native，這個成本優勢就在。**但這把雙面刃**——同樣的 AI 工具也在降低新進者的進入門檻（見 §5.6 脆弱點）
- **破解條件**：大牌做不到（結構），但**新的 AI native 小團隊可以複製這個模式**——所以護城河 #2 必須配合 #1（閉環廣度）和 #3（在地）才夠深，單靠開發模式不夠

> **這條是整套策略的引擎，但也是最誠實要面對的地方**：Edward 的軸心讓 BeyondSpec 能做到大牌做不到的事（快迭代/敢客製），但「用 AI 低成本造產品」這件事本身，2026 年已經是 34% 新 micro-SaaS 創辦人都在做的事。**護城河不是「我們會用 AI 開發」，是「我們用 AI 開發 + 做了一個橫跨三品類的閉環 + 深耕台灣在地 + 累積了用戶資料和品牌」的組合**。單一條都可被複製，組合起來才難。

#### 護城河 #3：台灣 / 華語在地化（國際大牌結構性做不到）

- **內容**：繁中母語設計（非英翻中）、台幣定價、台灣金流、台灣三層市場訊號（Google/Dcard/Threads）、在地客服與客製。
- **為什麼大牌做不到 / 不願做**：台灣市場對 Notion/HoneyBook/Attio 是長尾，不值得投入母語級在地化；它們的中文永遠是「翻譯」不是「設計」
- **為什麼本地對手也做不到**：鼎新在地但 DNA 製造業/中型/要 IT，下不到 AI native 小團隊；Zoho 有台灣代理但產品是美式大雜燴
- **延續性**：在地資料源合作關係、繁中內容、台灣社群口碑隨時間複利
- **破解條件**：某國際大牌決定認真做台灣母語版——商業上不划算，機率低

#### 護城河 #4：Claude 原生協作（雙軸：人 + Claude Cowork/Code + BeyondSpec）

- **內容**：BeyondSpec 不只是「用了 AI 的軟體」，它的設計前提是「使用者本來就在用 Claude Cowork/Code 開公司」，BeyondSpec 是那個工作流裡的營運層。
- **為什麼大牌做不到**：通用工具沒有「Claude native」這個前提；Attio 有 MCP 但只 CRM 單點。**這條目前是『理念領先』，執行上 Attio 的 MCP 整合其實比 BeyondSpec 成熟**（見 §5.6 誠實標記）
- **延續性**：Anthropic SDK/MCP 生態 2026-2028 爆發，越早原生整合越早成 Claude 用戶的首選營運層
- **破解條件 / 落後點**：**這裡要誠實——Attio 已經 Lead Enrichment MCP live，BeyondSpec 還沒有對外 MCP。這條護城河目前是「願景」不是「既成事實」，v2.0 要把它從願景做成事實**

#### 護城河 #5（軟）：品牌「有溫度的 AI 商業引擎」+ 創辦人 founder-market fit

- **內容**：三層靈魂指令（信任/包覆/情緒價值）、warm-serif 儀式感、co-founder 式 AI 語氣，加上 **Edward 本人 13 年產品經驗 + 親身蹚過「賣顧問服務→賣 SaaS 產品」的轉型**——他就是目標客群本人。
- **為什麼大牌做不到**：品牌溫度來自創辦人品味，大公司的 PM 複製不出；**founder-market fit 是 BeyondSpec 特有的**——Edward 從 SSOT 那份顧問生意一路走來，他知道小團隊做產品會踩的每一個坑（因為他自己踩過），這是任何外部團隊砸錢買不到的
- **延續性**：品牌與創辦人故事隨時間沉澱
- **破解條件**：軟護城河，靠持續執行維持，不是一勞永逸

---

### 5.6 脆弱點（誠實 > 樂觀，這節是策略文件最重要的部分）

我答應 Edward 要誠實。以下是這個模式真正的軟肋，不講就是失職：

**脆弱點 1：小團隊信任度（最現實的銷售障礙）**
- 台灣中小企業主對「3 人團隊做的 SaaS」會直覺問「你們會不會倒、資料會不會不見、明年還在不在」
- 蘇菲的市場研究已標記：台灣 SaaS 信任赤字、需要口碑背書
- **這是 §5.2 候選 A 定位的直接代價**——把「我們是小團隊」放前台，要同時準備好「為什麼小反而是你的優勢」的答案（更新快、敢客製、創辦人親自回你），以及實打實的資料備援/SLA 承諾
- **緩解**：資料可攜出（不綁架）、明確的備份/匯出承諾、用早期口碑案例背書、Edward 個人品牌與經歷當信任錨

**脆弱點 2：穩定性與品質（小團隊 + 快迭代的代價）**
- 「更版快」的另一面是「可能不穩」——城堡自己的歷史（v1.0.8 退版、v1.3.19 三連鎖事故、v1.5.0 NT$1300 浪費）就是證據
- 快速客製化若沒有紀律，會變成技術債和品質崩壞
- **緩解**：這正是城堡 Delivery Gates 5 關存在的理由——速度要配紀律，不然護城河 #2 會反噬成口碑災難

**脆弱點 3：AI 成本波動（單位經濟的隱形風險）**
- BeyondSpec 的價值高度依賴 Claude API，token 成本上漲會直接吃毛利
- 定價 NT$599/1299 含 AI 苦工，若 AI 用量超出預期或 API 漲價，單位經濟會壓力大
- **緩解**：定價含 token buffer、prompt 優化、用量監控、必要時分級限流；蘇菲市場研究已列此為中高風險

**脆弱點 4（結構性、最該長期警惕）：BeyondSpec 自己就是「賣 seat 的 SaaS」——而這正是 2026 年 AI agent 顛覆的對象** ⭐
- 產業正在發生「SaaSpocalypse」：2026 上半軟體業市值蒸發約 **$2 兆**，買家從「我要 50 個授權」轉向「我要完成 X 件工作」，vertical AI agent 賣「完成的工作」而非「軟體 seat」
- BeyondSpec 的 Team 方案是 **NT$499/人/月**——這是典型的「賣 seat」模式，正是被顛覆的那一類
- **這個張力必須正面想清楚**：BeyondSpec 一邊是「AI 顛覆者」（用 AI 低成本造工具顛覆傳統軟體），一邊又是「可能被 AI agent 顛覆的訂閱 SaaS」
- **存活下來的是什麼**：產業共識是「有深度資料護城河、網路效應、在地/合規差異化的平台存活；商品化單點工具被取代」——這**反而印證 BeyondSpec 的方向是對的**（閉環 = 資料護城河、在地 = 差異化），但前提是 BeyondSpec 要往「賣完成的工作/結果」而非「賣 seat」演化
- **緩解 / 戰略指引**：(1) 強化資料閉環（讓用戶資料越用越離不開）(2) 往「AI 幫你完成 X」的價值敘事走，弱化「按人頭收費」(3) 把 Edward 軸心的「敢客製」變成大牌和純 agent 都給不了的服務層 (4) 長期定價可能要從「per seat」往「per outcome / per workspace」演化

---

## 六、3 個立刻可做的策略決策

### 決策 1：定位主敘事鎖定「B 身體 + A 靈魂 + C 聲音」三層配置
- **建議**：官網主標維持 B（已對），品牌故事補 A（創辦人 + AI native 小團隊敘事，目前缺），在地行銷用 C
- **下一步**：寫一頁「BeyondSpec 是怎麼做出來的」品牌故事（蘇菲文案 + 霍爾把關），把「3 人 AI native 團隊做給同類人用」變成傳播資產
- **時機**：立刻，低成本高回報

### 決策 2：競品話術從「我有 AI」全面改成「我有閉環 + 在地 + 驗證前置」
- **理由**：6 月證據顯示 AI 已是入場券不是差異點（HoneyBook/Notion/Attio/Zoho/鼎新全都有 AI 了）。再打「我有 AI」會顯得天真
- **下一步**：更新所有對比話術——對 Notion 打「閉環 + 固定費用 vs credits」、對 HoneyBook 打「在地 + 驗證」、對 Attio 打「整間生意 vs 只有 CRM」、對 Zoho 打「為小團隊剛好夠 vs 50 app 自己組」、對鼎新打「給用 AI 開公司的人 vs 給工廠」
- **時機**：立刻

### 決策 3：把「SaaSpocalypse / per-outcome」張力列入 v2.0 產品策略議題
- **理由**：這是 3 年內的結構性風險，現在不想，等 AI agent 真的吃過來就晚了
- **下一步**：(1) v2.0 把對外 MCP / AI agent 整合做成事實（追平 Attio）(2) 研究定價從 per-seat 往 per-workspace/per-outcome 演化的路徑 (3) 強化資料閉環黏性
- **時機**：v2.0 規劃期納入，不急於本季，但要進 roadmap

---

## 附錄：本次新增/更新證據來源

| 主題 | 來源 | 關鍵更新 |
|---|---|---|
| Notion AI 2026 改 credits 制 | [costbench](https://costbench.com/software/ai-productivity/notion-ai/) / [Notion Guide 2026](https://smartproductivitytools.com/notion-complete-guide/) | Business $15-20、Custom Agents 5/4 起 $10/1000 credits 不滾存 |
| Attio 2026 漲價 + MCP live | [MarketBetter](https://marketbetter.ai/blog/attio-crm-pricing-breakdown-2026/) / [SyncGTM](https://syncgtm.com/blog/attio-review) | Pro 漲到 $69、Lead Enrichment MCP 已 live |
| HoneyBook 2026 AI 全下放 | [solofinancehub](https://solofinancehub.com/blog/honeybook-review-2026/) | AI 連 Starter 都有，差異點消失 |
| Zoho One 2026（新增對手）| [aiproductivity](https://aiproductivity.ai/guides/zoho-one-bundle-review-2026/) / [theravenlabs](https://www.theravenlabs.com/zoho-crm-zia-ai-features-2026-22-capabilities-explained/) | $37/user 含 50+ app + Zia |
| 鼎新轉 GenAI 平台（新增對手）| [iThome](https://www.ithome.com.tw/news/166101) / [鼎新數智](https://www.digiwin.com.tw/blog/erp/3623.html) | 6 款 AI 助理、打製造業中型 |
| 台灣垂直報價 SaaS + 開發超支痛點 | [恆遠](https://foreverwebs.com/blog/sme-crm-auto-quotation-system) / [恆遠開發費用](https://foreverwebs.com/blog/software-development-cost-breakdown-2026) | 87% 中小企業開發超支 30%+ |
| ClickUp/Monday 2026 定價 | [Quackback](https://quackback.io/blog/clickup-pricing) / [monday](https://monday.com/blog/project-management/monday-com-vs-clickup/) | AI 仍是 add-on |
| Synthetic Users/Maze 2026 | [Synthetic Users](https://www.syntheticusers.com/pricing) / [Maze](https://maze.co/blog/ai-tools-user-research/) | $2-27/合成用戶，按訪談計費 |
| AI native 小團隊開發趨勢（軸心佐證）| [bubble.io](https://bubble.io/blog/ai-tools-for-startups/) / [entrepreneurloop](https://entrepreneurloop.com/solo-founder-ai-tools/) | 34% 新 micro-SaaS 由無程式背景者 vibe code、少 30-40% 工程工時 |
| SaaSpocalypse / vertical AI agent 顛覆（脆弱點佐證）| [Taskade](https://www.taskade.com/blog/saaspocalypse-explained) / [GeekWire](https://www.geekwire.com/2026/the-rise-of-vertical-ai-agents-and-the-startups-racing-to-build-them/) | 軟體業市值蒸發 $2 兆、賣 seat 模式被顛覆 |

---

*— 霍爾（CPO / 策略長），2026-06-20 · 約 6,500 字 · 站在 4 月霍爾競品研究 + 蘇菲市場研究 + Edward SSOT 肩膀上，以 2026-06 證據重抓競品動態、補齊台灣本地對手、納入 Edward「AI native 小團隊」軸心、誠實標記脆弱點。*
