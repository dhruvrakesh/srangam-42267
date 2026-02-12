

# SEO Completion: Documentation Update and GSC Activation

**Scope**: Update project documentation to record current verified state, add the remaining blocker (GSC verification), and prepare for custom domain configuration if needed.

---

## Part 1: Current State (Verified)

All code-level SEO fixes from the previous repair cycle are confirmed working:

| Fix | File(s) | Status |
|-----|---------|--------|
| OG image PNG (1200x630) | `public/brand/og-image.png` | Verified -- branded image renders correctly |
| All canonical URLs use `srangam-db.lovable.app` | 7 files | Verified -- zero stale domain references found |
| robots.txt sitemap points to edge function | `public/robots.txt` | Verified -- returns valid XML |
| Home page has Helmet SEO tags | `src/pages/Home.tsx` | Verified -- title, description, OG tags present |
| Font loading optimized | `index.html` | Verified -- display=swap, lazy loading for ancient scripts |
| Edge function domain fixed | `generate-article-seo/index.ts` | Verified |

**The only remaining blocker is not a code issue.** Your Google Search Console screenshots show the property is registered for `nartiang.org`, while the application is deployed at `srangam-db.lovable.app`. Google is looking at the wrong domain entirely.

---

## Part 2: Changes to Make

### 2A. Update `docs/IMPLEMENTATION_STATUS.md`

Add a new "SEO Activation" section under Active Phases that tracks the remaining user actions:

- Add GSC property setup status (pending user action)
- Add custom domain consideration (`nartiang.org` vs `srangam-db.lovable.app`)
- Record the verified state of all code-level fixes
- Add to Known Issues: "GSC registered for wrong domain"

### 2B. Update `docs/SEO_CONFIGURATION.md`

Add a new section documenting the domain strategy decision:

- If `nartiang.org` is the intended public domain: document the custom domain setup steps (A record pointing to 185.158.133.1, TXT verification record, add both root and www in Lovable project settings)
- If `srangam-db.lovable.app` is the production domain: document that GSC must be re-registered for this domain
- Add a "Current Blocker" callout at the top of the file

### 2C. Add GSC verification meta tag to `index.html`

Once you provide the verification code from Google Search Console (for the correct domain property), uncomment line 14 and insert the actual code. This is a single-line edit.

---

## Part 3: User Decision Required

Before any implementation, one strategic decision is needed:

**Which domain is the production identity for Srangam?**

- **Option A: `srangam-db.lovable.app`** (current deployment)
  - Action: Create a new GSC property for this URL, get verification code, share it here
  - No DNS changes needed
  - All code already points here

- **Option B: `nartiang.org`** (your current GSC property)
  - Action: Configure `nartiang.org` as a custom domain in Lovable project settings
  - DNS: Add A records for `@` and `www` pointing to `185.158.133.1`, plus a TXT record for verification
  - After domain is active: update all canonical URLs, OG tags, and sitemap base URL from `srangam-db.lovable.app` to `nartiang.org`
  - This would be a second round of canonical standardization

- **Option C: A different domain** (e.g., `srangam.com` or `srangam.in`)
  - Same process as Option B but with a different domain

---

## Part 4: Implementation (After Decision)

### If Option A (keep `srangam-db.lovable.app`):

| Step | Action | Owner |
|------|--------|-------|
| 1 | Update documentation (2A, 2B above) | AI |
| 2 | Register `srangam-db.lovable.app` in GSC (URL prefix method) | User |
| 3 | Choose HTML tag verification, copy the code | User |
| 4 | Share verification code in chat | User |
| 5 | Uncomment meta tag in `index.html` with actual code | AI |
| 6 | Publish the change | User |
| 7 | Submit sitemap in GSC: the edge function URL shown in robots.txt | User |
| 8 | Request indexing for priority pages (/, /articles, /about) | User |

### If Option B (use `nartiang.org`):

| Step | Action | Owner |
|------|--------|-------|
| 1 | Update documentation (2A, 2B above) | AI |
| 2 | Add `nartiang.org` in Lovable project Settings > Domains | User |
| 3 | Configure DNS: A records for @ and www to 185.158.133.1, TXT record | User |
| 4 | Wait for DNS propagation and SSL provisioning | User |
| 5 | Update all canonical URLs from `srangam-db.lovable.app` to `nartiang.org` (7 files) | AI |
| 6 | Update sitemap base URL in edge function | AI |
| 7 | Update OG tags in index.html | AI |
| 8 | Get GSC verification code for `nartiang.org` | User |
| 9 | Add verification meta tag | AI |
| 10 | Submit sitemap and request indexing | User |

---

## Part 5: Risk Assessment

| Risk | Level | Notes |
|------|-------|-------|
| Documentation updates | Zero | Read-only changes to markdown files |
| GSC meta tag addition | Zero | Single HTML attribute change |
| Custom domain migration (Option B only) | Low | String replacements only, same pattern as previous canonical fix |
| DNS propagation delay | N/A | Can take up to 72 hours, no code impact |

---

## Part 6: What This Plan Does NOT Do

- Does not add SSR or pre-rendering
- Does not expand the codebase
- Does not change routing, auth, or business logic
- Does not touch database schema or RLS policies
- Does not create new components or edge functions

The SEO infrastructure is complete. The remaining work is configuration (GSC setup) and a strategic domain decision.

