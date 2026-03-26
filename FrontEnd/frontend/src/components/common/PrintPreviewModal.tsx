import { useRef } from "react";
import { Modal } from "./Modal";
import { Btn } from "./PageHeader";

interface PrintPreviewModalProps {
	html: string | null;
	onClose: () => void;
	title?: string;
}

export function PrintPreviewModal({
	html,
	onClose,
	title = "Prévia de Impressão",
}: PrintPreviewModalProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	function handlePrint() {
		iframeRef.current?.contentWindow?.print();
		onClose();
	}

	return (
		<Modal
			isOpen={html !== null}
			onClose={onClose}
			title={title}
			size="lg"
			fixedHeight
			plainHeader
			noPadding
			footer={
				<>
					<Btn variant="secondary" onClick={onClose}>
						Fechar
					</Btn>
					<Btn icon="🖨️" onClick={handlePrint}>
						Confirmar Impressão
					</Btn>
				</>
			}
		>
			{html && (
				<div className="w-full h-full overflow-auto bg-gray-200 flex justify-center">
					<iframe
						ref={iframeRef}
						srcDoc={html}
						className="border-0 bg-white shadow"
						style={{
							width: 680,
							minWidth: 600,
							minHeight: 480,
							height: "100%",
						}}
						title="Prévia de Impressão"
					/>
				</div>
			)}
		</Modal>
	);
}
