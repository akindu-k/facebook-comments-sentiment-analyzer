import requests;
import os;
import json;


walker getComments{
    has page_id: str = "";
    has access_token:str = '';

    def feth_comments(post_id: str) -> List[dict]{
        print("  Fetching comments for post:", post_id);
        comments_url = f"https://graph.facebook.com/v19.0/{post_id}/comments?fields=message,created_time,from,like_count&access_token={self.access_token}";
        comments = [];

        while (comments_url){
            response = requests.get(comments_url);
            data = response.json();

            if ('data' in data){
                comments.extend(data['data']);
            }

            comments_url = data.get('paging', {}).get('next');

        }

        return comments;
    }

    can start with `root entry{
        os.makedirs("posts", exist_ok=True);
        url = f"https://graph.facebook.com/v19.0/{self.page_id}/feed?fields=id,message,created_time,from,attachments,permalink_url&access_token={self.access_token}";

        post_count = 0;

        while (url){
            response = requests.get(url);
            data = response.json();
            
            posts = data.get('data', []);

            for post in posts{
                post_count += 1;
                print(f"Processing post {post_count}: {post.get('id', 'Unknown ID')}");

                comments = self.fetch_comments(post['id']);
                post['comments'] = comments;
                post['comments_count'] = len(comments);

                filename = f"posts/post_{post['id'].replace('_', '-')}.json";

                with open(filename, "w", encoding="utf-8") as f{
                    json.dump(post, f, indent=2, ensure_ascii=False);
                }
        
                print(f"  Saved {len(comments)} comments for post {post['id']}");
            }

        }
        print(f"Finished processing {post_count} posts!");
        print(f"All posts with comments saved in the 'posts/' directory");

    }
}

with entry{
    root spawn getComments();
    
}
