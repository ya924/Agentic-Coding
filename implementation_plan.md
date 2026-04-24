# 俄羅斯方塊遊戲開發計畫 (最終版)

開發一個高品質、具備現代感視覺效果的純 HTML/JavaScript 俄羅斯方塊。

## 使用者需求確認
- [x] 純 HTML (HTML5 Canvas + Vanilla JS)
- [x] 箭頭控制
- [x] 音效 (使用 Web Audio API 產生)
- [x] 多個顏色 (各形狀專屬顏色)
- [x] 預覽方塊
- [x] 直接下落 (Hard Drop)
- [x] 左右旋轉 (上箭頭/X 順時針，Z 逆時針)

## 視覺設計提案
- **主題**：淺色霓虹風格 (Light Neon / Frosty)。
- **特效**：方塊消除時的閃爍動畫、背景淡入淡出漸層、玻璃擬態 (Glassmorphism) 的 UI 面板。
- **字體**：使用 Google Fonts (如 `Orbitron` 或 `Inter`)。

## 擬定實施檔案
- [index.html](./index.html): 網頁結構與 UI 配置。
- [style.css](./style.css): 視覺美化、動畫定義。
- [audio.js](./audio.js): 負責使用 Web Audio API 產生遊戲音效。
- [tetris.js](./tetris.js): 核心遊戲邏輯。

## 預定開發步驟
1. **建立基礎結構與樣式**：已完成。
2. **音效系統**：已完成。
3. **遊戲核心邏輯**：已完成。
4. **互動控制與修正**：已修正開始按鈕顯示問題。

## 驗證計畫
- [x] 測試基本移動與旋轉。
- [x] 測試消除行是否正確計分。
- [x] 測試 Hard Drop 功能。
- [x] 測試音效觸發。
- [x] 檢查視覺效果是否符合 Premium 標準。
