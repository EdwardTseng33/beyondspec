# Post-Mortem · v1.3.17 戰情室白屏 bug

> **事件**：v1.3.17 推出後，愛德華打開營運戰情室看到白屏
> **發現時間**：2026-04-21（v1.3.18 剛推完，愛德華才發現——表示至少兩天以上 production 壞掉沒被 catch）
> **修復版本**：v1.3.19（卡西法 hotfix）
> **Severity**：**High**（核心模組白屏，但有 fallback 路由可用）

---

## 一、技術根因（卡西法診斷）

### Stack trace

```
TypeError: Cannot read properties of undefined (reading 'length')
    at renderInsights (app.html:19824:52)
    at renderModule (app.html:7281:7)
```

### Root Cause

v1.3.17 在 `renderInsights()` 頂部 **新增** Hero 今日戰情卡（line 19780-19821）+ 3 mini KPI（19823-19844）。Hero block 執行時需要讀：
- `_overdueTasks.length`
- `_stuckTasks.length`
- `_weekDueTasks.length`

但這 3 個變數**直到 line 19851-19854 才被 `var` 宣告賦值**。

JavaScript `var` hoisting 的行為：
- ✅ **宣告**被 hoist 到函式頂（變數存在，值 = `undefined`）
- ❌ **賦值**不被 hoist

所以執行到 Hero block 時，`_overdueTasks` 是 `undefined`，`.length` 當場炸 TypeError。

### 修法（已 fix）

把 6 個變數預計算區塊（原 19848-19867）**上移到 19780 Hero block 之前**。純結構調整，邏輯零變動。

---

## 二、流程失誤盤點（為什麼沒 catch）

### ❌ 失誤 1：v1.3.17 上線時 **Gate 1 缺失**

城堡憲法規定：**Gate 1（卡西法）必須做 Chrome 瀏覽器實測**，不能只讀 code。

v1.3.17 推的時候：
- ✅ 看了 code 改動
- ❌ **沒開 Chrome MCP 實際打開戰情室頁面**
- ❌ **沒讀 console messages**
- ❌ **沒截圖驗證 Hero + 3 KPI 有渲染**

**違反的憲法條款**：`CLAUDE.md` Gate 1「程式碼驗證 + 瀏覽器實測」——兩項都要做，不是二選一。

### ❌ 失誤 2：主對話蘇菲輕忽「只是 prepend」

我在整合 v1.3.17 時內心的判斷：
> 「只是在函式頂部加兩個 HTML block，既有邏輯不動，應該沒事。」

這個判斷忽略了：
- `var` hoisting 的 gotcha（JS 經典陷阱）
- 新 block 可能引用舊 block 才賦值的變數
- 大函式（renderInsights ~500 行）局部視角無法看出依賴鏈

### ❌ 失誤 3：renderInsights 沒有 smoke test

`projects/beyondpath/tests/` 目錄有 unit test 框架，但 `renderInsights` 這種純 render 大函式**沒有對應 test 檔**。

### ❌ 失誤 4：沒寫 pre-push smoke playbook

愛德華看到的是 prod 壞掉，表示我推 push 到 **GitHub Pages 部署完成之間的 30-60 秒**沒有做任何驗證動作。

### ❌ 失誤 5：兩次推版（v1.3.17 → v1.3.18）都沒踩到

- v1.3.17 上線時：我沒驗戰情室就走了
- v1.3.18 我只動了 renderFullReport 和 renderMarketSignal 的 Math.random，**沒動戰情室**——但 v1.3.17 的 bug 已經躺在那，只要有用戶打開就會炸

**結論**：這個 bug 大概從 v1.3.17 上線那刻（可能 2-4 小時前）就壞了。愛德華一直到剛才才點進去。

---

## 三、未來怎麼避免（SOP 升級）

### 🔒 憲法級強化（加入 `CLAUDE.md`）

