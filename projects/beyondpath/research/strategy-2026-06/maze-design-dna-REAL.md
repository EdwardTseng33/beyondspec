# maze.co 設計 DNA（真實實測 · 2026-06-20）+ landing-v5 重做藍圖

> 蘇菲親自用 Chrome 滾過 maze.co 實測（前 4 屏截圖觀察）+ 2026 配色趨勢 web search。
> 背景：Edward 三次回饋「沒讀到 maze 的動態」「呆板無聊」。這份是真的讀到後的拆解。

## 一、maze 的動態 DNA（我之前完全沒抓到的）

| # | maze 實際手法 | 我之前做的（錯） |
|---|---|---|
| 1 | **整段背景大膽變色滑入**：往下滾，整片畫面從米白→螢光綠→紫色大區塊浮現。顏色是「一整段」的 | 暖米底不變 + 小卡片淡入 |
| 2 | **超大標題**：H1 佔半個畫面、字超大、行距鬆 | 標題中等、偏密 |
| 3 | **大量留白、慢節奏**：一段一個重點，scroll 距離長 | 段落密、元素多 |
| 4 | **scroll 觸發轉場**：大區塊浮上來、視差、顏色換場 | reveal 只有淡入上浮 |
| 5 | **互動頁籤切換**：Recruit/Research/Analyze 大字 tab | 無互動切換 |
| 6 | **真實產品 UI + 真人照片**穿插浮動 | lo-fi 小卡、無真人 |

## 二、maze 配色（實測）
- 底：暖米白（warm cream）
- 黑字（高對比、超粗大標）
- **大色塊**：藍（人群插圖）、**紫**（demographics 區塊整塊）、**螢光綠 acid green**（整段背景）
- 彩色是「整段背景」級用法，不是點綴

## 三、2026 UIUX 配色趨勢（web search）
- Pantone 年度色 **Cloud Dancer**（空靈白）打底 = reset/clarity/calm
- 主趨勢：**blue-greens**、Acid Green、Cyan Blue、**Hyper-Violet**
- 薰衣草/柔紫 → AI app 常見
- 自然暖調仍主流
- 色彩當「系統」：明暗模式/無障礙/OLED；neon 當受控點綴、WCAG 4.5:1
- 來源：recursion.agency / loungelizard / andacademy / updivision

→ **結論**：BeyondSpec 現有「暖米 + 紫 + 螢光綠」完全在趨勢上。要改的是「用法」——從小點綴 → 整段大色塊。

## 四、landing-v5 重做藍圖（拿著 maze 做，不憑想像）

**保留**（Edward 核心，v4 已對）：
- 敘事：小團隊的 AI 商業引擎 / 你的生意不該只靠你一個人撐 / 從驗證到收款 AI 幫你跑完每一步 / 人做決策 AI 做苦工
- 核心競爭力上前台：大廠戰力小團隊價格（AI native 小團隊）
- 兩階段：驗證 → 營收
- 視覺基因：暖米 + 超粗黑體 + 紫 + 螢光綠

**用 maze 手法重做**：
1. **每個 section 一個大色塊背景**，scroll 時整段顏色滑入：
   - Hero：暖米
   - 核心競爭力：深墨（已有）
   - 兩階段 / 模組：**整段紫**或**整段螢光綠**背景
   - personas：暖米或淺色
2. **超大標題**：H1 拉到 clamp(56,9vw,120) 級、大留白、行距鬆
3. **真人 personas 段加回來**（Edward 點名要的）：真人照片 + 「他卡在什麼」+ 對應模組。6 個角色（創辦人/PM/業務/HR/財務/老闆）
4. **互動頁籤**：模組用 tab 切換展示（像 maze Recruit/Research/Analyze）
5. **豐富 scroll 動態**：區塊浮現、視差、數字滾動、標題逐字/逐行進場、sticky 換色
6. **節奏放慢**：section padding 加大、一段一重點、不堆疊

**破「呆板」關鍵**：不要每段都「置中標題 + grid」。要 hero 不對稱 / 核心對比 / 兩階段旅程 / personas 真人卡 / 模組 tab 切換 / 大色塊換場——版型與背景色都要變。
