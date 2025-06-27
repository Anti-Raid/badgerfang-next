import { NextRequest } from 'next/server';

/**
 * Handles GET requests to provide holiday or seasonal event information for the current date.
 *
 * Returns a JSON response containing the ISO date string and either event metadata with themed asset paths if a holiday or season is detected, or a default message and asset paths if not.
 */
export async function GET(req: NextRequest) {
	const today = new Date();
	const eventInfo = getHolidayOrSeason(today);

	const logo = `./logo${eventInfo?.key ? `_${eventInfo.key}` : ''}.webp`;
	const banner = `./banner${eventInfo?.key ? `_${eventInfo.key}` : ''}.webp`;

	const response = {
		date: today.toISOString().split('T')[0],
		...(eventInfo
			? {
					event: {
						name: eventInfo.displayName,
						key: eventInfo.key,
						description: eventInfo.description
					},
					assets: { logo, banner }
				}
			: {
					message: 'No holiday or cultural event today. Using default assets.',
					assets: { logo, banner }
				})
	};

	return Response.json(response);
}

interface EventInfo {
	key: string;
	displayName: string;
	description: string;
}

/**
 * Determines if the given date matches a predefined holiday or seasonal event and returns its metadata.
 *
 * @param date - The date to check for a matching event.
 * @returns An {@link EventInfo} object with event details if the date matches a holiday or season, or null if there is no match.
 *
 * @remark
 * Chinese New Year is only recognized for the years 2026–2030, based on hardcoded dates.
 */
function getHolidayOrSeason(date: Date): EventInfo | null {
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const year = date.getFullYear();

	const events: (EventInfo & { check: () => boolean })[] = [
		{
			key: 'new_year',
			displayName: "New Year's Day",
			description: 'Celebration of the first day of the Gregorian calendar.',
			check: () => month === 1 && day === 1
		},
		{
			key: 'christmas',
			displayName: 'Christmas Day',
			description: 'Christian holiday celebrating the birth of Jesus.',
			check: () => month === 12 && day === 25
		},
		{
			key: 'halloween',
			displayName: 'Halloween',
			description: 'A celebration observed in many countries on October 31.',
			check: () => month === 10 && day === 31
		},
		{
			key: 'thanksgiving',
			displayName: 'Thanksgiving (USA)',
			description: 'Celebrated on the fourth Thursday of November.',
			check: () => month === 11 && isNthWeekdayOfMonth(date, 4, 4)
		},
		{
			key: 'chinese_new_year',
			displayName: 'Chinese New Year',
			description: 'Lunar new year celebrated in Chinese culture.',
			check: () => {
				const cnyDates: Record<number, string> = {
					2026: '02-17',
					2027: '02-06',
					2028: '01-26',
					2029: '02-13',
					2030: '02-03'
				};
				const match = cnyDates[year];
				if (!match) return false;
				const [m, d] = match.split('-').map(Number);
				return month === m && day === d;
			}
		},
		{
			key: 'spring',
			displayName: 'Spring Begins',
			description: 'Astronomical beginning of spring in the northern hemisphere.',
			check: () => month === 3 && day >= 20
		},
		{
			key: 'summer',
			displayName: 'Summer Begins',
			description: 'Astronomical beginning of summer in the northern hemisphere.',
			check: () => month === 6 && day >= 21
		},
		{
			key: 'autumn',
			displayName: 'Autumn Begins',
			description: 'Astronomical beginning of autumn in the northern hemisphere.',
			check: () => month === 9 && day >= 22
		},
		{
			key: 'winter',
			displayName: 'Winter Begins',
			description: 'Astronomical beginning of winter in the northern hemisphere.',
			check: () => month === 12 && day >= 21
		}
	];

	for (const event of events) {
		if (event.check()) {
			return {
				key: event.key,
				displayName: event.displayName,
				description: event.description
			};
		}
	}

	return null;
}

/**
 * Determines whether the given date is the nth occurrence of a specified weekday within its month.
 *
 * @param date - The date to check.
 * @param nth - The occurrence number (e.g., 4 for the fourth occurrence).
 * @param weekday - The target weekday (0 for Sunday through 6 for Saturday).
 * @returns True if {@link date} is the nth occurrence of {@link weekday} in its month; otherwise, false.
 */
function isNthWeekdayOfMonth(date: Date, nth: number, weekday: number): boolean {
	if (date.getDay() !== weekday) return false;

	const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
	const firstWeekday = firstOfMonth.getDay();
	const offset = (7 + weekday - firstWeekday) % 7;
	const firstOccurrence = 1 + offset;
	const targetDate = firstOccurrence + (nth - 1) * 7;

	return date.getDate() === targetDate;
}
