# S1 D5 · PATH 診斷 v2.0 · 內容規格（Content Spec）

> **Sprint**：S1 · D5
> **Owner**：🌸 蘇菲（主對話）
> **前置**：D1 CSS namespace ✅ / D2 Render Engine 🏃 / D3 URL routing 🏃 / D4 AI Wrapper 🏃（未啟動）
> **本檔定位**：PATH 診斷 v2.0 的**內容側規格**——Claude prompt 升級 + JSON Schema + 敘事範本
> **依據**：
> - `tool-selection-matrix.md §2` PATH 四維增強融合表（P=JTBD, A=STP, T=五力, H=SMART）
> - `2026-ai-native-upgrade.md §1` JTBD 4 層（L1/L2/L3/L4）
> - `content-rubric-95.md §2` PATH Surface/Mid/Deep 三層
> - `visual-rubric-95.md` 10 維視覺要求
> - 霍爾戰略 Q1 液態團隊時代 / Q2 STEEP 2.0 / Q3 Gemini 主 70% + GPT 30%

---

## §1 · Claude Prompt v2.0（PATH 診斷專用）

### §1.1 Prompt 結構（System + User）

```
[SYSTEM PROMPT]
你是 BeyondPath 的 PATH 診斷分析師。你的任務是根據創辦人的 24 題作答，
產生一份符合以下規格的 JSON：

定位：
- 讀者是**創辦人本人**（2-5 分鐘快速判斷 Kill/Pivot/Persevere）
- 敘事主語氣 Gemini 風（有命題感、有轉折、像朋友的戰略夥伴，不是顧問腔）
- 語言：正體中文 · 稱讀者「你」· 避免英文 jargon · 台灣生活化比喻優先

硬規則：
1. Hero verdict 必為 12-20 字一句話結論（不是描述是判斷）
2. 數字必量化 · 不可用「很好」「不錯」「大幅」
3. 每個建議必含 SMART 五要素
4. 無 Math.random · 無虛構數字 · 無無來源主張
5. JTBD 4 層（Functional/Emotional/Identity/Addiction）全填，不互抄
6. Next Action 3 條 · 每條指向一個 PATH 軸的最弱子項
7. Hypothesis 必明示 · 本結論的 3 項核心假設 + 失效條件

[USER PROMPT]
用戶作答資料：
{scoreP: {P1: ..., P2: ..., ...}, scoreA: ..., scoreT: ..., scoreH: ...}

請產出符合 PATH-DIAGNOSTIC-V2 schema 的 JSON。
```

### §1.2 Prompt 升級點 vs v1

| 項目 | v1（既有）| v2（本規格）|
|---|---|---|
| Hero verdict | 無（只有 POC SCORE + 「蓄勢待發者」標籤）| **12-20 字 Gemini 風一句話結論** |
| JTBD 結構 | 無（P 維只是分數）| **4 層展開（L1/L2/L3/L4）每層證據 + 狀態色** |
| Next Action | 一條模糊建議（「建議進入 Audience Lab」）| **3 條 SMART 格式**（S/M/A/R/T 五要素全填 + 誰做/風險/失效）|
| Hypothesis | 無 | **方法論抽屜**（資料來源 + 3 假設 + 信心度% + 失效條件）|
| 跨工具導引 | 無 | **F1/F2 動態觸發**（A<60→Lab / T<60→市場探測）|
| 資料源 | 無標記 | **🟢🟡🔴 三色 badge 覆蓋率 ≥95%** |
| 信心度 | 「中信心」模糊 | **% 數字**（例：72%）+ 計算依據 |
| 術語翻譯 | 直接用英文（JTBD / PMF）| **首次出現附中文 + 生活化比喻** |

---

## §2 · JSON Schema（PATH-DIAGNOSTIC-V2）

