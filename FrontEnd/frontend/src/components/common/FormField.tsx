import { forwardRef } from "react";
import type {
	InputHTMLAttributes,
	SelectHTMLAttributes,
	TextareaHTMLAttributes,
} from "react";

interface BaseProps {
	label?: string;
	error?: string;
	required?: boolean;
	className?: string;
	labelWidth?: string;
	inline?: boolean;
}

type InputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type SelectProps = BaseProps &
	SelectHTMLAttributes<HTMLSelectElement> & {
		options: { value: string; label: string }[];
	};
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const inputClass =
	"border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 bg-white";
const labelClass = "text-sm font-medium text-gray-700";
const errorClass = "text-xs text-red-600 mt-0.5";

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			required,
			className = "", // Este className agora vai para a DIV
			inline = false,
			labelWidth,
			...props
		},
		ref,
	) => {
		const wrapper = inline
			? "flex items-center gap-2"
			: "flex flex-col gap-0.5";

		return (
			/* AQUI: Adicionei o className na div pai */
			<div className={`${wrapper} ${className}`}>
				{label && (
					<label
						className={labelClass}
						style={
							labelWidth ? { minWidth: labelWidth } : undefined
						}
					>
						{label}
						{required && (
							<span className="text-red-500 ml-0.5">*</span>
						)}
					</label>
				)}
				<div className="flex-1">
					<input
						ref={ref}
						/* AQUI: Removi o ${className} daqui para não duplicar estilos */
						className={inputClass}
						{...props}
					/>
					{error && <p className={errorClass}>{error}</p>}
				</div>
			</div>
		);
	},
);
FormInput.displayName = "FormInput";

export const FormSelect = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			error,
			required,
			options,
			className = "",
			inline = false,
			labelWidth,
			...props
		},
		ref,
	) => {
		const wrapper = inline
			? "flex items-center gap-2"
			: "flex flex-col gap-0.5";
		return (
			<div className={wrapper}>
				{label && (
					<label
						className={labelClass}
						style={
							labelWidth ? { minWidth: labelWidth } : undefined
						}
					>
						{label}
						{required && (
							<span className="text-red-500 ml-0.5">*</span>
						)}
					</label>
				)}
				<div className="flex-1">
					<select
						ref={ref}
						className={`${inputClass} ${className}`}
						{...props}
					>
						{options.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
					{error && <p className={errorClass}>{error}</p>}
				</div>
			</div>
		);
	},
);
FormSelect.displayName = "FormSelect";

export const FormTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			label,
			error,
			required,
			className = "",
			inline = false,
			labelWidth,
			...props
		},
		ref,
	) => {
		const wrapper = inline
			? "flex items-start gap-2"
			: "flex flex-col gap-0.5";
		return (
			<div className={wrapper}>
				{label && (
					<label
						className={labelClass}
						style={
							labelWidth ? { minWidth: labelWidth } : undefined
						}
					>
						{label}
						{required && (
							<span className="text-red-500 ml-0.5">*</span>
						)}
					</label>
				)}
				<div className="flex-1">
					<textarea
						ref={ref}
						className={`${inputClass} ${className}`}
						rows={3}
						{...props}
					/>
					{error && <p className={errorClass}>{error}</p>}
				</div>
			</div>
		);
	},
);
FormTextarea.displayName = "FormTextarea";

export function FormSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<fieldset className="border border-gray-200 rounded p-3 mb-0">
			<legend className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
				{title}
			</legend>
			<div className="grid gap-2">{children}</div>
		</fieldset>
	);
}

export function FormRow({
	children,
	cols = 2,
}: {
	children: React.ReactNode;
	cols?: number;
}) {
	// Mapeamento necessário para o Tailwind identificar as classes
	const gridCols =
		{
			1: "grid-cols-1",
			2: "grid-cols-2",
			3: "grid-cols-3",
			4: "grid-cols-4",
			5: "grid-cols-5",
			6: "grid-cols-6",
			7: "grid-cols-7",
		}[cols] || "grid-cols-2";

	return (
		<div className={`grid ${gridCols} gap-3 items-start`}>{children}</div>
	);
}
