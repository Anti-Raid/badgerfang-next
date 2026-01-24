'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useScroll, useSpring } from '@/components/ui/motion';
import {
	Calendar,
	Tag,
	User,
	ArrowLeft,
	Share2,
	BookOpen,
	Clock,
	Heart,
	MessageCircle,
	Quote,
	Terminal
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFootnotes from 'remark-footnotes';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'katex/dist/katex.min.css';

import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('js', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('ts', ts);
SyntaxHighlighter.registerLanguage('tsx', ts);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('shell', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('md', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('yml', yaml);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('py', python);

import ReactMarkdown from 'react-markdown';
import type { Blog } from '@/types/blogs/index';
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaLink, FaDiscord } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { strapiBlogsOptions } from '@/lib/api';

interface BlogSlugLayoutProps {
	slug: string;
	initialPost?: Blog | null;
}

const BlogSlugLayout: React.FC<BlogSlugLayoutProps> = ({ slug, initialPost }) => {
	const [copied, setCopied] = useState(false);
	const articleRef = useRef<HTMLElement>(null);

	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30
	});

	const blog = initialPost || null;

	const { data: allBlogsResponse, isLoading } = useQuery({
		...strapiBlogsOptions,
		enabled: !!initialPost && !!initialPost.tags && initialPost.tags.length > 0
	});

	const relatedBlogs = useMemo(() => {
		if (!initialPost?.tags || !allBlogsResponse?.data) return [];
		const allBlogs = allBlogsResponse.data;
		return allBlogs
			.filter(
				(b: Blog) => b.slug !== slug && b.tags?.some((tag) => initialPost.tags?.includes(tag))
			)
			.slice(0, 3);
	}, [initialPost, allBlogsResponse, slug]);

	const calculateReadingTime = (content: string): string => {
		if (!content) return '1 min read';
		const wordsPerMinute = 200;
		const wordCount = content.split(/\s+/).length;
		const minutes = Math.ceil(wordCount / wordsPerMinute);
		return `${minutes} min read`;
	};

	const slugify = (text: string) =>
		text
			.toString()
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');

	const extractHeadings = (markdown: string) => {
		const matches = Array.from(markdown.matchAll(/^#{1,6}\s+(.*)$/gm));
		return matches.map((m) => {
			const level = m[0].indexOf(' ') > -1 ? m[0].split(' ')[0].length : 1;
			const text = m[1].replace(/`/g, '').trim();
			return { level, text, id: slugify(text) };
		});
	};

	const [headings, setHeadings] = useState<{ level: number; text: string; id: string }[]>([]);

	useEffect(() => {
		if (blog?.content) {
			setHeadings(extractHeadings(blog.content));
		}
	}, [blog?.content]);

	const MermaidRenderer: React.FC<{ code: string }> = ({ code }) => {
		const containerRef = useRef<HTMLDivElement | null>(null);
		useEffect(() => {
			let mounted = true;
			import('mermaid')
				.then((mermaid) => {
					if (!mounted) return;
					try {
						mermaid.default.initialize({ startOnLoad: false, theme: 'dark' });
						const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
						const renderResult = mermaid.default.render(id, code);
						if (typeof renderResult === 'string') {
							if (containerRef.current) containerRef.current.innerHTML = renderResult;
						} else if ((renderResult as any)?.then) {
							(renderResult as any).then((svg: string) => {
								if (containerRef.current) containerRef.current.innerHTML = svg;
							});
						}
					} catch (e) {
						console.error('Mermaid render error', e);
					}
				})
				.catch((err) => console.error('Failed to load mermaid', err));
			return () => {
				mounted = false;
			};
		}, [code]);

		return <div ref={containerRef} className="my-8" />;
	};

	const CodeBlock: React.FC<{ lang: string; code: string }> = ({ lang, code }) => {
		const [copiedCode, setCopiedCode] = useState(false);
		return (
			<div className="relative my-10">
				<div className="flex items-center justify-between px-6 py-3 bg-secondary/50 border-x border-t border-border/50 rounded-t-[2rem]">
					<div className="flex items-center gap-2">
						<Terminal size={14} className="text-primary" />
						<span className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-widest">
							{lang}
						</span>
					</div>
					<button
						className="bg-white/5 text-muted-foreground px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-primary/10 hover:text-primary transition-all uppercase tracking-widest border border-white/5"
						onClick={() => {
							navigator.clipboard.writeText(code).then(() => {
								setCopiedCode(true);
								setTimeout(() => setCopiedCode(false), 1500);
							});
						}}
					>
						{copiedCode ? 'Copied' : 'Copy Code'}
					</button>
				</div>
				<SyntaxHighlighter
					style={atomOneDark}
					language={lang}
					PreTag="div"
					showLineNumbers={true}
					className="!mt-0 rounded-b-[2rem] border-x border-b border-border/50 !bg-secondary/30 shadow-2xl"
				>
					{code}
				</SyntaxHighlighter>
			</div>
		);
	};

	const shareArticle = () => {
		if (navigator.share) {
			navigator
				.share({
					title: blog?.title || 'AntiRaid Blog',
					text: blog?.description || '',
					url: window.location.href
				})
				.catch((error) => {
					if (error?.name !== 'AbortError') {
						console.error('Error sharing article:', error);
					}
				});
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
				return <FaTwitter size={18} />;
			case 'facebook':
				return <FaFacebook size={18} />;
			case 'linkedin':
				return <FaLinkedin size={18} />;
			case 'instagram':
				return <FaInstagram size={18} />;
			case 'discord':
				return <FaDiscord size={18} />;
			default:
				return <FaLink size={18} />;
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background pt-20">
				<div className="max-w-4xl mx-auto px-4 py-12">
					<div className="h-4 w-24 bg-card rounded-full animate-pulse mb-8" />
					<div className="h-12 w-3/4 bg-card rounded-2xl animate-pulse mb-6" />
					<div className="h-6 w-1/2 bg-card rounded-full animate-pulse mb-12" />
					<div className="h-[400px] w-full bg-card rounded-3xl animate-pulse mb-12" />
					<div className="space-y-4">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="h-4 w-full bg-card rounded-full animate-pulse" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!blog) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="inline-block p-6 bg-accent/10 rounded-full mb-6">
						<BookOpen size={48} className="text-accent" />
					</div>
					<h1 className="text-4xl font-bold font-monster mb-4">Post Not Found</h1>
					<p className="text-muted-foreground mb-8">
						The article you're seeking has vanished into the void.
					</p>
					<Link
						to="/blogs"
						className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
					>
						<ArrowLeft size={18} className="mr-2" />
						Return to Blog
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background selection:bg-primary/30">
			<motion.div
				className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-accent z-50 origin-left"
				style={{ transform: `scaleX(${scaleX})` }}
			/>

			<div className="fixed bottom-6 right-6 z-40 md:hidden flex flex-col gap-3">
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={shareArticle}
					className="p-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 border border-white/10"
				>
					<Share2 size={24} />
				</motion.button>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20 flex flex-col items-center">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="w-full max-w-4xl mb-12"
				>
					<Link
						to="/blogs"
						className="inline-flex items-center text-muted-foreground hover:text-primary transition-all group font-medium"
					>
						<div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors mr-2">
							<ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
						</div>
						Return to Library
					</Link>
				</motion.div>

				<article ref={articleRef} className="w-full max-w-4xl relative">
					<header className="mb-12 text-center md:text-left">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="flex flex-wrap justify-center md:justify-start gap-3 mb-8"
						>
							{blog.badges?.map((badge) => (
								<span
									key={badge}
									className="px-4 py-1.5 bg-gradient-to-r from-accent to-purple-500 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent/25 border border-white/10"
								>
									{badge}
								</span>
							))}
							{blog.tags?.map((tag) => (
								<span
									key={tag}
									className="px-4 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/25 border border-white/10"
								>
									{tag}
								</span>
							))}
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="text-4xl md:text-6xl font-bold font-monster tracking-tight mb-8 leading-[1.1]"
						>
							<span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
								{blog.title}
							</span>
						</motion.h1>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground pb-12 border-b border-white/5"
						>
							<div className="flex items-center">
								{blog.author.avatar && (
									<div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 mr-3">
										<img
											src={blog.author.avatar}
											alt={blog.author.name}
											className="object-cover w-full h-full"
											loading="lazy"
										/>
									</div>
								)}

								<div>
									<p className="text-foreground font-bold leading-none mb-1">{blog.author.name}</p>
									<div className="flex items-center text-xs space-x-2">
										<div className="flex items-center">
											<Calendar size={12} className="mr-1" />
											{format(new Date(blog.publishedAt), 'MMM d, yyyy')}
										</div>
										<span>•</span>
										<div className="flex items-center">
											<Clock size={12} className="mr-1" />
											{calculateReadingTime(blog.content)}
										</div>
									</div>
								</div>
							</div>

							<div className="flex items-center gap-2 ml-auto">
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									onClick={shareArticle}
									className="p-3 bg-white/5 hover:bg-primary/20 rounded-full border border-white/5 transition-all relative group"
								>
									<Share2 size={18} className="group-hover:text-primary" />
									{copied && (
										<span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-white text-[10px] rounded animate-bounce">
											Copied!
										</span>
									)}
								</motion.button>
							</div>
						</motion.div>
					</header>

					{blog.image || blog.slug ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7 }}
							className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-primary/10 border border-white/5"
						>
							<img
								src={blog.image || `/api/get/og-image?slug=${blog.slug}`}
								alt={blog.title}
								className="object-cover w-full h-full"
								fetchPriority="high"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
						</motion.div>
					) : (
						<div className="w-full aspect-[21/9] rounded-[2rem] bg-secondary/30 mb-16 flex items-center justify-center border border-dashed border-primary/20">
							<BookOpen size={64} className="text-primary/20" />
						</div>
					)}

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.7, delay: 0.4 }}
						className="prose prose-invert prose-lg max-w-none md:prose-xl font-inter leading-[1.8] text-foreground/90 prose-headings:font-monster prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-foreground prose-strong:text-foreground prose-strong:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline decoration-primary/30 underline-offset-4 prose-img:rounded-[2.5rem] prose-hr:border-border/50"
					>
						<ReactMarkdown
							remarkPlugins={[remarkGfm, remarkMath, remarkFootnotes, remarkEmoji]}
							rehypePlugins={[
								rehypeRaw,
								rehypeKatex,
								rehypeSlug,
								[rehypeAutolinkHeadings, { behavior: 'wrap' }]
							]}
							components={{
								h1: ({ children }) => (
									<h1 className="text-4xl md:text-5xl font-bold font-monster mb-8 mt-12 text-foreground" id={slugify(String(children))}>
										<span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
											{children}
										</span>
									</h1>
								),
								h2: ({ children }) => (
									<h2 className="text-3xl md:text-4xl font-bold font-monster mb-6 mt-10 flex items-center gap-3" id={slugify(String(children))}>
										<span className="w-1.5 h-8 bg-primary rounded-full" />
										{children}
									</h2>
								),
								h3: ({ children }) => (
									<h3 className="text-2xl md:text-3xl font-bold font-monster mb-4 mt-8 text-foreground/90" id={slugify(String(children))}>
										{children}
									</h3>
								),
								h4: ({ children }) => (
									<h4 className="text-xl md:text-2xl font-bold mb-3 mt-6" id={slugify(String(children))}>
										{children}
									</h4>
								),
								h5: ({ children }) => (
									<h5 className="text-lg font-semibold mb-2 mt-4" id={slugify(String(children))}>
										{children}
									</h5>
								),
								h6: ({ children }) => (
									<h6 className="text-sm font-semibold mb-2 mt-3 text-muted-foreground" id={slugify(String(children))}>
										{children}
									</h6>
								),
								p: ({ children }) => (
									<p className="mb-8 last:mb-0 text-foreground/80 leading-[2] font-inter">
										{children}
									</p>
								),
								blockquote: ({ children }) => (
									<blockquote className="relative border-l-4 border-primary bg-primary/5 px-8 py-6 my-10 rounded-r-[2rem] italic shadow-2xl shadow-primary/5 group transition-all hover:bg-primary/10">
										<Quote className="absolute -top-3 -left-3 text-primary/20 w-8 h-8 -rotate-12 group-hover:text-primary/40 transition-transform group-hover:scale-110" />
										<div className="text-foreground/90 font-medium leading-relaxed">
											{children}
										</div>
									</blockquote>
								),
								hr: () => (
									<hr className="my-16 border-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
								),
								ul: ({ children }) => <ul className="space-y-3 mb-8 ml-6 list-none">{children}</ul>,
								ol: ({ children }) => (
									<ol className="space-y-3 mb-8 ml-6 list-decimal marker:text-primary marker:font-bold">
										{children}
									</ol>
								),
								li: ({ children, ordered }: any) => (
									<li className="relative group mb-3 last:mb-0 flex items-start gap-3">
										{!ordered && (
											<span className="mt-3 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all duration-300 shrink-0 shadow-lg shadow-primary/20" />
										)}
										<div className="flex-1 text-foreground/80 group-hover:text-foreground transition-colors">
											{children}
										</div>
									</li>
								),
								table: ({ children }) => (
									<div className="my-12 overflow-x-auto rounded-[2rem] border border-border/50 bg-secondary/20 backdrop-blur-xl shadow-2xl">
										<table className="w-full text-left border-collapse">{children}</table>
									</div>
								),
								thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
								tr: ({ children }) => (
									<tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
										{children}
									</tr>
								),
								th: ({ children }) => (
									<th className="px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] text-primary whitespace-nowrap">
										{children}
									</th>
								),
								td: ({ children }) => (
									<td className="px-8 py-5 text-sm text-foreground/70 leading-relaxed font-inter group-hover:text-foreground transition-colors border-r border-white/5 last:border-r-0">
										{children}
									</td>
								),
								strong: ({ children }) => (
									<strong className="font-bold text-foreground bg-primary/10 px-1 rounded-sm">
										{children}
									</strong>
								),
								em: ({ children }) => (
									<em className="text-primary/90 italic font-medium px-0.5">{children}</em>
								),
								del: ({ children }) => (
									<del className="text-muted-foreground line-through decoration-primary/50 opacity-60">
										{children}
									</del>
								),
								a: ({ href, children, title }) => {
									const url = String(href || '');
									const external = /^(http|https):\/\//.test(url);
									return (
										<a
											href={url}
											{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
											className="text-primary hover:underline"
											title={title}
										>
											{children}
										</a>
									);
								},
								img: ({ src, alt, title }) => {
									const [text, caption] = (alt || '').split('|').map((s) => s.trim());
									return (
										<figure className="my-8">
											<img src={String(src)} alt={text || ''} title={title} className="rounded-2xl" />
											{caption && <figcaption className="text-sm text-muted-foreground mt-2">{caption}</figcaption>}
										</figure>
									);
								},
								code({ node, inline, className, children, ...props }: any) {
									const match = /language-(\w+)/.exec(className || '');
									const codeText = String(children).replace(/\n$/, '');
									if (!inline && match) {
										const lang = match[1];
										if (lang === 'mermaid') return <MermaidRenderer code={codeText} />;
										return <CodeBlock lang={lang} code={codeText} />;
									}
									return (
										<code className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-mono text-sm" {...props}>
											{children}
										</code>
									);
								}
							}}
						>
							{blog.content}
						</ReactMarkdown>
					</motion.div>

					<footer className="mt-24 pt-16 border-t border-border/50">
						<div className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-secondary/40 to-transparent border border-border/50 backdrop-blur-sm relative overflow-hidden group">
							<div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700" />
							<div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
								{blog.author.avatar && (
									<div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-border/50 shadow-xl shrink-0">
										<img
											src={blog.author.avatar}
											alt={blog.author.name}
											className="object-cover w-full h-full"
											loading="lazy"
										/>
									</div>
								)}
								<div className="text-center md:text-left space-y-4">
									<div>
										<h4 className="text-2xl font-bold font-monster mb-1">{blog.author.name}</h4>
										<p className="text-primary font-bold text-xs uppercase tracking-widest">
											Expert Contributor / AntiRaid Team
										</p>
									</div>
									<p className="text-muted-foreground leading-relaxed max-w-2xl">
										{blog.author.bio}
									</p>
									<div className="flex justify-center md:justify-start gap-4">
										{blog.author.socials?.map((social: any, i: number) => (
											<motion.a
												key={i}
												href={social.url}
												target="_blank"
												rel="noopener noreferrer"
												whileHover={{ y: -3, scale: 1.1 }}
												className="p-3 bg-secondary/40 hover:bg-primary/20 rounded-xl transition-all border border-border/50"
											>
												{getSocialIcon(social.platform)}
											</motion.a>
										))}
									</div>
								</div>
							</div>
						</div>
					</footer>
				</article>

				{relatedBlogs.length > 0 && (
					<div className="w-full max-w-7xl mt-32">
						<div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
							<div className="text-center md:text-left">
								<h2 className="text-3xl font-bold font-monster mb-2">Continue Reading</h2>
								<p className="text-muted-foreground">More insights hand-picked for you</p>
							</div>
							<Link
								to="/blogs"
								className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-sm font-bold transition-all"
							>
								View All Articles
							</Link>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{relatedBlogs.map((relatedBlog: Blog, index: number) => (
								<motion.div
									key={relatedBlog.slug}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
								>
									<Link
										to="/blogs/$slug"
										params={{ slug: relatedBlog.slug }}
										className="group block h-full"
									>
										<div className="relative aspect-video rounded-3xl overflow-hidden mb-6 border border-white/5 group-hover:border-primary/50 transition-all duration-500">
											<img
												src={`/api/get/og-image?slug=${relatedBlog.slug}`}
												alt={relatedBlog.title}
												className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
												loading="lazy"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>
										<h3 className="text-xl font-bold font-monster mb-3 line-clamp-2 group-hover:text-primary transition-colors">
											{relatedBlog.title}
										</h3>
										<div className="flex items-center text-xs text-muted-foreground">
											<Calendar size={12} className="mr-2 text-primary" />
											{format(new Date(relatedBlog.publishedAt), 'MMM d, yyyy')}
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BlogSlugLayout;
