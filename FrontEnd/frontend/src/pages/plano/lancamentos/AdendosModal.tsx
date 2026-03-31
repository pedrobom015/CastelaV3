/**
 * AdendosModal — wrapper modal para o AdendosPanel.
 */
import { useState } from "react";
import { Modal } from "../../../components/common/Modal";
import { Btn } from "../../../components/common/PageHeader";
import { AdendosPanel } from "../../../components/common/AdendosPanel";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	codigo: string;
	nomeContrato: string;
}

export function AdendosModal({ isOpen, onClose, codigo, nomeContrato }: Props) {
	const codigoPad = String(codigo).padStart(9, "0");
	const [navButtons, setNavButtons] = useState<React.ReactNode>(null);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={
				<div className="flex flex-col leading-tight">
					<span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">
						Adicionar Produto / Serviço
					</span>
					<span className="text-sm font-semibold">
						{codigoPad} — {nomeContrato}
					</span>
				</div>
			}
			footer={
				<div className="flex items-center justify-between w-full">
					<Btn variant="secondary" onClick={onClose}>
						Fechar
					</Btn>
					<div className="flex gap-2">{navButtons}</div>
				</div>
			}
		>
			<AdendosPanel
				codigo={codigo}
				hideList
				onFooterChange={setNavButtons}
			/>
		</Modal>
	);
}
