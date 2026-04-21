# BeyondPath 深度競業研究 — Competitive Deep Dive

**作者**：霍爾（CPO / 策略長）
**日期**：2026-04-21
**前置閱讀**：`lab-research-competitive-framing.md` / `market-signal-positioning.md` / `platform-diagnosis-strategy.md`

---

## TL;DR

BeyondPath 的競爭地形在 2026 Q1 已重新洗牌：Notion AI 把 AI 鎖進 $20 Business plan、HoneyBook 一次漲 63-89% 把自己推向中型客單、Attio 靠 AI Attributes 把 CRM 重做、Synthetic Users 把「discovery co-pilot」做穩。**所有人都加 AI，但沒有人同時做「驗證 + 營運閉環」、也沒有人把台灣三層訊號 (Google/PTT/蝦皮) 做進產品。** BeyondPath 的位置很清楚：**華語區唯一「驗證→營收閉環」+ 在地訊號雷達的 AI 商業引擎**。

---

## 1. 競品分類與矩陣

### 🎯 核心直競

#### 1.1 Notion + Notion AI
| 項目 | 內容 |
|------|------|
| Tagline | "Your connected workspace. Now with AI." |
| 功能覆蓋（11 維）| 驗證 0/5 · 營運 3/6（沒報價、收款、會議 CRM）|
| Pricing（2026-03）| Free / Plus $10 / **Business $20**（AI 綁死）/ Enterprise |
| 目標客群 | Solo + SMB + 大企業（超廣）|
| AI 整合 | **Deep native**（3.3 Custom Agents, GPT-5/Claude Opus 4.1）|
| 中文化 | 部分 |
| 小團隊痛點 | 陡峭—「給你積木自己蓋」|
| **BP 怎麼贏** | 我們給閉環，他們給積木 |
| **BP 怎麼避開** | 不打 workspace / 文件庫 |

**關鍵信號**：AI add-on 取消，綁進 $20 Business plan。10 人團隊 = $200/月 = BeyondPath 整年訂閱。**最大價格槓桿**。

#### 1.2 Monday.com
| Pricing | **3 seat 起跳**：Basic $9/seat / Standard $12 / Pro $19（年繳）|
| AI 整合 | Shallow（AI credits 模式）|
| BP 怎麼贏 | 單人也能用、AI 不計 credits、有驗證工具 |

#### 1.3 HoneyBook（最接近對手）
| Tagline | "The all-in-one clientflow platform for independent businesses" |
| 功能覆蓋 | 驗證 0/5 · **營運 6/6** |
| Pricing（2026-02 大漲後）| **Starter $29-39 / Essentials $49-59 / Premium $109-129** |
| AI 整合 | Deep native（2026 predictive lead alerts、proposal draft、workflow 語言生成）|
| 中文化 | **零** |
| BP 怎麼贏 | **三刀齊下**：(1) 華語/台幣 (2) 有驗證工具 (3) 價格咬住漲價前 HoneyBook |

**關鍵信號**：2026-02 漲 63-89% 激怒小團隊客戶，社群退訂聲浪。**2026 Q2-Q3 最大外部機會窗口**。

#### 1.4 ClickUp
| Pricing | Free / Unlimited $7 / Business $12 + **AI Brain $9 add-on** |
| BP 怎麼贏 | 輕、專注、AI 內建不加錢 |

#### 1.5 Attio（AI-native CRM 新星）
| Pricing | Free（3 user）/ Plus $29 / Pro $59 / Enterprise $119 |
| AI 整合 | **Deepest native**（AI Attributes、Ask Attio、**MCP 支援**、Call intelligence）|
| BP 怎麼贏 | 完整閉環（他們只 CRM）、中文化、價格低 |

**關鍵信號**：2026 Q1 推 Ask Attio + MCP——第一個原生支援 Claude/GPT MCP 的 CRM。**是我們 v2.0 的目標**。

#### 1.6 Folk
| Pricing | Standard $20 / Premium $40 |
| 威脅 | 低—只做 CRM |

---

### 🔬 驗證工具類

#### 2.1 Synthetic Users（Lab 最接近對手）
| Pricing | **$2-27 / simulated user**（+$5 RAG）|
| 敘事 | 「Discovery co-pilot, not replacement」+ 主動揭短（85-92% parity, bias upfront）|
| BP 怎麼贏 | 中文合成 + 與 PATH/問卷/市場探測閉環 |

#### 2.2 Maze（理性大人）
| 敘事 | AI-moderated interviews（**只做真人**，主動 frame synthetic 不適合 4 種場景）|
| BP 怎麼學 | 品牌人格、列清楚「什麼不要用 AI」|

#### 2.3 Dovetail
| Pricing | **$300-500+/月 enterprise**——打不到小團隊 |

