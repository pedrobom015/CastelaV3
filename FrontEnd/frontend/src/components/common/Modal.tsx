import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Contexto que expõe o painel da modal atual para filhas aninhadas
const ModalPanelContext = createContext<HTMLDivElement | null>(null);

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: React.ReactNode;
	children: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	footer?: React.ReactNode;
	fixedHeight?: boolean;
	noMinHeight?: boolean;
	hideHeader?: boolean;
	plainHeader?: boolean;
	noPadding?: boolean;
	headerExtra?: React.ReactNode;
	zIndex?: number;
}

const sizeClasses = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-2xl",
	xl: "max-w-5xl",
	full: "max-w-7xl",
};

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	footer,
	fixedHeight,
	noMinHeight,
	hideHeader,
	plainHeader,
	noPadding,
	headerExtra,
	zIndex = 100,
}: ModalProps) {
	const parentPanel = useContext(ModalPanelContext);
	const backdropRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [, forceRender] = useState(0);
	const [visible, setVisible] = useState(false);

	// força re-render após montar para expor panelRef.current via context
	useEffect(() => {
		forceRender((n) => n + 1);
	}, [isOpen]);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		if (isOpen) {
			document.addEventListener("keydown", handleKey);
			if (!parentPanel) document.body.style.overflow = "hidden";
			requestAnimationFrame(() => setVisible(true));
		} else {
			setVisible(false);
		}
		return () => {
			document.removeEventListener("keydown", handleKey);
			if (!parentPanel) document.body.style.overflow = "";
		};
	}, [isOpen, onClose, parentPanel]);

	if (!isOpen) return null;

	// Modal aninhada: backdrop cobre apenas o painel pai (position: absolute)
	const isNested = !!parentPanel;

	const panel = (
		<div
			ref={panelRef}
			className={`bg-white rounded-md shadow-xl w-full ${sizeClasses[size]} flex flex-col ${fixedHeight ? "h-full" : "h-[500px]"} ${noMinHeight ? "" : "min-h-[50vh]"}`}
			style={{
				opacity: visible ? 1 : 0,
				transform: visible
					? "translateY(0) scale(1)"
					: "translateY(16px) scale(0.98)",
				transition: "opacity 220ms ease, transform 220ms ease",
			}}
		>
			{/* Header */}
			{!hideHeader &&
				(plainHeader ? (
					<div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white rounded-t-md">
						<span className="text-xs text-gray-500">{title}</span>
						<div className="flex items-center gap-2">
							{headerExtra}
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-gray-700 text-xl leading-none"
							>
								×
							</button>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between px-4 py-3 bg-blue-900 text-white rounded-md">
						<h2 className="text-base font-semibold uppercase tracking-wide">
							{title}
						</h2>
						<div className="flex items-center gap-3">
							{headerExtra}
							<button
								onClick={onClose}
								className="text-blue-200 hover:text-white text-xl leading-none"
							>
								×
							</button>
						</div>
					</div>
				))}

			{/* Body */}
			<div
				className={`flex-1 min-h-0 relative ${noPadding ? "overflow-hidden p-0" : `overflow-y-auto p-4 ${!hideHeader ? "pt-4" : "pt-10"}`}`}
			>
				{hideHeader && !noPadding && (
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none z-10"
					>
						×
					</button>
				)}
				<ModalPanelContext.Provider value={panelRef.current}>
					{children}
				</ModalPanelContext.Provider>
			</div>

			{/* Footer */}
			{footer && (
				<div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 rounded-b-lg">
					{footer}
				</div>
			)}
		</div>
	);

	if (isNested) {
		// Renderiza o backdrop sobre o painel pai, não sobre a tela toda
		const nestedContent = (
			<div
				ref={backdropRef}
				className="absolute inset-0 flex items-center justify-center p-4 rounded-md overflow-hidden"
				style={{
					zIndex,
					backgroundColor: visible
						? "rgba(0,0,0,0.45)"
						: "rgba(0,0,0,0)",
					transition: "background-color 200ms ease",
				}}
				onClick={(e) => e.target === backdropRef.current && onClose()}
			>
				{panel}
			</div>
		);
		return createPortal(nestedContent, parentPanel!);
	}

	const rootContent = (
		<div
			ref={backdropRef}
			className="fixed inset-0 flex items-center justify-center p-4"
			style={{
				zIndex,
				backgroundColor: visible ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
				transition: "background-color 200ms ease",
			}}
			onClick={(e) => e.target === backdropRef.current && onClose()}
		>
			{panel}
		</div>
	);

	return createPortal(rootContent, document.body);
}

export function ConfirmDialog({
	isOpen,
	onConfirm,
	onCancel,
	message,
	title = "Confirmação",
}: {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	message: string;
	title?: string;
}) {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onCancel}
			title={title}
			size="sm"
			footer={
				<>
					<button
						onClick={onCancel}
						className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
					>
						Não
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800"
					>
						Sim
					</button>
				</>
			}
		>
			<p className="text-gray-700">{message}</p>
		</Modal>
	);
}
