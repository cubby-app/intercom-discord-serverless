import {z} from 'zod';
import {comment} from './comment';
import {cycle} from './cycle';
import {issue} from './issue';
import {issueLabel} from './issue-label';
import {project} from './project';
import {reaction} from './reaction';
import {dateResolvable, defaultAction} from './util';

const commons = z.object({
	organizationId: z.string().uuid(),
	createdAt: dateResolvable,
	action: defaultAction,
});

export const bodySchema = commons.and(
	comment.or(issue).or(issueLabel).or(project).or(cycle).or(reaction),
);

export const intercomWebhookSchema = z.object({
	type: z.literal('notification_event'),
	app_id: z.string(),
	data: z.object({
		type: z.literal('notification_event_data'),
		item: z.object({
			type: z.literal('conversation'),
			id: z.string(),
			created_at: z.number(),
			updated_at: z.number(),
			waiting_since: z.number().nullable(),
			snoozed_until: z.number().nullable(),
			source: z.object({
				type: z.string(),
				id: z.string(),
				delivered_as: z.string(),
				subject: z.string(),
				body: z.string(),
				author: z.object({
					type: z.string(),
					id: z.string(),
					name: z.string(),
					email: z.string()
				}),
				attachments: z.array(z.any()),
				url: z.string(),
				redacted: z.boolean()
			}),
			contacts: z.object({
				type: z.string(),
				contacts: z.array(z.object({
					type: z.string(),
					id: z.string(),
					external_id: z.string()
				}))
			}),
			open: z.boolean(),
			state: z.string(),
			read: z.boolean(),
			priority: z.string(),
			title: z.string(),
			custom_attributes: z.record(z.any())
		})
	}),
	topic: z.string(),
	id: z.string(),
	created_at: z.number()
});

export type IntercomWebhookPayload = z.infer<typeof intercomWebhookSchema>;
