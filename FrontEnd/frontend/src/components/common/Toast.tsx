import { useEffect, useState } from "react";

type ToastType = "error" | "warning" | "success" | "info";

const CONFIG: Record<
	ToastType,
	{ bg: string; border: string; text: string; sub: string; icon: JSX.Element }
> = {
	error: {
		bg: "#fff5f5",
		border: "#fca5a5",
		text: "#991b1b",
		sub: "#b91c1c",
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
		),
	},
	warning: {
		bg: "#fffbeb",
		border: "#fcd34d",
		text: "#92400e",
		sub: "#b45309",
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		),
	},
	success: {
		bg: "#f0fdf4",
		border: "#86efac",
		text: "#14532d",
		sub: "#166534",
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
		),
	},
	info: {
		bg: "#eff6ff",
		border: "#93c5fd",
		text: "#1e3a8a",
		sub: "#1d4ed8",
		icon: (
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</svg>
		),
	},
};

interface ToastProps {
	message: string;
	type?: ToastType;
	duration?: number;
	onClose: () => void;
}

export function Toast({
	message,
	type = "error",
	duration = 4000,
	onClose,
}: ToastProps) {
	const [visible, setVisible] = useState(false);
	const [progress, setProgress] = useState(100);
	const cfg = CONFIG[type];

	// Mount animation
	useEffect(() => {
		const t = requestAnimationFrame(() => setVisible(true));
		return () => cancelAnimationFrame(t);
	}, []);

	// Progress bar + auto-close
	useEffect(() => {
		const start = Date.now();
		const interval = setInterval(() => {
			const elapsed = Date.now() - start;
			const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
			setProgress(remaining);
			if (remaining === 0) {
				clearInterval(interval);
				setVisible(false);
				setTimeout(onClose, 250);
			}
		}, 30);
		return () => clearInterval(interval);
	}, [duration, onClose]);

	const handleClose = () => {
		setVisible(false);
		setTimeout(onClose, 250);
	};

	// Parse message: lines starting with "• " become list items
	const lines = message.split("\n");
	const title = lines[0];
	const items = lines.slice(1).filter((l) => l.startsWith("• ")).map((l) => l.slice(2));

	return (
		<div
			style={{
				position: "fixed",
				top: 24,
				left: "50%",
				transform: `translateX(-50%) translateY(${visible ? 0 : -16}px)`,
				opacity: visible ? 1 : 0,
				transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
				zIndex: 9999,
				width: "min(440px, calc(100vw - 32px))",
				background: cfg.bg,
				border: `1px solid ${cfg.border}`,
				borderRadius: 14,
				boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
				overflow: "hidden",
			}}
			role="alert"
		>
			<div style={{ padding: "14px 16px 12px" }}>
				<div className="flex items-start gap-3">
					<div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
					<div className="flex-1 min-w-0">
						<p
							className="text-sm font-semibold leading-snug"
							style={{ color: cfg.text }}
						>
							{title}
						</p>
						{items.length > 0 && (
							<ul className="mt-1.5 space-y-0.5">
								{items.map((item, i) => (
									<li
										key={i}
										className="text-xs flex items-center gap-1.5"
										style={{ color: cfg.sub }}
									>
										<span
											className="w-1 h-1 rounded-full flex-shrink-0"
											style={{ background: cfg.sub }}
										/>
										{item}
									</li>
								))}
							</ul>
						)}
					</div>
					<button
						onClick={handleClose}
						className="flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
						style={{
							width: 24,
							height: 24,
							color: cfg.text,
							opacity: 0.5,
						}}
						onMouseEnter={(e) =>
							((e.currentTarget as HTMLElement).style.opacity = "1")
						}
						onMouseLeave={(e) =>
							((e.currentTarget as HTMLElement).style.opacity = "0.5")
						}
					>
						<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			</div>

			{/* Progress bar */}
			<div style={{ height: 3, background: `${cfg.border}55` }}>
				<div
					style={{
						height: "100%",
						width: `${progress}%`,
						background: cfg.border,
						transition: "width 0.03s linear",
					}}
				/>
			</div>
		</div>
	);
}
