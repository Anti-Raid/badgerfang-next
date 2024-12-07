'use client';
import React from 'react';
import { posts } from "@/types/forums/types";

const PostCard: React.FC<posts> = (post: posts) => {
	const ImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = '/logo.webp';
	};

	return (
		<>
            <h1>{JSON.stringify(post)}</h1>
            <div className="p-5" />
        </>
	);
};

export default PostCard;
