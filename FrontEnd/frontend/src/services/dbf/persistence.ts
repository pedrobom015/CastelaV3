// src/services/dbf/persistence.ts
import { get, set } from "idb-keyval";

const IDB_KEY = "dir-handle";

export async function saveHandle(handle: FileSystemDirectoryHandle) {
	await set(IDB_KEY, handle);
}

export async function getStoredHandle() {
	const handle = await get<FileSystemDirectoryHandle>(IDB_KEY);
	if (!handle) return null;

	// Verifica se já temos permissão (após refresh o status volta para 'prompt')
	const options = { mode: "readwrite" as FileSystemPermissionMode };
	if ((await handle.queryPermission(options)) === "granted") {
		return handle;
	}
	return handle; // Retorna o handle para pedir permissão depois
}
