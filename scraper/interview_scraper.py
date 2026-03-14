"""
GAMEPM RADAR — Interview Question Aggregator Engine
====================================================
Scrapes gaming PM interview questions from 20+ public sources,
organizes by company, and stores in Supabase.

Sources:
  - Glassdoor (interview section)
  - AmbitionBox
  - Indeed (interview section)
  - Levels.fyi (interview section)
  - Blind (Teamblind.com)
  - Reddit (r/GameDev, r/PMinterviews, r/ProductManagement)
  - Quora
  - Exponent
  - RocketBlocks
  - Product Manager HQ
  - LeetCode Discuss
  - Interview Query / Pathrise
  - Gamasutra / Game Developer
  - GameDev.net forums
  - LinkedIn posts
  - YouTube transcripts
  - Medium blogs
  - Company engineering/product blogs
  - Discord archives (via web)
  - Sample case studies

Runs as part of the daily GitHub Actions cron job.
"""

import os
import re
import json
import time
import hashlib
import logging
from datetime import date, datetime
from urllib.parse import urljoin, quote_plus

import requests
from bs4 import BeautifulSoup

# ─── CONFIGURATION ─────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("interview_scraper")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Rate limiting: be respectful
REQUEST_DELAY = 2.0  # seconds between requests

# Gaming companies to search for
GAMING_COMPANIES = [
    "Riot Games", "Supercell", "Electronic Arts", "Ubisoft", "Epic Games",
    "Roblox", "Valve", "Nintendo", "Sony Interactive Entertainment",
    "Microsoft Gaming", "Take-Two Interactive", "Rockstar Games",
    "CD Projekt Red", "Bungie", "Bethesda", "Capcom", "Square Enix",
    "Bandai Namco", "Konami", "Sega", "Nexon", "NCSoft", "Netmarble",
    "Krafton", "Garena", "Scopely", "Playtika", "Playrix", "Moon Active",
    "King", "Zynga", "Niantic", "Miniclip", "Gameloft", "Dream11",
    "Nazara Technologies", "Larian Studios", "Remedy Entertainment",
    "IO Interactive", "Techland", "Behaviour Interactive",
    "Digital Extremes", "Grinding Gear Games", "Tencent Games",
    "NetEase Games", "Wargaming", "Crytek", "Frontier Developments",
    "Creative Assembly", "Respawn Entertainment", "Insomniac Games",
    "Naughty Dog", "Guerrilla Games", "Obsidian Entertainment",
    "Playground Games", "Rare", "Mojang Studios",
    "SuperGaming", "Moonfrog Labs", "JetSynthesys", "99Games",
]

# PM-related keywords to match
PM_KEYWORDS = [
    "product manager", "pm interview", "product lead",
    "senior pm", "product management", "associate pm",
    "growth pm", "liveops pm", "monetization pm",
]

# Question categories for classification
CATEGORY_PATTERNS = {
    "Product Design": [
        r"design\b", r"build\b", r"create\b", r"feature",
        r"user experience", r"ux\b", r"player experience",
        r"game mechanic", r"battle pass", r"matchmaking",
    ],
    "Metrics & Analytics": [
        r"metric", r"kpi\b", r"measure", r"analytics",
        r"data", r"a/b test", r"experiment", r"retention",
        r"dau\b", r"mau\b", r"arpu\b", r"ltv\b", r"conversion",
    ],
    "Strategy": [
        r"strategy", r"roadmap", r"prioriti", r"vision",
        r"compete", r"market", r"growth", r"monetiz",
        r"business model", r"revenue", r"go.to.market",
    ],
    "Behavioral": [
        r"tell me about a time", r"describe a situation",
        r"give an example", r"how do you handle",
        r"conflict", r"disagree", r"challenge", r"failure",
        r"mistake", r"leadership", r"team\b",
    ],
    "Technical": [
        r"technical", r"api\b", r"system design",
        r"architecture", r"sql\b", r"engineer",
        r"implementation", r"scalab", r"infrastructure",
    ],
    "Case Study": [
        r"case study", r"estimate", r"how many",
        r"how would you", r"walk me through",
        r"what would you do if", r"framework",
    ],
    "Game Economy": [
        r"economy", r"virtual currency", r"loot box",
        r"gacha", r"pricing", r"in.app purchase",
        r"iap\b", r"store\b", r"shop\b", r"f2p\b",
        r"free.to.play", r"pay.to.win",
    ],
    "LiveOps": [
        r"liveops", r"live ops", r"live service",
        r"event\b", r"season", r"update cadence",
        r"content calendar", r"engagement loop",
    ],
    "Player Psychology": [
        r"player", r"motivation", r"engagement",
        r"churn", r"onboard", r"tutorial",
        r"first.time user", r"ftue\b", r"habit",
        r"reward\b", r"feedback loop",
    ],
}


