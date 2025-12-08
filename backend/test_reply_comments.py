import requests
import json
from dotenv import load_dotenv
import os
import time

# Load environment variables from .env file
load_dotenv()

PAGE_ID = os.getenv('PAGE_ID')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')

# Create posts directory if it doesn't exist
os.makedirs("posts", exist_ok=True)

def load_existing_post_data(filename):
    """Load existing post data if file exists"""
    if os.path.exists(filename):
        try:
            with open(filename, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return None
    return None

def get_existing_comment_ids(post_data):
    """Get list of existing comment IDs from saved post data"""
    if post_data and 'comments' in post_data:
        return {comment.get('id') for comment in post_data['comments'] if comment.get('id')}
    return set()

def reply_to_comment(comment_id, message="Thank for comment"):
    """Reply to a specific comment"""
    reply_url = f"https://graph.facebook.com/v19.0/{comment_id}/comments"
    payload = {
        'message': message,
        'access_token': ACCESS_TOKEN
    }
    
    try:
        response = requests.post(reply_url, data=payload)
        result = response.json()
        
        # Add delay to avoid rate limiting
        time.sleep(2)
        
        return result
    except Exception as e:
        return {'error': {'message': str(e)}}

def fetch_comments(post_id):
    """Fetch all comments for a specific post"""
    comments_url = f"https://graph.facebook.com/v19.0/{post_id}/comments?fields=id,message,created_time,from,like_count&access_token={ACCESS_TOKEN}"
    comments = []
    
    while comments_url:
        try:
            response = requests.get(comments_url)
            data = response.json()
            
            if 'error' in data:
                print(f"    Error fetching comments: {data['error']}")
                break
            
            if 'data' in data:
                comments.extend(data['data'])
            
            # Get next page of comments
            comments_url = data.get('paging', {}).get('next')
            
            # Add delay to avoid rate limiting
            time.sleep(1)
            
        except Exception as e:
            print(f"    Exception fetching comments: {e}")
            break
    
    return comments

def get_page_access_token():
    """Try to get page access token from user token"""
    url = f"https://graph.facebook.com/v19.0/me/accounts?access_token={ACCESS_TOKEN}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'data' in data:
            for page in data['data']:
                if page['id'] == PAGE_ID:
                    print(f"Found page access token for {page['name']}")
                    return page['access_token']
    except Exception as e:
        print(f"Error getting page token: {e}")
    
    return ACCESS_TOKEN

def check_token_permissions():
    """Check if the access token has required permissions"""
    url = f"https://graph.facebook.com/v19.0/me/permissions?access_token={ACCESS_TOKEN}"
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'data' in data:
            permissions = [perm['permission'] for perm in data['data'] if perm['status'] == 'granted']
            print(f"Granted permissions: {permissions}")
            
            required_perms = ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list']
            missing_perms = [perm for perm in required_perms if perm not in permissions]
            
            if missing_perms:
                print(f"Missing permissions: {missing_perms}")
                return False
            
            print("✓ All required permissions granted")
            return True
        else:
            print(f"✗ Error checking permissions: {data}")
            return False
    except Exception as e:
        print(f"✗ Exception checking permissions: {e}")
        return False

# Try to get page access token
print("Attempting to get page access token...")
page_token = get_page_access_token()
if page_token != ACCESS_TOKEN:
    ACCESS_TOKEN = page_token
    print("✓ Using page access token")
else:
    print("⚠ Using original token - might have permission issues")

# Check permissions
print("Checking token permissions...")
check_token_permissions()

print(f"\nStarting to process posts from page {PAGE_ID}")
print("=" * 60)

url = f"https://graph.facebook.com/v19.0/{PAGE_ID}/feed?fields=id,message,created_time,from,attachments,permalink_url&access_token={ACCESS_TOKEN}"

post_count = 0
total_new_comments = 0
total_processed_comments = 0

while url:
    try:
        response = requests.get(url)
        data = response.json()
        
        if 'error' in data:
            print(f"API Error: {data['error']}")
            break
        
        posts = data.get('data', [])
        
        for post in posts:
            post_count += 1
            post_id = post.get('id', 'Unknown ID')
            print(f"\nProcessing post {post_count}: {post_id}")
            
            # Create filename based on post ID
            filename = f"posts/post_{post_id.replace('_', '-')}.json"
            
            # Load existing post data
            existing_post_data = load_existing_post_data(filename)
            existing_comment_ids = get_existing_comment_ids(existing_post_data)
            
            print(f"  Previously saved comments: {len(existing_comment_ids)}")
            
            # Fetch current comments for this post
            current_comments = fetch_comments(post_id)
            print(f"  Current comments found: {len(current_comments)}")
            
            total_processed_comments += len(current_comments)
            
            # Find new comments
            new_comments = []
            for comment in current_comments:
                comment_id = comment.get('id')
                if comment_id and comment_id not in existing_comment_ids:
                    new_comments.append(comment)
            
            print(f"  New comments to reply to: {len(new_comments)}")
            
            # Reply to new comments
            successful_replies = 0
            for new_comment in new_comments:
                comment_id = new_comment.get('id')
                commenter_name = new_comment.get('from', {}).get('name', 'Unknown')
                comment_message = new_comment.get('message', '')[:50] + '...' if len(new_comment.get('message', '')) > 50 else new_comment.get('message', '')
                
                print(f"    📝 New comment from {commenter_name}: \"{comment_message}\"")
                
                # Reply to the comment
                reply_response = reply_to_comment(comment_id, "Thank for comment")
                
                if 'id' in reply_response:
                    print(f"    ✅ Successfully replied to comment {comment_id}")
                    successful_replies += 1
                elif 'error' in reply_response:
                    error_msg = reply_response['error'].get('message', 'Unknown error')
                    error_code = reply_response['error'].get('code', 'No code')
                    print(f"    ❌ Failed to reply to comment {comment_id}")
                    print(f"       Error ({error_code}): {error_msg}")
                    
                    # If it's a permissions error, suggest solution
                    if error_code == 200:
                        print(f"       💡 This is a permissions error. You may need:")
                        print(f"          - Page access token instead of user token")
                        print(f"          - pages_manage_posts permission")
                        print(f"          - Admin role on the page")
                else:
                    print(f"    ❓ Unexpected response: {reply_response}")
            
            # Update post data with all current comments
            post['comments'] = current_comments
            post['comments_count'] = len(current_comments)
            post['last_updated'] = time.strftime('%Y-%m-%d %H:%M:%S')
            
            # Save updated post with comments to JSON file
            try:
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(post, f, indent=2, ensure_ascii=False)
                print(f"  💾 Saved post data to {filename}")
            except Exception as e:
                print(f"  ❌ Error saving file {filename}: {e}")
            
            total_new_comments += successful_replies
            
            print(f"  📊 Summary: {len(current_comments)} total, {len(new_comments)} new, {successful_replies} replied")
        
        # Get next page of posts
        url = data.get('paging', {}).get('next')
        
        if url:
            print(f"\n⏭️  Moving to next page of posts...")
            time.sleep(2)  # Delay between pages
        
    except Exception as e:
        print(f"❌ Exception processing posts: {e}")
        break

print("\n" + "=" * 60)
print("📈 FINAL SUMMARY")
print("=" * 60)
print(f"✅ Posts processed: {post_count}")
print(f"📝 Total comments processed: {total_processed_comments}")
print(f"🆕 New comments found and replied to: {total_new_comments}")
print(f"📁 All posts saved in 'posts/' directory")

if total_new_comments == 0 and total_processed_comments > 0:
    print("\n💡 No new comments found. All existing comments were already processed!")
elif total_new_comments > 0:
    print(f"\n🎉 Successfully replied to {total_new_comments} new comments!")

print("\n🔄 Run this script periodically to auto-reply to new comments!")