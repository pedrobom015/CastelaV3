import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import { getActiveModule, filterDevItems } from "../../config/modules";
import type { MenuItem } from "../../config/modules";

/** Retorna true se o item (ou qualquer filho) contém a rota atual */
function menuContainsPath(item: MenuItem, pathname: string): boolean {
	if (item.path && pathname.startsWith(item.path)) return true;
	return item.children?.some((c) => menuContainsPath(c, pathname)) ?? false;
}

interface DropdownProps {
	items: MenuItem[];
	depth?: number;
	onClose: () => void;
	pathname: string;
}

const Z_INDEXES = ["z-50", "z-[60]", "z-[70]", "z-[80]"];

function Dropdown({ items, depth = 0, onClose, pathname }: DropdownProps) {
	const navigate = useNavigate();
	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const [flipLeft, setFlipLeft] = useState(false);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	// posição vertical do item hovered para alinhar o filho
	const [childTop, setChildTop] = useState(0);

	useEffect(() => {
		if (!ref.current) return;
		const rect = ref.current.getBoundingClientRect();
		if (rect.right > window.innerWidth - 8) setFlipLeft(true);
	}, []);

	const handleOpen = useCallback((idx: number, el: HTMLElement) => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
		const containerTop = ref.current?.getBoundingClientRect().top ?? 0;
		const itemTop = el.getBoundingClientRect().top - containerTop - 1;
		setChildTop(itemTop);
		setHoveredIdx(idx);
	}, []);

	const scheduleClose = useCallback(() => {
		closeTimer.current = setTimeout(() => setHoveredIdx(null), CLOSE_DELAY);
	}, []);

	const cancelClose = useCallback(() => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
	}, []);

	const zClass = Z_INDEXES[Math.min(depth, Z_INDEXES.length - 1)];
	const zChild = Z_INDEXES[Math.min(depth + 1, Z_INDEXES.length - 1)];
	const hasChild = hoveredIdx !== null && !!items[hoveredIdx]?.children;

	return (
		<div
			ref={ref}
			className={`absolute bg-white border border-gray-200 shadow-lg min-w-48 ${zClass} ${
				depth > 0
					? `border-l-2 border-l-blue-900 ${flipLeft ? "right-full top-0 -mt-1" : "left-full top-0 -mt-1"}`
					: "top-full right-0 -mt-px border-t-2 border-t-blue-900"
			}`}
		>
			<div>
				{items.map((item, idx) => {
					const isActive = item.path
						? pathname.startsWith(item.path)
						: (item.children?.some((c) =>
								menuContainsPath(c, pathname),
							) ?? false);
					return (
						<div
							key={idx}
							className="relative"
							onMouseEnter={(e) =>
								handleOpen(idx, e.currentTarget)
							}
							onMouseLeave={scheduleClose}
						>
							<button
								className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-4 whitespace-nowrap transition-colors
									${isActive ? "bg-blue-50 text-blue-900 font-semibold" : "text-gray-800"}
									hover:bg-blue-900 hover:!text-white`}
								onClick={() => {
									if (item.path) {
										navigate(item.path);
										onClose();
									}
								}}
							>
								<span className="flex items-center gap-1.5">
									{isActive && (
										<span className="text-blue-900 text-xs leading-none">
											▸
										</span>
									)}
									{item.label}
								</span>
								{item.children && (
									<span className="text-xs">▶</span>
								)}
							</button>
						</div>
					);
				})}
			</div>

			{hasChild && (
				<div
					className={`absolute ${zChild} ${flipLeft ? "right-full" : "left-full"}`}
					style={{ top: childTop }}
					onMouseEnter={cancelClose}
					onMouseLeave={scheduleClose}
				>
					<Dropdown
						items={items[hoveredIdx!].children!}
						depth={depth + 1}
						onClose={onClose}
						pathname={pathname}
					/>
				</div>
			)}
		</div>
	);
}

const CLOSE_DELAY = 400;

export function TopNav() {
	const [openMenu, setOpenMenu] = useState<number | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const location = useLocation();
	const { usuario } = useAppStore();
	void usuario;
	const activeMod = getActiveModule(location.pathname);
	const moduleTitle = activeMod?.label ?? "";
	const menuItems = filterDevItems(activeMod?.menu ?? []);

	const scheduleTopClose = () => {
		closeTimer.current = setTimeout(() => setOpenMenu(null), CLOSE_DELAY);
	};
	const cancelTopClose = () => {
		if (closeTimer.current) clearTimeout(closeTimer.current);
	};

	return (
		<nav className="z-[2] cursor-grab active:cursor-grabbing bg-gray-50 text-gray-600 select-none h-9 flex items-center border-b border-gray-200">
			<div className="flex items-center justify-between px-[5px] w-full">
				{/* Módulo ativo à esquerda */}
				{moduleTitle && (
					<span className="px-4 text-xs font-semibold uppercase tracking-widesttext-gray-400">
						{moduleTitle}
					</span>
				)}

				{/* Menus à direita */}
				<div className="flex ml-auto">
					{menuItems.map((item, idx) => {
						const isMenuActive =
							openMenu !== idx &&
							(item.children?.some((c) =>
								menuContainsPath(c, location.pathname),
							) ??
								false);
						return (
							<div
								key={idx}
								className="relative"
								onMouseLeave={scheduleTopClose}
								onMouseEnter={() => {
									cancelTopClose();
									setOpenMenu(idx);
								}}
							>
								<button
									className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 hover:bg-blue-900 hover:text-white ${
										openMenu === idx
											? "bg-blue-900 text-white"
											: isMenuActive
												? "text-blue-900"
												: ""
									}`}
									onMouseEnter={() => {
										cancelTopClose();
										setOpenMenu(idx);
									}}
									onClick={() => setOpenMenu(idx)}
								>
									{item.label}
									{isMenuActive && (
										<span className="text-[10px] leading-none">
											▾
										</span>
									)}
								</button>
								{item.children && openMenu === idx && (
									<Dropdown
										items={item.children}
										onClose={() => setOpenMenu(null)}
										pathname={location.pathname}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</nav>
	);
}
