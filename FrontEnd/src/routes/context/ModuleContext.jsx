// src/context/ModuleContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import {
	Settings as SettingsIcon,
	Home as HomeIcon,
	Dashboard as DashboardIcon,
	Dashboard,
} from "@mui/icons-material";

const ModuleContext = createContext();

const ICON_MAP = {
	Plano: DashboardIcon,
	Configurações: SettingsIcon,
	Geral: HomeIcon,
	// adicione mais mapeamentos conforme precisar
};

export const ModuleProvider = ({ children }) => {
	const [permissions, setPermissions] = useState([]); // só os restantes por unidade
	const [allpermissions, setAllPermissions] = useState([]);
	const [activeModule, setActiveModule] = useState(null);
	const [activeSession, setActiveSession] = useState(null);
	const [hasModules, setIsModules] = useState(true);
	const [activePermissionContext, setActivePermissionContext] = useState([]);
	const [needsPermission, setNeedsPermission] = useState(false);
	const [sStatus, setsStatus] = useState(false);
	const [colorlb, setColorLevelBoard] = useState(false);
	const [gerais, setGerais] = useState([]); // combinados de todas unidades

	useEffect(() => {
		const mapGerais = new Map();
		const allperm = localStorage.getItem("permissions");
		const saved = localStorage.getItem("active_permission");

		if (!saved) return;

		try {
			const parsed = JSON.parse(saved);
			const allpermparsed = JSON.parse(allperm);
			if (!Array.isArray(parsed)) {
				console.warn(
					"permissions no localStorage não é um array:",
					parsed
				);
				setPermissions([]);
				return;
			}
			setAllPermissions(allpermparsed);

			let restantesMapped = [];

			for (const perm of allpermparsed) {
				// separar gerais e restantes dessa unidade
				const { gerais } = separarGeral(perm.modules);

				// acumula os gerais de todas as unidades
				for (const g of gerais) {
					// 🔑 A chave única para o módulo "Geral" continua sendo o ID (esperado ser 3)
					const key = g.id;

					if (mapGerais.has(key)) {
						// 🎯 MÓDULO JÁ EXISTE: Acumula os 'groups' (sessions) sem duplicar pelo 'resource'
						const existingGeral = mapGerais.get(key);
						const existingResources = new Set(
							existingGeral.sessions.map((s) => s.resource)
						);

						const newSessions = g.groups.filter(
							(newSession) =>
								!existingResources.has(newSession.resource)
						);

						existingGeral.sessions.push(...newSessions);
						// O 'unit' é atualizado para a última unidade que contribuiu (pode ser ajustado se necessário)
						existingGeral.unit = perm.system_unit_id;
						mapGerais.set(key, existingGeral);
					} else {
						// MÓDULO NOVO: Cria a entrada inicial no Map
						mapGerais.set(key, {
							id: g.id,
							label: g.name_module,
							icon: ICON_MAP[g.name_module] || null,
							sessions: g.groups,
							unit: perm.system_unit_id,
						});
					}
				}
			}

			for (const perm of parsed) {
				if (perm.modules.length !== 0) {
					setIsModules(true);
				} else {
					setIsModules(false);
				}

				// separar gerais e restantes dessa unidade
				const { restantes } = separarGeral(perm.modules);

				// acumula os restantes por unidade
				restantesMapped = restantesMapped.concat(
					restantes.map((m) => ({
						id: m.id,
						label: m.name_module,
						icon: ICON_MAP[m.name_module] || null,
						sessions: m.groups,
						unit: perm.system_unit_id,
					}))
				);
			}

			// ordena os restantes (Plano primeiro)
			restantesMapped.sort((a, b) => {
				if (a.label === "Plano") return -1;
				if (b.label === "Plano") return 1;
				return 0;
			});

			setPermissions(restantesMapped); // só os não gerais
			setGerais(Array.from(mapGerais.values())); // todos os gerais juntos
		} catch (err) {
			console.error("Erro ao parsear permissions do localStorage:", err);
			setPermissions([]);
			setGerais([]);
		}
	}, [activePermissionContext]);

	// separa gerais e restantes dentro de cada módulo
	function separarGeral(modules) {
		const gerais = [];
		const restantes = [];

		for (const mod of modules) {
			const geraisGroups = mod.groups.filter(
				(g) => g.resource_type === "geral"
			);
			const outrasGroups = mod.groups.filter(
				(g) => g.resource_type !== "geral"
			);

			if (geraisGroups.length > 0) {
				gerais.push({
					...mod,
					groups: geraisGroups,
				});
			}

			if (outrasGroups.length > 0) {
				restantes.push({
					...mod,
					groups: outrasGroups,
				});
			}
		}

		return { gerais, restantes };
	}

	return (
		<ModuleContext.Provider
			value={{
				permissions, // só restantes
				gerais, // combinados
				activeModule,
				setActiveModule,
				activeSession,
				hasModules,
				setIsModules,
				setActiveSession,
				setNeedsPermission,
				needsPermission,
				setActivePermissionContext,
				activePermissionContext,
				setPermissions,
				allpermissions,
				sStatus,
				setsStatus,
				setColorLevelBoard,
				colorlb,
				setGerais,
				gerais,
			}}
		>
			{children}
		</ModuleContext.Provider>
	);
};

export const useModule = () => useContext(ModuleContext);