#### 2.4 Sprig / Typeform / UserCall.ai / Looppanel / Kraftful
- 單點工具（問卷/電話訪談/分析）
- 作為「單點價格錨點」：他們多貴，BeyondPath 打包多划算

---

### 🌏 台灣本土 / 華語

#### 3.1 Awoo 阿物
- 16,000+ 企業客戶、MarTech leader from Taiwan
- **企業級年繳制**（NT$30K-80K/月等級，不公開）
- 小團隊可及性：零
- **關鍵機會**：市場探測是「Awoo 下探版」—— NT$29 級 Awoo 視角

#### 3.2 OpView / KEYPO
- OpView：220,000+ 觀察頻道、**NT$50K+/月企業級**
- KEYPO：中小企業友善分級（最低 NT$5K-10K/月）
- **關鍵機會**：市場探測 v1.2 社群層做「KEYPO 三分之一價」

---

## 2. 競爭定位圖

### 矩陣 A：AI 深度 × 驗證能力

```
高 AI 深度
  │
  │  Attio ●       ● Synthetic Users
  │
  │  Notion AI ●
  │
  │  HoneyBook ●    ★ BeyondPath
  │                 (AI + 驗證 + 閉環)
  │  Folk ●
  │          ● Maze
  │  ClickUp ●          ● Dovetail
  │
  │  Monday ●
  │
  │  ZEALS ●  ● ONES
  │
低 AI 深度────────────────────────→ 高驗證能力
```

BeyondPath **獨佔右上空白帶**。

### 矩陣 B：價格 × 功能覆蓋（給小團隊）

```
低價（<$30/月）
  │
  │  Folk $20 ●                      ★ BeyondPath
  │                            (NT$29-99)
  │  Notion Plus $10 ●
  │
  │  ClickUp $7 ●
  │
  │  HoneyBook $29 ●  ←── 漲價前位置
  │                      (咬住這裡)
  │                 ● HoneyBook $49+ (漲後)
  │
  │  Monday $9 ●  (但 3 seat = $27)
  │                      ● Attio $29-59
  │                               ● Notion Business $20
高價                               ● ClickUp + Brain $16
                                   ● Dovetail $300+
                                   ● OpView NT$50K
低功能覆蓋────────────────────────→ 高功能覆蓋
```

---

## 3. 結構性護城河（3-5 年）

### 護城河 #1：驗證 + 營運閉環（結構唯一）
- 對手為何做不到：Notion/Monday/ClickUp 是通用 workspace；HoneyBook/Attio/Folk 只做客戶確定後；Synthetic Users/Maze/Dovetail 只做研究端
- 延續性：五工具互相餵養—PATH → Lab → 問卷 → 探測 → 報告 → 客戶 → 報價 → 收款，補一圈要 5 年
- 破解條件：Notion 真的做 PATH 驗證（機率低）

### 護城河 #2：台灣三層訊號雷達（在地壟斷）
- 對手為何做不到：國際工具沒動機、Awoo/OpView 結構上做不到 NT$29
- 延續性：資料源合規合作關係時間建立，每階段都是 moat
- 破解條件：Awoo 推 NT$99 版（成本結構做不到）

### 護城河 #3：Claude Cowork + BeyondPath 雙軸協作
- 對手為何做不到：通用工具沒 MCP/SDK 級 Claude 整合；Attio 只 CRM 單點
- 延續性：Anthropic SDK 2026-2028 爆發，BeyondPath 越早原生越早成 Claude 用戶首選

### 護城河 #4：中文/台灣一級品牌語言
- 所有 UI / AI 洞察 / 賦能問題 / 警語由愛德華親自中文定稿
- 不是「英翻中」是「中文為母語設計」

### 護城河 #5（軟）：品牌「有溫度的 AI 商業引擎」
- 三層靈魂指令 + warm-serif + co-founder 式 AI 語氣
- 軟 = 執行決策來自創辦人品味，對手 PM 複製不出

---

## 4. 戰術建議

### 4.1 該打哪個對手

**優先級 1：HoneyBook 留下的真空帶**
- 2026-02 漲 89% 有退訂潮；華語區沒人服務
- landing 直接點名「HoneyBook 的驗證工具 + 在地訊號 + 華語版 + 價格回到 $29」
- 時機：Q2-Q3

**優先級 2：Awoo/OpView 小團隊下探失敗**
- 他們 DNA 企業級，做不到 NT$99
- 「Awoo 級視角 × 一杯咖啡的錢」
- 時機：v1.1 DataForSEO 真資料上線

**優先級 3：Notion AI Business $20 綁死**
- 10 人 = $200/月給 Notion，小團隊會被價格逼走
- 「BeyondPath 年訂閱 < Notion 一個月」
- 時機：v1.2+ 商業模組完整

### 4.2 該避開哪場戰爭

