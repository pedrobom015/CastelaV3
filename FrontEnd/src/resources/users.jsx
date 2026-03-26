import { useState, useRef, useEffect } from "react";
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
	useRecordContext,
	ReferenceInput,
	SelectInput,
	FunctionField,
	useRefresh,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { usePermissions } from "react-admin";
import { useModule } from "../routes/context/ModuleContext";
import ModuleSessionInfo from "../components/layout/ModuleSessionInfo";
// --- BOTÕES DE AÇÕES NO TOPO ---
const ListActions = ({ onOpenCreate, isMobile, canCreate, resData }) => (
	<TopToolbar>
		<ModuleSessionInfo data={resData} />
		{!isMobile && canCreate && (
			<Button size="small" variant="contained" onClick={onOpenCreate}>
				Novo Usuário
			</Button>
		)}
	</TopToolbar>
);

// --- FORMULÁRIO DE CRIAÇÃO ---
export const UsersCreate = ({ onClose }) => {
	const [create] = useCreate();
	const notify = useNotify();
	const refresh = useRefresh();
	const handleSave = (values) => {
		create(
			"users",
			{ data: values },
			{
				onSuccess: () => {
					notify("Usuário criado com sucesso 🎉");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao criar usuário", { type: "error" }),
			},
		);
	};

	return (
		<SimpleForm
			onSubmit={handleSave}
			toolbar={<CustomToolbar onClose={onClose} />}
		>
			<TextInput
				source="name"
				label="Nome"
				fullWidth
				validate={[required()]}
			/>
			<TextInput
				source="email"
				label="E-mail"
				fullWidth
				validate={[required()]}
			/>
			<ReferenceInput
				label="Permissão"
				source="group_permission_id" // coluna do usuário
				reference="units-group-permission" // Resource que retorna permissões
			>
				<SelectInput
					optionText="permission_name"
					fullWidth
					validate={[required()]}
				/>
			</ReferenceInput>
		</SimpleForm>
	);
};

// --- FORMULÁRIO DE EDIÇÃO ---
export const UsersEdit = ({ record, onClose, resourceData }) => {
	const [update] = useUpdate();
	const notify = useNotify();
	const refresh = useRefresh();
	const handleSave = (values) => {
		update(
			"users",
			{ id: record.id, data: values, previousData: record },
			{
				onSuccess: () => {
					notify("Usuário atualizado com sucesso ✅");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao atualizar usuário", { type: "error" }),
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
				source="name"
				label="Nome"
				fullWidth
				validate={[required()]}
			/>
			<TextInput
				source="email"
				label="E-mail"
				fullWidth
				validate={[required()]}
			/>
			<ReferenceInput
				label="Permissão"
				source="group_permission_id" // coluna do usuário
				reference="units-group-permission" // Resource que retorna permissões
			>
				<SelectInput optionText="permission_name" fullWidth />
			</ReferenceInput>
		</SimpleForm>
	);
};

// --- TOOLBAR PERSONALIZADA ---
const CustomToolbar = ({ onClose }) => (
	<Toolbar sx={{ justifyContent: "flex-end", paddingRight: 0 }}>
		<SaveButton alwaysEnable />
		<Button onClick={onClose} style={{ marginLeft: 8 }}>
			Cancelar
		</Button>
	</Toolbar>
);

// --- LISTAGEM COM CREATE + EDIT EM MODAL ---
export const UsersList = ({ resourceData }) => {
	const [openCreate, setOpenCreate] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const isMobile = useMediaQuery("(max-width:750px)");

	const { permissions } = useModule();
	const permissionsArray = Array.isArray(permissions)
		? permissions
		: [permissions];
	const unitsGroup = permissionsArray
		?.flatMap((m) => m?.sessions)
		.find((s) => s?.resource === "users");

	const canCreate = unitsGroup?.actions?.includes("create") ?? false;
	const canEdit = unitsGroup?.actions?.includes("edit") ?? false;
	const canDelete = unitsGroup?.actions?.includes("delete") ?? false;
	const canRead = unitsGroup?.actions?.includes("read") ?? false;

	const gridRef = useRef(null); // Datagrid é uma tabela <table>
	const [height, setHeight] = useState();

	useEffect(() => {
		if (gridRef.current) {
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
						{/* <TextField source="id" label="id" /> */}
						<TextField source="name" label="Nome" />
						<TextField source="email" label="E-mail" />
						<TextField source="permission_name" label="Acesso" />

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
								{"✚"} {"Novo Usuário"}
							</span>
						</div>
					</DialogTitle>

					<DialogContent>
						<UsersCreate onClose={() => setOpenCreate(false)} />
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
								{"▤"} {"Editar Usuário"}
							</span>
						</div>
					</DialogTitle>
					<DialogContent>
						{selectedUser && (
							<UsersEdit
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
