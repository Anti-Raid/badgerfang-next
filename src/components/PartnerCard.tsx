'use client';
import { Partner } from '../types/Partner';
import { useRouter } from 'next/navigation';

const ImageLoadError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
	e.currentTarget.src = '/logo.webp'; // Fallback image if load error
};

interface PartnerCardProps {
	partner: Partner;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner }) => {
	const router = useRouter();

	const handleViewMoreClick = () => {
		router.push(`/partners/view/${partner.name.replace(/\s+/g, '%20')}`);
	};

	return (
		<div className="block max-w-sm p-4 border rounded-lg shadow bg-background/75 border-background-65 hover:bg-background/85 text-foreground">
			<div className="partner">
				<h2 className="flex">
					<img
						className="h-8 w-8 rounded-full"
						src={partner.logo}
						height="32px"
						width="32px"
						alt={partner.name}
						onError={ImageLoadError}
					/>
					<p className="ml-2 mt-1 mb-1 font-bold font-monster">{partner.name}</p>
				</h2>

				<h2 className="mt-1 text-base font-semibold font-cabin overflow-x-auto">
					{partner.description}
				</h2>

				<a
					className="mt-1 inline-flex items-center bg-primary rounded-full h-[40px] pr-2"
					href={partner.owner_website || '#'}
				>
					<img
						className="h-[40px] rounded-full"
						src={partner.owner_image}
						height="40px"
						width="40px"
						alt={partner.owner}
						onError={ImageLoadError}
					/>
					<p className="ml-2 font-bold text-md font-cabin hover:underline">{partner.owner}</p>
				</a>

				<div className="partner-buttons">
					<div className="view">
						<button
							className="mt-2 w-full rounded-md px-3 py-2 text-sm font-semibold bg-primary text-foreground font-monster shadow-sm"
							onClick={handleViewMoreClick}
						>
							View More...
						</button>
					</div>

					<div className="links">
						{partner.links.map((button, index) => (
							<button
								key={index}
								className="mt-2 first:ml-0 ml-2 rounded-md px-3 py-2 text-sm font-semibold bg-primary text-foreground font-monster shadow-sm"
								onClick={() => (window.location.href = button.link)}
							>
								{button.emoji.startsWith('fa') ? (
									<i className={`${button.emoji} text-foreground`} />
								) : (
									<span>{button.emoji}</span>
								)}
								<span className="ml-1">{button.name}</span>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PartnerCard;
