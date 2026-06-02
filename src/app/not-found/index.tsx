import { createFileRoute } from '@tanstack/react-router';
import NotFoundPage from './-NotFoundPage';

export const Route = createFileRoute('/not-found/')({
	component: NotFoundPage
});
