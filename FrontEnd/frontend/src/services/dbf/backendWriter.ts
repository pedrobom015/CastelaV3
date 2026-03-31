/**
 * backendWriter.ts
 * Funções de escrita no backend Python (modo demo).
 * Intencionalmente sem imports de DbfReader para evitar dependência circular.
 */
import type { DbfRecord } from "../../types/models";

const BACKEND_URL =
	(import.meta.env.VITE_BACKEND_URL as string | undefined) ?? "/api";

export async function saveTableToBackend(
	tableName: string,
	records: DbfRecord[],
): Promise<void> {
	const name = tableName.replace(/\.DBF$/i, "").toUpperCase();
	const serialized = records.map((rec) => {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(rec)) {
			out[k] = v instanceof Date ? v.toISOString().slice(0, 10) : v;
		}
		return out;
	});

	const res = await fetch(`${BACKEND_URL}/tables/${name}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ records: serialized }),
	});

	if (res.status === 403) {
		window.dispatchEvent(new CustomEvent("session-expired"));
		return;
	}

	if (!res.ok) {
		const err = (await res.json().catch(() => ({}))) as { detail?: string };
		throw new Error(err.detail ?? `Erro ${res.status} ao salvar ${name}`);
	}
}
