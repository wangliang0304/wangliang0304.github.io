# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website hosted on GitHub Pages containing a collection of browser-based utility tools. The project uses pure HTML/CSS/JavaScript with no build process or framework dependencies.

**Key Characteristics:**
- 13 standalone HTML tool pages + 1 main landing page
- No backend - all tools run client-side in the browser
- GitHub Pages auto-deploys from `main` branch
- Includes a Chrome extension for bookmark management

## Architecture

### Core Structure
The project follows a flat architecture where each tool is a self-contained HTML file with embedded CSS and JavaScript:

```
index.html                    # Landing page with tool cards grid
{tool_name}.html × 13         # Independent tool pages
js/qrcode.min.js             # Shared library for QR code generation
img/                         # Shared assets (QR codes, images)
chrome_plugin/favoritesPlugin/ # Chrome extension (Manifest V3)
```

### Design System
All pages share a consistent design language through CSS custom properties:

**CSS Variables (defined in `:root` of each page):**
- `--primary-color: #3498db` (or tool-specific variant)
- `--primary-dark`, `--secondary-color`, `--accent-color`, `--danger-color`
- `--border-radius: 8px`
- `--shadow: 0 2px 10px rgba(0,0,0,0.1)`

**Responsive Breakpoints:**
- Desktop: > 768px (default)
- Tablet: ≤ 768px
- Mobile: ≤ 480px

**Common Page Structure:**
```html
<header class="header">          <!-- Tool title + "返回首页" button -->
<div class="container">          <!-- Main tool functionality -->
<footer class="footer">          <!-- Contact info with QR codes -->
<script>                         <!-- Tool-specific logic -->
```

### State Management
- **localStorage** for data persistence (e.g., `quark_drive_manager.html` stores link data)
- No global state - each tool is isolated
- Chrome extension uses `chrome.storage` API

## Tool Catalog

**Completed Tools (12):**
1. `time_tool.html` - Timestamp ↔ datetime conversion
2. `short_link_url.html` - URL shortening (TinyURL API)
3. `url_encode_or_decode.html` - URL encoding/decoding
4. `json_tool.html` - JSON formatting/validation
5. `markdone_preview.html` - Markdown live preview (uses marked.js)
6. `run_html_tool.html` - HTML code playground
7. `waterMark_add.html` - Image watermarking (Canvas API)
8. `diff_tool.html` - Text diff viewer (diff2html library)
9. `qr_code_generate.html` - QR code generator (js/qrcode.min.js)
10. `mothers_day_card.html` - Custom greeting card maker
11. `quark_drive_manager.html` - Quark Drive link manager (CRUD operations)
12. `chrome_plugin/favoritesPlugin/` - Chrome bookmark manager

**In Development (1):**
- `barcode_conver.html` - Barcode generator (EAN-13, Code128)

## Development Workflow

### Adding a New Tool

1. **Create tool page** following the standard structure:
   ```html
   <!DOCTYPE html>
   <html lang="zh-CN">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>工具名称 - Joker的工具箱</title>
       <style>
           /* Copy CSS variables from existing tool */
           /* Add tool-specific styles */
       </style>
   </head>
   <body>
       <header class="header">
           <h1>工具标题</h1>
           <button onclick="location.href='index.html'">返回首页</button>
       </header>
       <div class="container">
           <!-- Tool UI -->
       </div>
       <footer class="footer">
           <!-- Standard footer with contact QR codes -->
       </footer>
       <script>
           // Tool logic
       </script>
   </body>
   </html>
   ```

2. **Add card to landing page** (`index.html`):
   ```html
   <div class="tool-card">
       <div class="tool-header" style="background-color: #[color];">
           <h2>工具名称</h2>
       </div>
       <div class="tool-content">
           <p>工具描述</p>
       </div>
       <div class="tool-footer">
           <a href="tool_name.html" class="btn" style="background-color: #[color];">立即使用</a>
       </div>
   </div>
   ```

3. **Test responsiveness** on mobile/tablet breakpoints

4. **Commit and push** to `main` branch for auto-deployment

### Modifying Existing Tools

- **Global style changes**: Update CSS variables in each tool's `<style>` block
- **Contact info updates**: Modify footer sections and update QR code images in `img/`
- **Tool status**: Mark as "优化中" by adding `opacity: 0.6` and `cursor: not-allowed` to card

### Chrome Extension Development

**Location:** `chrome_plugin/favoritesPlugin/`

**Key Files:**
- `manifest.json` - Manifest V3 config (permissions: bookmarks, storage)
- `popup.html/js/css` - Extension UI
- `background.js` - Service worker

**Testing:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `favoritesPlugin/` folder
4. Test popup functionality

**Debugging:**
- Right-click extension icon → "Inspect popup" (for popup console)
- `chrome://extensions/` → "Inspect views: background page" (for service worker)

## Deployment

**Process:**
- Push to `main` branch
- GitHub Pages auto-builds and deploys
- Custom domain configured via `CNAME` file

**No build commands needed** - pure static files are served directly.

## Code Standards

### JavaScript
- Pure Vanilla JS (no frameworks)
- Use `DOMContentLoaded` before DOM manipulation
- Avoid global variables - use IIFEs or modules where needed
- Client-side data persistence via `localStorage`

### CSS
- Desktop-first approach (media queries use `max-width`)
- CSS variables for theming consistency
- Flexbox for 1D layouts, Grid for card layouts (`tools-grid`)
- Transition effects: `0.3s` for hover states

### HTML
- UTF-8 encoding (`<meta charset="UTF-8">`)
- Semantic tags (`<header>`, `<footer>`, `<main>`)
- Mobile viewport meta tag required

## External Dependencies

**CDN/Libraries:**
- `marked.js` - Markdown parsing (in `markdone_preview.html`)
- `diff2html` - Text diff rendering (in `diff_tool.html`)
- `js/qrcode.min.js` - QR code generation (local file)

**APIs:**
- TinyURL API - URL shortening service (used in `short_link_url.html`)

## Security Considerations

- **All processing is client-side** - no data leaves user's browser except for TinyURL API calls
- **localStorage data** is domain-scoped and not shared
- **Chrome extension** has minimal permissions (bookmarks, storage only)
- **No authentication/backend** - tools are stateless

## Contact Information

- 微信: jokerceshi666
- 公众号: joker测试之路
- GitHub: wangliang0304

---

**Key Principle:** This project prioritizes simplicity and maintainability. Each tool is self-contained to enable easy updates without breaking dependencies.