# ─── UTILITIES ─────────────────────────────────────────────────

def safe_request(url, params=None, max_retries=2):
    """Make a GET request with retries and rate limiting."""
    for attempt in range(max_retries):
        try:
            time.sleep(REQUEST_DELAY)
            resp = requests.get(
                url, headers=HEADERS, params=params,
                timeout=15, allow_redirects=True,
            )
            if resp.status_code == 200:
                return resp
            elif resp.status_code == 429:
                log.warning(f"Rate limited on {url}, waiting 30s...")
                time.sleep(30)
            else:
                log.warning(f"HTTP {resp.status_code} for {url}")
                return None
        except requests.RequestException as e:
            log.warning(f"Request failed ({attempt+1}/{max_retries}): {e}")
            time.sleep(5)
    return None


def classify_question(text):
    """Classify a question into a category based on keyword patterns."""
    text_lower = text.lower()
    scores = {}
    for category, patterns in CATEGORY_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, text_lower))
        if score > 0:
            scores[category] = score

    if scores:
        return max(scores, key=scores.get)
    return "General"


def is_valid_question(text):
    """Check if extracted text looks like a real interview question."""
    text = text.strip()
    if len(text) < 15 or len(text) > 500:
        return False
    if not any(c.isalpha() for c in text):
        return False
    # Should look like a question or prompt
    question_indicators = [
        "?", "how would", "how do", "tell me", "describe",
        "what would", "walk me", "explain", "design",
        "why did", "give an example", "what is your",
        "what metrics", "how might", "imagine",
    ]
    text_lower = text.lower()
    return any(ind in text_lower for ind in question_indicators)


def deduplicate_questions(questions):
    """Remove duplicate or near-duplicate questions."""
    seen_hashes = set()
    unique = []
    for q in questions:
        # Normalize for dedup
        normalized = re.sub(r'[^a-z0-9\s]', '', q["question"].lower())
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        h = hashlib.md5(normalized.encode()).hexdigest()
        if h not in seen_hashes:
            seen_hashes.add(h)
            unique.append(q)
    return unique


def make_question_obj(question_text, company, source, source_url="", difficulty=""):
    """Create a standardized question object."""
    return {
        "question": question_text.strip(),
        "company_name": company,
        "category": classify_question(question_text),
        "source": source,
        "source_url": source_url,
        "difficulty": difficulty,
        "date_scraped": str(date.today()),
    }


# ─── SOURCE SCRAPERS ──────────────────────────────────────────

