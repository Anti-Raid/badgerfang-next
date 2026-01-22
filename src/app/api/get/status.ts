import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/get/status')({
	server: {
		handlers: {
			GET: async () => {
				const pageId = process.env.INSTATUS_PAGE_ID;
				const apiKey = process.env.INSTATUS_API_KEY;

				if (!pageId) {
					return Response.json({ page: { status: 'UP' } });
				}

				try {
					const response = await fetch(`https://api.instatus.com/v1/${pageId}`, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${apiKey}`,
							'Content-Type': 'application/json'
						}
					});

					if (!response.ok) {
						return Response.json({ page: { status: 'UP' } });
					}

					const data = await response.json();
					return Response.json(data);
				} catch (error) {
					return Response.json({ page: { status: 'UP' } });
				}
			}
		}
	}
});
