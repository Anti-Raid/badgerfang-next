'use client';

import { ChevronRight } from 'lucide-react';
import type { Component } from '@/lib/settings/events.parse';
import { DisplayElementView } from './DisplayElement';
import { MultiForm } from './MultiForm';

/**
 * Recursively renders a settings-v2 component tree for a single template.
 */
export function SV2({ template, comps }: { template: string; comps: Component[] }) {
	return (
		<>
			{comps.map((comp, idx) => {
				if (comp.type === 'DisplayElement') {
					return <DisplayElementView key={`disp-${idx}`} el={comp.element} />;
				}
				if (comp.type === 'Section') {
					return (
						<section key={comp.id} id={comp.id} className="mb-6">
							<details
								open
								className="group bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
							>
								<summary className="flex flex-col cursor-pointer p-5 bg-secondary/40 hover:bg-secondary/60 transition-colors select-none">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
											<span className="text-lg font-bold text-foreground">{comp.title}</span>
											<span className="text-[10px] font-mono bg-secondary text-muted-foreground px-2 py-0.5 rounded-md uppercase tracking-wider">
												{comp.id}
											</span>
										</div>
									</div>
									{comp.description && (
										<p className="text-muted-foreground text-sm mt-2 ml-8">{comp.description}</p>
									)}
								</summary>
								<div className="p-6 border-t border-border flex flex-col gap-8">
									<SV2 template={template} comps={comp.entries} />
								</div>
							</details>
						</section>
					);
				}
				if (comp.type === 'FormSet') {
					return (
						<MultiForm
							key={comp.id}
							template={template}
							id={comp.id}
							reorderable={comp.reorderable}
							forms={comp.forms}
							actions={comp.actions}
						/>
					);
				}
				return null;
			})}
		</>
	);
}
