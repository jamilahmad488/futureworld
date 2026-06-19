# FutureWorld Intelligence Interface Standard

This document records the approved website interface standard after the 10-phase standardization work.

## 1. Core Rule

All normal public pages should use the shared FutureWorld global interface instead of manually hardcoded navigation.

Required stylesheet:

```html
<link rel="stylesheet" href="/style.css?v=2.6">
```

Required global script:

```html
<script src="/script.js?v=2.4"></script>
```

Required navigation placeholder:

```html
<nav class="floating-nav" aria-label="Primary navigation"></nav>
```

For Chinese pages:

```html
<nav class="floating-nav" aria-label="中文导航"></nav>
```

The global script builds the desktop navigation, mobile navigation, Chinese access, clean URL corrections, return-home button, translation button, and accessibility behavior.

## 2. Internal Navigation Classes

Use the shared internal navigation stylesheet loaded by `script.js`:

```html
/assets/fwi-internal-nav.css?v=2.1
```

Approved internal navigation classes:

```html
<nav class="fwi-section-nav"></nav>
<nav class="fwi-pillars-nav"></nav>
<nav class="fwi-module-nav"></nav>
<nav class="fwi-lecture-nav"></nav>
<nav class="fwi-report-toc"></nav>
<nav class="fwi-gallery-nav"></nav>
<nav class="fwi-connect-nav"></nav>
<nav class="fwi-internal-nav"></nav>
```

## 3. Page Type Standards

### Intelligence Domain Page

Use this structure:

1. Global navigation placeholder
2. Page hero
3. `.fwi-section-nav`
4. Library / principles section
5. Domains section
6. Method section
7. Priorities section
8. Connected platform section
9. Footer
10. `script.js?v=2.4`

### Course Page

Use this structure:

1. Global navigation placeholder
2. Course hero
3. `.fwi-module-nav`
4. Optional `.fwi-lecture-nav`
5. Course content cards
6. Practice / prompt / checklist boxes
7. Copyright note
8. Footer
9. `script.js?v=2.4`

### Report or Article Page

Use this structure:

1. Global navigation placeholder
2. Report hero
3. `.fwi-report-toc`
4. Executive summary / key question
5. Analysis sections
6. FutureWorld assessment
7. Related links
8. Footer
9. `script.js?v=2.4`

### Gallery Page

Use this structure:

1. Global navigation placeholder
2. Gallery hero
3. `.fwi-gallery-nav`
4. Search bar
5. Gallery grid
6. Lightbox
7. Related links
8. Footer
9. `script.js?v=2.4`

### Connect Page

Use this structure:

1. Global navigation placeholder
2. Connect hero
3. `.fwi-connect-nav`
4. Priority links
5. Domain links
6. Course sharing links
7. Social links
8. Contact section
9. Footer
10. `script.js?v=2.4`

### Chinese Gateway Page

Use this structure:

1. Chinese global navigation placeholder
2. Chinese hero
3. `.fwi-section-nav`
4. Curated Chinese summary sections
5. English / translation route links
6. Footer
7. `script.js?v=2.4`

## 4. Chinese and Translation Standard

FutureWorld uses a hybrid Chinese access system:

- `/zh/` is the curated Chinese gateway.
- `中文翻译` translates the current English page through Google Translate.
- `中文首页` opens the Chinese homepage.

Do not duplicate every English article manually in Chinese unless it is a priority curated page.

## 5. Mobile and Accessibility Standard

All standardized pages receive:

- Mobile bottom navigation
- Mobile sheets for Intelligence, Resources, Chinese access, and Chinese more menu
- ARIA labels
- `aria-expanded` and `aria-controls` for mobile sheets
- Escape-key sheet closing
- Outside-click sheet closing
- Keyboard focus visibility
- Reduced-motion support
- Larger mobile touch targets
- Keyboard-accessible clickable cards

## 6. Clean URL Standard

Always link to clean URLs instead of `.html` when a clean page exists.

Correct examples:

```html
<a href="/pages/climate/">Climate</a>
<a href="/pages/ai/">AI</a>
<a href="/pages/geopolitics/">Geopolitics</a>
<a href="/pages/energy/">Energy</a>
<a href="/pages/futures/">Futures</a>
<a href="/courses/practical-ai-website-building/">Practical AI Course</a>
```

Avoid:

```html
<a href="/pages/climate.html">Climate</a>
```

## 7. QA Checklist for Every New Page

Before publishing a new page, check:

- The page loads `/style.css?v=2.6`.
- The page contains `<nav class="floating-nav"></nav>`.
- The page loads `/script.js?v=2.4`.
- Internal navigation uses one approved `.fwi-*` nav class.
- Mobile view does not overlap content.
- Buttons are readable and tappable.
- Links use clean URLs.
- Related links are included.
- Footer is present.
- Chinese translation access remains available on English pages.
- The page works after Ctrl + F5.