```json
{
  "$schema": "https://beyondpath.tw/schemas/path-diagnostic-v2.json",
  "version": "2.0",
  "type": "diagnostic",

  "hero": {
    "verdict": "方向對，補 Traction 就能衝",
    "verdict_tone": "teal",
    "tldr": "綜合 PATH 分數 82/100 · P/A/H 都強 · T 弱需補",
    "confidence": 72,
    "confidence_calc": "基於 24 題作答一致性 + 同業 n=47 比對",
    "kpis": [
      {
        "value": 82, "label": "PATH 總分", "trend": "+3 vs 上次",
        "source": "measured", "trendDirection": "up"
      },
      {
        "value": "T 弱項", "label": "需補強", "source": "measured"
      },
      {
        "value": "2 週", "label": "下輪重估", "source": "estimated"
      }
    ]
  },

  "pathScores": {
    "P": {
      "total": 18,
      "max": 25,
      "status": "healthy",
      "diagnosis": "問題真實存在，用戶雇用你解決「一個人跑完整條鏈」",
      "subScores": {
        "L1_functional": {
          "score": 5.5, "max": 6, "status": "healthy",
          "evidence": "24 題中 18 題提及「節省時間」關鍵字",
          "evidence_source": "measured"
        },
        "L2_emotional": {
          "score": 5.0, "max": 6, "status": "healthy",
          "evidence": "你描述「半夜擔心 cash flow」——情緒頻率每週 ≥ 2 次",
          "evidence_source": "measured"
        },
        "L3_identity": {
          "score": 6.0, "max": 7, "status": "healthy",
          "evidence": "你已在 LinkedIn 公開自稱「獨立創辦人」——identity 形成",
          "evidence_source": "estimated"
        },
        "L4_addiction": {
          "score": 5.0, "max": 6, "status": "healthy",
          "evidence": "早晨打開儀式尚未完全形成（目前 3 天/週）——可升級",
          "evidence_source": "estimated"
        }
      }
    },
    "A": {
      "total": 20,
      "max": 25,
      "status": "healthy",
      "diagnosis": "Segmentation + Targeting 清楚，Positioning 可再鋒利",
      "subScores": {
        "S_segmentation": { "score": 7, "max": 8, "status": "healthy" },
        "T_targeting":   { "score": 7, "max": 8, "status": "healthy" },
        "P_positioning": { "score": 6, "max": 9, "status": "warn",
          "evidence": "Positioning statement 缺 unlike/we 差異化子句" }
      }
    },
    "T": {
      "total": 15,
      "max": 25,
      "status": "warn",
      "diagnosis": "產業競爭強度偏高，內部訊號尚未累積足夠",
      "subScores": {
        "internal_signals": { "score": 7, "max": 12 },
        "competition_intensity": { "score": 5, "max": 8 },
        "ai_maturity": { "score": 3, "max": 5 }
      }
    },
    "H": {
      "total": 22,
      "max": 25,
      "status": "healthy",
      "diagnosis": "資源盤點 + SMART 化能力強，這是你的護城河"
    }
  },

  "nextActions": [
    {
      "id": "act-1",
      "title": "補 Traction 第一波證據",
      "priority": 1,
      "smart": {
        "specific": "蒐集 3 個付費客戶的 testimonial video",
        "measurable": "每段 ≥ 60 秒 · 含「為什麼選 BeyondPath」",
        "achievable": "你的客戶池中有 8 位合適對象 · 工時 6h · 城堡估 1h",
        "relevant": "T 軸 +5 分 · 下輪 PATH 診斷預估 87/100",
        "timeBound": "2026-05-05 前（2 週內）"
      },
      "owner": "你 + 助理",
      "risk": "客戶可能不想露臉 → 備案改文字 + logo",
      "failureCondition": "若找不到 3 位願拍者 → 先補驗證層（跑問卷引擎）",
      "crossToolTarget": null
    },
    {
      "id": "act-2",
      "title": "鋒利化 Positioning Statement",
      "priority": 2,
      "smart": {
        "specific": "完成「For X who Y, BeyondPath is Z that W, unlike A we B」六格",
        "measurable": "社群投票 3 個變體選 1",
        "achievable": "工時 3h",
        "relevant": "A 軸 Positioning 子分 6→8 · PATH +2",
        "timeBound": "本週內"
      },
      "owner": "你",
      "risk": "過度鋒利可能失去 primary segment",
      "failureCondition": "若投票 3 變體都 < 30% 支持 → 回頭跑 Lab 確認 Persona",
      "crossToolTarget": "lab"
    },
    {
      "id": "act-3",
      "title": "L4 Addiction 儀式強化",
      "priority": 3,
      "smart": {
        "specific": "每週五寄送「本週 PATH 分數變化」email",
        "measurable": "D7 retention +10pp",
        "achievable": "MailChimp 自動化 · 工時 2h",
        "relevant": "L4 子分 5→5.5 + 留存護城河",
        "timeBound": "2026-04-28 上線"
      },
      "owner": "你",
      "risk": "email 疲勞 → 測 A/B 開信率",
      "failureCondition": "開信率 < 25% → 改 LINE Notify",
      "crossToolTarget": null
    }
  ],

  "hypothesis": {
    "dataSources": [
      { "type": "user_answers", "count": 24, "source": "🟢 measured" },
      { "type": "industry_benchmark", "count": 47, "source": "🟡 estimated · AI 推估台灣同階段新創中位數" },
      { "type": "lab_quotes", "count": 0, "source": "🔴 未啟用 · 建議跑 Lab 深化" }
    ],
    "coreAssumptions": [
      "假設 1：你的作答反映真實狀態（非「想當然」填答）",
      "假設 2：同業 benchmark 代表你的實際參照群（TW 3-20 人 B2B SaaS）",
      "假設 3：未來 3 個月市場環境穩定（若 AI 法案突然實施，T 軸需重估）"
    ],
    "confidence": 72,
    "confidenceRationale": "作答一致性 85% · 同業比對樣本 47 · 資料新鮮度 30 天內",
    "failureCondition": "若假設 1 不成立（作答偏差大）→ 本結論失效，需重跑",
    "recommendedRecheck": "2 週後（action 完成後）或當市場出現重大事件時"
  },

  "crossToolNav": {
    "triggers": [
      {
        "condition": "pathScores.A.total < 60",
        "target": "lab",
        "label": "Audience 不夠清楚 → 跑 Lab 合成 5 位 persona 驗證"
      },
      {
        "condition": "pathScores.T.total < 60",
        "target": "market-signal",
        "label": "Traction 弱 → 看市場訊號是否支撐"
      }
    ]
  },

  "meta": {
    "generatedAt": "2026-04-21T18:00:00+08:00",
    "model": "claude-sonnet-4.5",
    "promptVersion": "v2.0",
    "schemaVersion": "2.0",
    "costUSD": 0.023,
    "latencyMs": 2400,
    "shelfLife": "30 days",
    "aiTransparency": {
      "aiGenerated": ["verdict", "diagnosis", "nextActions.*.smart"],
      "userInput": ["pathScores.P.total", "pathScores.A.total", "..."],
      "algorithmic": ["confidence", "crossToolNav.triggers"]
    }
  }
}
```

