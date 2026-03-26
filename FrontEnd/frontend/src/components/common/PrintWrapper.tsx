import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

interface PrintWrapperProps {
  children: React.ReactNode
  title?: string
  buttonLabel?: string
  buttonClassName?: string
  landscape?: boolean
}

export function PrintWrapper({
  children,
  title,
  buttonLabel = 'Imprimir',
  buttonClassName = '',
  landscape = false,
}: PrintWrapperProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: title ?? 'Relatório ADP',
    pageStyle: `
      @page {
        size: ${landscape ? 'A4 landscape' : 'A4 portrait'};
        margin: 15mm;
      }
      @media print {
        body { font-size: 10pt; font-family: 'Courier New', monospace; }
        .no-print { display: none !important; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #999; padding: 2px 4px; font-size: 9pt; }
        th { background-color: #e5e7eb !important; -webkit-print-color-adjust: exact; }
      }
    `,
  })

  return (
    <div>
      <div className="no-print flex justify-end mb-3 gap-2">
        <button
          onClick={handlePrint}
          className={`px-4 py-2 bg-blue-900 text-white text-sm rounded hover:bg-blue-800 flex items-center gap-2 ${buttonClassName}`}
        >
          🖨️ {buttonLabel}
        </button>
      </div>
      <div ref={contentRef}>
        {title && (
          <div className="text-center mb-4">
            <h1 className="text-base font-bold uppercase">{title}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
