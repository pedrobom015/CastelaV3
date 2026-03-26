import React, { use, useEffect, useRef, useState } from "react";
import {
	List,
	Datagrid,
	TextField,
	TopToolbar,
	useCreate,
	useUpdate,
	useNotify,
	TextInput,
	SimpleForm,
	Toolbar,
	SaveButton,
	required,
	useRefresh,
	Create,
	FunctionField,
	useInput,
	useGetOne,
	useGetList,
	InfiniteList,
} from "react-admin";

import {
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	Button,
	IconButton,
	useMediaQuery,
	Typography,
	Checkbox,
	FormGroup,
	FormControlLabel,
	Select,
	MenuItem,
	Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ModuleSessionInfo from "../components/layout/ModuleSessionInfo";
import { useModule } from "../routes/context/ModuleContext";

const ListActions = ({ onOpenCreate, isMobile, canCreate, resData }) => (
	<TopToolbar>
		<ModuleSessionInfo data={resData} />
		{!isMobile && canCreate && (
			<Button size="small" variant="contained" onClick={onOpenCreate}>
				Nova permissao
			</Button>
		)}
	</TopToolbar>
);

// --- TOOLBAR PERSONALIZADA ---
const CustomToolbar = ({ onClose }) => (
	<Toolbar
		sx={{ display: "flex", justifyContent: "flex-end", paddingRight: 0 }}
	>
		<SaveButton alwaysEnable />
		<Button style={{ marginLeft: 8 }} onClick={onClose}>
			Cancelar
		</Button>
	</Toolbar>
);

// --- LISTAGEM COM CREATE + EDIT EM MODAL ---
export const PermissionList = ({ resourceData }) => {
	const [openCreate, setOpenCreate] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const isMobile = useMediaQuery("(max-width:750px)");

	const { gerais, permissions } = useModule();

	const permissionsArray = Array.isArray(permissions)
		? permissions
		: [permissions];

	// 🔹 Primeiro tenta achar no permissionsArray
	let unitsGroup = permissionsArray
		?.flatMap((m) => m?.sessions)
		.find((s) => s?.resource === resourceData);

	// 🔹 Se não encontrar, tenta achar em gerais
	if (!unitsGroup && Array.isArray(gerais)) {
		unitsGroup = gerais
			?.flatMap((m) => m?.sessions)
			.find((s) => s?.resource === resourceData);
	}

	const canCreate = unitsGroup?.actions?.includes("create") ?? false;
	const canEdit = unitsGroup?.actions?.includes("edit") ?? false;
	const canDelete = unitsGroup?.actions?.includes("delete") ?? false;
	const canRead = unitsGroup?.actions?.includes("read") ?? false;

	return (
		canRead && (
			<Box
				sx={{
					paddingLeft: 2,
					paddingRight: 2,
				}}
			>
				<ListActions
					resData={resourceData}
					onOpenCreate={() => setOpenCreate(true)}
					isMobile={isMobile}
					canCreate={canCreate}
				/>
				<InfiniteList
					perPage={5}
					actions={false}
					sx={{ maxHeight: "30vh", overflowY: "auto" }}
				>
					<Datagrid rowClick={false} bulkActionButtons={canDelete}>
						<TextField
							source="permission_name"
							label="Nome do grupo de acesso"
						/>
						{resourceData.includes("licenses") ? (
							<TextField source="name" label="Unidade" />
						) : null}
						{canEdit && (
							<FunctionField
								label="Ações" // Isso cria o cabeçalho da coluna
								render={(record) => (
									<IconButton
										onClick={() => {
											setSelectedUser(record);
											setOpenEdit(true);
										}}
									>
										<EditIcon color="primary" />
									</IconButton>
								)}
							/>
						)}
					</Datagrid>
				</InfiniteList>

				{isMobile && canCreate && (
					<div
						style={{
							position: "absolute",
							right: "10px",
							bottom: "10px",
						}}
					>
						<IconButton
							size="large"
							sx={{
								color: "white",
								backgroundColor: "#ff914d",
							}}
							onClick={() => setOpenCreate(true)}
							// Você pode adicionar um tooltipe para acessibilidade
							title="Criar"
						>
							<AddIcon />
						</IconButton>
					</div>
				)}

				{/* MODAL DE CRIAÇÃO */}
				<Dialog
					open={openCreate}
					onClose={() => setOpenCreate(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle
						sx={{
							borderBottom: "1px solid #fff",
							padding: "10px",
							background: `radial-gradient(circle, #ff914d, #f0883eff)`,
							color: "#ffffffff",
							fontWeight: "600",
							fontSize: "1rem",
							display: "flex",
							justifyContent: "center",
							boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",

								paddingLeft: 20,
								paddingRight: 20,
								paddingBottom: 4,

								width: "100%",
							}}
						>
							<span
								style={{
									lineHeight: 0.5,
									marginRight: 6,
								}}
							>
								{"■▣"}
							</span>

							<span
								style={{
									lineHeight: 0.5,
								}}
							>
								{"✚"} {"Nova Permissao"}
							</span>
						</div>
					</DialogTitle>

					<DialogContent>
						<PermissionCreate
							onClose={() => setOpenCreate(false)}
							resourceData={resourceData}
						/>
					</DialogContent>
				</Dialog>

				{/* MODAL DE EDIÇÃO */}
				<Dialog
					open={openEdit}
					onClose={() => setOpenEdit(false)}
					maxWidth="sm"
					fullWidth
				>
					<DialogTitle
						sx={{
							borderBottom: "1px solid #fff",
							padding: "10px",
							background: `radial-gradient(circle, #ff914d, #f0883eff)`,
							color: "#ffffffff",
							fontWeight: "600",
							fontSize: "1rem",
							display: "flex",
							justifyContent: "center",
							marginBottom: 4,
							boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",

								paddingLeft: 20,
								paddingRight: 20,
								paddingTop: 4,
								paddingBottom: 4,

								width: "100%",
							}}
						>
							<span
								style={{
									lineHeight: 0.5,
									marginRight: 6,
								}}
							>
								{"■▣"}
							</span>

							<span
								style={{
									lineHeight: 0.5,
								}}
							>
								{"▤"} {"Editar Permissao"}
							</span>
						</div>
					</DialogTitle>
					<DialogContent>
						{selectedUser && (
							<PermissionEdit
								record={selectedUser}
								onClose={() => setOpenEdit(false)}
								resourceData={resourceData}
							/>
						)}
					</DialogContent>
				</Dialog>
			</Box>
		)
	);
};

// This is a custom component to handle the nested permissions
const ModulePermissionsInput = ({
	source,
	allModules,
	moduleStates,
	setModuleStates,
	newActions,
	setNewActions,
}) => {
	const { field } = useInput({ source, defaultValue: [] });
	const selectedModules = field.value || [];

	const [selectedModuleToAdd, setSelectedModuleToAdd] = React.useState("");

	useEffect(() => {
		if (!moduleStates?.groups || moduleStates?.groups?.length === 0) return;

		const currentModules = [...(selectedModules || [])];
		let newModules = [...currentModules];

		allModules.forEach((m) => {
			m.sessions.forEach((s) => {
				const matched = moduleStates.groups.find(
					(g) => g.id === s.section_id,
				);
				const exists = newModules.some((g) => g.id === m.id);

				if (matched) {
					setNewActions((prev) => {
						const existing = prev.find(
							(mod) => mod.moduleId === matched.id,
						);
						if (existing) {
							return prev.map((mod) =>
								mod.moduleId === matched.id
									? {
											...mod,
											actions: [
												...new Set([
													...mod.actions,
													...matched.actions,
												]),
											],
										}
									: mod,
							);
						} else {
							return [
								...prev,
								{
									moduleId: matched.id,
									actions: matched.actions,
								},
							];
						}
					});
					if (!exists) {
						newModules.push({
							id: m.id,
						});
					}
				}
			});
		});

		field.onChange(newModules);
	}, [moduleStates]);

	useEffect(() => {
		if (!newActions || newActions.length === 0) return;

		const currentModules = [...(selectedModules || [])];
		let updatedModules = [...currentModules];

		newActions.forEach((item) => {
			if (!item.moduleId) return; // proteção

			const idx = updatedModules.findIndex((m) => m.id === item.moduleId);

			if (idx !== -1) {
				// Atualiza
				updatedModules[idx] = {
					...updatedModules[idx],
					actions: item.actions,
				};
			} else if (item.actions?.length > 0) {
				// Só adiciona se realmente houver actions
				updatedModules.push({
					id: item.moduleId,
					actions: item.actions,
				});
			}
		});

		field.onChange(updatedModules);
	}, [newActions]);
	// Adiciona o módulo selecionado ao formulário

	const handleAddModule = () => {
		if (!selectedModuleToAdd) return;

		const moduleData = allModules?.find((m) => {
			return m.id === selectedModuleToAdd;
		});
		if (
			moduleData &&
			!selectedModules?.find((m) => m.id === moduleData.id)
		) {
			const newModules = [
				...selectedModules,
				{ id: moduleData.id, actions: [] },
			];

			field.onChange(newModules);
			setSelectedModuleToAdd("");
		}
	};

	const handleRemoveModule = (moduleId) => {
		if (!selectedModules || !allModules) return;

		// Remove da lista do formulário
		let newModules = selectedModules.filter((m) => m.id !== moduleId);

		// Remove ações relacionadas
		const mtor = allModules.find((m) => m.id === moduleId);
		if (mtor?.sessions?.length) {
			mtor.sessions.forEach((s) => {
				// Remove ações
				setNewActions((prev) =>
					prev.filter((a) => a.moduleId !== s.section_id),
				);

				// Remove do formulário também se houver referência pelo section_id
				newModules = newModules.filter((m) => m.id !== s.section_id);
			});
		}

		// Atualiza o formulário
		field.onChange(newModules);
	};
	// Lida com a mudança de estado dos checkboxes
	const handleCheckboxChange = (moduleId, moduleData, key, isChecked) => {
		setNewActions((prev) => {
			const existing = prev.find((m) => m.moduleId === moduleId);

			if (isChecked) {
				// Marca
				if (existing) {
					return prev.map((m) =>
						m.moduleId === moduleId
							? {
									...m,
									actions: [...new Set([...m.actions, key])],
								}
							: m,
					);
				} else {
					return [...prev, { moduleId, actions: [key] }];
				}
			} else {
				// Desmarca
				if (!existing) return prev;

				const updated = existing.actions.filter((a) => a !== key);
				if (updated.length === 0) {
					// remove módulo se não tem mais actions
					return prev.filter((m) => m.moduleId !== moduleId);
				}
				return prev.map((m) =>
					m.moduleId === moduleId ? { ...m, actions: updated } : m,
				);
			}
		});
	};

	return (
		<Box sx={{ width: "100%" }}>
			{/* Seletor para adicionar novos módulos */}
			<Box
				sx={{
					p: 1,
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Select
					labelId="select-module-label"
					value={selectedModuleToAdd}
					onChange={(e) => setSelectedModuleToAdd(e.target.value)}
					displayEmpty
					fullWidth
				>
					<MenuItem value="" disabled>
						<div style={{ display: "flex", alignItems: "center" }}>
							<AddIcon />
							<span style={{ fontWeight: 200 }}>
								acessos do grupo de permissao
							</span>
						</div>
					</MenuItem>
					{allModules?.map((module) => {
						return (
							<MenuItem
								key={module.id}
								value={module.id}
								disabled={selectedModules.some(
									(m) => m.id === module.id,
								)}
							>
								{module.label}
							</MenuItem>
						);
					})}
				</Select>

				<Button
					sx={{ height: "-webkit-fill-available" }}
					variant="contained"
					onClick={handleAddModule}
					disabled={!selectedModuleToAdd}
				>
					<AddIcon />
				</Button>
			</Box>
			{/* Container para a lista horizontal de módulos selecionados */}
			<Box
				sx={{
					border: "1px solid #ddd",
					borderRadius: 1,
					marginTop: "10px",
					height: 400,
					p: 2,
					display: "flex", // Use flexbox
					gap: 2, // Espaço entre os itens
					overflowX: "auto", // Scroll horizontal
					overflowY: "hidden", // Opcional, para evitar scroll vertical se os itens forem de altura fixa
				}}
			>
				{selectedModules?.map((mod) => {
					const moduleData = allModules.find((m) => m.id === mod.id);

					if (!moduleData) return null;

					return (
						<Box
							key={moduleData.id}
							sx={{
								border: "1px solid #e0e0e0",
								p: 2,
								borderRadius: 1,
								position: "relative",
								minWidth: 200, // Largura fixa para cada módulo
								flexShrink: 0, // Evita que os módulos encolham
								height: "100%", // Garante que a altura seja a mesma do container pai
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 1,
								}}
							>
								<Typography
									variant="subtitle1"
									sx={{ fontWeight: "bold" }}
								>
									{moduleData.name_module}
								</Typography>
								<IconButton
									sx={{
										position: "absolute",
										top: 1,
										right: 2,
									}}
									size="small"
									onClick={() =>
										handleRemoveModule(moduleData.id)
									}
									aria-label="remover módulo"
								>
									<DeleteIcon
										fontSize="inherit"
										color="primary"
									/>
								</IconButton>
							</Box>
							{/* Itera sobre os grupos de permissão */}
							<Box sx={{ flexGrow: 1, overflowY: "auto" }}>
								{moduleData?.sessions.map((session) => {
									return (
										<Box
											key={session.label}
											sx={{
												mb: 1.5,
												p: 1,
												backgroundColor: "#fafafa",
												borderRadius: "5px",
											}}
										>
											<Typography
												variant="body2"
												sx={{
													fontWeight: "600",
													mb: 0.5,
												}}
											>
												{session.label}
											</Typography>
											<FormGroup>
												{session?.actions.map(
													(action, index) => {
														const uniqueAction = `${index}:${session.resource}`;

														return (
															<FormControlLabel
																key={
																	uniqueAction
																}
																control={
																	<Checkbox
																		checked={newActions.some(
																			(
																				mod,
																			) =>
																				mod.moduleId ===
																					session.section_id &&
																				mod.actions.includes(
																					action,
																				),
																		)}
																		onChange={(
																			e,
																		) =>
																			handleCheckboxChange(
																				session.section_id,
																				moduleData,
																				action,
																				e
																					.target
																					.checked,
																			)
																		}
																		size="small"
																	/>
																}
																label={
																	<Typography variant="caption">
																		{action}
																	</Typography>
																}
															/>
														);
													},
												)}
											</FormGroup>
										</Box>
									);
								})}
							</Box>
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

// --- FORMULÁRIO DE EDIÇÃO ---
export const PermissionEdit = ({ record, onClose, resourceData }) => {
	const [update] = useUpdate();
	const notify = useNotify();
	const refresh = useRefresh();
	const [newActions, setNewActions] = React.useState([]);
	const { permissions } = useModule();

	const [moduleStates, setModuleStates] = useState([]);

	const { data, isError } = useGetOne(
		resourceData,
		{
			id: record.id,
			/* meta: { unitId: uniqueUnits }, */
		},
		{ retry: 1 },
	);

	const allModules = data?.allModules || permissions;
	const uniqueUnits = [...new Set(allModules.map((module) => module.unit))];

	useEffect(() => {
		if (!data || !allModules) return;

		if (!isError && !moduleStates?.groups) {
			setModuleStates(data);
		}
	}, [data, isError]);

	useEffect(() => {
		if (!moduleStates) return;
	}, [moduleStates]);

	const handleSave = (values) => {
		const result = newActions.map(({ moduleId, ...rest }) => ({
			id: moduleId,
			...rest,
		}));
		values.modules = result ? result : [];

		update(
			resourceData,
			{ id: data.id, data: values, previousData: data },
			{
				onSuccess: () => {
					notify("Permissao atualizada com sucesso ✅");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao atualizar permissao", { type: "error" }),
			},
		);
	};

	return (
		<SimpleForm
			onSubmit={handleSave}
			defaultValues={record}
			toolbar={<CustomToolbar onClose={onClose} />}
		>
			<TextInput
				source="permission_name"
				label="Nome da permissao"
				fullWidth
				validate={[required()]}
			/>
			<ModulePermissionsInput
				source="modules"
				moduleStates={moduleStates}
				allModules={allModules}
				setModuleStates={setModuleStates}
				setNewActions={setNewActions}
				newActions={newActions}
			/>
		</SimpleForm>
	);
};

export const PermissionCreate = ({ onClose, resourceData }) => {
	const [create] = useCreate();
	const notify = useNotify();
	const [newActions, setNewActions] = React.useState([]);
	const [data, setData] = useState([]);

	const handleSave = (values) => {
		const result = newActions.map(({ moduleId, ...rest }) => ({
			id: moduleId,
			...rest,
		}));
		values.modules = result;

		create(
			resourceData,
			{ data: values },
			{
				onSuccess: () => {
					notify("Permissao criada com sucesso 🎉");
					onClose();
				},
				onError: () =>
					notify("Erro ao criar permissao", { type: "error" }),
			},
		);
	};

	const licensesModulesQuery = useGetList(
		"licenses-modules",
		{
			pagination: { page: 1, perPage: 1000 },
		},
		{ retry: 1, enabled: resourceData === "licenses-group-permission" }, // só dispara se true
	);

	const { permissions } = useModule();

	const { data: licensesData } = licensesModulesQuery;

	// Depois você decide qual "data" usar
	const allModules =
		resourceData === "licenses-group-permission"
			? licensesData
			: permissions;

	return (
		<Create>
			<SimpleForm
				onSubmit={handleSave}
				toolbar={<CustomToolbar onClose={onClose} />}
			>
				<TextInput
					source="permission_name"
					label="Nome do Grupo de Permissão"
					fullWidth
					validate={[required()]}
				/>

				{/* Custom input to handle module permissions */}
				<ModulePermissionsInput
					source="modules"
					allModules={allModules}
					newActions={newActions}
					setNewActions={setNewActions}
				/>
			</SimpleForm>
		</Create>
	);
};