1. **每次改 `render*` 函式必跑 Gate 1 實測**
   - Grep `function render[A-Z]` 的任何改動（新增 block / 移動區塊 / 加變數）都必須走 Chrome MCP 渲染測試
   - **最低標準**：navigate 到該模組 + read_console_messages 無 error + read_page 確認有 content

2. **「prepend block」陷阱警覺**
   - 若在既有函式**頂部**新增內容，新 block 內引用的每個變數**必須逐一確認**已在上方宣告賦值
   - 動刀前 grep 該變數名，確認 assign 位置
   - 這是 JS `var` hoisting 的經典陷阱，必須納入檢查清單

3. **Pre-push smoke playbook**（強制走完才允許 push）
   ```
   1. Chrome MCP navigate /path/app/
   2. 登入
   3. 走訪「動了刀」的所有模組
   4. read_console_messages 確認 0 error
   5. 截圖對照前版
   6. PASS 才能 git push
   ```

4. **renderInsights / renderFullReport / renderLab 等「大函式」加 smoke test**
   - 用 jsdom mock globals 跑函式，確認無 exception
   - test 不需測 DOM 結果，只驗「執行不崩」即可（minimal smoke）
   - 本次 v1.3.19 hotfix 卡西法已驗證 mock 跑通

### 🛠 工具層強化

5. **Runtime error boundary**
   - 在 `renderModule` 包 try-catch，捕捉到 error 時顯示 graceful fallback（「模組載入失敗，錯誤碼 XXX，請 refresh」）而不是白屏
   - 同時呼叫 `window.BPReport.callAI` （未來的）或 console error 讓我後端知道有 prod error

6. **JS 執行錯誤監控**
   - 加 `window.onerror` handler，把 error 寫進 `bp_error_log` localStorage + 選擇性 Firestore
   - 每週檢查 prod error 有沒有累積

7. **var → const/let 漸進遷移（但 ES5 政策要先討論）**
   - 目前 CLAUDE.md 規定 ES5 only（Safari 13 相容）
   - `const/let` 的 TDZ（temporal dead zone）行為會讓這個 bug 在**宣告前使用**時**直接報錯**而不是 `undefined`
   - 但 ES5 政策目前優先度更高，先透過 SOP 擋住

### 🧠 人性層面（我自己的失誤反省）

8. **不信任自己的「這改動很小」判斷**
   - 任何 UI 代碼改動都有 side-effect 風險
   - 大函式尤其——局部視角無法看全依賴
   - 「只加兩個 block」不等於「安全」

9. **多對話迭代時不偷懶**
   - v1.3.17 是我一路推 30 版的第 27 版，我在節奏上急，沒走 Gate 1
   - 快的代價是把品質關卡跳過，之後付出 debug + hotfix + 信任成本更大

10. **愛德華睡覺前推大版本時特別謹慎**
    - 這次是深夜推版，隔天早上愛德華才可能發現
    - 深夜推 = 瑕疵傳到 prod 後沒人即時 catch
    - **規則**：深夜推版的 Gate 1 要求更高（必跑 Chrome MCP 3 個核心模組 smoke）

---

## 四、延伸檢查（馬魯克跑過一次）

這個 bug 讓我擔心其他 `render*` 函式有沒有相同毛病。請馬魯克（Gate 4）之後跑一次審計：

1. grep `function render[A-Z]\w+` 列出所有 render 函式
2. 檢查每個函式頂部 20 行內若有 block 引用 `_xxx` 變數，該變數 assign 位置是否在 block 之後
3. 若有，列入 v1.3.20+ hotfix backlog

---

## 五、本次 bug 帶來的正面價值

**壞事轉好事**：這次慘痛經驗讓我把 Gate 1 SOP 重新打磨更細，未來推版 regression 率會顯著下降。而且卡西法在 mock 環境驗證 renderInsights 的實作，為後續可能的 smoke test 框架鋪路了。

---

*建立日期：2026-04-21 深夜 · 作者：蘇菲（自我反省）· Peer-review：卡西法 Gate 1 技術面*