---

## §3 · 敘事範本（Gemini 70% + GPT 30% · 液態團隊時代）

### §3.1 Hero Verdict 5 種情境範本

**條件**：根據 PATH 總分 + 最弱軸動態選擇

| PATH 總分 | 最弱軸 | Hero Verdict 範本 |
|:---:|:---:|---|
| ≥ 85 | - | 「方向鋒利，現在全力衝刺就對了」（teal）|
| 70-84 | T | 「方向對，補 Traction 就能衝」（teal）|
| 70-84 | A | 「方向對，但受眾要再聚焦」（gold）|
| 70-84 | P | 「執行力強，但先確認真的是問題」（gold）|
| 70-84 | H | 「方向對，執行力需要支援系統」（gold）|
| 50-69 | - | 「訊號混合，先補最弱維度」（gold）|
| < 50 | - | 「重新思考切入點會比硬推有效」（rose）|

**語氣紀律**：
- ✅ **對讀者說話**（「你」開頭 / 結尾有推力）
- ❌ **不用「您」** · **不用顧問腔**（「基於本分析，建議...」）
- ✅ **像朋友的戰略夥伴**（溫暖精準）
- ❌ **不煽情**（「加油！」「相信自己」禁用）

### §3.2 液態團隊時代彩蛋（整篇只出現 1 次）

每份 PATH 診斷報告結尾 footer 前，放一段彩蛋：

> 💡 **時代判讀**：2026 是**液態團隊時代**——3-10 人用 Claude 跑完驗證到營收的元年。你正在參與這個實驗。

**硬規則**：
- 不在 hero 出現（避免過度品牌敘事）
- 不在每章重複
- 整份報告僅此一處（密度控制）

---

## §4 · 漸進揭露 UI 設計

### §4.1 展開行為規格

**Default view**（手機 / 快速掃）：
```
Hero verdict（一句話）
POC SCORE + verdict badge
PATH 四維雷達圖 + 4 個 bar（P/A/T/H）
Next Action Top 3（卡片）
[展開看方法論抽屜 📐]
```

