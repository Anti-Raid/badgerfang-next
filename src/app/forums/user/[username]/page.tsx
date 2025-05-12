import { getForumUser, listForumUserPosts } from "@/lib/api"
import type { users, posts } from "@/types/forums/types"
import ProfileLayout from "@/components/forums/profileLayout"
import { notFound } from "next/navigation"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  try {
    const username = params.username.startsWith("@") ? params.username.substring(1) : params.username

    const user = await getForumUser(username)

    if (user instanceof Error) {
      notFound()
    }

    const userPosts = await listForumUserPosts(username)
    const posts = userPosts instanceof Error ? [] : userPosts

    return (
      <main className="container mx-auto px-4 py-8">
        <ProfileLayout user={user as users} posts={posts as posts[]} />
      </main>
    )
  } catch (error) {
    console.error("Error fetching user profile:", error)
    notFound()
  }
}
