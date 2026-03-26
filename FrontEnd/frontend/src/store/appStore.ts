import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get as idbGet, set as idbSet, del } from "idb-keyval";
import type { DbfTable } from "../services/dbf/DbfReader";

// Chave IDB separada para o FileSystemDirectoryHandle (não passa por JSON)
const DIR_HANDLE_IDB_KEY = 'adp-dir-handle-native'

// 1. Interface do Estado
interface AppState {
	dirHandle: FileSystemDirectoryHandle | null;
	dirPath: string;
	tables: Map<string, DbfTable>;
	loading: boolean;
	loadProgress: number;
	loadMessage: string;
	usuario: string;
	nivelop: number;
	parametros: Record<string, string | number> | null;

	setDirHandle: (handle: FileSystemDirectoryHandle, path: string) => void;
	restoreDirHandle: () => Promise<void>;
	setTable: (name: string, table: DbfTable) => void;
	setTables: (tables: Map<string, DbfTable>) => void;
	setLoading: (loading: boolean, progress?: number, message?: string) => void;
	setUsuario: (usuario: string, nivel: number) => void;
	setParametros: (params: Record<string, string | number>) => void;
	getTable: (name: string) => DbfTable | undefined;
	clearAll: () => void;
}

// 2. Adaptador IndexedDB (idb-keyval)
const idbStorage = {
	getItem: async (name: string) => (await idbGet(name)) || null,
	setItem: async (name: string, value: any) => await idbSet(name, value),
	removeItem: async (name: string) => await del(name),
};

// 3. Store com persistência e correção de Map
export const useAppStore = create<AppState>()(
	persist(
		(set, get) => ({
			dirHandle: null,
			dirPath: "",
			tables: new Map(),
			loading: false,
			loadProgress: 0,
			loadMessage: "",
			usuario: "",
			nivelop: 0,
			parametros: null,

			setDirHandle: (handle, path) => {
				set({ dirHandle: handle, dirPath: path })
				// Salva a handle diretamente no IDB sem JSON (structured clone nativo)
				idbSet(DIR_HANDLE_IDB_KEY, handle)
			},

			restoreDirHandle: async () => {
				try {
					const handle = await idbGet(DIR_HANDLE_IDB_KEY) as FileSystemDirectoryHandle | undefined
					// Valida que é uma handle real com o método entries
					if (!handle || typeof handle.entries !== 'function') return
					// Solicita permissão — pode exigir gesto do usuário em alguns browsers
					let perm = await handle.queryPermission({ mode: 'readwrite' })
					if (perm === 'prompt') {
						perm = await handle.requestPermission({ mode: 'readwrite' })
					}
					if (perm === 'granted') {
						set({ dirHandle: handle })
					}
				} catch {
					// handle expirada ou inválida — ignora
				}
			},

			setTable: (name, table) => {
				const tables = new Map(get().tables);
				tables.set(name.toLowerCase(), table);
				set({ tables });
			},

			setTables: (tables) => set({ tables }),

			setLoading: (loading, progress = 0, message = "") =>
				set({ loading, loadProgress: progress, loadMessage: message }),

			setUsuario: (usuario, nivelop) => set({ usuario, nivelop }),

			setParametros: (parametros) => set({ parametros }),

			// Proteção contra o erro ".get is not a function"
			getTable: (name) => {
				const state = get();
				if (!state.tables) return undefined;

				// Se por algum motivo ainda for um objeto literal, acessa como chave
				if (!(state.tables instanceof Map)) {
					return (state.tables as any)[name.toLowerCase()];
				}

				return state.tables.get(name.toLowerCase());
			},

			clearAll: () =>
				set({
					dirHandle: null,
					dirPath: "",
					tables: new Map(),
					usuario: "",
					nivelop: 0,
					parametros: null,
				}),
		}),
		{
			name: "adp-storage",
			storage: createJSONStorage(() => idbStorage),

			// dirHandle EXCLUÍDO do persist — FileSystemDirectoryHandle não é
			// JSON-serializável. Seria restaurado como {} sem métodos.
			// É armazenado via idbSet(DIR_HANDLE_IDB_KEY) e restaurado por restoreDirHandle()
			partialize: (state) => ({
				dirPath: state.dirPath,
				usuario: state.usuario,
				nivelop: state.nivelop,
				tables: Object.fromEntries(state.tables),
			}),

			// Converte Objeto -> Map ao carregar + garante dirHandle nunca vira {}
			onRehydrateStorage: () => (state) => {
				if (!state) return
				// Garante que dirHandle nunca fica como objeto quebrado vindo de versão antiga
				state.dirHandle = null
				if (state.tables && !(state.tables instanceof Map)) {
					state.tables = new Map(Object.entries(state.tables as Record<string, DbfTable>))
				}
			},
		},
	),
);
