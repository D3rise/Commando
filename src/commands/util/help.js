const { splitMessage } = require('discord.js');
const {	stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Показывает список всех команд, или выводит детальную информацию об указанной команде.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [{
				key: 'command',
				prompt: 'Which command would you like to view the help for?',
				type: 'string',
				default: ''
			}]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Комманда **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Только на серверах)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Формат:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Или же:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Группа:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Детали:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Пример:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.embed({
						color: 16711749,
						description: help
					}));
				} catch(err) {
					messages.push(await msg.embed({
						color: 16711749,
						decription: 'Невозможно отправить сообщение со списком команд.'
					}, '', { reply: this.client.user }));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.embed({
					color: 16711749,
					description: 'Найдено несколько команд. Будьте более точными.'
				}, '', { reply: this.client.user });
			} else if(commands.length > 1) {
				return msg.embed({
					color: 16711749,
					description: disambiguation(commands, 'commands')
				}, '', { reply: this.client.user });
			} else {
				return msg.embed({
					color: 16711749,
					description: `Невозможно идентифицировать команду. Используйте ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} для просмотра полного списка команд.`
				}, '', { reply: this.client.user });
			}
		} else {
			const messages = [];
			try {
				const body = stripIndents`
				${oneLine`
					Для запуска команд на ${msg.guild.name || 'любом сервере'},
					используйте ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					К примеру, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
				`}

				Используйте ${this.usage('all', null, null)} для просмотра списка *всех* команд.

				__**${showAll ? 'Все команды' : `Доступные команды в ${msg.guild || 'этом ЛС'}`}**__

				${(showAll ? groups : groups.filter(grp => grp.commands.some(cmd => cmd.isUsable(msg))))
					.map(grp => stripIndents`
						__${grp.name}__
						${(showAll ? grp.commands : grp.commands.filter(cmd => cmd.isUsable(msg)))
							.map(cmd => `**js!${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
						}
					`).join('\n\n')
				}`;

				if(body.length >= 2000) {
					const splitContent = splitMessage(body);

					for(const part in splitContent) {
						messages.push(await msg.embed({ // eslint-disable-line no-await-in-loop
							color: 16711749,
							description: splitContent[part]
						}));
					}
				} else {
					messages.push(await msg.embed({ // eslint-disable-line no-await-in-loop
						color: 16711749,
						description: body
					}));
				}
			} catch(err) {
				messages.push(await msg.reply('Невозможно отправить список команд/информацию о команде.'));
			}
			return messages;
		}
	}
};
