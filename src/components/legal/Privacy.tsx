'use client';

import { useState, useEffect } from 'react';
import {
	FaShieldAlt,
	FaInfoCircle,
	FaCookieBite,
	FaUserShield,
	FaChild,
	FaGavel,
	FaHistory
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import Link from 'next/link';
import TableOfContents from '@/components/legal/TableOfContents';
import { Metadata } from 'next';
import { website_url } from '@/components/common';
import { generatePrivacyMetadata } from '@/lib/Metadata';

/**
 * Renders the AntiRaid website's privacy policy page with interactive navigation and structured content sections.
 *
 * Displays a table of contents for quick navigation, highlights the active section based on scroll position, and provides detailed privacy policy information organized into semantic sections.
 */
export default function PrivacyPolicy() {
	const [activeSection, setActiveSection] = useState('');

	const sections = [
		{ id: 'overview', title: 'Overview', icon: <FaInfoCircle /> },
		{ id: 'information-collection', title: 'Information Collection', icon: <FaShieldAlt /> },
		{ id: 'use-of-information', title: 'Use of Information', icon: <MdSecurity /> },
		{ id: 'cookies', title: 'Cookies and Web Beacons', icon: <FaCookieBite /> },
		{ id: 'advertising', title: 'Advertising Partners', icon: <FaInfoCircle /> },
		{ id: 'third-party', title: 'Third Party Policies', icon: <FaInfoCircle /> },
		{ id: 'ccpa', title: 'CCPA Privacy Rights', icon: <FaUserShield /> },
		{ id: 'gdpr', title: 'GDPR Data Protection Rights', icon: <FaUserShield /> },
		{ id: 'children', title: "Children's Information", icon: <FaChild /> },
		{ id: 'governing-law', title: 'Governing Law', icon: <FaGavel /> },
		{ id: 'changes', title: 'Changes to Policy', icon: <FaHistory /> },
		{ id: 'contact', title: 'Contact Us', icon: <FaInfoCircle /> }
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
					<FaShieldAlt className="mr-3" />
					Privacy Policy
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
				<section id="overview" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaInfoCircle className="mr-2 text-primary" /> Overview
					</h2>
					<p>
						By accessing the AntiRaid website at{' '}
						<a href="https://antiraid.xyz/" className="text-primary hover:underline">
							https://antiraid.xyz/
						</a>
						, you are agreeing to abide by the terms outlined in this Privacy Policy. It is your
						responsibility to comply with applicable local laws.
					</p>
					<p>
						If you do not agree with any of these terms, you are prohibited from accessing this
						site. The materials on this website are protected by copyright and trademark law.
					</p>
				</section>

				<section id="information-collection" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaShieldAlt className="mr-2 text-primary" /> Information Collection
					</h2>
					<p>
						When you access AntiRaid website, we may collect personal information, the purposes of
						which will be made clear to you. Additional information may be obtained if you contact
						us directly or register for an Account.
					</p>
				</section>

				<section id="use-of-information" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<MdSecurity className="mr-2 text-primary" /> Use of Information
					</h2>
					<p>
						We use the collected information to operate, improve, and communicate on AntiRaid
						website. This includes updates, marketing, and fraud prevention. Log files containing
						non-personally identifiable information are used for analytics.
					</p>
				</section>

				<section id="cookies" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaCookieBite className="mr-2 text-primary" /> Cookies and Web Beacons
					</h2>
					<p>
						Like any other website, AntiRaid use cookies to enhance user experience. Cookies store
						visitor preferences and optimize content based on browser type. Our Privacy Policy does
						not cover third-party advertisers' cookies. You can manage cookies through your browser
						settings.
					</p>
				</section>

				<section id="advertising" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaInfoCircle className="mr-2 text-primary" /> Advertising Partners Privacy Policies
					</h2>
					<p>
						You may consult the Privacy Policy for each advertising partner of AntiRaid. Third-party
						ad servers or ad networks use technologies like cookies for advertising campaigns. We
						have no control over these cookies. Consult third-party Privacy Policies for details and
						opt-out instructions.
					</p>
				</section>

				<section id="third-party" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaInfoCircle className="mr-2 text-primary" /> Third Party Privacy Policies
					</h2>
					<p>
						AntiRaid's Privacy Policy does not apply to other advertisers or websites. Please refer
						to the respective Privacy Policies of these third-party ad servers for detailed
						information, including practices and opt-out instructions. You can disable cookies
						through your browser options. For more information on cookie management with specific
						web browsers, consult the respective browser websites.
					</p>
				</section>

				<section id="ccpa" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaUserShield className="mr-2 text-primary" /> CCPA Privacy Rights (Do Not Sell My
						Personal Information)
					</h2>
					<p>
						Under the California Consumer Privacy Act (CCPA), California consumers have the right
						to:
					</p>
					<ul className="list-disc pl-6 space-y-2">
						<li>
							Request disclosure of categories and specific pieces of personal data collected.
						</li>
						<li>Request deletion of personal data collected.</li>
						<li>Opt-out of the sale of personal data.</li>
					</ul>
					<p>
						If you wish to exercise any of these rights, please contact us. We will respond within
						one month.
					</p>
				</section>

				<section id="gdpr" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaUserShield className="mr-2 text-primary" /> GDPR Data Protection Rights
					</h2>
					<p>
						We want to ensure you are aware of your data protection rights. Every user is entitled
						to the following under the General Data Protection Regulation (GDPR):
					</p>
					<ul className="list-disc pl-6 space-y-2">
						<li>The right to access - Request copies of your personal data.</li>
						<li>
							The right to rectification - Request correction of inaccurate or incomplete
							information.
						</li>
						<li>
							The right to erasure - Request deletion of your personal data under certain
							conditions.
						</li>
						<li>
							The right to restrict processing - Request restriction of processing under certain
							conditions.
						</li>
						<li>
							The right to object to processing - Object to our processing of your personal data
							under certain conditions.
						</li>
						<li>
							The right to data portability - Request transfer of your data to another organization
							under certain conditions.
						</li>
					</ul>
					<p>
						If you wish to exercise any of these rights, please contact us. We will respond within
						one month.
					</p>
				</section>

				<section id="children" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaChild className="mr-2 text-primary" /> Children's Information
					</h2>
					<p>
						Ensuring the protection of children online is a priority. We encourage parents and
						guardians to monitor and guide their children's online activities. AntiRaid does not
						knowingly collect any Personal Identifiable Information from children under the age of
						13. If you believe your child has provided such information on our website, please
						contact us immediately, and we will make efforts to promptly remove such information
						from our records.
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

				<section id="changes" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaHistory className="mr-2 text-primary" /> Changes to This Privacy Policy
					</h2>
					<p>
						We may update our Privacy Policy. Please review this page periodically for any changes.
						Changes are effective immediately upon posting. If you have questions or suggestions,{' '}
						<Link href="/contact" className="text-primary hover:underline">
							Contact Us
						</Link>
						..
					</p>
				</section>

				<section id="contact" className="scroll-mt-20">
					<h2 className="text-2xl font-bold border-b border-border pb-2 mb-4 flex items-center">
						<FaInfoCircle className="mr-2 text-primary" /> Contact Us
					</h2>
					<p>
						If you have any questions or suggestions about our Privacy Policy, do not hesitate to{' '}
						<Link href="/contact" className="text-primary hover:underline">
							Contact Us
						</Link>
						.
					</p>
				</section>
			</div>
		</div>
	);
}