/**
 * AdendosModal — wrapper modal para o AdendosPanel.
 */
import { Modal } from '../../../components/common/Modal'
import { Btn } from '../../../components/common/PageHeader'
import { AdendosPanel } from '../../../components/common/AdendosPanel'

interface Props {
  isOpen: boolean
  onClose: () => void
  codigo: string
  nomeContrato: string
}

export function AdendosModal({ isOpen, onClose, codigo, nomeContrato }: Props) {
  const codigoPad = String(codigo).padStart(9, '0')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-normal opacity-70 uppercase tracking-wider">Adendos do Contrato</span>
          <span className="text-sm font-semibold">{codigoPad} — {nomeContrato}</span>
        </div>
      }
      footer={<Btn variant="secondary" onClick={onClose}>Fechar</Btn>}
    >
      <AdendosPanel codigo={codigo} />
    </Modal>
  )
}
