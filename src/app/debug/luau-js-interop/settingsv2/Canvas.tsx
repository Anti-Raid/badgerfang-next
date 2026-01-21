import { InputField } from "@/components/settings/components/form-elements";
import { DrawCmd, DrawCmdForm, DrawCmdFormList, DrawCmdInput } from "./drawcmd";
import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Bell, Code, Database, Edit, FileCode, Plus, Shield, Trash2, User, Lock, ChevronDown, GripVertical } from "lucide-react";
import { Primary } from "@/components/ui/Buttons";

export type FormData = {[key: string]: Record<string, any>}

/**
 * Takes the form data out of the draw commands.
 */
const takeFormValues = (drawcmds: DrawCmd[]): FormData => {
    throw new Error("Not implemented yet");
}

interface SettingsInputProps {
    data: DrawCmdInput;
    value: any;
    onChange: (val: any) => void;
}

// Only re-render if 'value' specifically changes
const SettingsInput = memo(({ data, value, onChange }: SettingsInputProps) => {
    return (
        <div className="mb-4">
            {data.input.type == "text" && (
                <InputField 
                    id={data.input.id}
                    label={data.input.label}
                    description={data.input.description}
                    type="text"
                    value={data.input.value}
                    onChange={onChange}
                    disabled={data.input.readonly}
                    placeholder={data.input.placeholder}
                />
            )}
        </div>
    );
});

interface SettingsFormProps {
    data: DrawCmdForm;
    values: Record<string, any>; // this forms values
    onCancel: () => void;
    onChange: (formId: string, fieldId: string, value: any) => void;
}

// Only re-render if 'values' (this specific form's data) changes
const SettingsForm = memo(({ data, values, onChange, onCancel }: SettingsFormProps) => {
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		// Auto-focus the first input or actionable element in the form
		const firstInput = formRef.current?.querySelector('input, textarea, select, button:not([aria-label="Cancel"])') as HTMLElement;
		if (firstInput) {
			firstInput.focus();
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			className="mb-10"
		>
			<form 
				ref={formRef}
				onSubmit={handleSubmit}
				className="bg-card border border-border/50 rounded-3xl p-8 lg:p-10 shadow-2xl"
			>
				<div className="flex items-center justify-between mb-8">
					<div>
						<h3 className="text-xl font-bold tracking-tight text-foreground">
							{data.label}
						</h3>
						<p className="text-xs text-muted-foreground mt-1 font-medium">Please fill in the details below</p>
					</div>
					<button 
						type="button"
						onClick={onCancel}
						className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
						aria-label="Cancel"
					>
						<Plus size={20} className={'rotate-45'} />
					</button>
				</div>

				<div>
                    {data.commands.map((cmd, i) => {
                        if (cmd.type === "input") {
                            return (
                                <SettingsInput 
                                    key={cmd.input.id} 
                                    data={cmd}
                                    value={values[cmd.input.id]}
                                    onChange={(val) => onChange(data.id, cmd.input.id, val)}
                                />
                            );
                        }
                        return null; 
                    })}
				</div>

				<div className="flex flex-col sm:flex-row gap-3 mt-10 pt-8 border-t border-border/50">
					<div className="flex-1">
						<Primary 
							Title={data.submitButton ? data.submitButton.label : "Save Changes"} 
							type="submit"
							className="w-full !py-3 !rounded-xl !text-sm !font-bold shadow-lg shadow-primary/10"
						/>
					</div>
					<button
						type="button"
						className="px-8 py-3 rounded-xl bg-accent/50 text-foreground font-bold text-sm hover:bg-accent transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-border/50"
						onClick={onCancel}
					>
						{data.cancelButton ? data.cancelButton.label : "Cancel"}
					</button>
				</div>
			</form>
		</motion.div>
	);
});

interface SettingFormWrapperProps {
    data: DrawCmdForm;
    onDelete: (formId: string) => void;
    onEdit: (formId: string) => void;
}

/**
 * A simple wrapper around a form entry in a list, with edit/delete buttons.
 * 
 * The intent is that clicking "edit" will open the full form for editing (aka
 * the wrapper acts as a summary view of the form).
 */
