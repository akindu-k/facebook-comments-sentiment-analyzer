import requests
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()
PAGE_ID = os.getenv('PAGE_ID')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

# Create posts directory if it doesn't exist
os.makedirs("posts", exist_ok=True)
print("Posts directory ensured to exist.")

def fetch_comments(post_id):
    """Fetch all comments for a specific post"""
    print(f"Fetching comments for post ID: {post_id}")
    comments_url = f"https://graph.facebook.com/v19.0/{post_id}/comments?fields=message,created_time,from,like_count&access_token={ACCESS_TOKEN}"
    comments = []
    
    while comments_url:
        print(f"Fetching comments from URL: {comments_url}")
        response = requests.get(comments_url)
        data = response.json()
        print(f"Response received for comments: {data}")
        
        if 'data' in data:
            comments.extend(data['data'])
            print(f"Added {len(data['data'])} comments. Total comments so far: {len(comments)}")
        
        # Get next page of comments
        comments_url = data.get('paging', {}).get('next')
        if comments_url:
            print("Found next page of comments.")
        else:
            print("No more pages of comments.")
    
    print(f"Finished fetching comments for post ID: {post_id}. Total comments: {len(comments)}")
    return comments

url = f"https://graph.facebook.com/v19.0/{PAGE_ID}/feed?fields=id,message,created_time,from,attachments,permalink_url&access_token={ACCESS_TOKEN}"
print(f"Starting to fetch posts from URL: {url}")

post_count = 0
while url:
    print(f"Fetching posts from URL: {url}")
    response = requests.get(url)
    data = response.json()
    print(f"Response received for posts: {data}")
    
    posts = data.get('data', [])
    print(f"Number of posts fetched: {len(posts)}")
    
    for post in posts:
        post_count += 1
        print(f"Processing post {post_count}: {post.get('id', 'Unknown ID')}")
        
        # Fetch comments for this post
        comments = fetch_comments(post['id'])
        post['comments'] = comments
        post['comments_count'] = len(comments)
        
        # Create filename based on post ID
        filename = f"posts/post_{post['id'].replace('_', '-')}.json"
        print(f"Saving post {post['id']} to file: {filename}")
        
        # Save individual post with comments to JSON file
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(post, f, indent=2, ensure_ascii=False)
        
        print(f"Saved {len(comments)} comments for post {post['id']}")
    
    # Get next page
    url = data.get('paging', {}).get('next')
    if url:
        print("Found next page of posts.")
    else:
        print("No more pages of posts.")

print(f"Finished processing {post_count} posts!")
print(f"All posts with comments saved in the 'posts/' directory")