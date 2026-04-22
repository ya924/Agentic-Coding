# 俄羅斯方塊遊戲開發計畫 (Tetris Master)

這是一個基於 HTML5 Canvas、CSS3 與原生 JavaScript 開發的現代化俄羅斯方塊遊戲。

## 使用者需求確認
- [x] 純 HTML/JS/CSS 實作。
- [x] 箭頭鍵控制移動與旋轉。
- [x] 包含音效 (使用 Web Audio API 合成)。
- [x] 多種顏色方塊。
- [x] 預覽下一個方塊。
- [x] 直接下落 (Hard Drop) 功能。
- [x] 支援左右旋轉 (Z/X 或 Up/Ctrl)。

## 視覺與互動設計 (Premium Aesthetics)
- **配色方案**：深色背景搭配霓虹色彩 (Neon Colors)。
- **特效**：方塊消除時的閃爍效果、背景動態漸層、玻璃擬態 UI。
- **字體**：使用 'Inter' 或 'Orbitron' 提升科技感。

## 檔案結構
- `index.html`: 遊戲主頁面。
- `style.css`: 視覺樣式與動畫。
- `game.js`: 核心遊戲邏輯 (Grid, Tetrominoes, Collision)。
- `audio.js`: 音效合成模組 (Web Audio API)。

## 預定更動

### 1. 基礎架構
- [NEW] [index.html](./index.html)
- [NEW] [style.css](./style.css)

### 2. 核心邏輯
- [NEW] [game.js](./game.js)
- 處理方塊矩陣、旋轉演算法、消除邏輯、計分系統。

### 3. 音效模組
- [NEW] [audio.js](./audio.js)
- 使用 Web Audio API 產生移動、旋轉、消除行的音效。

## 驗證計畫
### 自動化測試
- 使用 Browser Subagent 進行操作錄影與功能驗證。

### 手動驗證
- 檢查所有控制鍵 (箭頭、空白鍵、Z/X) 是否正常。
- 確認消除行時音效與動畫是否同步。
- 確認預覽視窗正確顯示下一個方塊。
- 測試 Hard Drop 邏輯。
