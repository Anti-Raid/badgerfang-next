'use client';
import React from 'react';

interface BreadcrumbProps {
	Title: string;
	Description: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ Title, Description }) => {
	const ImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		e.currentTarget.src = '/logo.webp';
	};

	return (
		<div>
			<div className="flex">
				<img
					className="h-10 rounded-full"
					src="/logo.webp"
					alt="AntiRaid Logo"
					height="40px"
					width="40px"
					onError={ImageLoadError}
				/>

				<h2 className="ml-2 text-white font-monster tracking-tight font-bold text-4xl">{Title}</h2>
			</div>

			<h6
				className="mt-2 ml-2 text-white/75 font-bold text-left leading-6 font-cabin text-base md:text-xl lg:text-2xl"
				dangerouslySetInnerHTML={{ __html: Description }} // Safely insert HTML
			/>
		</div>
	);
};

export default Breadcrumb;
