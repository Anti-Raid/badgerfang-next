import PostCard from "@/components/forums/PostCard";
import { Posts } from "@/lib/forums/fetch";
import { posts } from "@/types/forums/types";

export default async function DebugForumPostCard() {
    const data = await Posts.listPosts();

    return (
        <>
            {data.map((post: posts, index: number) => (
                <PostCard {...post} key={index} />
            ))}
        </>
    );
}