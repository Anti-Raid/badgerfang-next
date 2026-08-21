'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { Event, FormAction, FormData, FormElement } from '@/lib/settings/events.parse';
import { useSettings } from './context';
import { FormInner } from './FormInner';

export function MultiForm({
	template,
	id,
	reorderable,
	forms,
	actions
}: {
	template: string;
	id: string;
	reorderable: boolean;
	forms: FormElement[];
	actions: FormAction[];
}) {
	const ctx = useSettings();
	const formData = ctx.settings[template].formdata[id];
	const [formOrder, setFormOrder] = useState<string[] | null>(null);

	const sortedForms = useMemo(() => {
		if (!formOrder) return formData;
		const ordered = formOrder
			.map((fid) => formData.find((f) => f.id === fid))
			.filter(Boolean) as FormData[];
		const remaining = formData.filter((f) => !formOrder.includes(f.id));
		return [...ordered, ...remaining];
	}, [formOrder, formData]);

	const startReordering = () => setFormOrder(sortedForms.map((f) => f.id));
	const cancelReordering = () => setFormOrder(null);

	const move = (index: number, direction: 'up' | 'down') => {
		if (!formOrder) return;
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= formOrder.length) return;
		const next = [...formOrder];
		[next[index], next[newIndex]] = [next[newIndex], next[index]];
		setFormOrder(next);
	};

	const saveOrder = async () => {
		if (!formOrder) return;
		const event: Event = {
			type: 'formset_reorder',
			__tloop_template_id: template,
			id,
			list: formOrder
		};
		await ctx.dispatchEvent(event);
		await ctx.refetch();
		setFormOrder(null);
	};

	return (
		<div className="flex flex-col gap-6 w-full">
			{reorderable && sortedForms.length > 0 && (
				<div className="flex justify-end gap-2 px-1">
					{!formOrder ? (
						<button
							type="button"
							onClick={startReordering}
							className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background text-foreground shadow-sm hover:bg-secondary transition-colors"
						>
							<ArrowUpDown className="w-3.5 h-3.5" />
							Reorder Forms
						</button>
					) : (
						<>
							<button
								type="button"
								onClick={cancelReordering}
								className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background text-foreground shadow-sm hover:bg-secondary transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={async () => {
									try {
										await saveOrder();
									} catch (err) {
										setFormOrder(null);
										alert(err instanceof Error ? err.message : 'Unknown error sending action');
									}
								}}
								className="px-4 py-2 rounded-lg text-sm font-medium border border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
							>
								Save Order
							</button>
						</>
					)}
				</div>
			)}

			<div className="flex flex-col gap-4">
				{formOrder ? (
					sortedForms.map((form, i) => (
						<section
							key={form.id}
							className="p-3 rounded-3xl border bg-card shadow-sm relative ring-2 ring-primary/20 border-primary/50"
							aria-labelledby={`form-title-${form.id}`}
						>
							<div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
								<button
									type="button"
									onClick={() => move(i, 'up')}
									disabled={i === 0}
									className="p-2 bg-card border border-border rounded-xl hover:bg-secondary hover:text-primary shadow-md transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
									title="Move Up"
								>
									<ChevronUp className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() => move(i, 'down')}
									disabled={i === sortedForms.length - 1}
									className="p-2 bg-card border border-border rounded-xl hover:bg-secondary hover:text-primary shadow-md transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
									title="Move Down"
								>
									<ChevronDown className="w-4 h-4" />
								</button>
							</div>
							<header className="flex items-center justify-between py-2.5 px-3 border-b border-border bg-secondary/40 -mx-3 -mt-3 rounded-t-3xl">
								<div className="flex flex-col gap-0.5">
									<h3
										id={`form-title-${form.id}`}
										className="text-sm font-bold uppercase tracking-wider text-foreground"
									>
										{form.title || 'Untitled Form'}
									</h3>
									<code className="text-[10px] text-muted-foreground font-mono bg-secondary px-1 rounded w-max">
										ID: {form.id}
									</code>
								</div>
								<span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground animate-pulse rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
									<ArrowUpDown className="w-2.5 h-2.5" />
									Reordering...
								</span>
							</header>
						</section>
					))
				) : (
					<>
						{formData.length === 0 && (
							<h3 className="text-sm text-destructive">No Form Entries ({id})</h3>
						)}
						{formData.map((form, i) => (
							<section
								key={form.id}
								className="p-3 rounded-3xl border bg-card shadow-sm border-border relative"
								aria-labelledby={`form-title-${form.id}`}
							>
								<details className="group/form">
									<summary className="flex items-center justify-between cursor-pointer select-none py-2.5 px-3 border-b border-border hover:bg-secondary/40 -mx-3 -mt-3 rounded-t-3xl transition-colors">
										<div className="flex items-center gap-2">
											<ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-open/form:rotate-0 transition-transform shrink-0" />
											<div className="flex flex-col gap-0.5">
												<h3
													id={`form-title-${form.id}`}
													className="text-sm font-bold uppercase tracking-wider text-foreground"
												>
													{form.title || 'Untitled Form'}
												</h3>
												<code className="text-[10px] text-muted-foreground font-mono bg-secondary px-1 rounded w-max">
													ID: {form.id}
												</code>
											</div>
										</div>
									</summary>
									<div className="pt-5 flex flex-col gap-5">
										<FormInner
											template={template}
											form={forms}
											formid={form.id}
											formidx={i}
											formsetid={id}
											actions={actions}
										/>
									</div>
								</details>
							</section>
						))}
					</>
				)}
			</div>
		</div>
	);
}
