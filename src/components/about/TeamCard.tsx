import { motion } from 'framer-motion';
import useSWR from 'swr';
import Image from 'next/image';

export const TeamMembers = ({ isLoaded }: { isLoaded: boolean }) => {
	const userIds = [
		'728871946456137770',
		'510065483693817867',
		'775855009421066262',
		'202560656883449856',
		'564164277251080208',
		'1196897908579123273'
	];

	const fetcher = async (userIds: string[]) => {
		const data = await Promise.all(
			userIds.map(async (id) => {
				const response = await fetch(`https://japi.rest/discord/v1/user/${id}`);
				const json = await response.json();
				return json.data;
			})
		);
		return data;
	};

	const { data: usersData, error, isLoading } = useSWR(userIds, fetcher);

	if (isLoading)
		return (
			<div className="text-center py-12">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
				<p className="mt-4 text-foreground/70">Loading team members...</p>
			</div>
		);

	if (error)
		return (
			<div className="text-center py-12 text-destructive">
				<p>Error loading team members</p>
			</div>
		);

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
			{usersData?.map((user, index) => (
				<motion.div
					key={index}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
					transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
					className="bg-background/30 backdrop-blur-sm border border-primary/10 rounded-xl p-4 hover:border-primary/30 transition-all hover:shadow-[0_5px_15px_rgba(var(--primary)/10%)] group"
				>
					<div className="flex flex-col items-center text-center">
						<div className="relative mb-3 w-20 h-20">
							<div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-extra opacity-0 group-hover:opacity-100 blur-md transition-opacity"></div>
							<Image
								className="relative rounded-full object-cover border-2 border-primary/30 group-hover:border-primary/70 transition-all"
								src={user.avatarURL || '/logo.webp'}
								alt={`${user.global_name || user.username}'s Avatar`}
								width={80}
								height={80}
							/>
						</div>
						<h3 className="text-lg font-monster font-semibold leading-tight">
							{user.global_name || user.username}
						</h3>
						<p className="text-sm text-foreground/60 mt-1">@{user.username}</p>
					</div>
				</motion.div>
			))}
		</div>
	);
};
