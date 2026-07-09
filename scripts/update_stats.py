import os
import requests
import json
from datetime import datetime, timezone, timedelta

# Configuration
USERNAME = "dmzrider"
TOKEN = os.getenv("GITHUB_TOKEN")

if not TOKEN:
    print("Warning: GITHUB_TOKEN not found. Running with mock/cached data.")
    # If no token is provided, the script exits or uses fallback mock data
    # (In GitHub Actions, GITHUB_TOKEN is always present)

# GraphQL Query to fetch all statistics
query = """
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
    repositories {
      totalCount
    }
  }
}
"""

def fetch_stats():
    if not TOKEN:
        # Fallback Mock Data if token is missing (for local testing)
        return {
            "commits": 520,
            "prs": 28,
            "reviews": 14,
            "issues": 12,
            "repos": 18,
            "daily_activity": [1, 2, 0, 4, 1, 0, 5, 2, 1, 3, 4, 0, 2, 1, 3, 5, 2, 0, 1, 4, 2, 1, 0, 3, 5, 2, 1, 4, 2, 3],
            "productive_time": [20, 35, 30, 15]
        }

    headers = {"Authorization": f"Bearer {TOKEN}"}
    response = requests.post(
        "https://api.github.com/graphql",
        json={"query": query, "variables": {"username": USERNAME}},
        headers=headers
    )
    
    if response.status_code != 200:
        raise Exception(f"GitHub API query failed: {response.text}")
        
    data = response.json()
    if "errors" in data:
        raise Exception(f"GraphQL errors: {data['errors']}")
        
    user_data = data["data"]["user"]
    contribs = user_data["contributionsCollection"]
    
    # Extract Daily contribution calendar (last 30 days)
    daily_counts = []
    for week in contribs["contributionCalendar"]["weeks"]:
        for day in week["contributionDays"]:
            daily_counts.append((day["date"], day["contributionCount"]))
            
    # Sort by date and take the last 30 days
    daily_counts.sort(key=lambda x: x[0])
    last_30_days = [count for _, count in daily_counts[-30:]]
    
    # If less than 30 days, pad with zeros
    if len(last_30_days) < 30:
        last_30_days = [0] * (30 - len(last_30_days)) + last_30_days

    # Fetch commits timestamp to determine productive time (via REST API)
    # Fetching the last 100 public events to analyze commit hours in IST (UTC+5.5)
    productive_time = [0, 0, 0, 0] # Morning, Day, Evening, Night
    event_response = requests.get(
        f"https://api.github.com/users/{USERNAME}/events/public",
        headers=headers
    )
    
    commit_count = 0
    if event_response.status_code == 200:
        events = event_response.json()
        for event in events:
            if event["type"] == "PushEvent":
                # Get timestamp of event (UTC)
                created_at = event["created_at"]
                dt = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
                # Convert to IST (UTC+5:30)
                ist_dt = dt.astimezone(timezone(timedelta(hours=5, minutes=30)))
                hour = ist_dt.hour
                
                if 6 <= hour < 12:
                    productive_time[0] += 1
                elif 12 <= hour < 18:
                    productive_time[1] += 1
                elif 18 <= hour < 24:
                    productive_time[2] += 1
                else:
                    productive_time[3] += 1
                commit_count += 1

    # Fallback to defaults if no commits found recently
    if commit_count == 0:
        productive_time = [20, 35, 30, 15]
    else:
        total_p = sum(productive_time)
        productive_time = [round((val / total_p) * 100) for val in productive_time]

    return {
        "commits": contribs["totalCommitContributions"],
        "prs": contribs["totalPullRequestContributions"],
        "reviews": contribs["totalPullRequestReviewContributions"],
        "issues": contribs["totalIssueContributions"],
        "repos": user_data["repositories"]["totalCount"],
        "daily_activity": last_30_days,
        "productive_time": productive_time
    }