1. 不打 workspace / 文件庫（Notion 主場）
2. 不打 PM 功能完整度（ClickUp/Monday 厚度打不贏）
3. 不打 CRM data model 強度（Attio 工程深度打不贏）
4. 不打合成訪談學術深度（Synthetic Users 有 peer-reviewed）
5. 不打美國 clientflow 自動化（HoneyBook 6 年領先）
6. 不打台灣企業級輿情（OpView/KEYPO 資料規模打不贏）

### 4.3 該抄的 feature

| 對手 | 該抄的 | 抄成什麼 |
|------|--------|---------|
| HoneyBook | AI workflow builder（描述流程→生成工作流）| v1.3+「一句話生成任務模板」|
| HoneyBook | Predictive lead alerts | 戰情室「今天值得 follow 的 3 個客戶」|
| Attio | AI Attributes（prompt-driven 欄位）| 客戶管理「AI 欄位」(自動填「這家公司的產業地位」)|
| Attio | MCP 原生支援 | v2.0 接 Claude Cowork |
| Linear | 一個 Hero Metric 貫穿 | 戰情室 Hero 3 指標，不 dashboard hell |
| Stripe | 「今天 vs 昨天」大數字 | 戰情室 left-top 放「本月現金流」差分 |
| Synthetic Users | 誠實度三層（學術/方法論/使用層）| 已在 `lab-research-competitive-framing.md` 鎖定 |

### 4.4 該學的敘事

1. **Synthetic Users — 誠實度框敘事**：「Discovery co-pilot, not replacement」+ 主動揭短
2. **HoneyBook — clientflow 術語**：不說 CRM/PM，自創術語把定位獨立；BP「驗證到營收的 PATH」在做同樣事
3. **Maze — 「理性大人」人格**：主動列「什麼場景不適合用我們」，信任 +30%
4. **Attio — "AI-native, not AI-added"**：直接放首頁

### 4.5 case-by-case 攻防

| 情境 | 對手 | 戰術 |
|------|------|------|
| 「我已經用 Notion」| Notion | 不叫搬家—定位為**補位工具**。Notion 放文件，BP 做驗證/報價/收款閉環 |
| 「HoneyBook 最近漲很多」| HoneyBook | 直球對決—「華語版 + 有驗證 + 不漲價」|
| 「Attio AI CRM 很猛」| Attio | 承認 Attio 強，反問「你需要 CRM 還是需要生意」|
| 「你們合成訪談準不準」| Synthetic Users | 學 bias upfront —「合成跑廣度、真人跑深度，兩層都給你」|
| 「Awoo 太貴」| Awoo | 「Awoo 視角 × 咖啡錢」+ 強調小團隊需要的不是 SEO 報表是「該不該做」判斷 |

---

## 5. 3 個立刻做的競爭決策

### 決策 1：2026 Q2-Q3 打 HoneyBook 難民接盤？

**建議**：**B+**（守華語區，但做一頁英文 landing 承接「HoneyBook alternative Taiwan / Chinese」SEO 流量）。成本低、風險低、0 損失。

### 決策 2：v2.0 旗艦做 Attio MCP 級 Claude 整合？

**建議**：**A 預埋 + B 執行**—v1.4 架構預埋 MCP hook（3-5 天工時），v2.0 正式發布當旗艦敘事。這是跟所有對手永久拉開的那條線。

### 決策 3：市場探測 v1.2 社群層首發？

**建議**：**A（Threads + Dcard 雙軌）**。Threads 合規風險最低（Meta 官方 API）、Dcard 是 Taiwan Z 世代命脈、PTT 流量下滑（v1.2.1 補即可）。上線當天可對媒體說：**「第一個同時看到 Google + Threads + Dcard 的小團隊工具」**。

---

## Sources

- [Notion Pricing 2026](https://www.notion.com/pricing)
- [Notion AI 3.3 Custom Agents](https://max-productive.ai/ai-tools/notion-ai/)
- [Attio Pricing + MCP](https://attio.com/pricing) / [Attio 2026 Review](https://www.stacksync.com/blog/attio-crm-2025-review-features-pros-cons-pricing)
- [HoneyBook Pricing 漲價分析](https://www.agencyhandy.com/honeybook-pricing/)
- [Monday 2026 Pricing](https://www.getaiperks.com/en/articles/monday-com-pricing)
- [ClickUp Brain Pricing](https://clickup.com/brain/pricing)
- [Folk CRM](https://www.folk.app/pricing)
- [Synthetic Users / Maze / Dovetail 2026 市場對比](https://blog.userintelligence.app/ai-market-research-landscape-2026/)
- [Awoo 方案](https://www.awoo.org/order) / [Awoo GEO 2026](https://www.awoo.ai/zh-hant/blog/2026-seo-geo-trends/)
- [OpView / KEYPO 2025 比較](https://www.brainmax-marketing.com/article_d.php?lang=tw&tb=6&id=1445)

*— 霍爾，2026-04-21 · 約 3,200 字 · 資料新鮮度：2026-04*
