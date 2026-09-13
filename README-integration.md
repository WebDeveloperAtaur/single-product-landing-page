# Alargy Shifa Landing Page — Integration Guide

## Files
- `index.html` — full markup, wrapped in one `<div class="as-page">`
- `alargy-landing.css` — all styles, every selector scoped under `.as-page` (won't touch your theme's global styles)
- `alargy-landing.js` — countdown, package/delivery pricing, FAQ accordion, gallery, and the order submission + tracking logic

## Adding it in Elementor
1. Create a new page → set it to **Elementor Canvas** (no theme header/footer) if this is a dedicated ad-landing page.
2. Drop a single **HTML** widget into a full-width section and paste everything between (and including) `<div class="as-page">` and `</div><!-- /.as-page -->`.
3. Add the CSS: Elementor → page settings → **Custom CSS** (paste `alargy-landing.css` contents), or upload it as a file and enqueue it only on this page.
4. Add the JS: paste `alargy-landing.js` inside a **HTML widget's `<script>` tag** at the bottom of the page, or enqueue it as a file via a snippet plugin (WPCode/Code Snippets), scoped to this page only.
5. Do **not** add a separate GTM/Meta Pixel plugin on top of this page — the container ID (`GTM-NPPM42CD`) and Pixel ID (`846247267870260`) are already in the `<head>` block at the top of `index.html`. If your theme already fires GTM/Pixel sitewide, delete that block here to avoid double PageView events, but keep `alargy-landing.js` as-is (it only pushes `purchase`/`Purchase` events, which are safe to keep either way).

## What's editable without touching code
Every visible line of copy is marked with `<!-- EDITABLE -->` in `index.html` — headings, bullet points, prices shown in text, testimonials, FAQ, footer links. If you rebuild sections as native Elementor widgets (Heading/Text/Button) instead of one HTML block, just carry over that text.

## What NOT to edit casually
Anything marked `<!-- LOGIC -->` (package `data-price`/`data-old`, delivery `data-zone`/`data-fee`, element `id`s like `asHeroPrice`, `asOrderForm`) is read directly by `alargy-landing.js`. Changing an `id` or a `data-*` value without updating the matching line in the JS will break the price calculator or the order form.

## What changed in this redesign
- Hero section background is now light (off-white → pale mint gradient) to match the reference image, instead of the earlier dark green hero.
- The top ticker bar and main nav are now in **English**, matching the reference screenshot exactly (e.g. "FREE DELIVERY on the Full Course", "Home / Product / Ingredients / Reviews / Order", "Shop Organic" button, search/wishlist/cart icons). The rest of the page (product copy, form, FAQ-less sections) stays Bengali, matching your existing site's language.
- The 3 gallery thumbnails sit directly under the main product image and are **fully wired**: clicking any thumbnail swaps `#asMainImg`'s `src` to that thumbnail's `data-full` value (see `initGallery()` in `alargy-landing.js`). Put a different real photo URL on each thumbnail's `data-full` (and matching `<img src>`) so the swap is visually obvious once your images are in.
- The 3 trust badges ("১০০% জেনুইন পণ্য", "ক্যাশ অন ডেলিভারি", "টাকা ফেরত গ্যারান্টি") moved from the right info column to directly under the thumbnails, matching the reference layout.
- Removed the FAQ section — it wasn't part of the reference image, so the page now only has the sections shown there: top bar, nav, offer bar, hero, why-choose band, how-to-use, order form, reviews, guarantee banner, footer.
- The reference's delivery-area picker in the screenshot shows 3 buttons, but your actual WooCommerce logic only recognizes two zones (ঢাকা / ঢাকার বাইরে, with free delivery on the 2-file package) — kept the real 2-zone logic rather than inventing a third zone that the backend doesn't support. Let me know if you actually want a genuine 3rd tier and I'll wire it into both the form and the JS pricing.

## Product images
Every `src="PASTE_..._URL_HERE"` in `index.html` is a placeholder — swap in your real image URLs (WordPress Media Library links work fine). Nothing else needs to change for images to show up correctly.

## Order submission
The form posts to the same WooCommerce REST endpoint and product ID as your existing build (`wp-json/alargy/v1/order`, product ID `21`). Update `CONFIG.wcProductId` / `CONFIG.orderEndpoint` at the top of `alargy-landing.js` if either changes.
