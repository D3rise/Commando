const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');

module.exports = class PrefixCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prefix',
			group: 'util',
			memberName: 'prefix',
			description: 'Показывает или ставит префикс.',
			format: '[prefix/"default"/"none"]',
			details: oneLine`
				If no prefix is provided, the current prefix will be shown.
				If the prefix is "default", the prefix will be reset to the bot's default prefix.
				If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands.
				Only administrators may change the prefix.
			`,
			examples: ['prefix', 'prefix -', 'prefix omg!', 'prefix default', 'prefix none'],

			args: [
				{
					key: 'prefix',
					prompt: 'Какой префикс вы хотите выставить в боте??',
					type: 'string',
					max: 15,
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		// Just output the prefix
		if(!args.prefix) {
			const prefix = msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix;
			return msg.reply(stripIndents`
				${prefix ? `Префикс команд: \`${prefix}\`.` : 'Здесь нету префикса.'}
				Для запуска команд, используй ${msg.anyUsage('command')}.
			`);
		}

		// Check the user's permission before changing anything
		if(msg.guild) {
			if(!msg.member.hasPermission('ADMINISTRATOR') && !this.client.isOwner(msg.author)) {
				return msg.reply('Только администраторы могут изменять префикс.');
			}
		} else if(!this.client.isOwner(msg.author)) {
			return msg.reply('Только владелец бота может изменять префикс.');
		}

		// Save the prefix
		const lowercase = args.prefix.toLowerCase();
		const prefix = lowercase === 'none' ? '' : args.prefix;
		let response;
		if(lowercase === 'default') {
			if(msg.guild) msg.guild.commandPrefix = null; else this.client.commandPrefix = null;
			const current = this.client.commandPrefix ? `\`${this.client.commandPrefix}\`` : 'no prefix';
			response = `Reset the command prefix to the default (currently ${current}).`;
		} else {
			if(msg.guild) msg.guild.commandPrefix = prefix; else this.client.commandPrefix = prefix;
			response = prefix ? `Set the command prefix to \`${args.prefix}\`.` : 'Removed the command prefix entirely.';
		}

		await msg.reply(`${response} To run commands, use ${msg.anyUsage('command')}.`);
		return null;
	}
};