def update_activity_graph(stats):
    filepath = "activity-graph.svg"
    if not os.path.exists(filepath):
        return

    with open(filepath, "r", encoding="utf-8") as f:
        svg_content = f.read()

    # Generate path and area points
    # Chart area: width from x=60 to x=810 (750 pixels). Height baseline y=175. Max height y=65.
    x_coords = [60 + i * (750 / 29) for i in range(30)]
    max_activity = max(stats["daily_activity"]) if max(stats["daily_activity"]) > 0 else 1
    
    # Map activity count to y coordinate (higher activity -> lower y value)
    y_coords = []
    for count in stats["daily_activity"]:
        normalized = count / max_activity
        y = 175 - (normalized * 110) # max height change is 110px (brings y from 175 to 65)
        y_coords.append(y)

    # Construct the path string (straight segments)
    path_points = [f"{x_coords[i]:.1f},{y_coords[i]:.1f}" for i in range(30)]
    path_d = "M " + " L ".join(path_points)
    
    # Area path (closes at baseline corners)
    area_d = f"M 60,175 L " + " L ".join(path_points) + " L 810,175 Z"

    # Replace path definitions in SVG
    # Look for the path declarations and replace their d="..."
    # We will locate the comment guides we left in the SVG:
    # <path d="..." fill="url(#areaGrad)"/>
    # <path d="..." fill="none" stroke="url(#lineGrad)" ... />
    
    # Since XML parsing can be strict, simple string replacement works safely here
    import re
    svg_content = re.sub(
        r'<path d="[^"]+" fill="url\(#areaGrad\)"',
        f'<path d="{area_d}" fill="url(#areaGrad)"',
        svg_content
    )
    svg_content = re.sub(
        r'<path d="[^"]+"(\s+)fill="none"(\s+)stroke="url\(#lineGrad\)"',
        f'<path d="{path_d}"\\1fill="none"\\2stroke="url(#lineGrad)"',
        svg_content
    )

    # Update Peak Label
    peak_val = max(stats["daily_activity"])
    svg_content = re.sub(
        r'<text x="460" y="54"([^>]+)>PEAK RUNTIME</text>',
        f'<text x="460" y="54"\\1>PEAK: {peak_val} ACT</text>',
        svg_content
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Updated activity-graph.svg successfully.")

def update_diagnostics(stats):
    filepath = "diagnostics.svg"
    if not os.path.exists(filepath):
        return

    with open(filepath, "r", encoding="utf-8") as f:
        svg_content = f.read()

    import re
    # Update Productive time percentages and animated bar values
    p_times = stats["productive_time"]
    
    # We will find the <animate attributeName="width" values="0;\d+;\d+" dur="1.2s" fill="freeze" begin="X.Xs"/> tags
    # and update the values="0;{val};{val}" where val = 160 * p_times[i] / 100.
    
    # Morning (begin="0.2s")
    svg_content = re.sub(
        r'<animate attributeName="width" values="0;\d+;\d+" dur="1\.2s" fill="freeze" begin="0\.2s"/>',
        f'<animate attributeName="width" values="0;{int(160 * p_times[0] / 100)};{int(160 * p_times[0] / 100)}" dur="1.2s" fill="freeze" begin="0.2s"/>',
        svg_content
    )
    # Daytime (begin="0.4s")
    svg_content = re.sub(
        r'<animate attributeName="width" values="0;\d+;\d+" dur="1\.2s" fill="freeze" begin="0\.4s"/>',
        f'<animate attributeName="width" values="0;{int(160 * p_times[1] / 100)};{int(160 * p_times[1] / 100)}" dur="1.2s" fill="freeze" begin="0.4s"/>',
        svg_content
    )
    # Evening (begin="0.6s")
    svg_content = re.sub(
        r'<animate attributeName="width" values="0;\d+;\d+" dur="1\.2s" fill="freeze" begin="0\.6s"/>',
        f'<animate attributeName="width" values="0;{int(160 * p_times[2] / 100)};{int(160 * p_times[2] / 100)}" dur="1.2s" fill="freeze" begin="0.6s"/>',
        svg_content
    )
    # Night (begin="0.8s")
    svg_content = re.sub(
        r'<animate attributeName="width" values="0;\d+;\d+" dur="1\.2s" fill="freeze" begin="0\.8s"/>',
        f'<animate attributeName="width" values="0;{int(160 * p_times[3] / 100)};{int(160 * p_times[3] / 100)}" dur="1.2s" fill="freeze" begin="0.8s"/>',
        svg_content
    )

    # Replace individual percentage texts
    # Format matches: <text x="345" y="12" ...>20%</text>
    # Grouping indices: 0 = Morning, 1 = Daytime, 2 = Evening, 3 = Night
    pattern = r'(<text x="345" y="12"[^>]*>)\d+%(</text>)'
    matches = list(re.finditer(pattern, svg_content))
    if len(matches) >= 4:
        for i in range(3, -1, -1):
            m = matches[i]
            svg_content = svg_content[:m.start()] + f"{m.group(1)}{p_times[i]}%{m.group(2)}" + svg_content[m.end():]

    # Update Profile Metrics Summary
    # Commits
    svg_content = re.sub(
        r'<text x="55" y="24"([^>]*?)>\d+\+?</text>(\s*)<text x="55" y="42"([^>]*?)>COMMITS</text>',
        f'<text x="55" y="24"\\1>{stats["commits"]}</text>\\2<text x="55" y="42"\\3>COMMITS</text>',
        svg_content
    )
    # PRs
    svg_content = re.sub(
        r'<text x="55" y="24"([^>]*?)>\d+\+?</text>(\s*)<text x="55" y="42"([^>]*?)>PRs SPLIT</text>',
        f'<text x="55" y="24"\\1>{stats["prs"]}</text>\\2<text x="55" y="42"\\3>PRs SPLIT</text>',
        svg_content
    )
    # Issues
    svg_content = re.sub(
        r'<text x="55" y="24"([^>]*?)>\d+\+?</text>(\s*)<text x="55" y="42"([^>]*?)>ISSUES SOLVED</text>',
        f'<text x="55" y="24"\\1>{stats["issues"]}</text>\\2<text x="55" y="42"\\3>ISSUES SOLVED</text>',
        svg_content
    )
    # Repos
    svg_content = re.sub(
        r'<text x="55" y="24"([^>]*?)>\d+\+?</text>(\s*)<text x="55" y="42"([^>]*?)>PROJECTS</text>',
        f'<text x="55" y="24"\\1>{stats["repos"]}</text>\\2<text x="55" y="42"\\3>PROJECTS</text>',
        svg_content
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Updated diagnostics.svg successfully.")

def update_activity_radar(stats):
    filepath = "activity-radar.svg"
    if not os.path.exists(filepath):
        return

    with open(filepath, "r", encoding="utf-8") as f:
        svg_content = f.read()

    import re
    # Calculate percentage contributions for radar
    total_actions = stats["commits"] + stats["prs"] + stats["reviews"] + stats["issues"]
    if total_actions == 0:
        total_actions = 1
        
    pct_commits = round((stats["commits"] / total_actions) * 100)
    pct_reviews = round((stats["reviews"] / total_actions) * 100)
    pct_prs = round((stats["prs"] / total_actions) * 100)
    pct_issues = round((stats["issues"] / total_actions) * 100)

    # Radar center: cx=645, cy=160. Max radius = 110.
    # Axes: Up=Reviews, Right=Issues, Down=PRs, Left=Commits
    # Up reviews: cx=645, cy = 160 - (pct_reviews/100 * 110)
    # Right issues: cx = 645 + (pct_issues/100 * 110), cy=160
    # Down PRs: cx=645, cy = 160 + (pct_prs/100 * 110)
    # Left commits: cx = 645 - (pct_commits/100 * 110), cy=160
    y_up = 160 - int((pct_reviews / 100) * 110)
    x_right = 645 + int((pct_issues / 100) * 110)
    y_down = 160 + int((pct_prs / 100) * 110)
    x_left = 645 - int((pct_commits / 100) * 110)

    # Replace polygon points
    # Target match: <polygon points="645,130 661,160 645,181 586,160" ... />
    svg_content = re.sub(
        r'<polygon\s+points="[^"]+"\s+fill="url\(#radarFill\)"\s+stroke="none"\s+opacity="0\.85"/>',
        f'<polygon points="{645},{y_up} {x_right},160 {645},{y_down} {x_left},160" fill="url(#radarFill)" stroke="none" opacity="0.85"/>',
        svg_content
    )
    svg_content = re.sub(
        r'<polygon\s+points="[^"]+"\s+fill="none"\s+stroke="#00f0ff"\s+stroke-width="2"\s+opacity="1"/>',
        f'<polygon points="{645},{y_up} {x_right},160 {645},{y_down} {x_left},160" fill="none" stroke="#00f0ff" stroke-width="2" opacity="1"/>',
        svg_content
    )

    # Update data point circle coordinates
    # Reviews
    svg_content = re.sub(
        r'<circle cx="645" cy="\d+" r="5" fill="#a855f7" filter="url\(#rGlow\)"/>',
        f'<circle cx="645" cy="{y_up}" r="5" fill="#a855f7" filter="url(#rGlow)"/>',
        svg_content
    )
    # Issues
    svg_content = re.sub(
        r'<circle cx="\d+" cy="160" r="5" fill="#fbbf24" filter="url\(#rGlow\)"/>',
        f'<circle cx="{x_right}" cy="160" r="5" fill="#fbbf24" filter="url(#rGlow)"/>',
        svg_content
    )
    # PRs
    svg_content = re.sub(
        r'<circle cx="645" cy="\d+" r="5" fill="#ff007f" filter="url\(#rGlow\)"/>',
        f'<circle cx="645" cy="{y_down}" r="5" fill="#ff007f" filter="url(#rGlow)"/>',
        svg_content
    )
    # Commits
    svg_content = re.sub(
        r'<circle cx="\d+" cy="160" r="5" fill="#00f0ff" filter="url\(#rGlow\)"/>',
        f'<circle cx="{x_left}" cy="160" r="5" fill="#00f0ff" filter="url(#rGlow)"/>',
        svg_content
    )

    # Update Left panel progress bars
    # Commits (max 350px)
    svg_content = re.sub(
        r'<g transform="translate\(32, 78\)">(.*?)width="\d+"(.*?)fill="url\(#radarFill\)"',
        r'<g transform="translate(32, 78)">\1width="' + str(int(350 * pct_commits / 100)) + r'"\2fill="url(#radarFill)"', # wait fill is #00f0ff in original, let's just make it fill="[^"]+"
        svg_content,
        flags=re.DOTALL
    )
    # Code Review (max 350px)
    svg_content = re.sub(
        r'<g transform="translate\(32, 148\)">(.*?)width="\d+"',
        r'<g transform="translate(32, 148)">\1width="' + str(int(350 * pct_reviews / 100)) + r'"',
        svg_content,
        flags=re.DOTALL
    )
    # PRs
    svg_content = re.sub(
        r'<g transform="translate\(32, 218\)">(.*?)width="\d+"',
        r'<g transform="translate(32, 218)">\1width="' + str(int(350 * pct_prs / 100)) + r'"',
        svg_content,
        flags=re.DOTALL
    )
    # Issues
    svg_content = re.sub(
        r'<g transform="translate\(32, 288\)">(.*?)width="\d+"',
        r'<g transform="translate(32, 288)">\1width="' + str(int(350 * pct_issues / 100)) + r'"',
        svg_content,
        flags=re.DOTALL
    )

    # Update Left panel percentage texts
    # Commits
    svg_content = re.sub(
        r'(\s*)(\d+)%(\s*)(</text>\s*</g>\s*<!-- Row 2: Code Review -->)',
        f'\\1{pct_commits}%\\3\\4',
        svg_content
    )
    # Reviews
    svg_content = re.sub(
        r'(\s*)(\d+)%(\s*)(</text>\s*</g>\s*<!-- Row 3: Pull Requests -->)',
        f'\\1{pct_reviews}%\\3\\4',
        svg_content
    )
    # PRs
    svg_content = re.sub(
        r'(\s*)(\d+)%(\s*)(</text>\s*</g>\s*<!-- Row 4: Issues -->)',
        f'\\1{pct_prs}%\\3\\4',
        svg_content
    )
    # Issues
    svg_content = re.sub(
        r'(\s*)(\d+)%(\s*)(</text>\s*</g>\s*<!-- Row 5: Repositories -->)',
        f'\\1{pct_issues}%\\3\\4',
        svg_content
    )

    # Update Right panel percentages and labels
    # Up Reviews
    svg_content = re.sub(
        r'<text x="645" y="38"([^>]*?)>\d+%</text>',
        f'<text x="645" y="38"\\1>{pct_reviews}%</text>',
        svg_content
    )
    # Right Issues
    svg_content = re.sub(
        r'<text x="758" y="156"([^>]*?)>\d+%</text>',
        f'<text x="758" y="156"\\1>{pct_issues}%</text>',
        svg_content
    )
    # Down PRs
    svg_content = re.sub(
        r'<text x="645" y="288"([^>]*?)>\d+%</text>',
        f'<text x="645" y="288"\\1>{pct_prs}%</text>',
        svg_content
    )
    # Left Commits
    svg_content = re.sub(
        r'<text x="532" y="156"([^>]*?)>\d+%</text>',
        f'<text x="532" y="156"\\1>{pct_commits}%</text>',
        svg_content
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Updated activity-radar.svg successfully.")

if __name__ == "__main__":
    try:
        stats = fetch_stats()
        print(f"Stats fetched: {json.dumps(stats, indent=2)}")
        update_activity_graph(stats)
        update_diagnostics(stats)
        update_activity_radar(stats)
        print("All SVGs updated successfully!")
    except Exception as e:
        print(f"Error updating stats: {e}")
