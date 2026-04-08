import useSWR from 'swr';
import Image from 'next/image';
import { FaDiscord } from 'react-icons/fa';

export const TeamMembers = ({ isLoaded }: { isLoaded: boolean }) => {
	const userIds = [
		'728871946456137770',
		'510065483693817867',
		'775855009421066262',
		'202560656883449856',
		'564164277251080208',
		'1196897908579123273'
	];

	const fetcher = async (ids: string[]) => {
		const data = await Promise.all(
			ids.map(async (id) => {
				const res = await fetch(`https://japi.rest/discord/v1/user/${id}`);
				const json = await res.json();
				return json.data;
			})
		);
		return data;
	};

	const { data: usersData, error, isLoading } = useSWR(userIds, fetcher);

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" role="status" aria-live="polite">
				{userIds.map((id) => (
					<div
						key={id}
						className="rounded-2xl bg-card border border-border p-5 flex flex-col items-center gap-3 animate-pulse"
					>
						<div className="w-16 h-16 rounded-full bg-accent" />
						<div className="h-3 w-20 rounded bg-accent" />
						<div className="h-2.5 w-16 rounded bg-accent" />
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12 text-muted-foreground" role="alert">
				<p>Could not load team members.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			{usersData?.map((user, index) => (
				<div
					key={index}
					className={`group relative p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col items-center text-center ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
					style={{ transitionDelay: `${index * 60}ms` }}
				>
					{/* Avatar */}
					<div className="relative mb-3">
						{/* Glow ring on hover */}
						<div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-blue-500 opacity-0 group-hover:opacity-30 blur transition-opacity" />
						<Image
							className="relative w-16 h-16 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
							src={user.avatarURL || '/logo.webp'}
							alt={`${user.global_name || user.username}'s avatar`}
							width={64}
							height={64}
						/>
						{/* Online dot */}
						<span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card" />
					</div>

					{/* Name */}
					<h3 className="text-sm font-bold text-foreground leading-tight mb-0.5">
						{user.global_name || user.username}
					</h3>

					{/* Username */}
					<p className="text-xs text-muted-foreground font-mono">@{user.username}</p>

					{/* Discord icon — appears on hover */}
					<div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
						<FaDiscord className="w-4 h-4 text-primary mx-auto" />
					</div>
				</div>
			))}
		</div>
	);
};
