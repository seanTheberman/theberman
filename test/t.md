Ready for review
Select text to add comments on the plan
CMS Implementation Plan - The Berman Website
Context
Client ko admin panel se website pages edit karne ki capability chahiye. Abhi ~80% content hardcoded hai. PDF brief ke according: Homepage, About, News, FAQ editable hone chahiye + naya Blog section banana hai + navigation updates.

Phase 1: Foundation (DB + Types)
1.1 New Supabase Tables (3 migrations)
page_content - Flexible key-value store for page sections

CREATE TABLE page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,        -- 'home', 'about'
  section TEXT NOT NULL,     -- 'hero', 'how_it_works', etc.
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section)
);
faq_items - DB-driven FAQs

CREATE TABLE faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,     -- HTML from ReactQuill
  category TEXT DEFAULT 'General',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
blog_articles - Mirrors news_articles + subtitle/slug

CREATE TABLE blog_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'The Berman Team',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'All Posts',
  is_live BOOLEAN DEFAULT true,
  show_badge BOOLEAN DEFAULT false,
  read_time TEXT DEFAULT '3 min read',
  slug TEXT UNIQUE
);
1.2 TypeScript Interfaces
File: src/types/admin.ts - Add BlogArticle, FaqItem, PageContent interfaces

1.3 Content Hook
New file: src/hooks/usePageContent.ts - Fetch page_content rows with fallback to hardcoded defaults

Phase 2: Blog System (New)
2.1 New Files to Create
File	Based On	Purpose
src/pages/AdminBlogAction.tsx	Clone AdminNewsAction.tsx	Blog create/edit form (+ subtitle, slug, blog categories)
src/components/admin/views/BlogView.tsx	Clone NewsView.tsx	Admin blog article list
src/pages/Blog.tsx	New	Public blog page with category sidebar + article counts
src/pages/BlogDetail.tsx	Based on NewsDetail.tsx	Blog post detail page
2.2 Blog Categories (hardcoded in code)
All Posts, BER Explained, Costs & Grants, Home Upgrades, Selling & Renting, Green Mortgages & Finance, Regulations, Success Stories, How-to & Guides, FAQs

2.3 Shared Article Components (reuse in both News & Blog detail pages)
File	Purpose
src/components/ArticleCTABanner.tsx	"Secure Your BER Quote Today" CTA (replaces "Return to Newsroom")
src/components/ArticleSocialShare.tsx	Facebook, Instagram, LinkedIn, X icons + "SHARE THIS BLOG POST"
src/components/ArticleNewsletter.tsx	"STAY INFORMED" email subscribe banner
2.4 Wire into Admin
File: src/pages/Admin.tsx

Add "Blog" to sidebar NAV_ITEMS
Add state: blogArticles, fetchBlogArticles()
Add real-time subscription for blog_articles
Render <BlogView /> in view switch
2.5 Routes
File: src/App.tsx - Add /blog, /blog/:slug, /admin/blog/new, /admin/blog/edit/:id

Phase 3: News Updates + Article Page Fixes
3.1 Update News Categories
src/pages/News.tsx line 27: Add 'Policy & Regulation', 'Technology & Innovation', replace 'Industry Updates' → 'Industry Insights'
src/pages/AdminNewsAction.tsx lines 285-290: Same category updates in dropdown
3.2 Update NewsDetail.tsx
Replace "Return to Newsroom" section (lines 218-239) → <ArticleCTABanner />
Replace social share (lines 170-213) → <ArticleSocialShare />
Add <ArticleNewsletter /> before footer
Twitter icon → X icon
Phase 4: FAQ CMS
4.1 Admin FAQ Management
New file: src/components/admin/views/FaqView.tsx

CRUD list with inline create/edit
ReactQuill editor for content
Drag-to-reorder (sort_order)
Active/inactive toggle
4.2 Seed Migration
Convert 21 hardcoded FAQ items from FAQ.tsx into INSERT statements for faq_items table
4.3 Refactor FAQ.tsx
Remove hardcoded FAQ_DATA array (lines 12-306)
Fetch from supabase.from('faq_items').select('*').eq('is_active', true).order('sort_order')
Render content via dangerouslySetInnerHTML
Keep same sidebar layout
4.4 Wire into Admin
Add "FAQ" to Admin.tsx sidebar, state, fetch, real-time subscription
Phase 5: Homepage & About CMS
5.1 Admin Page Content Editor
New file: src/components/admin/views/PageContentView.tsx

Tabs for each page (Home, About)
Collapsible cards per section
Section-specific form fields (text, textarea, ReactQuill, Cloudinary upload, array editor)
Independent save per section (upsert to page_content)
5.2 Seed page_content with current hardcoded values
Home sections: hero, how_it_works, benefits, testimonials, solar, faq_preview, counties, newsletter_cta
About sections: hero, story, values, faq
5.3 Refactor Home.tsx
Use usePageContent('home') hook
Each section reads from DB content with fallback to current hardcoded values
Example: content?.hero?.heading || "Need a BER Cert?"
5.4 Refactor About.tsx
Same pattern as Home.tsx with usePageContent('about')
5.5 Wire into Admin
Add "Page Content" to Admin.tsx sidebar
Phase 6: Navigation Updates
6.1 Layout.tsx Changes
Add to NAV_LINKS: { label: 'Blog', path: '/blog' } with dropdown for blog categories
Add to NAV_LINKS: { label: 'FAQ', path: '/faq' }
Update footer links to include Blog and FAQ
Social links in footer: Facebook (specific URL), Instagram (TBD), LinkedIn (specific URL), X (TBD)
Files Summary
New Files (11)
supabase/migrations/YYYYMMDD_create_page_content.sql
supabase/migrations/YYYYMMDD_create_faq_items.sql
supabase/migrations/YYYYMMDD_create_blog_articles.sql
src/hooks/usePageContent.ts
src/pages/AdminBlogAction.tsx
src/pages/Blog.tsx
src/pages/BlogDetail.tsx
src/components/admin/views/BlogView.tsx
src/components/admin/views/FaqView.tsx
src/components/admin/views/PageContentView.tsx
src/components/ArticleCTABanner.tsx + ArticleSocialShare.tsx + ArticleNewsletter.tsx
Modified Files (9)
src/types/admin.ts - New interfaces
src/pages/Admin.tsx - 3 new sidebar tabs, state, fetches, subscriptions
src/pages/AdminNewsAction.tsx - Updated categories
src/pages/News.tsx - Updated categories
src/pages/NewsDetail.tsx - CTA banner, social icons, newsletter
src/pages/FAQ.tsx - DB-driven instead of hardcoded
src/pages/Home.tsx - usePageContent hook
src/pages/About.tsx - usePageContent hook
src/components/Layout.tsx - Nav + footer updates
src/App.tsx - New routes
Verification
Admin panel: Create/edit/delete blog posts, FAQ items, page content sections
Public pages: Blog listing with category filter, blog detail with CTA/social/newsletter
News: New categories work, article detail has updated banners/icons
FAQ: Items load from DB, admin can add/edit/reorder
Home/About: Content loads from DB, fallback works if no DB data
Navigation: Blog dropdown and FAQ link visible in header + mobile menu + footer
