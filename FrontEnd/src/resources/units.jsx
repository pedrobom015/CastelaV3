import { useState, useRef, useEffect, useMemo, use } from "react";
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
	FunctionField,
	InfiniteList,
	useGetOne,
	ArrayInput,
	SelectInput,
	useGetList,
	SimpleFormIterator,
	ReferenceInput,
	useRefresh,
	useSimpleFormIterator,
	useSimpleFormIteratorItem,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import {
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	Button,
	IconButton,
	Typography,
	useMediaQuery,
	Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";

import EditIcon from "@mui/icons-material/Edit";
import { useModule } from "../routes/context/ModuleContext";
import ModuleSessionInfo from "../components/layout/ModuleSessionInfo";
import { useTheme } from "@mui/material/styles";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { color, transform } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import { useWatch } from "react-hook-form";

// ----------------------------------------------------------------------------------
// NOVOS COMPONENTES PARA FILTRAGEM DE DUPLICATAS
// ----------------------------------------------------------------------------------

/**
 * Componente para selecionar permissões, evitando duplicatas no ArrayInput principal.
 * Ele usa useWatch para ler as permissões já selecionadas.
 */

const PermissionSelect = ({ defaultDt, unitId }) => {
	const theme = useTheme();
	const [PermissionList, setPermissionList] = useState([]);
	const { getValues } = useFormContext();

	const { data, isLoading } = useGetList("users-units", {
		pagination: { page: 1, perPage: 30 },
		sort: { field: "permission_name", order: "ASC" },
		filter: { unitID: unitId },
	});
	const { index } = useSimpleFormIteratorItem();
	useEffect(() => {
		setPermissionList(data);
	}, [data]);

	const handleOpen = () => {
		const formValues = getValues();
		const opcaoP = formValues.permissions.filter((item, idx) => {
			return idx !== index;
		});

		const filtPerm = data.filter(
			(d) => !opcaoP.some((o) => o.permission_id === d.id)
		);
		setPermissionList(filtPerm);
	};

	return (
		<>
			<SelectInput
				sx={{
					marginTop: 0,
					paddingLeft: 1,
					paddingRight: 1,
					paddingTop: 0,
					"& .MuiInputBase-input": {
						color: theme.palette.primary.secondary,
						fontSize: "0.9rem",
						paddingTop: 0,
						backgroundColor: "transparent",
					},
					"& .MuiFormHelperText-root": {
						display: "none",
					},
					"& .MuiInputLabel-root": {
						display: "none",
					},
					"& .MuiFilledInput-root": {
						paddingTop: 0,
						backgroundColor: "transparent",
						"&:before, &:after": {
							backgroundColor: "transparent",
						},
					},
				}}
				source="permission_id"
				optionText="permission_name"
				optionValue="id"
				fullWidth
				validate={[required()]}
				choices={PermissionList}
				SelectProps={{
					onOpen: handleOpen,
				}}
			/>
			<ArrayInput
				source="users"
				label=""
				sx={{
					padding: "1px !important",
					paddingLeft: "20px !important",
					paddingRight: "20px !important",
				}}
			>
				<SimpleFormIterator
					addButton={
						<MyAddButton
							Bcolor={theme.palette.primary.main}
							icon={<PersonIcon fontSize="1" />}
							label={"usuarios"}
						/>
					}
					removeButton={<MyRemoveButton sizeE={10} />}
					disableClear={true}
					disableReordering={true}
					sx={{
						display: "flex",

						flexDirection: "column-reverse",
						width: "100%",

						"& .RaSimpleFormIterator-buttons": {
							color: "white",
							fontWeight: "bold",
							display: "flex",
							flexDirection: "row-reverse",
						},

						"& .RaSimpleFormIterator-action": {
							/* visibility: "hidden", */
							position: "absolute",
							margin: "6px",
						},

						"& .RaSimpleFormIterator-list": {
							display: "flex",
							flexDirection: "column",
							backgroundColor: "transparent",
						},
						"& .RaSimpleFormIterator-line": {
							display: "flex",
							margin: "0px !important",

							backgroundColor: "transparent",
							borderBottom: "none !important",
						},
					}}
				>
					{/* 🌟 SUBSTITUÍDO PELO NOVO COMPONENTE 🌟 */}
					<UserSelect dataM={defaultDt} indexP={index} />
				</SimpleFormIterator>
			</ArrayInput>
		</>
	);
};

/**
 * Componente para selecionar usuários, evitando duplicatas DENTRO da permissão atual.
 * Ele usa useRecordContext para pegar os usuários já selecionados no item pai.
 */
const UserSelect = ({ dataM, indexP }) => {
	const theme = useTheme();
	const [userList, setUserList] = useState([]);
	const { getValues } = useFormContext();
	const { data, isLoading } = useGetList("licenses", {
		pagination: { page: 1, perPage: 20 },
		sort: { field: "user_id", order: "ASC" },
	});
	useEffect(() => {
		setUserList(data);
	}, [data]);

	const { index: indexU } = useSimpleFormIteratorItem();
	if (isLoading) return <span>Carregando...</span>;
	/* 	const handleOpen = () => {
		const formValues = getValues();
		const opcaoU = formValues.permissions[indexP].users.filter(
			(item, index) => {
				return index !== indexU;
			}
		);
		const filtUser = data.filter(
			(d) => !opcaoU.some((o) => o.user_id === d.id)
		);

		setUserList(filtUser);
	}; */

	const handleOpen = () => {
		const formValues = getValues();
		const allUsers = formValues.permissions.flatMap((p) => p.users);
		const filtUser = data.filter(
			(d) => !allUsers.some((o) => o.user_id === d.id)
		);

		setUserList(filtUser);
	};

	return (
		<SelectInput
			sx={{
				marginTop: 0.2,

				"& .MuiInputBase-input": {
					fontSize: "0.6rem",
					padding: "0px",
					paddingLeft: 5,
					backgroundColor: "transparent",
					borderRadius: 1,
					color: theme.palette.primary.main,
				},
				"& .MuiFilledInput-root:before": {
					borderBottom: "none !important",
				},
				"& .MuiFilledInput-root:after": {
					borderBottom: "none !important",
				},
				"& .MuiFilledInput-root:hover:not(.Mui-disabled):before": {
					borderBottom: "none !important",
				},
				"& .MuiFormHelperText-root": {
					display: "none",
				},
				"& .MuiInputLabel-root": {
					display: "none",
				},
				"& .MuiFilledInput-root": {
					borderRadius: "5px",
					backgroundColor: "white",
				},
			}}
			source="user_id" // 🔹 Campo no form onde o valor vai ser salvo
			validate={[required()]}
			optionText={(record) => `${record.name} (${record.email})`}
			optionValue="id"
			choices={userList}
			SelectProps={{
				onOpen: handleOpen,
			}}
			// 4. Filtra as opções que já estão em 'selected'
		/>
	);
};

// ----------------------------------------------------------------------------------
// RESTANTE DO CÓDIGO (Inalterado, exceto UnitsEdit)
// ----------------------------------------------------------------------------------

const ListActions = ({ onOpenCreate, isMobile, canCreate, resData, theme }) => (
	<TopToolbar>
		<ModuleSessionInfo data={resData} />
		{!isMobile && canCreate && (
			<Button
				sx={{
					backgroundColor: theme.palette.primary.secondary,
				}}
				size="small"
				variant="contained"
				onClick={onOpenCreate}
			>
				Nova Unidade
			</Button>
		)}
	</TopToolbar>
);
export const MyAddButton = ({ Bcolor, icon, label, ...rest }) => {
	const { add } = useSimpleFormIterator();
	const theme = useTheme();

	return (
		<Button
			sx={{
				borderRadius: "5px",
				minWidth: 0,
				height: 25,
				width: 40,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				marginBottom: 0,
				padding: 0,
				color: Bcolor || "white", // ✅ usa aqui
				backgroundColor: "white",
				"&:hover": {
					backgroundColor: "white",
					transform: "scale(1.05)", // opcional: pequeno efeito de zoom
				},
			}}
			onClick={() => add()}
			{...rest} // ✅ só passa as props válidas
		>
			<Tooltip title={`Adicionar ${label}`} placement="right">
				<span
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 4,
					}}
				>
					<AddIcon fontSize="small" />
					{icon}
				</span>
			</Tooltip>
		</Button>
	);
};

