'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
	FaScroll,
	FaInfoCircle,
	FaFileContract,
	FaExclamationTriangle,
	FaLink,
	FaHistory,
	FaGavel
} from 'react-icons/fa';
import { MdGavel, MdSecurity } from 'react-icons/md';
import TableOfContents from '@/components/legal/TableOfContents';

/**
 * Renders the Terms of Service page with interactive navigation and section highlighting.
 *
 * Displays a list of terms sections, a table of contents for quick navigation, and updates the active section based on scroll position. Each section includes legal content and relevant icons.
 */
export default function TermsOfService() {
	const [activeSection, setActiveSection] = useState('');

	const sections = [
		{ id: 'introduction', title: 'Introduction', icon: <FaInfoCircle /> },
		{ id: 'use-license', title: 'Use License', icon: <FaFileContract /> },
		{ id: 'disclaimer', title: 'Disclaimer', icon: <FaExclamationTriangle /> },
		{ id: 'limitations', title: 'Limitations', icon: <MdGavel /> },
		{ id: 'revisions', title: 'Revisions and Errata', icon: <FaHistory /> },
		{ id: 'links', title: 'Links', icon: <FaLink /> },
		{ id: 'modifications', title: 'Site Terms Modifications', icon: <FaHistory /> },
		{ id: 'privacy', title: 'Your Privacy', icon: <MdSecurity /> },
		{ id: 'governing-law', title: 'Governing Law', icon: <FaGavel /> }
	];

	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + 100;

			for (let i = sections.length - 1; i >= 0; i--) {
				const section = document.getElementById(sections[i].id);
				if (section && section.offsetTop <= scrollPosition) {
					setActiveSection(sections[i].id);
					break;
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	}, [sections]);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			window.scrollTo({
				top: element.offsetTop - 80,
				behavior: 'smooth'
			});
			setActiveSection(id);
		}
	};

	const lastUpdated = 'March 24, 2025';

	return (
		<div className="bg-background text-foreground">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold flex items-center text-primary">
					<FaScroll className="mr-3" />
					Terms of Service
				</h1>
				<div className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</div>
			</div>

			{/* Table of Contents */}
			<TableOfContents
				sections={sections}
				activeSection={activeSection}
				scrollToSection={scrollToSection}
			/>

			{/* Content */}
			<div className="space-y-8 prose prose-sm max-w-none">
				<section id="introduction" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaInfoCircle className="mr-2 text-primary" /> Introduction
					</h2>
					<p>
						By accessing this website, accessible from{' '}
						<a href="https://antiraid.xyz/" className="text-primary hover:underline">
							https://antiraid.xyz/
						</a>
						, you are agreeing to be bound by these website Terms and Conditions of Use and agree
						that you are responsible for the agreement with any applicable local laws.
					</p>
					<p>
						If you disagree with any of these terms, you are prohibited from accessing this site.
						The materials contained in this website are protected by copyright and trademark law.
					</p>
				</section>

				<section id="use-license" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaFileContract className="mr-2 text-primary" /> Use License
					</h2>
					<p>
						Permission is granted to temporarily download one copy of the materials on AntiRaid's
						website for personal, non-commercial transitory viewing only.
					</p>
					<p>
						This is the grant of a license, not a transfer of title, and under this license you may
						not:
					</p>
					<ul className="list-disc pl-6 space-y-2">
						<li>modify or copy the materials;</li>
						<li>use the materials for any commercial purpose or for any public display;</li>
						<li>attempt to reverse engineer any software contained on AntiRaid's website;</li>
						<li>remove any copyright or other proprietary notations from the materials;</li>
						<li>
							or transferring the materials to another person or "mirror" the materials on any other
							server.
						</li>
					</ul>
					<p>
						This will let AntiRaid to terminate upon violations of any of these restrictions. Upon
						termination, your viewing right will also be terminated and you should destroy any
						downloaded materials in your possession whether it is printed or electronic format.
					</p>
				</section>

				<section id="disclaimer" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaExclamationTriangle className="mr-2 text-primary" /> Disclaimer
					</h2>
					<p>
						All the materials on AntiRaid's website are provided "as is". AntiRaid makes no
						warranties, may it be expressed or implied, therefore negates all other warranties.
					</p>
					<p>
						Furthermore, AntiRaid does not make any representations concerning the accuracy or
						reliability of the use of the materials on its website or otherwise relating to such
						materials or any sites linked to this website.
					</p>
				</section>

				<section id="limitations" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<MdGavel className="mr-2 text-primary" /> Limitations
					</h2>
					<p>
						AntiRaid or its suppliers will not be held accountable for any damages that will arise
						with the use or inability to use the materials on AntiRaid's website, even if AntiRaid
						or an authorized representative of this website has been notified, orally or written, of
						the possibility of such damage.
					</p>
					<p>
						Some jurisdiction does not allow limitations on implied warranties or limitations of
						liability for incidental damages, these limitations may not apply to you.
					</p>
				</section>

				<section id="revisions" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaHistory className="mr-2 text-primary" /> Revisions and Errata
					</h2>
					<p>
						The materials appearing on AntiRaid's website may include technical, typographical, or
						photographic errors.
					</p>
					<p>
						AntiRaid will not promise that any of the materials in this website are accurate,
						complete, or current. AntiRaid may change the materials contained on its website at any
						time without notice. AntiRaid does not make any commitment to update the materials.
					</p>
				</section>

				<section id="links" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaLink className="mr-2 text-primary" /> Links
					</h2>
					<p>
						AntiRaid has not reviewed all of the sites linked to its website and is not responsible
						for the contents of any such linked site.
					</p>
					<p>
						The presence of any link does not imply endorsement by AntiRaid of the site. The use of
						any linked website is at the user's own risk.
					</p>
				</section>

				<section id="modifications" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaHistory className="mr-2 text-primary" /> Site Terms of Use Modifications
					</h2>
					<p>
						AntiRaid may revise these Terms of Use for its website at any time without prior notice.
					</p>
					<p>
						By using this website, you are agreeing to be bound by the current version of these
						Terms and Conditions of Use.
					</p>
				</section>

				<section id="privacy" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<MdSecurity className="mr-2 text-primary" /> Your Privacy
					</h2>
					<p>
						Please read our{' '}
						<Link href="/legal/privacy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						.
					</p>
				</section>

				<section id="governing-law" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaGavel className="mr-2 text-primary" /> Governing Law
					</h2>
					<p>
						Any claim related to AntiRaid's website shall be governed by the laws of us without
						regards to its conflict of law provisions.
					</p>
				</section>
			</div>
		</div>
	);
}