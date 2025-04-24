'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Tag, User } from 'lucide-react';
import Link from 'next/link';
import { Blog } from '@/types/blogs/index';
import { format } from 'date-fns';

export default function BlogPostLayout() {
	const params = useParams();
	const slug = params.slug as string;

	const [blog, setBlog] = useState<Blog | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchBlog = async () => {
			try {
				const response = await fetch('/api/get/blogs');
				const data: Blog[] = await response.json();
				const foundBlog = data.find((b) => b.slug === slug);
				setBlog(foundBlog || null);
			} catch (error) {
				console.error('Error fetching blog:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (slug) {
			fetchBlog();
		}
	}, [slug]);

	const renderMarkdown = (content: string) => {
		let html = content
			.replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mt-8 mb-4">$1</h1>')
			.replace(/^## (.*$)/gm, '<h2 class="text-3xl font-bold mt-6 mb-3">$1</h2>')
			.replace(/^### (.*$)/gm, '<h3 class="text-2xl font-bold mt-5 mb-2">$1</h3>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
			.replace(/^- (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
			.replace(/^(?!<(h[1-6]|ul|ol|li|p|blockquote))(.*)$/gm, '<p class="my-4">$2</p>');

		const lines = html.split('\n');
		let inList = false;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('<li') && !inList) {
				lines[i] = `<ul class="my-4">` + lines[i];
				inList = true;
			} else if (!lines[i].startsWith('<li') && inList) {
				lines[i - 1] += `</ul>`;
				inList = false;
			}
		}
		if (inList) lines.push('</ul>');

		return lines.join('\n');
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-12">
				<div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
				<div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mb-8"></div>
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
					))}
				</div>
			</div>
		);
	}

	if (!blog) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-12 text-center">
				<h1 className="text-3xl font-bold">Blog post not found</h1>
				<p className="mt-4">
					<Link href="/blogs" className="text-primary hover:underline">
						Return to all blogs
					</Link>
				</p>
			</div>
		);
	}

	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="max-w-4xl mx-auto px-4 py-12"
		>
			<Link href="/blogs" className="inline-flex items-center text-primary hover:underline mb-8">
				<motion.span
					initial={{ x: 10 }}
					animate={{ x: 0 }}
					transition={{
						repeat: Infinity,
						repeatType: 'reverse',
						duration: 0.6
					}}
				>
					←
				</motion.span>
				<span className="ml-2">Back to all blogs</span>
			</Link>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.6 }}
			>
				<h1 className="text-4xl md:text-5xl font-bold font-lora bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					{blog.title}
				</h1>
				<div className="flex flex-wrap items-center mt-6 text-muted-foreground">
					<div className="flex items-center mr-6 mb-2">
						<User size={18} className="mr-2" />
						<span>{blog.author.name}</span>
					</div>
					<div className="flex items-center mr-6 mb-2">
						<Calendar size={18} className="mr-2" />
						<span>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</span>
					</div>
					{blog.tags?.length ? (
						<div className="flex flex-wrap items-center mb-2">
							<Tag size={18} className="mr-2" />
							{blog.tags.map((tag) => (
								<span
									key={tag}
									className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm mr-2"
								>
									{tag}
								</span>
							))}
						</div>
					) : null}
				</div>
			</motion.div>

			<motion.div
				className="mt-8 prose prose-lg max-w-none"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.4, duration: 0.6 }}
				dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
			/>
		</motion.article>
	);
}
