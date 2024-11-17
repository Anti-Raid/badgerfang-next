'use client';
import Link from 'next/link';
import { Partner } from '../types/other/Partner';
import { useRouter } from 'next/navigation';

import { MdOpenInNew } from 'react-icons/md';

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
		<div className="grow flex w-full p-4 border rounded-lg shadow bg-white bg-opacity-5 backdrop:blur-sm border-secondary-65  text-foreground">
			<div className="partner flex flex-col grow justify-between">
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

				<h2 className="mt-1 text-sm opacity-80 font-normal font-inter overflow-x-auto">
					{partner.description}
				</h2>

				<div className="flex w-full justify-between items-center mt-3">
					<Link
						className="p-2 flex items-center justify-center bg-white bg-opacity-5 rounded-sm "
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
					</Link>

					<div className="partner-buttons">
						<div className="view  flex flex-row gap-2">
							<button
								className=" opacity-60 hover:opacity-100 transition-all"
								onClick={handleViewMoreClick}
							>
								<MdOpenInNew size={25} />
							</button>
							{partner.links.map((button, index) => (
								<button
									key={index}
									className=""
									onClick={() => (window.location.href = button.link)}
								>
									<span className="text-md opacity-60 hover:opacity-100 transition-all">
										{button.icon}
									</span>
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PartnerCard;
