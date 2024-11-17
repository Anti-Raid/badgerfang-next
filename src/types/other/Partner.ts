export interface PartnerLink {
	name?: string;
	emoji?: string;
	link: string;
	icon: React.ReactNode;
}

export interface Partner {
	name: string;
	description: string;
	long_description: string;
	logo: string;
	url: string;
	owner: string;
	owner_image: string;
	owner_website: string;
	links: PartnerLink[];
}
