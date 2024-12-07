import PostCard from '@/components/forums/PostCard';
import { Posts } from '@/lib/forums/fetch';
import { posts } from '@/types/forums/types';

export default async function DebugForumPostCard() {
	const data = await Posts.listPosts();

	return (
		<>
			<div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 p-4">
				{data.map((post: posts, index: number) => (
					<div className="break-inside-avoid mb-4" key={index}>
						<PostCard {...post} key={index} />
					</div>
				))}
			</div>
		</>
	);
}