**Expanded view**（點 P 軸 → 展開 JTBD 4 層）：
```
P 軸 18/25  你的用戶把你雇用來完成什麼？
├─ L1 功能層    5.5/6   🟢 「一個人跑完整條鏈」
├─ L2 情感層    5.0/6   🟢 「半夜不孤單」
├─ L3 身份層    6.0/7   🟢 「獨立創辦人」
└─ L4 習慣層    5.0/6   🟢 晨間儀式

診斷 + 證據 + 改進動作
```

### §4.2 漸進揭露紀律

- 預設折疊：JTBD 4 層子分、Hypothesis 方法論抽屜
- 預設展開：Hero verdict、PATH 四維、Next Action Top 3
- 一點展開原則：點某軸 → 只展那軸子分，不全部展開（避免認知負擔）

---

## §5 · 整合步驟（等卡西法 D2-D4 完成後）

### §5.1 主對話蘇菲要做的（非 app.html 操作）

1. ✅ D5 content spec 落檔（本文件）
2. 📋 撰寫 Claude API prompt 升級版（約 2000 字）→ 存 `projects/beyondpath/ai-proxy/prompts/path-diagnostic-v2.md`
3. 📋 建 JSON Schema 驗證檔 → 存 `projects/beyondpath/reports-standards/schemas/path-diagnostic-v2.schema.json`
4. 📋 撰寫 5 種 Hero verdict 範本 + 敘事測試集（5 組假資料）

### §5.2 卡西法要做的（app.html 操作 · 等 D2-D4 完成後整合）

1. 🏃 D2 Render Engine v1（進行中）
2. 🏃 D3 URL routing（進行中）
3. 📋 D4 AI Wrapper v2（下一輪派工）
4. 📋 D5 整合：將 `showQuizResults()` 升級為呼叫 `BPReport.render(diagnosticSchema, aiData)`

---

## §6 · Sprint 1 完成 DoD 對應（馬魯克 10 條）

| # | DoD 條款 | D5 貢獻 |
|:-:|---|---|
| 1 | PATH 診斷頁可正常渲染 · console 0 error | D5 整合後驗證 |
| 2 | 5 rubric AC ≥ 80% | D5 內容升級貢獻 content-rubric §2 + UX §1.1 |
| 3 | `page-title-area` 合規 | D5 不動 page-title，只改 report 內容 |
| 4 | Gate 1 Chrome MCP 實測 | D5 完成後跑 |
| 5 | Gate 2 視覺 10 維 ≥ 85 | D5 套 `.report-*` namespace 貢獻視覺 rubric |
| 6 | Gate 3 霍爾對齊（JTBD 4 層融入不違 Howl's Law）| **D5 主要戰場** |
| 7 | Gate 4 版控 | 最終 push 前 |
| 8 | diff-report AC ≥ 80% | D5 貢獻 AC 條目 |
| 9 | spec 落檔 | **本檔 ✅** |
| 10 | sidebar-version v1.4.0 | 最終 push 前 |

---

## §7 · 風險與守護

| 風險 | 預防 |
|------|------|
| Claude API 產出 JTBD 4 層品質不穩 | prompt 內放 3 組 few-shot examples · schema 驗證 failed 自動 retry 1 次 |
| Hero verdict 太模板化沒靈魂 | 5 種情境範本 + 隨機挑 1 變體（保留品牌辨識度）|
| L3 Identity 層需外部證據（LinkedIn bio 等）· 取得成本高 | v1 用「自評 + 社群推論」· v2（S3+）接 LinkedIn API |
| 跨工具導引 F1/F2 過度打擾 | 只觸發一次 + 可 dismiss + 分數跨閾值才觸發 |
| 液態團隊時代彩蛋被讀者認為廣告腔 | A/B 測試 2 版本（有/無彩蛋）· 留存率差 < 2pp 則保留 |

---

## §8 · 下一步

**D5 content spec 落檔完畢 ✅**

等卡西法 bg agent（`ab22ff9071345eacb`）完成 D2+D3 後：
1. 主對話蘇菲撰寫 Claude API prompt 升級版（`ai-proxy/prompts/`）
2. 撰寫 JSON Schema 驗證檔（`schemas/path-diagnostic-v2.schema.json`）
3. 派新卡西法 bg 做 D4 AI Wrapper v2 + D5 整合
4. Gate 1-4 全跑 + push v1.4.0

---

*D5 Content Spec v1.0 · 2026-04-21 · 主對話蘇菲*
*Howl's Law 守護 · Gemini 70% + GPT 30% · 液態團隊時代敘事*
