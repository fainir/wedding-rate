# wedding-rate Design

## Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (CSS-first config, no tailwind.config.ts)
- SQLite via better-sqlite3 (server-only)
- JWT auth via jsonwebtoken + httpOnly cookies
- bcryptjs for password hashing

## Theme
- Gold palette: #C9963C (primary), #F5E6C8 (light), #8B6914 (dark)
- Background: #FBF8F3 (warm ivory)
- Fonts: Playfair Display (headings EN), Heebo (Hebrew), Lato (body EN)
- RTL support via html[dir=rtl]

## DB Schema
users(id, email, name, password_hash, created_at)
weddings(id, slug, couple_name, wedding_date, location, user_id, created_at)
contractors(id, wedding_id, category, name, description, created_at)
reviews(id, contractor_id, wedding_id, rating, review_text, reviewer_name, user_id, guest_token, created_at)

## Auth
- JWT in httpOnly cookie `wr-session`, 30-day expiry
- Language in cookie `wr-lang`

## Pages
/ → landing
/create → create wedding (client component form)
/wedding/[slug] → guest rating page
/wedding/[slug]/results → aggregated results
/login /register /my-reviews → auth pages
