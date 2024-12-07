'use client';
import React from 'react';
import { posts } from '@/types/forums/types';

const PostCard: React.FC<posts> = (post: posts) => {
	const ImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = '/logo.webp';
	};

	return (
		<div className="block h-auto max-w-sm">
			{/* User Info */}
			<div className="p-2 border rounded-t-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700">
				<a href={`/forums/@${post.user.usertag}`}>
					<h2 className="flex">
						<img
							className="h-8 rounded-full"
							src={post.user.avatar as string}
							alt={`${post.user.name}'s Avatar`}
							width={30}
							height={30}
							onError={ImageLoadError}
						/>

						<p className="ml-2 mt-1 mb-1 font-bold text-primary-400">
							{post.user.name !== post.user.usertag ? post.user.name : post.user.usertag}
							<span className="text-primary-400/75">
								{post.user.name !== post.user.usertag ? `(@${post.user.usertag})` : ''}
							</span>
						</p>
					</h2>
				</a>
			</div>

			{/* Post Content */}
			<div className="p-3 border rounded-b-lg shadow bg-surface-800 border-surface-700 hover:bg-surface-700">
				<a href={`/forums/post/${post.postid}`}>
					<h5 className="mb-2 text-base font-bold overflow-x-auto tracking-tight text-primary-400">
						{post.caption}
					</h5>

					{/* Post Image */}
					{post.image && (
						<img
							src={post.image}
							alt="Post Card"
							className="max-h-[160px] w-full rounded-md"
							loading="lazy"
							height="120"
							tabIndex={0}
							onClick={() => (window.location.href = post.image || '#')}
							onKeyPress={(e) => {
								e.preventDefault();
								if (e.key === 'Enter') window.location.href = post.image || '#';
							}}
							onError={ImageLoadError}
						/>
					)}

					{/* Post Plugins */}
					{post.plugins.length > 0 &&
						post.plugins.map((item, idx) => {
							if (item.type === 'tenor') {
								return (
									<img
										key={idx}
										src={item.href}
										alt="Tenor"
										className="object-cover w-full max-h-[160px] rounded-md"
										loading="lazy"
										height="120"
										tabIndex={0}
										onClick={() => (window.location.href = item.href || '#')}
										onKeyPress={(e) => {
											e.preventDefault();
											if (e.key === 'Enter') window.location.href = item.href || '#';
										}}
										onError={ImageLoadError}
									/>
								);
							}

							if (item.type === 'url') {
								return (
									<div
										key={idx}
										className="block max-w-sm p-2 border cursor-pointer rounded-md shadow bg-surface-600 border-surface-400 hover:bg-surface-800"
										tabIndex={0}
										onClick={() => (window.location.href = item.jsonData.url)}
										onKeyPress={(e) => {
											e.preventDefault();
											if (e.key === 'Enter') window.location.href = item.jsonData.url;
										}}
									>
										<h2 className="flex">
											<img
												className="h-5 rounded-full"
												src={item.jsonData.favicon || null}
												alt={item.jsonData.sitename}
												width={20}
												height={20}
												onError={ImageLoadError}
											/>

											<p className="ml-2 font-extrabold text-sm text-primary-400 hover:underline">
												{item.jsonData.sitename}
											</p>
										</h2>

										<div className="mt-3">
											<h2 className="text-primary-500 text-md font-semibold hover:underline">
												{item.jsonData.title}
											</h2>
											<p className="text-primary-300 text-sm font-semibold">
												{item.jsonData.description}
											</p>

											{item.jsonData.image && (
												<img
													src={item.jsonData.image}
													alt={item.jsonData.title}
													className="object-cover mt-2 w-full max-h-[120px] rounded-md"
													loading="lazy"
													height="110"
													tabIndex={0}
													onClick={() => (window.location.href = item.jsonData.image)}
													onKeyPress={(e) => {
														e.preventDefault();
														if (e.key === 'Enter') window.location.href = item.jsonData.image;
													}}
													onError={ImageLoadError}
												/>
											)}
										</div>
									</div>
								);
							}
							return null;
						})}
				</a>
			</div>
		</div>
	);
};

export default PostCard;
