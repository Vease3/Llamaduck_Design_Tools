# 🚀 Implement Meal-Making-Monkey Design-Token Colors  
*Step-by-step instructions for an autonomous AI agent (LLM)*  
*(“direct CSS variable” method – **no Tailwind config mapping**)*

---

## 1  Locate the generated token style sheets  

| Theme | File | Selector inside |
|-------|------|-----------------|
| **Light** | `src/app/styles/colors/LightMode.css` | `:root { --token-name: … }` |
| **Dark**  | `src/app/styles/colors/DarkMode.css`  | `[data-theme="dark"] { --token-name: … }` |

> These files are produced by Style Dictionary; do **not** edit manually.

---

## 2  Import them globally (once)  

Edit `src/app/globals.css` **top** lines:

```css
@import "./styles/colors/LightMode.css";
@import "./styles/colors/DarkMode.css";

/* existing global styles follow … */
Never import these sheets anywhere else; once is enough.

3 Theme-switch mechanism
src/app/layout.tsx must:

Read localStorage.theme OR (prefers-color-scheme: dark) on first load.

Write <html data-theme="dark"> when dark mode is active.

Save choice back to localStorage.

A working version is already provided (see final code block below).
If the layout is regenerated, replicate the same logic.

4 Use variables directly in components
4.1 Plain CSS / CSS Modules
css
Copy
Edit
.card {
  background: var(--system-color-elevation-base-background);
  color:      var(--system-color-elevation-base-content);
}
4.2 Inline style in JSX/TSX
tsx
Copy
Edit
<div style={{
  background: 'var(--system-color-elevation-base-background)',
  color:       'var(--system-color-elevation-base-content)'
}}>
  Token-based colors
</div>
4.3 Tailwind utilities (arbitrary values)
tsx
Copy
Edit
<div className="
  bg-[var(--system-color-functional-info)]
  text-[var(--system-color-neutral-mid-tone-grey-900)]
  border
  border-[var(--system-color-border-primary)]
  rounded-[var(--system-border-radii-small)]
">
  Using `[var(--…)]` tokens
</div>
Square-bracket syntax works for any Tailwind property: bg-, text-, hover:bg-, h-, etc.

5 Refactor hard-coded colors
Search project for:

Hex codes (#, rgb(), Tailwind palette classes (bg-slate-…, text-black)

Replace with var(--token-name) or the bracketed Tailwind form.

Verify no remaining hard-coded palette values.

6 Testing checklist
Test	Expected
Page loads (light)	Background & text use light token values
Click theme toggle	<html data-theme="dark"> appears, all colors switch
Refresh	Theme persists via localStorage.theme
Lighthouse	Color-contrast passes in both themes

7 Optional enhancements
Helper classes – create small semantic classes in a CSS file if the direct var(--) strings feel verbose.

Token name shortening – post-process Light/Dark CSS to strip prefixes if desirable.

CI check – snapshot a few computed colors in light & dark to catch regression.

8 Reference: working layout.tsx
tsx
Copy
Edit
'use client';

import type { Metadata } from 'next';
import { Lexend_Deca } from 'next/font/google';
import { useEffect, useState } from 'react';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const lexendDeca = Lexend_Deca({
  subsets: ['latin'],
  variable: '--font-lexend-deca',
});

export const metadata: Metadata = { /* …your existing metadata unchanged… */ };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return (
      localStorage.getItem('theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    ) as 'light' | 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme; // sets data-theme attr
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <html lang="en">
      <body className={`${lexendDeca.variable} antialiased min-h-screen overflow-x-hidden`}>
        <button
          onClick={() => setTheme(t => (t === 'light' ? 'dark' : 'light'))}
          className="fixed top-4 right-4 z-50 rounded border p-2 backdrop-blur-md"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}