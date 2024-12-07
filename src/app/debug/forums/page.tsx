import PostCard from '@/components/forums/PostCard';
import { Posts } from '@/lib/forums/fetch';
import { posts } from '@/types/forums/types';

export default async function DebugForumPostCard() {
	const data = await Posts.listPosts();

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{data.map((post: posts, index: number) => (
					<div className="col-span-1 h-auto p-0 m-0" key={index}>
						<div className="self-auto h-auto p-0 m-0">
							<PostCard {...post} key={index} />
						</div>
					</div>
				))}
			</div>
		</>
	);
}
