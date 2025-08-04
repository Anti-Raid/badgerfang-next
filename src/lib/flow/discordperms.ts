/**
 * Deprecated: PermissionReadMessages has been replaced with PermissionViewChannel for text and voice channels
 */
export const PermissionReadMessages = 0x0000000000000400;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionSendMessages = 0x0000000000000800;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionSendTTSMessages = 0x0000000000001000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionManageMessages = 0x0000000000002000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionEmbedLinks = 0x0000000000004000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionAttachFiles = 0x0000000000008000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionReadMessageHistory = 0x0000000000010000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionMentionEveryone = 0x0000000000020000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionUseExternalEmojis = 0x0000000000040000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionUseSlashCommands = 0x0000000080000000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionManageThreads = 0x0000000400000000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionCreatePublicThreads = 0x0000000800000000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionCreatePrivateThreads = 0x0000001000000000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionUseExternalStickers = 0x0000002000000000;
/**
 * Constants for the different bit offsets of text channel permissions
 */
export const PermissionSendMessagesInThreads = 0x0000004000000000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoicePrioritySpeaker = 0x0000000000000100;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceStreamVideo = 0x0000000000000200;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceConnect = 0x0000000000100000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceSpeak = 0x0000000000200000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceMuteMembers = 0x0000000000400000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceDeafenMembers = 0x0000000000800000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceMoveMembers = 0x0000000001000000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceUseVAD = 0x0000000002000000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionVoiceRequestToSpeak = 0x0000000100000000;
/**
 * Constants for the different bit offsets of voice permissions
 */
export const PermissionUseActivities = 0x0000008000000000;
/**
 * Constants for general management.
 */
export const PermissionChangeNickname = 0x0000000004000000;
/**
 * Constants for general management.
 */
export const PermissionManageNicknames = 0x0000000008000000;
/**
 * Constants for general management.
 */
export const PermissionManageRoles = 0x0000000010000000;
/**
 * Constants for general management.
 */
export const PermissionManageWebhooks = 0x0000000020000000;
/**
 * Constants for general management.
 */
export const PermissionManageEmojis = 0x0000000040000000;
/**
 * Constants for general management.
 */
export const PermissionManageEvents = 0x0000000200000000;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionCreateInstantInvite = 0x0000000000000001;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionKickMembers = 0x0000000000000002;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionBanMembers = 0x0000000000000004;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionAdministrator = 0x0000000000000008;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionManageChannels = 0x0000000000000010;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionManageServer = 0x0000000000000020;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionAddReactions = 0x0000000000000040;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionViewAuditLogs = 0x0000000000000080;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionViewChannel = 0x0000000000000400;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionViewGuildInsights = 0x0000000000080000;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionModerateMembers = 0x0000010000000000;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionAllText =
	PermissionViewChannel |
	PermissionSendMessages |
	PermissionSendTTSMessages |
	PermissionManageMessages |
	PermissionEmbedLinks |
	PermissionAttachFiles |
	PermissionReadMessageHistory |
	PermissionMentionEveryone;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionAllVoice =
	PermissionViewChannel |
	PermissionVoiceConnect |
	PermissionVoiceSpeak |
	PermissionVoiceMuteMembers |
	PermissionVoiceDeafenMembers |
	PermissionVoiceMoveMembers |
	PermissionVoiceUseVAD |
	PermissionVoicePrioritySpeaker;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionAllChannel =
	PermissionAllText |
	PermissionAllVoice |
	PermissionCreateInstantInvite |
	PermissionManageRoles |
	PermissionManageChannels |
	PermissionAddReactions |
	PermissionViewAuditLogs;
/**
 * Constants for the different bit offsets of general permissions
 */
export const PermissionAll =
	PermissionAllChannel |
	PermissionKickMembers |
	PermissionBanMembers |
	PermissionManageServer |
	PermissionAdministrator |
	PermissionManageWebhooks |
	PermissionManageEmojis;

export const PermissionIndividual: { [perm: string]: number } = {
	ReadMessages: PermissionReadMessages,
	SendMessages: PermissionSendMessages,
	SendTTSMessages: PermissionSendTTSMessages,
	ManageMessages: PermissionManageMessages,
	EmbedLinks: PermissionEmbedLinks,
	AttachFiles: PermissionAttachFiles,
	ReadMessageHistory: PermissionReadMessageHistory,
	MentionEveryone: PermissionMentionEveryone,
	UseExternalEmojis: PermissionUseExternalEmojis,
	UseSlashCommands: PermissionUseSlashCommands,
	ManageThreads: PermissionManageThreads,
	CreatePublicThreads: PermissionCreatePublicThreads,
	CreatePrivateThreads: PermissionCreatePrivateThreads,
	UseExternalStickers: PermissionUseExternalStickers,
	SendMessagesInThreads: PermissionSendMessagesInThreads,
	VoicePrioritySpeaker: PermissionVoicePrioritySpeaker,
	VoiceStreamVideo: PermissionVoiceStreamVideo,
	VoiceConnect: PermissionVoiceConnect,
	VoiceSpeak: PermissionVoiceSpeak,
	VoiceMuteMembers: PermissionVoiceMuteMembers,
	VoiceDeafenMembers: PermissionVoiceDeafenMembers,
	VoiceMoveMembers: PermissionVoiceMoveMembers,
	VoiceUseVAD: PermissionVoiceUseVAD,
	VoiceRequestToSpeak: PermissionVoiceRequestToSpeak,
	UseActivities: PermissionUseActivities,
	ChangeNickname: PermissionChangeNickname,
	ManageNicknames: PermissionManageNicknames,
	ManageRoles: PermissionManageRoles,
	ManageWebhooks: PermissionManageWebhooks,
	ManageEmojis: PermissionManageEmojis,
	ManageEvents: PermissionManageEvents,
	CreateInstantInvite: PermissionCreateInstantInvite,
	KickMembers: PermissionKickMembers,
	BanMembers: PermissionBanMembers,
	Administrator: PermissionAdministrator,
	ManageChannels: PermissionManageChannels,
	ManageServer: PermissionManageServer,
	AddReactions: PermissionAddReactions,
	ViewAuditLogs: PermissionViewAuditLogs,
	ViewChannel: PermissionViewChannel,
	ViewGuildInsights: PermissionViewGuildInsights,
	ModerateMembers: PermissionModerateMembers,
	AllText: PermissionAllText,
	AllVoice: PermissionAllVoice,
	AllChannel: PermissionAllChannel,
	All: PermissionAll
};
