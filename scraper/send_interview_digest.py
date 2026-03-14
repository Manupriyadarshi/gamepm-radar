"""
Sends a weekly digest of newly scraped interview questions.
"""
import os
import json
import requests
from datetime import date


def send_digest():
    api_key = os.environ.get("SENDGRID_API_KEY")
    email = os.environ.get("ALERT_EMAIL")

    if not api_key or not email:
        print("No SendGrid key or email configured. Skipping digest.")
        return

    # Load results
    try:
        with open("interview_questions.json", "r") as f:
            questions = json.load(f)
    except FileNotFoundError:
        print("No interview_questions.json found.")
        return

    if not questions:
        print("No questions to report.")
        return

    # Count by company
    company_counts = {}
    for q in questions:
        c = q.get("company_name", "Unknown")
        company_counts[c] = company_counts.get(c, 0) + 1

    # Build email
    lines = [
        f"GAMEPM RADAR — Weekly Interview Question Digest",
        f"Date: {date.today()}",
        f"",
        f"Total questions collected: {len(questions)}",
        f"Companies covered: {len(company_counts)}",
        f"",
        f"Questions by company:",
        f"",
    ]

    for comp, count in sorted(company_counts.items(), key=lambda x: -x[1])[:20]:
        lines.append(f"  • {comp}: {count} questions")

    lines += [
        f"",
        f"Sample questions from this week:",
        f"",
    ]

    for q in questions[:10]:
        lines.append(f"  [{q.get('category', '')}] {q['question'][:100]}")
        lines.append(f"    — {q['company_name']} (via {q.get('source', 'Unknown')})")
        lines.append(f"")

    lines.append("View all questions in your GAMEPM RADAR dashboard.")

    body = "\n".join(lines)

    try:
        resp = requests.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "personalizations": [{"to": [{"email": email}]}],
                "from": {
                    "email": "alerts@gamepmradar.com",
                    "name": "GAMEPM RADAR",
                },
                "subject": (
                    f"🎮 Weekly Interview Prep — "
                    f"{len(questions)} questions from "
                    f"{len(company_counts)} companies"
                ),
                "content": [{"type": "text/plain", "value": body}],
            },
        )
        print(f"Digest email sent: HTTP {resp.status_code}")
    except Exception as e:
        print(f"Failed to send digest: {e}")


if __name__ == "__main__":
    send_digest()