# ==========================================
# 1. GLASSDOOR
# ==========================================
class GlassdoorScraper:
    """
    Scrapes Glassdoor interview questions pages.
    URL pattern: glassdoor.com/Interview/{company}-Interview-Questions-{id}.htm
    
    NOTE: Glassdoor aggressively blocks scrapers. This uses their
    public-facing pages. For production, consider their API or
    use a headless browser with Playwright.
    """
    BASE = "https://www.glassdoor.com/Interview"

    def scrape(self, company):
        log.info(f"[Glassdoor] Searching: {company}")
        questions = []
        
        # Search Google for Glassdoor interview pages
        search_url = f"https://www.google.com/search"
        params = {
            "q": f"site:glassdoor.com {company} product manager interview questions",
            "num": 5,
        }
        resp = safe_request(search_url, params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Extract Glassdoor URLs from search results
        glassdoor_urls = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if "glassdoor.com/Interview" in href:
                # Clean Google redirect URL
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                glassdoor_urls.append(href)

        for gd_url in glassdoor_urls[:3]:
            resp2 = safe_request(gd_url)
            if not resp2:
                continue
            
            soup2 = BeautifulSoup(resp2.text, "html.parser")
            
            # Glassdoor interview questions are in specific divs
            # Look for common patterns
            for elem in soup2.find_all(["span", "p", "div"], class_=True):
                text = elem.get_text(strip=True)
                if is_valid_question(text) and any(
                    kw in text.lower() for kw in PM_KEYWORDS + ["product"]
                ):
                    questions.append(make_question_obj(
                        text, company, "Glassdoor", gd_url
                    ))

        log.info(f"[Glassdoor] Found {len(questions)} questions for {company}")
        return questions


# ==========================================
# 2. AMBITIONBOX
# ==========================================
class AmbitionBoxScraper:
    """
    Scrapes AmbitionBox interview questions.
    Especially useful for Indian gaming companies.
    """
    BASE = "https://www.ambitionbox.com"

    def scrape(self, company):
        log.info(f"[AmbitionBox] Searching: {company}")
        questions = []
        
        slug = company.lower().replace(" ", "-").replace(".", "")
        url = f"{self.BASE}/{slug}-interview-questions"
        
        # Try direct URL first
        resp = safe_request(url)
        if not resp or resp.status_code != 200:
            # Fallback: search
            search_url = f"{self.BASE}/search"
            resp = safe_request(search_url, params={
                "q": f"{company} product manager interview",
                "type": "interviews",
            })
        
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        # AmbitionBox patterns
        for elem in soup.find_all(["div", "p", "span"]):
            text = elem.get_text(strip=True)
            if is_valid_question(text):
                questions.append(make_question_obj(
                    text, company, "AmbitionBox",
                    url if resp else "",
                ))

        log.info(f"[AmbitionBox] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 3. INDEED
# ==========================================
class IndeedScraper:
    """
    Scrapes Indeed interview questions section.
    URL: indeed.com/cmp/{company}/interviews
    """
    BASE = "https://www.indeed.com"

    def scrape(self, company):
        log.info(f"[Indeed] Searching: {company}")
        questions = []

        slug = company.lower().replace(" ", "-")
        url = f"{self.BASE}/cmp/{slug}/interviews"
        
        resp = safe_request(url)
        if not resp:
            # Try search
            resp = safe_request(
                f"{self.BASE}/cmp/{slug}/interviews",
                params={"q": "product manager"}
            )
        
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        for elem in soup.find_all(["span", "div", "p"]):
            text = elem.get_text(strip=True)
            if is_valid_question(text) and len(text) > 20:
                questions.append(make_question_obj(
                    text, company, "Indeed", url,
                ))

        log.info(f"[Indeed] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 4. LEVELS.FYI
# ==========================================
class LevelsFyiScraper:
    """
    Scrapes Levels.fyi interview section.
    They have a public API for some data.
    """
    BASE = "https://www.levels.fyi"

    def scrape(self, company):
        log.info(f"[Levels.fyi] Searching: {company}")
        questions = []

        slug = company.lower().replace(" ", "-")
        url = f"{self.BASE}/companies/{slug}/interviews"
        
        resp = safe_request(url)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")

        for elem in soup.find_all(["div", "p", "li"]):
            text = elem.get_text(strip=True)
            if is_valid_question(text):
                questions.append(make_question_obj(
                    text, company, "Levels.fyi", url,
                ))

        log.info(f"[Levels.fyi] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 5. BLIND (TeamBlind)
# ==========================================
class BlindScraper:
    """
    Searches Blind (teamblind.com) for interview discussion threads.
    Blind requires login for most content, so we search via Google.
    """
    def scrape(self, company):
        log.info(f"[Blind] Searching: {company}")
        questions = []

        search_url = "https://www.google.com/search"
        params = {
            "q": f'site:teamblind.com "{company}" "product manager" interview question',
            "num": 5,
        }
        resp = safe_request(search_url, params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Extract snippets from Google results
        for result in soup.find_all("div", class_=True):
            text = result.get_text(strip=True)
            # Google snippets sometimes contain the actual questions
            sentences = text.split(".")
            for sentence in sentences:
                sentence = sentence.strip()
                if is_valid_question(sentence):
                    questions.append(make_question_obj(
                        sentence, company, "Blind", "https://teamblind.com",
                    ))

        log.info(f"[Blind] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 6. REDDIT
# ==========================================
class RedditScraper:
    """
    Scrapes Reddit threads from gaming/PM subreddits.
    Uses Reddit's public JSON API (no auth needed for public posts).
    
    Subreddits: r/GameDev, r/PMinterviews, r/ProductManagement,
                r/gamedev, r/gameindustry
    """
    SUBREDDITS = [
        "gamedev", "PMinterviews", "ProductManagement",
        "gameindustry", "gaming", "Games",
    ]
    
    def scrape(self, company):
        log.info(f"[Reddit] Searching: {company}")
        questions = []

        for subreddit in self.SUBREDDITS:
            url = f"https://www.reddit.com/r/{subreddit}/search.json"
            params = {
                "q": f"{company} product manager interview",
                "restrict_sr": "on",
                "sort": "relevance",
                "t": "all",
                "limit": 10,
            }
            resp = safe_request(url, params=params)
            if not resp:
                continue
            
            try:
                data = resp.json()
                posts = data.get("data", {}).get("children", [])
                
                for post in posts:
                    post_data = post.get("data", {})
                    title = post_data.get("title", "")
                    selftext = post_data.get("selftext", "")
                    permalink = post_data.get("permalink", "")
                    
                    full_text = f"{title} {selftext}"
                    
                    # Extract questions from post
                    for line in full_text.split("\n"):
                        line = line.strip()
                        if is_valid_question(line):
                            questions.append(make_question_obj(
                                line, company,
                                f"Reddit r/{subreddit}",
                                f"https://www.reddit.com{permalink}",
                            ))
                    
                    # Also try to get comments
                    if permalink:
                        comment_url = f"https://www.reddit.com{permalink}.json"
                        comment_resp = safe_request(comment_url)
                        if comment_resp:
                            try:
                                comments_data = comment_resp.json()
                                if len(comments_data) > 1:
                                    self._extract_from_comments(
                                        comments_data[1], company,
                                        subreddit, permalink, questions
                                    )
                            except (json.JSONDecodeError, IndexError):
                                pass

            except json.JSONDecodeError:
                continue

        log.info(f"[Reddit] Found {len(questions)} for {company}")
        return questions

    def _extract_from_comments(self, comment_listing, company,
                                subreddit, permalink, questions):
        """Recursively extract questions from Reddit comment trees."""
        children = comment_listing.get("data", {}).get("children", [])
        for child in children[:20]:  # Limit depth
            body = child.get("data", {}).get("body", "")
            for line in body.split("\n"):
                line = line.strip()
                if is_valid_question(line):
                    questions.append(make_question_obj(
                        line, company,
                        f"Reddit r/{subreddit}",
                        f"https://www.reddit.com{permalink}",
                    ))
            # Recurse into replies
            replies = child.get("data", {}).get("replies", "")
            if isinstance(replies, dict):
                self._extract_from_comments(
                    replies, company, subreddit, permalink, questions
                )


# ==========================================
# 7. QUORA
# ==========================================
class QuoraScraper:
    """
    Searches Quora via Google for interview questions.
    """
    def scrape(self, company):
        log.info(f"[Quora] Searching: {company}")
        questions = []

        params = {
            "q": f'site:quora.com "{company}" "product manager" interview',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        for result in soup.find_all(["h3", "div"]):
            text = result.get_text(strip=True)
            if is_valid_question(text):
                questions.append(make_question_obj(
                    text, company, "Quora", "https://quora.com",
                ))

        log.info(f"[Quora] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 8. EXPONENT
# ==========================================
class ExponentScraper:
    """
    Scrapes Exponent (tryexponent.com) for PM interview questions.
    They have public question pages organized by company.
    """
    BASE = "https://www.tryexponent.com"

    def scrape(self, company):
        log.info(f"[Exponent] Searching: {company}")
        questions = []

        slug = company.lower().replace(" ", "-")
        url = f"{self.BASE}/questions?company={slug}&role=pm"
        
        resp = safe_request(url)
        if not resp:
            # Try search
            url = f"{self.BASE}/questions?search={quote_plus(company + ' product manager')}"
            resp = safe_request(url)
        
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")

        for elem in soup.find_all(["h3", "h4", "a", "div"]):
            text = elem.get_text(strip=True)
            if is_valid_question(text):
                link = ""
                if elem.name == "a" and elem.get("href"):
                    link = urljoin(self.BASE, elem["href"])
                questions.append(make_question_obj(
                    text, company, "Exponent", link or url,
                ))

        log.info(f"[Exponent] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 9. ROCKETBLOCKS
# ==========================================
class RocketBlocksScraper:
    """
    Scrapes RocketBlocks for PM interview content.
    """
    BASE = "https://www.rocketblocks.me"

    def scrape(self, company):
        log.info(f"[RocketBlocks] Searching: {company}")
        questions = []

        # RocketBlocks has blog posts about specific company interviews
        params = {
            "q": f'site:rocketblocks.me "{company}" product manager interview',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        urls = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if "rocketblocks.me" in href:
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                urls.append(href)

        for page_url in urls[:3]:
            resp2 = safe_request(page_url)
            if not resp2:
                continue
            soup2 = BeautifulSoup(resp2.text, "html.parser")
            
            for elem in soup2.find_all(["li", "p", "h3", "h4"]):
                text = elem.get_text(strip=True)
                if is_valid_question(text):
                    questions.append(make_question_obj(
                        text, company, "RocketBlocks", page_url,
                    ))

        log.info(f"[RocketBlocks] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 10. PRODUCT MANAGER HQ
# ==========================================
class PMHQScraper:
    """
    Scrapes Product Manager HQ for interview questions.
    """
    BASE = "https://www.productmanagerhq.com"

    def scrape(self, company):
        log.info(f"[PMHQ] Searching: {company}")
        questions = []

        params = {
            "q": f'site:productmanagerhq.com "{company}" interview',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        
        urls = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if "productmanagerhq.com" in href:
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                urls.append(href)

        for page_url in urls[:3]:
            resp2 = safe_request(page_url)
            if not resp2:
                continue
            soup2 = BeautifulSoup(resp2.text, "html.parser")
            for elem in soup2.find_all(["li", "p", "h3"]):
                text = elem.get_text(strip=True)
                if is_valid_question(text):
                    questions.append(make_question_obj(
                        text, company, "Product Manager HQ", page_url,
                    ))

        log.info(f"[PMHQ] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 11. LEETCODE DISCUSS
# ==========================================
class LeetCodeScraper:
    """
    Searches LeetCode Discuss for PM interview threads.
    """
    def scrape(self, company):
        log.info(f"[LeetCode] Searching: {company}")
        questions = []

        params = {
            "q": f'site:leetcode.com/discuss "{company}" "product manager"',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        for result in soup.find_all(["h3", "div", "span"]):
            text = result.get_text(strip=True)
            if is_valid_question(text):
                questions.append(make_question_obj(
                    text, company, "LeetCode Discuss",
                    "https://leetcode.com/discuss",
                ))

        log.info(f"[LeetCode] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 12. INTERVIEW QUERY / PATHRISE
# ==========================================
class InterviewQueryScraper:
    """
    Scrapes Interview Query and Pathrise for PM questions.
    """
    def scrape(self, company):
        log.info(f"[InterviewQuery] Searching: {company}")
        questions = []

        for site in ["interviewquery.com", "pathrise.com"]:
            params = {
                "q": f'site:{site} "{company}" product manager interview',
                "num": 3,
            }
            resp = safe_request("https://www.google.com/search", params=params)
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            urls = []
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                if site in href:
                    if "/url?q=" in href:
                        href = href.split("/url?q=")[1].split("&")[0]
                    urls.append(href)

            for page_url in urls[:2]:
                resp2 = safe_request(page_url)
                if not resp2:
                    continue
                soup2 = BeautifulSoup(resp2.text, "html.parser")
                for elem in soup2.find_all(["li", "p", "h3", "h4"]):
                    text = elem.get_text(strip=True)
                    if is_valid_question(text):
                        questions.append(make_question_obj(
                            text, company,
                            "Interview Query" if "interviewquery" in site else "Pathrise",
                            page_url,
                        ))

        log.info(f"[InterviewQuery] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 13. GAMASUTRA / GAME DEVELOPER
# ==========================================
class GamasutraScraper:
    """
    Scrapes Game Developer (formerly Gamasutra) for PM interview content.
    """
    BASE = "https://www.gamedeveloper.com"

    def scrape(self, company):
        log.info(f"[GameDeveloper] Searching: {company}")
        questions = []

        params = {
            "q": f'site:gamedeveloper.com "{company}" "product manager"',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        urls = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if "gamedeveloper.com" in href:
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                urls.append(href)

        for page_url in urls[:3]:
            resp2 = safe_request(page_url)
            if not resp2:
                continue
            soup2 = BeautifulSoup(resp2.text, "html.parser")
            for elem in soup2.find_all(["p", "li", "h3"]):
                text = elem.get_text(strip=True)
                if is_valid_question(text):
                    questions.append(make_question_obj(
                        text, company, "Game Developer", page_url,
                    ))

        log.info(f"[GameDeveloper] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 14. GAMEDEV.NET FORUMS
# ==========================================
class GameDevNetScraper:
    """
    Scrapes GameDev.net forums for PM interview discussions.
    """
    def scrape(self, company):
        log.info(f"[GameDev.net] Searching: {company}")
        questions = []

        params = {
            "q": f'site:gamedev.net "{company}" "product manager" interview',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        for result in soup.find_all(["h3", "div"]):
            text = result.get_text(strip=True)
            if is_valid_question(text):
                questions.append(make_question_obj(
                    text, company, "GameDev.net",
                    "https://gamedev.net",
                ))

        log.info(f"[GameDev.net] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 15. LINKEDIN POSTS (via Google)
# ==========================================
class LinkedInScraper:
    """
    Finds LinkedIn posts by gaming PMs sharing interview tips.
    Uses Google search since LinkedIn requires auth.
    """
    def scrape(self, company):
        log.info(f"[LinkedIn] Searching: {company}")
        questions = []

        params = {
            "q": (
                f'site:linkedin.com/posts "{company}" '
                f'"product manager" interview question'
            ),
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        for result in soup.find_all(["div", "span"]):
            text = result.get_text(strip=True)
            sentences = text.split(".")
            for s in sentences:
                s = s.strip()
                if is_valid_question(s):
                    questions.append(make_question_obj(
                        s, company, "LinkedIn",
                        "https://linkedin.com",
                    ))

        log.info(f"[LinkedIn] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 16. MEDIUM BLOGS
# ==========================================
class MediumScraper:
    """
    Scrapes Medium for PM interview experience posts.
    """
    def scrape(self, company):
        log.info(f"[Medium] Searching: {company}")
        questions = []

        params = {
            "q": f'site:medium.com "{company}" "product manager" interview',
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        urls = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if "medium.com" in href:
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                urls.append(href)

        for page_url in urls[:3]:
            resp2 = safe_request(page_url)
            if not resp2:
                continue
            soup2 = BeautifulSoup(resp2.text, "html.parser")
            for elem in soup2.find_all(["p", "li", "h3", "h4"]):
                text = elem.get_text(strip=True)
                if is_valid_question(text):
                    questions.append(make_question_obj(
                        text, company, "Medium", page_url,
                    ))

        log.info(f"[Medium] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 17. YOUTUBE (via Google)
# ==========================================
class YouTubeScraper:
    """
    Finds YouTube videos about gaming PM interviews.
    Extracts info from titles and descriptions.
    """
    def scrape(self, company):
        log.info(f"[YouTube] Searching: {company}")
        questions = []

        params = {
            "q": (
                f'site:youtube.com "{company}" '
                f'"product manager" interview'
            ),
            "num": 5,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        for h3 in soup.find_all("h3"):
            text = h3.get_text(strip=True)
            if any(kw in text.lower() for kw in ["interview", "product manager", "pm"]):
                questions.append(make_question_obj(
                    f"[Video] {text}", company, "YouTube",
                    "https://youtube.com",
                ))

        log.info(f"[YouTube] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 18. COMPANY BLOGS
# ==========================================
class CompanyBlogScraper:
    """
    Searches company engineering/product blogs for PM hiring posts.
    """
    BLOG_PATTERNS = {
        "Riot Games": ["technology.riotgames.com", "riotgames.com/en/news"],
        "Supercell": ["supercell.com/en/blog"],
        "Epic Games": ["epicgames.com/site/en-US/news"],
        "Roblox": ["blog.roblox.com"],
        "Electronic Arts": ["ea.com/news"],
        "King": ["king.com/article"],
    }

    def scrape(self, company):
        log.info(f"[CompanyBlog] Searching: {company}")
        questions = []

        blogs = self.BLOG_PATTERNS.get(company, [])
        search_sites = " OR ".join(f"site:{b}" for b in blogs) if blogs else ""
        
        query = f'{search_sites} "{company}" "product manager" interview hiring'
        if not search_sites:
            query = f'"{company}" blog "product manager" interview process gaming'

        params = {"q": query, "num": 5}
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        urls = []
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if any(b in href for b in blogs) or (not blogs and company.lower().replace(" ", "") in href.lower()):
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                urls.append(href)

        for page_url in urls[:2]:
            resp2 = safe_request(page_url)
            if not resp2:
                continue
            soup2 = BeautifulSoup(resp2.text, "html.parser")
            for elem in soup2.find_all(["p", "li"]):
                text = elem.get_text(strip=True)
                if is_valid_question(text):
                    questions.append(make_question_obj(
                        text, company, "Company Blog", page_url,
                    ))

        log.info(f"[CompanyBlog] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 19. DISCORD (via public web archives)
# ==========================================
class DiscordScraper:
    """
    Searches for Discord PM community discussions via Google.
    Discord content itself requires auth, so we look for
    public mirrors and screenshots.
    """
    def scrape(self, company):
        log.info(f"[Discord] Searching: {company}")
        questions = []

        params = {
            "q": (
                f'"discord" "{company}" "product manager" interview '
                f'(site:reddit.com OR site:medium.com OR "discord.com")'
            ),
            "num": 3,
        }
        resp = safe_request("https://www.google.com/search", params=params)
        if not resp:
            return questions

        soup = BeautifulSoup(resp.text, "html.parser")
        for result in soup.find_all(["div", "span"]):
            text = result.get_text(strip=True)
            sentences = text.split(".")
            for s in sentences:
                s = s.strip()
                if is_valid_question(s):
                    questions.append(make_question_obj(
                        s, company, "Discord Community", "",
                    ))

        log.info(f"[Discord] Found {len(questions)} for {company}")
        return questions


# ==========================================
# 20. GAMING PM CASE STUDIES
# ==========================================
class CaseStudyScraper:
    """
    Finds gaming-specific PM case study questions from prep sites.
    These are universal (not always company-specific).
    """
    CASE_STUDY_QUERIES = [
        "gaming product manager case study interview questions",
        "game design product case study examples",
        "mobile game PM metrics case study",
        "free to play monetization case study interview",
        "game economy design interview question",
        "liveops product manager case study",
        "player retention case study interview",
        "gaming growth PM case study",
    ]

    def scrape(self, company="General"):
        log.info(f"[CaseStudy] Gathering case studies...")
        questions = []

        for query in self.CASE_STUDY_QUERIES[:4]:  # Limit queries
            resp = safe_request(
                "https://www.google.com/search",
                params={"q": query, "num": 5},
            )
            if not resp:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            
            urls = []
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                if "/url?q=" in href:
                    href = href.split("/url?q=")[1].split("&")[0]
                if "http" in href and "google" not in href:
                    urls.append(href)

            for page_url in urls[:2]:
                resp2 = safe_request(page_url)
                if not resp2:
                    continue
                soup2 = BeautifulSoup(resp2.text, "html.parser")
                for elem in soup2.find_all(["li", "p", "h3", "h4"]):
                    text = elem.get_text(strip=True)
                    if is_valid_question(text):
                        questions.append(make_question_obj(
                            text, company, "Case Study Collection",
                            page_url,
                        ))

        log.info(f"[CaseStudy] Found {len(questions)} case study questions")
        return questions


# ─── ORCHESTRATOR ──────────────────────────────────────────────

class InterviewQuestionAggregator:
    """
    Orchestrates all scrapers, deduplicates results,
    and saves to Supabase.
    """

    def __init__(self):
        self.scrapers = [
            GlassdoorScraper(),
            AmbitionBoxScraper(),
            IndeedScraper(),
            LevelsFyiScraper(),
            BlindScraper(),
            RedditScraper(),
            QuoraScraper(),
            ExponentScraper(),
            RocketBlocksScraper(),
            PMHQScraper(),
            LeetCodeScraper(),
            InterviewQueryScraper(),
            GamasutraScraper(),
            GameDevNetScraper(),
            LinkedInScraper(),
            MediumScraper(),
            YouTubeScraper(),
            CompanyBlogScraper(),
            DiscordScraper(),
        ]
        self.case_study_scraper = CaseStudyScraper()

    def scrape_all_companies(self, companies=None):
        """Run all scrapers for all companies."""
        if companies is None:
            companies = GAMING_COMPANIES

        all_questions = []
        
        # Company-specific questions
        for company in companies:
            log.info(f"\n{'='*60}")
            log.info(f"SCRAPING: {company}")
            log.info(f"{'='*60}")
            
            company_questions = []
            for scraper in self.scrapers:
                try:
                    qs = scraper.scrape(company)
                    company_questions.extend(qs)
                except Exception as e:
                    log.error(
                        f"Error in {scraper.__class__.__name__} "
                        f"for {company}: {e}"
                    )
            
            # Deduplicate per company
            company_questions = deduplicate_questions(company_questions)
            all_questions.extend(company_questions)
            log.info(
                f"Total unique questions for {company}: "
                f"{len(company_questions)}"
            )

        # Generic case study questions
        log.info(f"\n{'='*60}")
        log.info(f"SCRAPING: Case Studies (General)")
        log.info(f"{'='*60}")
        case_studies = self.case_study_scraper.scrape()
        case_studies = deduplicate_questions(case_studies)
        all_questions.extend(case_studies)

        # Final dedup across all companies
        all_questions = deduplicate_questions(all_questions)
        
        log.info(f"\n{'='*60}")
        log.info(f"TOTAL UNIQUE QUESTIONS: {len(all_questions)}")
        log.info(f"{'='*60}")

        return all_questions

    def save_to_supabase(self, questions):
        """Save questions to Supabase database."""
        if not SUPABASE_URL or not SUPABASE_KEY:
            log.warning("No Supabase credentials. Saving to local JSON.")
            with open("interview_questions.json", "w") as f:
                json.dump(questions, f, indent=2)
            return

        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        saved = 0
        for q in questions:
            try:
                supabase.table("interview_questions").upsert(
                    {
                        "company_name": q["company_name"],
                        "question": q["question"],
                        "category": q["category"],
                        "source": q["source"],
                        "source_url": q.get("source_url", ""),
                        "difficulty": q.get("difficulty", ""),
                    },
                    on_conflict="company_name,question",
                ).execute()
                saved += 1
            except Exception as e:
                pass  # Skip duplicates
        
        log.info(f"Saved {saved} questions to Supabase")

    def save_to_json(self, questions, filepath="interview_questions.json"):
        """Save questions to a local JSON file."""
        with open(filepath, "w") as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        log.info(f"Saved {len(questions)} questions to {filepath}")

    def generate_report(self, questions):
        """Generate a summary report."""
        companies = {}
        categories = {}
        sources = {}
        
        for q in questions:
            companies[q["company_name"]] = companies.get(q["company_name"], 0) + 1
            categories[q["category"]] = categories.get(q["category"], 0) + 1
            sources[q["source"]] = sources.get(q["source"], 0) + 1

        report = f"""
╔══════════════════════════════════════════════════════════╗
║          GAMEPM RADAR — Interview Question Report        ║
║          {date.today()}                                  ║
╠══════════════════════════════════════════════════════════╣
║  Total Questions: {len(questions):<38} ║
║  Companies Covered: {len(companies):<36} ║
║  Sources Used: {len(sources):<41} ║
╚══════════════════════════════════════════════════════════╝

TOP COMPANIES BY QUESTIONS:
"""
        for comp, count in sorted(companies.items(), key=lambda x: -x[1])[:15]:
            report += f"  {comp:<35} {count:>4} questions\n"

        report += "\nQUESTION CATEGORIES:\n"
        for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
            report += f"  {cat:<35} {count:>4}\n"

        report += "\nSOURCES BREAKDOWN:\n"
        for src, count in sorted(sources.items(), key=lambda x: -x[1]):
            report += f"  {src:<35} {count:>4}\n"

        return report


# ─── MAIN ENTRY POINT ─────────────────────────────────────────

def main():
    """Run the full interview question scraping pipeline."""
    log.info("="*60)
    log.info("GAMEPM RADAR — Interview Question Aggregator")
    log.info(f"Date: {date.today()}")
    log.info(f"Companies: {len(GAMING_COMPANIES)}")
    log.info("="*60)

    aggregator = InterviewQuestionAggregator()
    
    # Scrape all
    questions = aggregator.scrape_all_companies()
    
    # Save
    aggregator.save_to_json(questions)
    aggregator.save_to_supabase(questions)
    
    # Report
    report = aggregator.generate_report(questions)
    print(report)
    
    with open("interview_report.txt", "w") as f:
        f.write(report)

    return questions


if __name__ == "__main__":
    main()
