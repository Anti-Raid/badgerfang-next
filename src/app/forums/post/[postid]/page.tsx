import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { listForumPosts } from "@/lib/api"
import PostCard from "@/components/forums/components/PostCard"
import { FaArrowLeft, FaReply } from "react-icons/fa"

async function getPost(postId: string) {
  try {
    const posts = await listForumPosts()
    if (posts instanceof Error) {
      console.error("Error fetching posts:", posts)
      return null
    }

    return posts.find((post) => post.postid === postId) || null
  } catch (error) {
    console.error("Error in getPost:", error)
    return null
  }
}

async function getRelatedPosts(currentPostId: string) {
  try {
    const posts = await listForumPosts()
    if (posts instanceof Error) {
      console.error("Error fetching posts:", posts)
      return []
    }

    // Filter out current post and limit to 3 posts
    return posts.filter((post) => post.postid !== currentPostId).slice(0, 3)
  } catch (error) {
    console.error("Error in getRelatedPosts:", error)
    return []
  }
}

export default async function PostPage({ params }: { params: { postid: string } }) {
  const post = await getPost(params.postid)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(params.postid)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <Link
          href="/forums"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaArrowLeft className="h-3 w-3" />
          Back to Forums
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Post */}
          <PostCard {...post} />

          {/* Comments Section */}
          <div className="rounded-lg bg-card/80 backdrop-blur-sm border border-border/30 p-4">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>

            {/* Comment Form */}
            <div className="flex gap-3 mb-6">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Your avatar"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  className="w-full rounded-md bg-background/50 border border-border/50 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Write a comment..."
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <FaReply className="h-3 w-3" />
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment, index) => (
                  <div key={index} className="flex gap-3 border-b border-border/20 pb-4">
                    <Image
                      src="/placeholder.svg?height=32&width=32"
                      alt="User avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Username</span>
                        <span className="text-xs text-muted-foreground">2h ago</span>
                      </div>
                      <p className="mt-1 text-sm">This is a comment.</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg bg-card/80 backdrop-blur-sm border border-border/30 p-4">
            <h3 className="text-lg font-semibold mb-3">About the Author</h3>
            <Link href={`/forums/@${post.user.usertag}`} className="flex items-center gap-3 mb-3">
              <Image
                src={(post.user.avatar as string) || "/placeholder.svg"}
                alt={`${post.user.name}'s Avatar`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48"
                }}
              />
              <div>
                <div className="font-medium">{post.user.name}</div>
                <div className="text-sm text-muted-foreground">@{post.user.usertag}</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-3">{post.user.bio}</p>
            <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Follow
            </button>
          </div>

          {relatedPosts.length > 0 && (
            <div className="rounded-lg bg-card/80 backdrop-blur-sm border border-border/30 p-4">
              <h3 className="text-lg font-semibold mb-3">Related Posts</h3>
              <div className="space-y-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.postid}
                    href={`/forums/post/${relatedPost.postid}`}
                    className="block p-3 rounded-md hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={(relatedPost.user.avatar as string) || "/placeholder.svg"}
                        alt={`${relatedPost.user.name}'s Avatar`}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium line-clamp-1">{relatedPost.caption}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          by {relatedPost.user.name} • {new Date(relatedPost.createdat).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
