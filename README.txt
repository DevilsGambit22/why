ACFA LIVE SIDEBAR V2.1
======================

Changes in this build
- Removed Quick Links tab/section.
- Uses Chess.com club profile members_count for the authoritative member total.
- Club Life Monitor can use Chess.com's club-created timestamp (with May 12, 2026 as the built-in fallback).
- Newest Members board uses the club members endpoint, sorts by joined timestamp, then enriches only the newest members.
- Titled board no longer assumes the club-members endpoint contains titles. It intersects the club roster with Chess.com's official GM/WGM/IM/WIM/FM/WFM/NM/WNM/CM/WCM title endpoints.
- Rating helper now prefers each category's documented best rating, with current/last rating as fallback.
- API calls are serialized and cached locally to reduce unnecessary requests and 429 rate-limit errors.
- Competitive record follows each @id returned by /pub/club/{club}/matches.
- Daily Team endpoints (/pub/match/{id}) and Live Team endpoints (/pub/match/live/{id}) are both normalized into W/D/L.
- Team-match variants such as Chess960 are included through settings.rules.
- Vote Chess is intentionally excluded from the competitive record because Chess.com's current Published-Data API documentation does not expose a documented Vote Chess result endpoint. The sidebar shows a small note stating that Vote Chess is not included.

Hosting
Upload the contents of acfa-sidebar-v2 to GitHub Pages, Cloudflare Pages, Netlify, or another static HTTPS host.
