/**
 * BuscaContrato — busca inteligente por código, CPF ou nome
 * Detecta automaticamente o tipo de entrada e filtra GRUPOS.
 */
import { useState, useMemo } from "react";
import { useAppStore } from "../../store/appStore";

export interface ContratoResumido {
	codigo: string;
	nome: string;
	cpf: string;
	telefone: string;
	grupo: string;
	cobrador: string;
	situacao: string;
}

interface Props {
	onSelecionar: (contrato: ContratoResumido) => void;
	disabled?: boolean;
}

export function BuscaContrato({ onSelecionar, disabled }: Props) {
	const { getTable } = useAppStore();
	const [query, setQuery] = useState("");

	const resultados = useMemo<ContratoResumido[]>(() => {
		const q = query.trim();
		if (q.length < 2) return [];

		const gruposTable = getTable("grupos");
		if (!gruposTable) return [];

		const soDigitos = q.replace(/\D/g, "");
		const upper = q.toUpperCase();

		return gruposTable.records
			.filter((r) => {
				if (r._deleted) return false;
				const codigo = String(r.codigo ?? "").trim();
				const nome = String(r.nome ?? "").toUpperCase();
				const cpf = String(r.cpf ?? "").replace(/\D/g, "");
				const telefone = String(r.telefone ?? "");

				// Código exato (começa com os dígitos digitados)
				if (
					soDigitos.length >= 1 &&
					/^\d+$/.test(q) &&
					codigo.startsWith(
						soDigitos.padStart(
							codigo.length > 0 ? soDigitos.length : 1,
							"0",
						),
					)
				)
					return true;
				// CPF parcial
				if (soDigitos.length >= 6 && cpf.includes(soDigitos))
					return true;
				// Telefone
				if (
					soDigitos.length >= 6 &&
					telefone.replace(/\D/g, "").includes(soDigitos)
				)
					return true;
				// Nome parcial
				if (q.length >= 3 && nome.includes(upper)) return true;
				return false;
			})
			.slice(0, 30)
			.map((r) => ({
				codigo: String(r.codigo ?? "").trim(),
				nome: String(r.nome ?? "").trim(),
				cpf: String(r.cpf ?? "").trim(),
				telefone: String(r.telefone ?? "").trim(),
				grupo: String(r.grupo ?? "").trim(),
				cobrador: String(r.cobrador ?? "").trim(),
				situacao: String(r.situacao ?? "").trim(),
			}));
	}, [query, getTable]);

	function handleSelecionar(c: ContratoResumido) {
		setQuery(c.codigo + " — " + c.nome);
		onSelecionar(c);
	}

	return (
		<div className="relative">
			<input
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				disabled={disabled}
				placeholder="Buscar por código, CPF ou nome..."
				className="w-full border rounded px-3 py-1.5 text-sm disabled:bg-gray-100"
			/>
			{resultados.length > 0 && (
				<div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-56 ">
					{resultados.map((c, i) => (
						<div
							key={i}
							onClick={() => handleSelecionar(c)}
							className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
						>
							<span className="font-mono text-xs text-gray-500 w-14 shrink-0">
								{c.codigo}
							</span>
							<span className="font-medium text-sm flex-1 truncate">
								{c.nome}
							</span>
							<span className="text-xs text-gray-400 shrink-0">
								{c.cpf || "—"}
							</span>
							<span
								className={`text-xs px-1 rounded font-bold shrink-0 ${c.situacao === "A" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
							>
								{c.situacao}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
