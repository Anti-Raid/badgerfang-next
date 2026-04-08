'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, ArrowLeft, Share2, Clock, User, BookOpen, Check, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import type { Blog, BlogPost } from '@/types/blogs/index';
import { FaTwitter, FaFacebook, FaLinkedin, FaLink, FaDiscord } from 'react-icons/fa';
import { fetchBlogs, fetchBlogBySlug } from '@/lib/api';

interface BlogSlugLayoutProps {
	slug: string;
}

const calculateReadingTime = (content: string): string => {
	if (!content) return '1 min read';
	const mins = Math.ceil(content.split(/\s+/).length / 200);
	return `${mins} min read`;
};

const getSocialIcon = (platform?: string) => {
	switch ((platform ?? '').toLowerCase()) {
		case 'twitter': return <FaTwitter size={15} />;
		case 'facebook': return <FaFacebook size={15} />;
		case 'linkedin': return <FaLinkedin size={15} />;
		case 'discord': return <FaDiscord size={15} />;
		default: return <FaLink size={15} />;
	}
};

// ── Related post mini-card ────────────────────────────────────────────────────

const RelatedCard = ({ blog }: { blog: Blog }) => (
	<Link
		href={`/blogs/${blog.slug}`}
		className="group flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-300"
	>
		<div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
			<Image
				src={`/api/get/og-image?slug=${blog.slug}`}
				alt={blog.title}
				fill
				className="object-cover group-hover:scale-105 transition-transform duration-500"
			/>
		</div>
		<div className="flex-1 min-w-0">
			{blog.tags?.[0] && (
				<span className="text-[11px] font-bold text-primary mb-1 block">{blog.tags[0]}</span>
			)}
			<h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
				{blog.title}
			</h4>
			<p className="text-xs text-muted-foreground">
				{format(new Date(blog.publishedAt), 'MMM d, yyyy')}
			</p>
		</div>
		<ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 mt-1" />
	</Link>
);

// ── Main layout ───────────────────────────────────────────────────────────────

