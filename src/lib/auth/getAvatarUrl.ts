import { PartialUser } from '@/types/gosdk/types';

export const getAvatarUrl = (user: PartialUser) => {
	if (user.avatar) {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
	}

	//  index = tostring(typesext.bitu64.rshift(typesext.U64((user :: any).id), 22) % 6) -- ((user_id >> 22) % 6)
	let index = (BigInt(user.id) >> BigInt(22)) % BigInt(6);

	return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
};
