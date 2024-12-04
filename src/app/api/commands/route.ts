import { NextResponse } from 'next/server';

export async function GET() {
	const commands = [
		{
			category: 'General',
			items: [
				{
					name: 'Help',
					description: 'Displays help information.',
					args: ['command']
				},
				{
					name: 'Info',
					description: 'Displays bot or server information.',
					args: []
				},
				{
					name: 'Ping',
					description: "Checks the bot's latency.",
					args: []
				}
			]
		},
		{
			category: 'Admin',
			items: [
				{
					name: 'Ban',
					description: 'Bans a user from the server.',
					args: ['userID', 'reason']
				},
				{
					name: 'Kick',
					description: 'Kicks a user from the server.',
					args: ['userID']
				},
				{
					name: 'Mute',
					description: 'Mutes a user in the server.',
					args: ['userID', 'duration']
				},
				{
					name: 'Unmute',
					description: 'Unmutes a user in the server.',
					args: ['userID']
				}
			]
		},
		{
			category: 'Music',
			items: [
				{
					name: 'Play',
					description: 'Plays a song in the voice channel.',
					args: ['song name or URL']
				},
				{
					name: 'Pause',
					description: 'Pauses the currently playing song.',
					args: []
				},
				{
					name: 'Skip',
					description: 'Skips the current song.',
					args: []
				},
				{
					name: 'Queue',
					description: 'Displays the current song queue.',
					args: []
				},
				{
					name: 'Stop',
					description: 'Stops the music and clears the queue.',
					args: []
				}
			]
		},
		{
			category: 'Fun',
			items: [
				{
					name: 'Meme',
					description: 'Sends a random meme.',
					args: []
				},
				{
					name: 'Joke',
					description: 'Sends a random joke.',
					args: []
				},
				{
					name: '8Ball',
					description: 'Answers a yes/no question.',
					args: ['question']
				},
				{
					name: 'Quote',
					description: 'Sends a random inspirational quote.',
					args: []
				}
			]
		},
		{
			category: 'Utility',
			items: [
				{
					name: 'Weather',
					description: 'Displays weather information for a specified location.',
					args: ['location']
				},
				{
					name: 'Time',
					description: 'Displays the current time for a specified timezone.',
					args: ['timezone']
				},
				{
					name: 'Translate',
					description: 'Translates text to a specified language.',
					args: ['text', 'language']
				},
				{
					name: 'Define',
					description: 'Fetches the definition of a word.',
					args: ['word']
				}
			]
		},
		{
			category: 'Moderation',
			items: [
				{
					name: 'Warn',
					description: 'Warns a user.',
					args: ['userID', 'reason']
				},
				{
					name: 'Clear',
					description: 'Clears a specified number of messages in a channel.',
					args: ['count']
				},
				{
					name: 'Lock',
					description: 'Locks a channel to prevent messages.',
					args: ['channelID']
				},
				{
					name: 'Unlock',
					description: 'Unlocks a previously locked channel.',
					args: ['channelID']
				}
			]
		}
	];

	return NextResponse.json(commands);
}
