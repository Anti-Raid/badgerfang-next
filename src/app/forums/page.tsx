import { listForumPosts } from "@/lib/api"
import PostCard from "@/components/forums/components/PostCard"
import FeedLayout from "@/components/forums/feedLayout"

async function getPosts() {
  try {
    const posts = await listForumPosts()
    if (posts instanceof Error) {
      console.error("Error fetching posts:", posts)
      return []
    }
    return posts
  } catch (error) {
    console.error("Error in getPosts:", error)
    return []
  }
}

export default async function ForumsPage() {
  const posts = await getPosts()

  return (
    <FeedLayout>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.postid} {...post} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M8 18v-1" />
              <path d="M16 18v-3" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">No posts found</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            There are no posts to display right now. Be the first to create a post!
          </p>
          <button className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Create Post
          </button>
        </div>
      )}
    </FeedLayout>
  )
}