const BlogSlugLayout: React.FC<BlogSlugLayoutProps> = ({ slug }) => {
	const [blog, setBlog] = useState<Blog | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
	const [copied, setCopied] = useState(false);

	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

	useEffect(() => {
		const loadData = async () => {
			try {
				const mainBlog = await fetchBlogBySlug(slug);
				if (mainBlog) {
					setBlog(mainBlog);
					const allBlogsResponse = await fetchBlogs();
					const allBlogs: BlogPost[] = allBlogsResponse;
					if (mainBlog.tags?.length > 0) {
						const related = allBlogs
							.filter((b) => b.slug !== slug && b.tags?.some((t: string) => mainBlog.tags?.includes(t)))
							.slice(0, 3);
						setRelatedBlogs(related);
					}
				}
			} catch (err) {
				console.error('Error loading blog:', err);
			} finally {
				setIsLoading(false);
			}
		};
		if (slug) loadData();
	}, [slug]);

	const shareArticle = () => {
		if (navigator.share) {
			navigator.share({ title: blog?.title || 'AntiRaid Blog', text: blog?.description || '', url: window.location.href })
				.catch(() => {});
		} else {
			navigator.clipboard.writeText(window.location.href).then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			});
		}
	};

	// ── Loading ──
	if (isLoading) {
		return (
			<div className="min-h-screen pt-32 px-6">
				<div className="max-w-3xl mx-auto space-y-6 animate-pulse">
					<div className="h-4 w-24 bg-muted rounded-full" />
					<div className="space-y-3">
						<div className="h-10 w-4/5 bg-muted rounded-xl" />
						<div className="h-8 w-3/5 bg-muted rounded-xl" />
					</div>
					<div className="flex gap-3">
						<div className="w-8 h-8 rounded-full bg-muted" />
						<div className="h-4 w-32 bg-muted rounded self-center" />
						<div className="h-4 w-24 bg-muted rounded self-center" />
					</div>
					<div className="aspect-video w-full bg-muted rounded-2xl" />
					{[...Array(6)].map((_, i) => (
						<div key={i} className="h-4 bg-muted rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
					))}
				</div>
			</div>
		);
	}

	// ── Not found ──
	if (!blog) {
		return (
			<div className="min-h-screen flex items-center justify-center px-6">
				<div className="text-center max-w-sm">
					<div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
						<BookOpen className="w-8 h-8 text-muted-foreground/50" />
					</div>
					<h1 className="text-2xl font-bold text-foreground mb-3">Article not found</h1>
					<p className="text-muted-foreground mb-8">
						This post doesn't exist or may have been removed.
					</p>
					<Link
						href="/blogs"
						className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Blog
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Reading progress bar */}
			<motion.div
				className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-violet-400 to-blue-500 z-50 origin-left"
				style={{ scaleX }}
			/>

			<div className="max-w-3xl mx-auto px-6 py-32">
				{/* ── Back link ── */}
				<motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
					<Link
						href="/blogs"
						className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						All articles
					</Link>
				</motion.div>

				<article>
					{/* ── Article header ── */}
					<header className="mb-10">
						{/* Tags */}
						{blog.tags?.length > 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex flex-wrap gap-2 mb-5"
							>
								{blog.tags.map((tag) => (
									<span
										key={tag}
										className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-full border border-primary/20"
									>
										{tag}
									</span>
								))}
							</motion.div>
						)}

						{/* Title */}
						<motion.h1
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.05 }}
							className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
						>
							{blog.title}
						</motion.h1>

						{/* Description */}
						{blog.description && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
								className="text-lg text-muted-foreground leading-relaxed mb-6"
							>
								{blog.description}
							</motion.p>
						)}

						{/* Meta row */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.15 }}
							className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-8 border-b border-border"
						>
							{/* Author */}
							<div className="flex items-center gap-2">
								{blog.author?.avatar ? (
									<div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-border">
										<Image
											src={blog.author.avatar}
											alt={blog.author.name}
											fill
											className="object-cover"
										/>
									</div>
								) : (
									<div className="w-9 h-9 rounded-full bg-accent border border-border flex items-center justify-center">
										<User className="w-4 h-4 text-muted-foreground" />
									</div>
								)}
								<span className="text-sm font-bold text-foreground">{blog.author?.name ?? 'AntiRaid Team'}</span>
							</div>

							<span className="text-border select-none">·</span>

							<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<Calendar className="w-3.5 h-3.5" />
								{format(new Date(blog.publishedAt), 'MMMM d, yyyy')}
							</span>

							<span className="text-border select-none">·</span>

							<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<Clock className="w-3.5 h-3.5" />
								{calculateReadingTime(blog.content)}
							</span>

							{/* Share */}
							<button
								onClick={shareArticle}
								className="ml-auto relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent border border-border text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
								aria-label="Share article"
							>
								{copied ? (
									<>
										<Check className="w-4 h-4 text-emerald-400" />
										<span className="text-emerald-400">Copied!</span>
									</>
								) : (
									<>
										<Share2 className="w-4 h-4" />
										Share
									</>
								)}
							</button>
						</motion.div>
					</header>

					{/* ── Cover image ── */}
					{blog.slug && (
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="relative aspect-video rounded-2xl overflow-hidden mb-12 bg-muted border border-border"
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

					{/* ── Article body ── */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.25 }}
						className="prose prose-neutral dark:prose-invert max-w-none
							prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-headings:scroll-mt-20
							prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
							prose-p:text-foreground/85 prose-p:leading-[1.85]
							prose-strong:text-foreground prose-strong:font-bold
							prose-ul:text-foreground/85 prose-ol:text-foreground/85 prose-li:text-foreground/85 prose-li:leading-[1.8]
							prose-hr:border-border
							[&_pre]:!p-0 [&_pre]:!bg-transparent [&_pre]:!my-0 [&_pre]:!rounded-none [&_pre]:!border-0
							[&_a]:!text-primary [&_a]:!font-medium [&_a]:!no-underline"
					>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeRaw]}
							components={{
								// Suppress the <pre> wrapper — SyntaxHighlighter provides its own
								pre({ children }) {
									return <>{children}</>;
								},

								// Block code: className="language-*" | Inline code: no className
								code({ className, children }: any) {
									const match = /language-(\w+)/.exec(className || '');
									if (match) {
										return (
											<SyntaxHighlighter
												style={atomOneDark}
												language={match[1]}
												PreTag="div"
												className="!rounded-2xl !text-sm !my-6 !bg-[#12121a] !border !border-border !p-5"
											>
												{String(children).replace(/\n$/, '')}
											</SyntaxHighlighter>
										);
									}
									return (
										<code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded-md text-[0.85em] font-semibold font-mono before:content-none after:content-none">
											{children}
										</code>
									);
								},

								// External links open in new tab
								a({ href, children }: any) {
									const external = href?.startsWith('http');
									return (
										<a
											href={href}
											target={external ? '_blank' : undefined}
											rel={external ? 'noopener noreferrer' : undefined}
											className="text-primary font-medium underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors"
										>
											{children}
										</a>
									);
								},

								// Images — full width with border
								img({ src, alt }: any) {
									if (!src) return null;
									return (
										<span className="block my-8">
											<img
												src={src}
												alt={alt ?? ''}
												className="w-full rounded-2xl border border-border"
											/>
											{alt && (
												<span className="block text-center text-xs text-muted-foreground mt-2">
													{alt}
												</span>
											)}
										</span>
									);
								},

								// Blockquote
								blockquote({ children }: any) {
									return (
										<blockquote className="my-6 pl-5 border-l-[3px] border-primary/50 bg-primary/5 rounded-r-xl pr-5 py-4 text-muted-foreground not-italic">
											{children}
										</blockquote>
									);
								},

								// GFM tables
								table({ children }: any) {
									return (
										<div className="overflow-x-auto my-8 rounded-2xl border border-border">
											<table className="w-full text-sm border-collapse">{children}</table>
										</div>
									);
								},
								thead({ children }: any) {
									return <thead className="bg-accent/50 border-b border-border">{children}</thead>;
								},
								th({ children }: any) {
									return (
										<th className="px-4 py-3 text-left font-bold text-foreground text-xs uppercase tracking-wider">
											{children}
										</th>
									);
								},
								td({ children }: any) {
									return (
										<td className="px-4 py-3 text-foreground/85 border-t border-border">
											{children}
										</td>
									);
								},

								// Horizontal rule
								hr() {
									return <hr className="my-10 border-border" />;
								}
							}}
						>
							{blog.content}
						</ReactMarkdown>
					</motion.div>

					{/* ── Author card ── */}
					<footer className="mt-16 pt-8 border-t border-border">
						<div className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border">
							{blog.author?.avatar ? (
								<div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-border flex-shrink-0">
									<Image
										src={blog.author.avatar}
										alt={blog.author.name}
										fill
										className="object-cover"
									/>
								</div>
							) : (
								<div className="w-16 h-16 rounded-2xl bg-accent border border-border flex items-center justify-center flex-shrink-0">
									<User className="w-7 h-7 text-muted-foreground" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								<p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Written by</p>
								<p className="text-lg font-bold text-foreground mb-1">
									{blog.author?.name ?? 'AntiRaid Team'}
								</p>
								{blog.author?.bio && (
									<p className="text-sm text-muted-foreground leading-relaxed mb-3">
										{blog.author.bio}
									</p>
								)}
								{blog.author?.socials?.length > 0 && (
									<div className="flex gap-2">
										{blog.author.socials.map((social: any, i: number) => (
											<a
												key={i}
												href={social.url}
												target="_blank"
												rel="noopener noreferrer"
												className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
												aria-label={social.platform}
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

				{/* ── Related posts ── */}
				{relatedBlogs.length > 0 && (
					<section className="mt-20 pt-12 border-t border-border">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-foreground">Related articles</h2>
							<Link
								href="/blogs"
								className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
							>
								All articles →
							</Link>
						</div>
						<div className="space-y-3">
							{relatedBlogs.map((b) => (
								<RelatedCard key={b.slug} blog={b} />
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
};

export default BlogSlugLayout;