const MyRemoveButton = ({ sizeE, datal }) => {
	const { remove, index } = useSimpleFormIteratorItem();

	return (
		<IconButton
			size="1"
			onClick={() => remove(index)}
			sx={{
				color: "red",
				fontSize: sizeE,
				"&:hover": {
					backgroundColor: "rgba(255,0,0,0.1)",
				},
			}}
		>
			<DeleteIcon fontSize="inherit" />
		</IconButton>
	);
};
// --- FORMULÁRIO DE CRIAÇÃO ---

export const UnitsCreate = ({ record, onClose, isMobile }) => {
	const refresh = useRefresh();
	const [create] = useCreate();
	const notify = useNotify();
	const theme = useTheme();
	const [datat, setDataT] = useState([]);

	const handleSave = (values) => {
		create(
			"units",
			{ data: values },
			{
				onSuccess: () => {
					notify("Unidade criada com sucesso 🎉");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao criar unidade", { type: "error" }),
			}
		);
	};

	return (
		<SimpleForm
			onSubmit={handleSave}
			toolbar={<CustomToolbar onClose={onClose} />}
		>
			{/* Nome da unidade */}
			<TextInput
				source="name"
				label="Nome da unidade"
				validate={[required()]}
				sx={{
					paddingBottom: 1,
					"& .MuiFormHelperText-root": {
						display: "none",
					},
				}}
			/>

			<ArrayInput source="permissions" label="">
				<Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
					<SimpleFormIterator
						disableReordering={true}
						disableClear={true}
						addButton={
							<div style={{ marginRight: 5 }}>
								<MyAddButton
									Bcolor={theme.palette.primary.secondary}
									label={"Permissions"}
									icon={<KeyIcon fontSize="1" />}
								/>
							</div>
						}
						removeButton={
							<MyRemoveButton sizeE={15} datal={datat} />
						}
						sx={{
							display: "flex",

							flexDirection: "column-reverse",
							"& .RaSimpleFormIterator-buttons": {
								color: "white",
								fontWeight: "bold",
								display: "flex",
								flexDirection: "row-reverse",
								marginBottom: 1,
								marginTop: 0.1,
							},

							"& .RaSimpleFormIterator-action": {
								marginTop: "-5px",
							},

							"@media (max-width:599.95px)": {
								"& .RaSimpleFormIterator-line": {
									display: "flex",
								},
							},

							"& .RaSimpleFormIterator-list": {
								display: "grid",
								gridTemplateColumns: !isMobile
									? "50% 50%"
									: "100%",
							},
							"& .RaSimpleFormIterator-line": {
								margin: "3px",
								borderRadius: 1,
								backgroundColor: "#69628c12",
								flexDirection: "column-reverse",
							},
						}}
					>
						{/* 🌟 SUBSTITUÍDO PELO NOVO COMPONENTE 🌟 */}

						<PermissionSelect defaultDt={datat} />
					</SimpleFormIterator>
				</Box>
			</ArrayInput>
		</SimpleForm>
	);
};

// --- FORMULÁRIO DE EDIÇÃO (CORRIGIDO) ---
export const UnitsEdit = ({ record, onClose, isMobile }) => {
	const refresh = useRefresh();
	const [update] = useUpdate();
	const notify = useNotify();
	const theme = useTheme();
	const [datat, setDataT] = useState();

	// **Código removido/movido para PermissionSelect:**
	// const values = useWatch({ name: "permissions" }) || [];
	// const current = useRecordContext();
	// const selected = values
	//     .map((p) => p.permission_id)
	//     .filter((id) => id && id !== current?.permission_id);

	const { data, isError } = useGetOne(
		"units",
		{
			id: record.id,
		},
		{ retry: 1 }
	);

	useEffect(() => {
		if (data) {
			setDataT(data);
		}
	}, [data]);
	const handleSave = (values) => {
		update(
			"units",
			{ id: record.id, data: values, previousData: record },
			{
				onSuccess: () => {
					notify("Unidade atualizada com sucesso ✅");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao atualizar unidade", { type: "error" }),
			}
		);
	};
	/*
	const form = useFormContext();

	// índice do nível superior (permission)
	const permissions = form.getValues("permissions") || []; */
	return (
		<SimpleForm
			onSubmit={handleSave}
			defaultValues={datat}
			toolbar={<CustomToolbar onClose={onClose} />}
		>
			{/* Nome da unidade */}
			<TextInput
				source="name"
				label="Nome da unidade"
				defaultValue={record?.unidade}
				validate={[required()]}
				sx={{
					paddingBottom: 1,
					"& .MuiFormHelperText-root": {
						display: "none",
					},
				}}
			/>

			<ArrayInput source="permissions" label="">
				<Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
					<SimpleFormIterator
						disableReordering={true}
						disableClear={true}
						addButton={
							<div style={{ marginRight: 5 }}>
								<MyAddButton
									Bcolor={theme.palette.primary.secondary}
									label={"Permissions"}
									icon={<KeyIcon fontSize="1" />}
								/>
							</div>
						}
						removeButton={
							<MyRemoveButton sizeE={15} datal={datat} />
						}
						sx={{
							display: "flex",

							flexDirection: "column-reverse",
							"& .RaSimpleFormIterator-buttons": {
								color: "white",
								fontWeight: "bold",
								display: "flex",
								flexDirection: "row-reverse",
								marginBottom: 1,
								marginTop: 0.1,
							},

							"& .RaSimpleFormIterator-action": {
								marginTop: "-5px",
							},

							"@media (max-width:599.95px)": {
								"& .RaSimpleFormIterator-line": {
									display: "flex",
								},
							},

							"& .RaSimpleFormIterator-list": {
								display: "grid",
								gridTemplateColumns: !isMobile
									? "50% 50%"
									: "100%",
							},
							"& .RaSimpleFormIterator-line": {
								margin: "3px",
								borderRadius: 1,
								backgroundColor: "#69628c12",
								flexDirection: "column-reverse",
							},
						}}
					>
						{/* 🌟 SUBSTITUÍDO PELO NOVO COMPONENTE 🌟 */}

						<PermissionSelect
							defaultDt={datat}
							unitId={record.id}
						/>
					</SimpleFormIterator>
				</Box>
			</ArrayInput>
		</SimpleForm>
	);
};

// --- TOOLBAR PERSONALIZADA ---
const CustomToolbar = ({ onClose, theme = useTheme() }) => (
	<Toolbar sx={{ justifyContent: "flex-end" }}>
		<SaveButton
			alwaysEnable
			sx={{ backgroundColor: theme.palette.primary.secondary }}
		/>
		<Button
			onClick={onClose}
			style={{ marginLeft: 8, color: theme.palette.primary.secondary }}
		>
			Cancelar
		</Button>
	</Toolbar>
);

// --- LISTAGEM COM CREATE + EDIT EM MODAL ---
export const UnitsList = ({ resourceData = "units" }) => {
	const [openCreate, setOpenCreate] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const theme = useTheme();
	const [selectedUser, setSelectedUser] = useState(null);
	const isMobile = useMediaQuery("(max-width:750px)");

	const { gerais } = useModule();
	const unitsGroup = gerais
		?.flatMap((m) => m?.sessions)
		.find((s) => s?.resource === "units");

	const canCreate = unitsGroup?.actions?.includes("create") ?? false;
	const canEdit = unitsGroup?.actions?.includes("edit") ?? false;
	const canDelete = unitsGroup?.actions?.includes("delete") ?? false;
	const canRead = unitsGroup?.actions?.includes("read") ?? false;

	const gridRef = useRef(null); // Datagrid é uma tabela <table>
	const [height, setHeight] = useState();

	useEffect(() => {
		if (gridRef?.current) {
			setHeight(gridRef.current.clientHeight);
		}
	}, [gridRef.current]);

	return (
		canRead && (
			<Box
				sx={{
					paddingLeft: 2,
					paddingRight: 2,
				}}
			>
				<ListActions
					theme={theme}
					resData={resourceData}
					onOpenCreate={() => setOpenCreate(true)}
					isMobile={isMobile}
					canCreate={canCreate}
				/>
				<InfiniteList
					sx={{ maxHeight: "30vh", overflowY: "auto" }}
					actions={false}
				>
					<Datagrid
						ref={gridRef}
						rowClick={false}
						bulkActionButtons={canDelete}
					>
						<TextField source="unidade" label="Unidade" />
						<TextField source="empresa" label="Licenca" />

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
										<EditIcon
											sx={{
												color: theme.palette.primary
													.secondary,
											}}
										/>
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
								backgroundColor:
									theme.palette.primary.secondary,
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
							backgroundColor: theme.palette.primary.secondary,

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
								{"✚"} {"Nova Unidade"}
							</span>
						</div>
					</DialogTitle>

					<DialogContent>
						<UnitsCreate onClose={() => setOpenCreate(false)} />
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
							backgroundColor: theme.palette.primary.secondary,

							color: "#ffffffff",
							fontWeight: "600",
							fontSize: "1rem",
							display: "flex",
							justifyContent: "center",
							marginBottom: 1,
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
								{"▤"} {"Editar Unidade"}
							</span>
						</div>
					</DialogTitle>
					<DialogContent sx={{ padding: 2 }}>
						{selectedUser && (
							<UnitsEdit
								isMobile={isMobile}
								record={selectedUser}
								onClose={() => setOpenEdit(false)}
							/>
						)}
					</DialogContent>
				</Dialog>
			</Box>
		)
	);
};
