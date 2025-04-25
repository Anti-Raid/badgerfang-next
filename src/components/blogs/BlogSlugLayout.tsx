'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Tag, User, ArrowLeft, Share2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import type { Blog } from '@/types/blogs/index';
import { FaTwitter, FaFacebook, FaLinkedin, FaGithub, FaInstagram, FaLink } from 'react-icons/fa';

export default function BlogPostLayout() {
	const params = useParams();
	const router = useRouter();
	const slug = params.slug as string;

	const [blog, setBlog] = useState<Blog | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const fetchBlog = async () => {
			try {
				const response = await fetch('/api/get/blogs');
				const data: Blog[] = await response.json();
				const foundBlog = data.find((b) => b.slug === slug);

				if (foundBlog) {
					setBlog(foundBlog);

					// Find related blogs (same tags)
					if (foundBlog.tags && foundBlog.tags.length > 0) {
						const related = data
							.filter(
								(b) => b.slug !== slug && b.tags?.some((tag) => foundBlog.tags?.includes(tag))
							)
							.slice(0, 2);
						setRelatedBlogs(related);
					}
				}
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

	const shareArticle = () => {
		if (navigator.share) {
			navigator
				.share({
					title: blog?.title || 'AntiRaid Blog',
					text: blog?.description || '',
					url: window.location.href
				})
				.catch((error) => console.log('Error sharing', error));
		} else {
			navigator.clipboard
				.writeText(window.location.href)
				.then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				})
				.catch((err) => console.error('Could not copy text: ', err));
		}
	};

	const getSocialIcon = (platform: string) => {
		switch (platform.toLowerCase()) {
			case 'twitter':
				return <FaTwitter size={18} />;
			case 'facebook':
				return <FaFacebook size={18} />;
			case 'linkedin':
				return <FaLinkedin size={18} />;
			case 'github':
				return <FaGithub size={18} />;
			case 'instagram':
				return <FaInstagram size={18} />;
			default:
				return <FaLink size={18} />;
		}
	};

	if (isLoading) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-12">
				<div className="h-8 w-40 bg-card rounded-full animate-pulse mb-8"></div>
				<div className="h-12 w-3/4 bg-card rounded-full animate-pulse mb-4"></div>
				<div className="h-6 w-1/2 bg-card rounded-full animate-pulse mb-8"></div>
				<div className="space-y-4">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-4 bg-card rounded-full animate-pulse"></div>
					))}
				</div>
			</div>
		);
	}

	if (!blog) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-24 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					<div className="inline-block p-4 bg-accent/10 rounded-full mb-6">
						<BookOpen size={32} className="text-accent" />
					</div>
					<h1 className="text-3xl font-bold mb-4">Blog post not found</h1>
					<p className="text-muted-foreground mb-8">
						The article you're looking for doesn't exist or has been removed.
					</p>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => router.push('/blogs')}
						className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
					>
						Return to all blogs
					</motion.button>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
				{/* Back button */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link
						href="/blogs"
						className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group"
					>
						<motion.span
							initial={{ x: 0 }}
							animate={{ x: 0 }}
							whileHover={{ x: -3 }}
							transition={{ duration: 0.2 }}
						>
							<ArrowLeft size={18} className="mr-2" />
						</motion.span>
						<span>Back to all blogs</span>
					</Link>
				</motion.div>

				<motion.article
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6 }}
					className="relative"
				>
					{/* Tags */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mb-4"
					>
						{blog.tags?.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{blog.tags.map((tag) => (
									<motion.span
										key={tag}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.3 }}
										className="bg-accent text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center"
									>
										<Tag size={14} className="mr-1.5" />
										{tag}
									</motion.span>
								))}
							</div>
						)}
					</motion.div>

					{/* Title */}
					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-4xl md:text-5xl font-bold font-lora bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6"
					>
						{blog.title}
					</motion.h1>

					{/* Meta info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex flex-wrap items-center mb-8 text-muted-foreground"
					>
						<div className="flex items-center mr-6 mb-2">
							<Calendar size={18} className="mr-2" />
							<span>{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}</span>
						</div>
						<div className="flex items-center gap-4 ml-auto mb-2">
							<motion.div className="relative">
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									onClick={shareArticle}
									className="text-muted-foreground hover:text-primary transition-colors"
									aria-label="Share this article"
								>
									<Share2 size={20} />
								</motion.button>
								{copied && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0 }}
										className="absolute right-0 -bottom-10 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap"
									>
										Link copied!
									</motion.div>
								)}
							</motion.div>
						</div>
					</motion.div>

					{/* Author section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						className="mt-8 p-6 rounded-xl bg-card border border-border relative"
					>
						{blog.author.socials && blog.author.socials.length > 0 && (
							<div className="absolute top-4 right-4 flex gap-2">
								{blog.author.socials.map((social, index) => (
									<motion.a
										key={index}
										href={social.url}
										target="_blank"
										rel="noopener noreferrer"
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										className="text-muted-foreground hover:text-primary transition-colors"
										aria-label={`${blog.author.name}'s ${social.platform}`}
									>
										{getSocialIcon(social.platform)}
									</motion.a>
								))}
							</div>
						)}
						<div className="flex items-center mb-4">
							{blog.author.avatar && blog.author.avatar.url ? (
								<div className="w-12 h-12 rounded-full overflow-hidden mr-4">
									<Image
										src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
										alt={blog.author.name}
										width={48}
										height={48}
										className="object-cover w-full h-full"
									/>
								</div>
							) : (
								<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
									<User size={24} className="text-primary" />
								</div>
							)}
							<div>
								<h3 className="font-bold text-lg">{blog.author.name}</h3>
								<p className="text-muted-foreground text-sm">Author</p>
							</div>
						</div>
						<p className="text-muted-foreground">{blog.author.bio}</p>
					</motion.div>

					{/* Content with enhanced styling */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.7, delay: 0.4 }}
						className="prose prose-lg max-w-none mt-8 dark:prose-invert"
					>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeRaw]}
							components={{
								h1: ({ node, ...props }) => (
									<h1
										className="text-3xl md:text-4xl font-bold mt-12 mb-6 pb-2 border-b border-border/60"
										{...props}
									/>
								),
								h2: ({ node, ...props }) => (
									<h2
										className="text-2xl md:text-3xl font-bold mt-10 mb-4 pb-1 border-b border-border/40"
										{...props}
									/>
								),
								h3: ({ node, ...props }) => (
									<h3 className="text-xl md:text-2xl font-semibold mt-8 mb-4" {...props} />
								),
								h4: ({ node, ...props }) => (
									<h4
										className="text-lg md:text-xl font-semibold mt-6 mb-3 text-primary/90"
										{...props}
									/>
								),
								h5: ({ node, ...props }) => (
									<h5
										className="text-base md:text-lg font-medium mt-5 mb-2 text-primary/80"
										{...props}
									/>
								),
								h6: ({ node, ...props }) => (
									<h6
										className="text-sm md:text-base font-medium mt-4 mb-2 text-muted-foreground"
										{...props}
									/>
								),
								p: ({ node, ...props }) => (
									<p className="my-4 leading-relaxed text-base md:text-lg" {...props} />
								),
								a: ({ node, ...props }) => (
									<a
										className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/70 transition-all"
										{...props}
									/>
								),
								blockquote: ({ node, ...props }) => (
									<blockquote
										className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-6 py-1"
										{...props}
									/>
								),
								ul: ({ node, ...props }) => (
									<ul className="my-4 ml-6 list-disc space-y-2 marker:text-primary/70" {...props} />
								),
								ol: ({ node, ...props }) => (
									<ol
										className="my-4 ml-6 list-decimal space-y-2 marker:text-primary/70"
										{...props}
									/>
								),
								li: ({ node, ...props }) => <li className="pl-2" {...props} />,
								code: ({ node, inline, className, children, ...props }) => {
									return inline ? (
										<code
											className="rounded bg-card px-1.5 py-0.5 text-sm font-mono border border-border/50 text-white"
											{...props}
										>
											{children}
										</code>
									) : (
										<SyntaxHighlighter
											style={{
												...docco,
												'code[class*="language-"]': {
													color: 'white'
												},
												'pre[class*="language-"]': {
													color: 'white',
													background: 'transparent'
												}
											}}
											language="javascript"
											PreTag="div"
											className="rounded-lg border border-border/50 !bg-gray-800 dark:!bg-gray-900 my-6 text-white"
											codeTagProps={{ className: 'text-white' }}
											{...props}
										>
											{String(children).replace(/\n$/, '')}
										</SyntaxHighlighter>
									);
								},
								pre: ({ node, ...props }) => (
									<pre
										className="overflow-x-auto rounded-lg !bg-transparent p-0 my-6 text-white"
										{...props}
									/>
								),
								img: ({ node, ...props }) => (
									<img className="rounded-lg shadow-md my-8 mx-auto" {...props} />
								),
								hr: ({ node, ...props }) => <hr className="my-8 border-border/60" {...props} />,
								table: ({ node, ...props }) => (
									<div className="overflow-x-auto my-8">
										<table className="w-full border-collapse text-sm text-white" {...props} />
									</div>
								),
								th: ({ node, ...props }) => (
									<th
										className="border border-border bg-gray-800 dark:bg-gray-900 px-4 py-2 text-left font-semibold text-white"
										{...props}
									/>
								),
								td: ({ node, ...props }) => (
									<td className="border border-border px-4 py-2 text-white" {...props} />
								)
							}}
						>
							{blog.content}
						</ReactMarkdown>
					</motion.div>
				</motion.article>

				{/* Related articles */}
				{relatedBlogs.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.7 }}
						className="mt-20"
					>
						<h2 className="text-2xl font-bold mb-6 font-lora">Related Articles</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{relatedBlogs.map((relatedBlog, index) => (
								<motion.div
									key={relatedBlog.slug}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
									className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
								>
									<Link href={`/blogs/${relatedBlog.slug}`} className="block">
										<h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-primary transition-colors">
											{relatedBlog.title}
										</h3>
										<p className="text-muted-foreground text-sm line-clamp-2 mb-4">
											{relatedBlog.description}
										</p>
										<div className="flex items-center text-xs text-muted-foreground">
											<Calendar size={12} className="mr-1" />
											<span>{format(new Date(relatedBlog.publishedAt), 'MMM d, yyyy')}</span>
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
