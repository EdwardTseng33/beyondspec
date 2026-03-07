# BeyondSpec Brand Assets — 使用指南

## 設計概念：② Editorial Serif Mixed

**字型搭配**：Playfair Display (Serif, 600) + Outfit (Sans-serif, 700)
**品牌色**：`#2D5BFF`（Spec 藍）
**深色背景**：`#141418`
**淺色背景**：`#FDFCFA`
**深色文字**：`#1A1A2E`

---

## 檔案清單

### SVG（向量，可無限放大）
| 檔案 | 用途 |
|------|------|
| `svg/logo-dark-bg.svg` | 完整 Logo（含中文），深色背景用 |
| `svg/logo-light-bg.svg` | 完整 Logo（含中文），淺色背景用 |
| `svg/logo-en-only-dark.svg` | 英文 Logo，深色背景用 |
| `svg/logo-en-only-light.svg` | 英文 Logo，淺色背景用 |

### PNG（點陣圖）
| 檔案 | 尺寸 | 用途 |
|------|------|------|
| `png/beyondspec-logo-dark-960x240.png` | 960×240 | 大尺寸展示（簡報封面、Banner） |
| `png/beyondspec-logo-dark-480x120.png` | 480×120 | 標準尺寸（網站 Nav、Email 簽名） |
| `png/beyondspec-logo-dark-240x60.png` | 240×60 | 小尺寸（頁尾、浮水印） |
| `png/beyondspec-logo-light-*.png` | 同上 | 淺色背景版本 |
| `png/*-transparent.png` | 同上 | 透明背景版本 |

### 英文版
| 檔案 | 用途 |
|------|------|
| `png/beyondspec-en-dark-480x80.png` | 國際場合、英文文件 |
| `png/beyondspec-en-light-480x80.png` | 同上，淺色背景 |

### 方形圖示（社群 / Google 商家大頭貼）
| 檔案 | 尺寸 | 用途 |
|------|------|------|
| `png/beyondspec-icon-dark-512x512.png` | 512×512 | Google 商家大頭貼、FB/IG 頭像 |
| `png/beyondspec-icon-light-512x512.png` | 512×512 | 同上，淺色版 |

### Favicon
| 檔案 | 尺寸 | 用途 |
|------|------|------|
| `png/favicon-dark.ico` | 16/32/48/64 多尺寸 | 瀏覽器分頁圖示 |
| `png/beyondspec-favicon-dark-32x32.png` | 32×32 | Web favicon |
| `png/beyondspec-favicon-dark-16x16.png` | 16×16 | 最小 favicon |

### 新版 Logo PNG（2026-03 更新）
| 檔案 | 尺寸 | 用途 |
|------|------|------|
| `spec_logo_black.png` | 264×81 | BeyondSpec Logo，淺色/白色背景用（深色文字 + 青綠 Spec） |
| `spec_logo_white.png` | 264×81 | BeyondSpec Logo，深色背景用（白色文字 + 青綠 Spec） |
| `path_logo_black.png` | 264×81 | BeyondPath Logo，淺色/白色背景用（深色文字 + 橘色 Path） |
| `path_logo_white.png` | 264×81 | BeyondPath Logo，深色背景用（白色文字 + 橘色 Path） |

---

## 建議使用情境

| 情境 | 推薦檔案 |
|------|----------|
| BeyondSpec 官網 Nav | `spec_logo_black.png`（已套用，height: 36px） |
| BeyondSpec 官網 Footer | `spec_logo_white.png`（已套用，height: 32px） |
| BeyondPath 工具網站（淺底） | `path_logo_black.png` |
| BeyondPath 工具網站（深底） | `path_logo_white.png` |
| 官網深色區塊（舊版 SVG） | `svg/logo-dark-bg.svg` |
| Google 商家大頭貼 | `png/beyondspec-icon-dark-512x512.png` |
| 社群媒體頭像 | `png/beyondspec-icon-*-512x512.png` |
| 簡報封面 | `png/beyondspec-logo-*-960x240.png` |
| Email 簽名 | `png/beyondspec-en-*-480x80.png` |
| 名片 | `svg/logo-*-bg.svg`（印刷用向量） |
| 瀏覽器 Favicon | `png/favicon-dark.ico` + `beyondspec-favicon-dark-32x32.png` |
| OG Image / 封面照 | 使用 `logo-generator.html` 產出 |

---

## Favicon HTML 用法

```html
<link rel="icon" type="image/x-icon" href="/brand-assets/png/favicon-dark.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/brand-assets/png/beyondspec-favicon-dark-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/brand-assets/png/beyondspec-favicon-dark-16x16.png">
```
