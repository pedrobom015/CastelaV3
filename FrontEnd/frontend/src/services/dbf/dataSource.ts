/**
 * dataSource.ts
 * Ponto único de carregamento de dados do app.
 *
 * VITE_MODE_DEMO=true  → carrega do backend Python (/api/tables/*)
 * (padrão)             → comportamento original: fetch /dados-teste/*.DBF
 */
import type { DbfTable } from './DbfReader'
import { loadDadosTeste } from './DbfReader'
import { loadAllFromBackend } from './backendLoader'

const IS_DEMO = import.meta.env.VITE_MODE_DEMO === 'true'

/**
 * Handle fictício injetado no store em modo demo para que os guards
 * `if (!dirHandle)` dos componentes não bloqueiem operações de escrita.
 * writeDbfFile verifica IS_DEMO antes de tentar usar o handle.
 */
export const DEMO_DIR_HANDLE = { name: 'backend', kind: 'directory' } as unknown as FileSystemDirectoryHandle

export async function loadTables(
  onProgress?: (loaded: number, total: number, name: string) => void,
): Promise<Map<string, DbfTable>> {
  if (IS_DEMO) {
    console.info('[dataSource] VITE_MODE_DEMO=true — carregando do backend')
    return loadAllFromBackend(onProgress)
  }
  return loadDadosTeste(onProgress)
}
