import { NextResponse } from 'next/server';

export async function GET() {
	const pageId = process.env.INSTATUS_PAGE_ID;
	const apiKey = process.env.INSTATUS_API_KEY;

	if (!pageId) {
		return NextResponse.json({ page: { status: 'UP' } });
	}

	try {
		const response = await fetch(`https://api.instatus.com/v1/${pageId}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			next: { revalidate: 300 } // Cache for 5 minutes
		});

		if (!response.ok) {
			return NextResponse.json({ page: { status: 'UP' } });
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json({ page: { status: 'UP' } });
	}
}
