import requests
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

GROUP_ID = os.getenv('GROUP_ID')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

url = f"https://graph.facebook.com/v19.0/{GROUP_ID}/feed?fields=message,created_time,from,attachments,permalink_url&access_token={ACCESS_TOKEN}"

posts = []
while url:
    response = requests.get(url)
    data = response.json()
    
    posts.extend(data.get('data', []))
    
    # Get next page
    url = data.get('paging', {}).get('next')

# Save all posts to a JSON file
with open("facebook_group_posts.json", "w", encoding="utf-8") as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

print(f"Saved {len(posts)} posts locally!")