export const SettingsFormWrapper: React.FC<SettingFormWrapperProps> = memo(({
    data,
    onDelete,
    onEdit
}) => {
    const handleClickEdit = useCallback(() => {
        onEdit(data.id);
    }, [onEdit, data.id]);

    const handleDelete = useCallback(() => {
        onDelete(data.id);
    }, [onDelete, data.id]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			className="group/entry relative bg-background border border-border/50 rounded-xl p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
		>
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<span className="text-sm font-bold text-foreground">
							{data.label}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
						onClick={handleClickEdit}
						aria-label={`Edit ${data.label || 'entry'}`}
					>
						<Edit size={16} />
					</button>
                    {data.delete && (
                        <button
                            type="button"
                            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            onClick={handleDelete}
                            aria-label={`Delete ${data.delete.ariaLabel || 'entry'}`}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
				</div>
			</div>
		</motion.div>
	);
});

interface SettingsReorderableListProps {
	data: DrawCmdFormList;
    values: FormData;
	onReorder: (forms: DrawCmdForm[]) => void;
	onEdit: (formId: string) => void;
	onDelete: (formId: string) => void;
	onSaveOrder: () => void;
	isReordered: boolean;
}

/**
 * Similar to SettingsFormWrapper, but with drag-and-drop reordering capabilities
 * 
 * Due to reordering, this component needs to know the full list of forms, not just
 * the individual form.
 */
export const ReorderableSettingsFormWrapper: React.FC<SettingsReorderableListProps> = memo(({
	data,
    values,
	onReorder,
	onEdit,
	onDelete,
	onSaveOrder,
	isReordered,
}) => {
	return (
		<div className="space-y-4">
			<div className="bg-accent/30 border border-border/50 rounded-2xl overflow-hidden p-3">
				<Reorder.Group
					axis="y"
					values={data.forms}
					onReorder={onReorder}
					className="space-y-2"
				>
					{data.forms.map((entry, index) => (
						<Reorder.Item 
							key={entry.id} 
							value={entry} 
							className="group/reorder relative bg-card border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all duration-200 shadow-sm"
						>
							<div className="flex items-center gap-4">
								<div className="text-muted-foreground/30 group-hover/reorder:text-primary transition-colors cursor-grab active:cursor-grabbing">
									<GripVertical size={20} />
								</div>
								
								<div className="flex-1">
									<span className="text-sm font-bold text-foreground transition-colors group-hover/reorder:text-primary">
										{data.title || `Entry ${index + 1}`}
									</span>
								</div>

								<div className="flex items-center gap-1 opacity-0 group-hover/reorder:opacity-100 group-focus-within/reorder:opacity-100 transition-opacity">
									<button
										type="button"
										className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
										onClick={() => onEdit(entry.id)}
										aria-label={`Edit ${entry.label || 'entry'}`}
									>
										<Edit size={16} />
									</button>
                                    {entry.delete && (
                                        <button
                                            type="button"
                                            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                            onClick={() => onDelete(entry.id)}
                                            aria-label={`Delete ${entry.label || 'entry'}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
								</div>
							</div>
						</Reorder.Item>
					))}
				</Reorder.Group>
			</div>

			{isReordered && (
				<motion.div 
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-end pt-2"
				>
					<Primary 
						Title="Save New Order" 
						onClick={onSaveOrder} 
						className="!px-6 !py-2.5 !rounded-xl !text-sm shadow-lg shadow-primary/10"
					/>
				</motion.div>
			)}
		</div>
	);
});

interface SettingsFormListProps {
    data: DrawCmdFormList; // The layout config
    formData: FormData;    // The full state (needed to slice for children)
    onChange: (formId: string, fieldId: string, value: any) => void;
    onReorder: (forms: DrawCmdForm[]) => void;
    onSaveOrder: () => void;
    onDelete: (formId: string) => void;
    isReordered: boolean;
}

/**
 * The base form list component, without the open/close logic.
 */
export const BaseSettingsFormList = memo(({ data, formData, onChange, onReorder, onDelete, onSaveOrder, isReordered }: SettingsFormListProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const activeForm = data.forms.find(f => f.id === editingId);
    const activeValues = editingId ? (formData[editingId] || {}) : {};

    const onCancel = useCallback(() => {
        setEditingId(null);
    }, [])

    const onEdit = useCallback((formId: string) => {
        setEditingId(formId);
    }, []);

    const onAddNew = useCallback(() => {
        // For now, just log the addition
        console.log(`Add new form to list with id: ${data.id}`);
    }, [data.id]);

    const handleDelete = useCallback((formId: string) => {
        if (editingId === formId) setEditingId(null);
        onDelete(formId);
    }, [editingId, onDelete]);

    return (
        <div className="space-y-8 mb-10">
            {/* The List Header */}
            <SettingsHeader label={data.title} onAddNew={onAddNew} />

            <div className="border-b pb-2">
                <h2 className="text-2xl font-bold">{data.title}</h2>
                {data.description && (
                    <p className="text-gray-500 mt-1">{data.description}</p>
                )}
            </div>

            {(activeForm) && (
                <SettingsForm 
                    key={activeForm.id}
                    data={activeForm}
                    values={activeValues} 
                    onChange={onChange}
                    onCancel={onCancel}
                />
            )}

            {/* Render the inner forms */}
            {data.reorderable ? (
                <ReorderableSettingsFormWrapper
                    data={data}
                    values={formData}
                    onReorder={onReorder}
                    onEdit={onEdit}
                    onDelete={handleDelete}
                    onSaveOrder={onSaveOrder}
                    isReordered={isReordered}
                />
            ) : (
                <>
                {data.forms.map((form) => {
                    if (form.id === editingId) return null;
                    return (
                        <SettingsFormWrapper
                            key={form.id}
                            data={form}
                            onEdit={onEdit}
                            onDelete={handleDelete}
                        />
                    );
                })}
                </>
            )}
        </div>
    );
});

interface SettingsHeaderProps {
    label: string;
    onAddNew: () => void;
}

/**
 * The header for a settings form list, with a add button.
 */
export const SettingsHeader: React.FC<SettingsHeaderProps> = memo(({ label, onAddNew }) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{label}</h3>
            <button
                className="flex items-center gap-1 text-foreground bg-accent px-3 py-1.5 rounded-md hover:bg-accent/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={onAddNew}
            >
                <Plus className="w-4 h-4" />
                <span>New {label}</span>
            </button>
        </div>
    );
});

/**
 * A wrapper around BaseSettingsFormList that a full description and enables the whole 
 * FormList to be collapsible.
 */
export const SettingsFormList = memo(({ data, formData, onChange, onReorder, onDelete, onSaveOrder, isReordered }: SettingsFormListProps) => {
	const [isOpen, setIsOpen] = useState(data.defaultOpen || false);
	const contentId = useId();

	return (
		<motion.div
			className="group/section"
			initial={{ opacity: 0, y: 10 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.4 }}
		>
			<div className="bg-card border border-border/50 rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
				{/* Header Section */}
				<button
					className="w-full text-left p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white focus:bg-accent/5 transition-colors group/header"
					onClick={() => setIsOpen(!isOpen)}
					aria-expanded={isOpen}
					aria-controls={contentId}
				>
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary transition-colors duration-300 group-hover/section:bg-primary/10 group-header:border-primary/30">
                                {
                                    data.icon == 'Bell' ? (
                                        <Bell size={20} />
                                    ) : data.icon == 'Shield' ? (
                                        <Shield size={20} />
                                    ) : data.icon == 'User' ? (
                                        <User size={20} />
                                    ) : data.icon == 'Code' ? (
                                        <Code size={20} />
                                    ) : data.icon == 'Database' ? (
                                        <Database size={20} />
                                    ) : data.icon == 'FileCode' ? (
                                        <FileCode size={20} />
                                    ) : data.icon == 'Lock' ? (
                                        <Lock size={20} />
                                    ) : (
                                        <Shield size={20} />
                                    )
                                }
    							</div>
							<div>
								<h2 className="text-lg font-bold tracking-tight text-foreground transition-colors group-header:text-primary">
									{data.title}
								</h2>
								{data.description && (
									<p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
										{data.description}
									</p>
								)}
							</div>
						</div>
						
						<div
							className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
								${isOpen 
									? 'bg-primary text-primary-foreground' 
									: 'bg-accent/50 text-foreground/70 group-hover/header:bg-accent group-hover/header:text-foreground'}
							`}
						>
							<motion.div
								animate={{ rotate: isOpen ? 180 : 0 }}
								transition={{ duration: 0.3 }}
							>
								<ChevronDown size={16} />
							</motion.div>
							<span>{isOpen ? 'Close' : 'Configure'}</span>
						</div>
					</div>
				</button>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							id={contentId}
						>
							<div className="border-t border-border/50 p-6 bg-accent/10">
								<motion.div
									initial={{ y: 5, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ duration: 0.2 }}
								>
                                    <BaseSettingsFormList
                                        data={data}
                                        formData={formData}
                                        onChange={onChange}
                                        onReorder={onReorder}
                                        onDelete={onDelete}
                                        onSaveOrder={onSaveOrder}
                                        isReordered={isReordered}
                                    />
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
});