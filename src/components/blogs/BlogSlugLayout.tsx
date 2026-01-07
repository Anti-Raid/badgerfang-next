'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Tag, User, ArrowLeft, Share2, BookOpen, Clock, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import type { Blog } from '@/types/blogs/index';
import { FaTwitter, FaFacebook, FaLinkedin, FaInstagram, FaLink, FaDiscord } from 'react-icons/fa';
import { fetchStrapiBlogs, fetchStrapiBlogBySlug } from '@/lib/api';

interface BlogSlugLayoutProps {
	slug: string;
}

const BlogSlugLayout: React.FC<BlogSlugLayoutProps> = ({ slug }) => {
	const router = useRouter();
	const [blog, setBlog] = useState<Blog | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
	const [copied, setCopied] = useState(false);
	const articleRef = useRef<HTMLElement>(null);

		// Track global scroll progress for the reading bar
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
					
					// Fetch all blogs to find related ones (we need tags)
					const allBlogsResponse = await fetchStrapiBlogs();
					const allBlogs = allBlogsResponse.data;
					
					if (mainBlog.tags && mainBlog.tags.length > 0) {
						const related = allBlogs
							.filter((b: Blog) => 
								b.slug !== slug && 
								b.tags?.some(tag => mainBlog.tags?.includes(tag))
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
			navigator.share({
				title: blog?.title || 'AntiRaid Blog',
				text: blog?.description || '',
				url: window.location.href
			}).catch(error => console.log('Error sharing', error));
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
			case 'twitter': return <FaTwitter size={18} />;
			case 'facebook': return <FaFacebook size={18} />;
			case 'linkedin': return <FaLinkedin size={18} />;
			case 'instagram': return <FaInstagram size={18} />;
			case 'discord': return <FaDiscord size={18} />;
			default: return <FaLink size={18} />;
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
						{[1, 2, 3, 4, 5, 6].map(i => (
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
					<p className="text-muted-foreground mb-8">The article you're seeking has vanished into the void.</p>
					<Link href="/blogs" className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
						<ArrowLeft size={18} className="mr-2" />
						Return to Blog
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background selection:bg-primary/30">
			{/* Reading Progress Bar */}
			<motion.div 
				className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-accent z-50 origin-left"
				style={{ scaleX }}
			/>

			{/* Sticky Header Actions for Mobile */}
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
				{/* Back Button */}
				<motion.div 
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="w-full max-w-4xl mb-12"
				>
					<Link
						href="/blogs"
						className="inline-flex items-center text-muted-foreground hover:text-primary transition-all group font-medium"
					>
						<div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors mr-2">
							<ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
						</div>
						Return to Library
					</Link>
				</motion.div>

				<article ref={articleRef} className="w-full max-w-4xl relative">
					{/* Article Header */}
					<header className="mb-12 text-center md:text-left">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="flex flex-wrap justify-center md:justify-start gap-3 mb-8"
						>
							{blog.tags?.map(tag => (
								<span key={tag} className="px-4 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/25 border border-white/10">
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
										<Image 
											src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
											alt={blog.author.name}
											fill
											className="object-cover"
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

					{/* Feature Image */}
					{blog.slug ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7 }}
							className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-primary/10 border border-white/5"
						>
							<Image
								src={`/api/get/og-image?slug=${blog.slug}`}
								alt={blog.title}
								fill
								className="object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
						</motion.div>
					) : (
						<div className="w-full aspect-[21/9] rounded-[2rem] bg-secondary/30 mb-16 flex items-center justify-center border border-dashed border-primary/20">
							<BookOpen size={64} className="text-primary/20" />
						</div>
					)}

					{/* Content */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.7, delay: 0.4 }}
						className="prose prose-invert prose-lg max-w-none md:prose-xl font-inter leading-[1.8] text-foreground/90 prose-headings:font-monster prose-headings:tracking-tight prose-headings:font-bold prose-headings:text-foreground prose-strong:text-foreground prose-strong:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline decoration-primary/30 underline-offset-4 prose-img:rounded-[2.5rem] prose-hr:border-border/50"
					>
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							rehypePlugins={[rehypeRaw]}
							components={{
								h1: ({ children }) => (
									<h1 className="text-4xl md:text-5xl font-bold font-monster mb-8 mt-12 text-foreground">
										<span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
											{children}
										</span>
									</h1>
								),
								h2: ({ children }) => (
									<h2 className="text-3xl md:text-4xl font-bold font-monster mb-6 mt-10 flex items-center gap-3">
										<span className="w-1.5 h-8 bg-primary rounded-full" />
										{children}
									</h2>
								),
								h3: ({ children }) => (
									<h3 className="text-2xl md:text-3xl font-bold font-monster mb-4 mt-8 text-foreground/90">
										{children}
									</h3>
								),
								p: ({ children }) => (
									<p className="mb-6 last:mb-0 text-foreground/80 leading-[1.8] font-inter">
										{children}
									</p>
								),
								ul: ({ children }) => (
									<ul className="space-y-3 mb-8 ml-6 list-none">
										{children}
									</ul>
								),
								ol: ({ children }) => (
									<ol className="space-y-3 mb-8 ml-6 list-decimal marker:text-primary marker:font-bold">
										{children}
									</ol>
								),
								li: ({ children }) => (
									<li className="relative group">
										<span className="absolute -left-6 top-3 w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
										{children}
									</li>
								),
								code({ node, inline, className, children, ...props }: any) {
									const match = /language-(\w+)/.exec(className || '');
									return !inline && match ? (
										<SyntaxHighlighter
											style={atomOneDark}
											language={match[1]}
											PreTag="div"
											className="rounded-3xl border border-border/50 !bg-secondary/30 my-10 shadow-2xl"
											{...props}
										>
											{String(children).replace(/\n$/, '')}
										</SyntaxHighlighter>
									) : (
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

					{/* Author Bio Widget */}
					<footer className="mt-24 pt-16 border-t border-border/50">
						<div className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-secondary/40 to-transparent border border-border/50 backdrop-blur-sm relative overflow-hidden group">
							<div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-700" />
							
							<div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
								{blog.author.avatar && (
									<div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-border/50 shadow-xl shrink-0">
										<Image 
											src={`https://strapi.purrquinox.com${blog.author.avatar.url}`}
											alt={blog.author.name}
											fill
											className="object-cover"
										/>
									</div>
								)}
								<div className="text-center md:text-left space-y-4">
									<div>
										<h4 className="text-2xl font-bold font-monster mb-1">{blog.author.name}</h4>
										<p className="text-primary font-bold text-xs uppercase tracking-widest">Expert Contributor / AntiRaid Team</p>
									</div>
									<p className="text-muted-foreground leading-relaxed max-w-2xl">{blog.author.bio}</p>
									
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

				{/* Related Posts Section */}
				{relatedBlogs.length > 0 && (
					<div className="w-full max-w-7xl mt-32">
						<div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
							<div className="text-center md:text-left">
								<h2 className="text-3xl font-bold font-monster mb-2">Continue Reading</h2>
								<p className="text-muted-foreground">More insights hand-picked for you</p>
							</div>
							<Link href="/blogs" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 text-sm font-bold transition-all">
								View All Articles
							</Link>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{relatedBlogs.map((relatedBlog, index) => (
								<motion.div
									key={relatedBlog.slug}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
								>
									<Link href={`/blogs/${relatedBlog.slug}`} className="group block h-full">
										<div className="relative aspect-video rounded-3xl overflow-hidden mb-6 border border-white/5 group-hover:border-primary/50 transition-all duration-500">
											<Image
												src={`/api/get/og-image?slug=${relatedBlog.slug}`}
												alt={relatedBlog.title}
												fill
												className="object-cover transition-transform duration-700 group-hover:scale-110"
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
