'use client';

import { useMemo, useState } from 'react';
import { ExposedProps, isTruthy } from 'animalang';
import type { Event, FormAction, FormElement } from '@/lib/settings/events.parse';
import { branchEngine, getClosure } from './anima';
import { useSettings } from './context';
import { DisplayElementView } from './DisplayElement';
import { ErrorBox } from './ErrorBox';
import { MemberSelectSingle } from './MemberSelectSingle';
import {
	MultiSelectField,
	MultiTextField,
	NumberField,
	SelectField,
	TextField,
	ToggleField
} from './fields';

const actionButtonClass = (style: FormAction['style']): string => {
	const base =
		'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
	switch (style) {
		case 'Danger':
			return `${base} bg-background border-destructive/30 text-destructive hover:bg-destructive/10`;
		case 'Secondary':
			return `${base} bg-background border-border text-foreground hover:bg-secondary`;
		case 'Primary':
		default:
			return `${base} bg-primary border-transparent text-primary-foreground hover:bg-primary/90`;
	}
};

export function FormInner({
	template,
	form,
	formid,
	formidx,
	formsetid,
	actions
}: {
	template: string;
	form: FormElement[];
	formid: string;
	formidx: number;
	formsetid: string;
	actions: FormAction[];
}) {
	const ctx = useSettings();
	const data = ctx.settings[template].formdata[formsetid][formidx].data;
	const [clickedBtns, setClickedBtns] = useState<Record<number, string | null>>({});

	const setField = (fieldId: string, value: unknown) =>
		ctx.setFieldValue(template, formsetid, formidx, fieldId, value);

	// Recompute which elements are visible by evaluating each Branch condition
	// against the current form data via Anima.
	const visibleElements = useMemo(() => {
		const props = new ExposedProps(data);
		const flatten = (elems: FormElement[]): FormElement[] => {
			const result: FormElement[] = [];
			for (const el of elems) {
				if (el.type === 'Branch') {
					try {
						const closure = getClosure(el.cond);
						const visible = isTruthy(branchEngine.evaluateClosure(closure, [props, el.id]));
						if (visible) result.push(...flatten(el.elems));
					} catch (error) {
						console.error(`Branch evaluation failed for id ${el.id} cond: ${el.cond}`, error);
					}
				} else {
					result.push(el);
				}
			}
			return result;
		};
		return flatten(form);
	}, [form, data]);

	const gatherData = (rec: Record<string, unknown>, elems: FormElement[]) => {
		const props = new ExposedProps(data);
		for (const elem of elems) {
			if (elem.type === 'DisplayElement') continue;
			if (elem.type === 'Branch') {
				try {
					const closure = getClosure(elem.cond);
					if (isTruthy(branchEngine.evaluateClosure(closure, [props, elem.id]))) {
						gatherData(rec, elem.elems);
					}
				} catch (error) {
					console.error(`Branch evaluation failed for id ${elem.id}`, error);
				}
				continue;
			}
			rec[elem.id] = data[elem.id];
		}
	};

	const submit = async (actionButtonId: string, sendForm: boolean) => {
		let event: Event;
		if (sendForm) {
			const formData: Record<string, unknown> = {};
			gatherData(formData, form);
			event = {
				type: 'form_action',
				__tloop_template_id: template,
				form_id: formid,
				formset_id: formsetid,
				action_button_id: actionButtonId,
				form_data: formData
			};
		} else {
			event = {
				type: 'form_action',
				__tloop_template_id: template,
				form_id: formid,
				formset_id: formsetid,
				action_button_id: actionButtonId
			};
		}
		await ctx.dispatchEvent(event);
		await ctx.refetch();
	};

	const renderElement = (el: FormElement, key: string) => {
		switch (el.type) {
			case 'DisplayElement':
				return <DisplayElementView key={key} el={el.element} />;
			case 'Text':
				if (el.choices?.type === 'Fixed') {
					return (
						<SelectField
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string}
							onChange={(v) => setField(el.id, v)}
							options={el.choices.choices}
							disabled={el.disabled}
						/>
					);
				}
				if (el.choices?.type === 'Role') {
					return (
						<SelectField
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string}
							onChange={(v) => setField(el.id, v)}
							options={ctx.roleChoices}
							disabled={el.disabled}
						/>
					);
				}
				if (el.choices?.type === 'Channel') {
					return (
						<SelectField
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string}
							onChange={(v) => setField(el.id, v)}
							options={ctx.channelChoices}
							disabled={el.disabled}
						/>
					);
				}
				if (el.choices?.type === 'Member') {
					return (
						<MemberSelectSingle
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string}
							onChange={(v) => setField(el.id, v)}
							disabled={el.disabled}
						/>
					);
				}
				return (
					<TextField
						key={key}
						id={el.id}
						label={el.label}
						description={el.description}
						placeholder={el.placeholder || 'Enter some text here!'}
						value={data[el.id] as string}
						onChange={(v) => setField(el.id, v)}
						disabled={el.disabled}
					/>
				);
			case 'Number':
				return (
					<NumberField
						key={key}
						id={el.id}
						label={el.label}
						description={el.description}
						placeholder={el.placeholder || 'Enter a number here!'}
						value={data[el.id] as number}
						onChange={(v) => setField(el.id, v)}
						disabled={el.disabled}
					/>
				);
			case 'Array.Text':
				if (el.choices?.type === 'Fixed') {
					return (
						<MultiSelectField
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string[]}
							onChange={(v) => setField(el.id, v)}
							options={el.choices.choices}
							disabled={el.disabled}
						/>
					);
				}
				if (el.choices?.type === 'Role') {
					return (
						<MultiSelectField
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string[]}
							onChange={(v) => setField(el.id, v)}
							options={ctx.roleChoices}
							disabled={el.disabled}
						/>
					);
				}
				if (el.choices?.type === 'Channel') {
					return (
						<MultiSelectField
							key={key}
							id={el.id}
							label={el.label}
							description={el.description}
							placeholder={el.placeholder}
							value={data[el.id] as string[]}
							onChange={(v) => setField(el.id, v)}
							options={ctx.channelChoices}
							disabled={el.disabled}
						/>
					);
				}
				return (
					<MultiTextField
						key={key}
						id={el.id}
						label={el.label}
						description={el.description}
						placeholder={el.placeholder}
						value={data[el.id] as string[]}
						onChange={(v) => setField(el.id, v)}
						disabled={el.disabled}
					/>
				);
			case 'Boolean':
				return (
					<ToggleField
						key={key}
						id={el.id}
						label={el.label}
						description={el.description}
						checked={data[el.id] as boolean}
						onChange={(v) => setField(el.id, v)}
						disabled={el.disabled}
					/>
				);
			case 'DateTime':
				// TODO: DateTime input not yet implemented (parity with willow).
				return null;
			default:
				return null;
		}
	};

	return (
		<>
			{visibleElements.map((el, idx) =>
				renderElement(el, el.type === 'DisplayElement' ? `disp-${idx}` : el.id)
			)}

			{actions.map((action, i) => (
				<div key={action.id} className="flex flex-col gap-2">
					<button
						type="button"
						className={actionButtonClass(action.style)}
						disabled={clickedBtns[i] === null}
						onClick={async () => {
							setClickedBtns((p) => ({ ...p, [i]: null }));
							try {
								await submit(action.id, action.send_form);
								setClickedBtns((p) => {
									const next = { ...p };
									delete next[i];
									return next;
								});
							} catch (err) {
								setClickedBtns((p) => ({
									...p,
									[i]: err instanceof Error ? err.message : 'Unknown error sending action'
								}));
							}
						}}
					>
						{action.text}
					</button>
					{typeof clickedBtns[i] === 'string' && <ErrorBox error={clickedBtns[i]} />}
				</div>
			))}
		</>
	);
}
