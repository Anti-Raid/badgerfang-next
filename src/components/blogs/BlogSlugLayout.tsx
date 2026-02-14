'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, ArrowLeft, Share2, Clock, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import type { Blog } from '@/types/blogs/index';
import { FaTwitter, FaFacebook, FaLinkedin, FaLink, FaDiscord } from 'react-icons/fa';
import { fetchStrapiBlogs, fetchStrapiBlogBySlug } from '@/lib/api';

interface BlogSlugLayoutProps {
	slug: string;
}

const BlogSlugLayout: React.FC<BlogSlugLayoutProps> = ({ slug }) => {
	const [blog, setBlog] = useState<Blog | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
	const [copied, setCopied] = useState(false);
	const articleRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001
	});

	useEffect(() => {
		const loadData = async () => {
			try {
				const mainBlog = await fetchStrapiBlogBySlug(slug);

				if (mainBlog) {
					setBlog(mainBlog);

					const allBlogsResponse = await fetchStrapiBlogs();
					const allBlogs = allBlogsResponse.data;

					if (mainBlog.tags && mainBlog.tags.length > 0) {
						const related = allBlogs
							.filter(
								(b: Blog) => b.slug !== slug && b.tags?.some((tag) => mainBlog.tags?.includes(tag))
							)
							.slice(0, 3);
						setRelatedBlogs(related);
					}
				}
			} catch (error) {
				console.error('Error loading blog data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		if (slug) loadData();
	}, [slug]);

	const calculateReadingTime = (content: string): string => {
		if (!content) return '1 min read';
		const wordsPerMinute = 200;
		const wordCount = content.split(/\s+/).length;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return `${minutes} min read`;
	};

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
			navigator.clipboard.writeText(window.location.href).then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			});
		}
	};

	const getSocialIcon = (platform?: any) => {
		const p = typeof platform === 'string' ? platform.toLowerCase() : '';
		switch (p) {
			case 'twitter':
				return <FaTwitter size={16} />;
			case 'facebook':
				return <FaFacebook size={16} />;
			case 'linkedin':
				return <FaLinkedin size={16} />;
			case 'discord':
				return <FaDiscord size={16} />;
			default:
				return <FaLink size={16} />;
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen pt-32 px-6">
				<div className="max-w-3xl mx-auto">
					<div className="h-4 w-20 bg-muted rounded animate-pulse mb-8" />
					<div className="h-10 w-3/4 bg-muted rounded animate-pulse mb-4" />
					<div className="h-6 w-1/2 bg-muted rounded animate-pulse mb-12" />
					<div className="aspect-video w-full bg-muted rounded-xl animate-pulse mb-12" />
					<div className="space-y-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="h-4 w-full bg-muted rounded animate-pulse" />
						))}
					</div>
				</div>
			</div>
		);
	}

	// Not found state
	if (!blog) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="text-center">
					<BookOpen size={48} className="mx-auto text-muted-foreground mb-6" />
					<h1 className="text-2xl font-semibold mb-3">Post not found</h1>
					<p className="text-muted-foreground mb-8">
						The article you're looking for doesn't exist.
					</p>
					<Link
						href="/blogs"
						className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
					>
						<ArrowLeft size={16} />
						Back to Blog
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Reading Progress */}
			<motion.div
				className="fixed top-0 left-0 right-0 h-0.5 bg-primary z-50 origin-left"
				style={{ scaleX }}
			/>

			<div className="max-w-3xl mx-auto px-6 py-32">
				{/* Back link */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-12"
				>
					<Link
						href="/blogs"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft size={16} />
						Back to Blog
					</Link>
				</motion.div>

				<article ref={articleRef}>
					{/* Header */}
					<header className="mb-12">
						{/* Tags */}
						{blog.tags && blog.tags.length > 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex flex-wrap gap-2 mb-4"
							>
								{blog.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-0.5 text-xs font-medium text-primary bg-primary/10 rounded"
									>
										{tag}
									</span>
								))}
							</motion.div>
						)}

						{/* Title */}
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-6"
						>
							{blog.title}
						</motion.h1>

						{/* Meta */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-8 border-b border-border"
						>
							<div className="flex items-center gap-2">
								{blog.author?.avatar ? (
									<div className="relative w-8 h-8 rounded-full overflow-hidden">
										<Image
											src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
											alt={blog.author.name}
											fill
											className="object-cover"
										/>
									</div>
								) : (
									<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
										<User size={14} />
									</div>
								)}
								<span className="font-medium text-foreground">{blog.author?.name}</span>
							</div>
							<span className="flex items-center gap-1">
								<Calendar size={14} />
								{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}
							</span>
							<span className="flex items-center gap-1">
								<Clock size={14} />
								{calculateReadingTime(blog.content)}
							</span>
							<button
								onClick={shareArticle}
								className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
								aria-label="Share article"
							>
								<Share2 size={16} />
								{copied && (
									<span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded">
										Copied!
									</span>
								)}
							</button>
						</motion.div>
					</header>

					{/* Featured Image */}
					{blog.slug && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="relative aspect-video rounded-xl overflow-hidden mb-12 bg-muted"
						>
							<Image
								src={`/api/get/og-image?slug=${blog.slug}`}
								alt={blog.title}
								fill
								className="object-cover"
								priority
							/>
						</motion.div>
					)}

					{/* Content */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-muted prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
					>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeRaw]}
							components={{
								code({ inline, className, children, ...props }: any) {
									const match = /language-(\w+)/.exec(className || '');
									return !inline && match ? (
										<SyntaxHighlighter
											style={atomOneDark}
											language={match[1]}
											PreTag="div"
											className="rounded-xl !bg-[#1a1a2e] my-6"
											{...props}
										>
											{String(children).replace(/\n$/, '')}
										</SyntaxHighlighter>
									) : (
										<code className={className} {...props}>
											{children}
										</code>
									);
								}
							}}
						>
							{blog.content}
						</ReactMarkdown>
					</motion.div>

					{/* Author Bio */}
					<footer className="mt-16 pt-8 border-t border-border">
						<div className="flex items-start gap-4">
							{blog.author?.avatar ? (
								<div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
									<Image
										src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
										alt={blog.author.name}
										fill
										className="object-cover"
									/>
								</div>
							) : (
								<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0">
									<User size={24} />
								</div>
							)}
							<div>
								<p className="font-semibold text-foreground mb-1">{blog.author?.name}</p>
								{blog.author?.bio && (
									<p className="text-sm text-muted-foreground mb-3">{blog.author.bio}</p>
								)}
								{blog.author?.socials && blog.author.socials.length > 0 && (
									<div className="flex gap-2">
										{blog.author.socials.map((social: any, i: number) => (
											<a
												key={i}
												href={social.url}
												target="_blank"
												rel="noopener noreferrer"
												className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
											>
												{getSocialIcon(social.platform)}
											</a>
										))}
									</div>
								)}
							</div>
						</div>
					</footer>
				</article>

				{/* Related Posts */}
				{relatedBlogs.length > 0 && (
					<section className="mt-24">
						<h2 className="text-xl font-semibold mb-8">Related articles</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{relatedBlogs.map((relatedBlog) => (
								<Link
									key={relatedBlog.slug}
									href={`/blogs/${relatedBlog.slug}`}
									className="group block"
								>
									<div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-muted">
										<Image
											src={`/api/get/og-image?slug=${relatedBlog.slug}`}
											alt={relatedBlog.title}
											fill
											className="object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									</div>
									<h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
										{relatedBlog.title}
									</h3>
									<p className="text-xs text-muted-foreground">
										{format(new Date(relatedBlog.publishedAt), 'MMM d, yyyy')}
									</p>
								</Link>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
};

export default BlogSlugLayout;
