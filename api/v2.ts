import {MessageEmbed} from 'discord.js';
import {HttpException} from 'nextkit';
import {z} from 'zod';
import {intercomWebhookSchema} from '../v2-util/schema';
import fetch from 'node-fetch';
import {api} from '../v2-util/api';

const querySchema = z.object({
	token: z.string(),
	id: z.string(),
});

const enum Colors {
	INTERCOM_BLUE = '#1F8FF7',
	ERRORS = '#d95858',
	SUCCESS = '#67d958',
	INFO = '#58c4d9',
	WARN = '#d9aa58',
}

const avatar = 'https://i.imgur.com/SICZmw8.png';
const footer = 'Intercom • ⚡ lds.alistair.cloud';

export default api({
	async POST(req) {
		const {
			token: webhookToken,
			id: webhookId,
		} = querySchema.parse(req.query);

		const body = intercomWebhookSchema.parse(req.body);

		const embed = new MessageEmbed()
			.setColor(Colors.INTERCOM_BLUE)
			.setFooter(footer, avatar)
			.setTimestamp(body.created_at * 1000); // Convert Unix timestamp to milliseconds

		const conversation = body.data.item;
		const source = conversation.source;
		const author = source.author;

		// Set the title based on the conversation topic
		embed.setTitle(`New ${body.topic.split('.').pop()} from ${author.name}`);

		// Add the conversation details
		embed
			.setDescription(source.body)
			.setURL(source.url)
			.setAuthor(author.name, undefined, `mailto:${author.email}`);

		// Add fields for important conversation information
		embed
			.addField('State', conversation.state, true)
			.addField('Priority', conversation.priority, true)
			.addField('Customer ID', conversation.contacts.contacts[0]?.external_id || 'N/A', true);

		// Add custom attributes if they exist
		if (Object.keys(conversation.custom_attributes).length > 0) {
			const customAttrs = Object.entries(conversation.custom_attributes)
				.map(([key, value]) => `${key}: ${value}`)
				.join('\n');
			embed.addField('Custom Attributes', customAttrs);
		}

		const webhook = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`;

		await fetch(webhook, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				embeds: [embed.toJSON()],
				avatar_url: avatar,
			}),
		}).then(async res => {
			if (res.status >= 400) {
				throw new LDSDiscordApiError(JSON.stringify(await res.json()));
			}
		});
	},
});

class LDSDiscordApiError extends Error {
	constructor(public readonly data: string) {
		super('Something went wrong sending to Discord.');
	}
}
