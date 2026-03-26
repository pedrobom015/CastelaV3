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
import { useTheme } from "@mui/material/styles";
// --- BOTÕES DE AÇÕES NO TOPO ---
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
				Novo Contrato
			</Button>
		)}
	</TopToolbar>
);

// --- FORMULÁRIO DE CRIAÇÃO ---
export const contractCreate = ({ onClose }) => {
	const [create] = useCreate();
	const notify = useNotify();
	const refresh = useRefresh();
	const handleSave = (values) => {
		create(
			"contract",
			{ data: values },
			{
				onSuccess: () => {
					notify("Contratos criado com sucesso 🎉");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao criar Contrato", { type: "error" }),
			}
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
		</SimpleForm>
	);
};

// --- FORMULÁRIO DE EDIÇÃO ---
export const ContractEdit = ({ record, onClose }) => {
	const [update] = useUpdate();
	const notify = useNotify();
	const refresh = useRefresh();
	const handleSave = (values) => {
		update(
			"contract",
			{ id: record.id, data: values, previousData: record },
			{
				onSuccess: () => {
					notify("Contratos atualizado com sucesso ✅");
					refresh();
					onClose();
				},
				onError: () =>
					notify("Erro ao atualizar Contratos", { type: "error" }),
			}
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
		</SimpleForm>
	);
};

// --- TOOLBAR PERSONALIZADA ---
const CustomToolbar = ({ onClose, theme = useTheme() }) => (
	<Toolbar
		sx={{
			justifyContent: "flex-end",
			paddingRight: 0,
		}}
	>
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
export const ContractList = ({ resourceData = "contract" }) => {
	const [openCreate, setOpenCreate] = useState(false);
	const [openEdit, setOpenEdit] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const isMobile = useMediaQuery("(max-width:750px)");
	const theme = useTheme();
	const { gerais } = useModule();
	const permissionsArray = Array.isArray(gerais) ? gerais : [gerais];
	const unitsGroup = permissionsArray
		?.flatMap((m) => m?.sessions)
		.find((s) => s?.resource === "contract");

	const canCreate = unitsGroup?.actions?.includes("create") ?? false;
	const canEdit = unitsGroup?.actions?.includes("edit") ?? false;
	const canDelete = unitsGroup?.actions?.includes("delete") ?? false;
	const canRead = unitsGroup?.actions?.includes("read") ?? false;

	const gridRef = useRef(null); // Datagrid é uma tabela <table>
	const [height, setHeight] = useState();

	console.log(unitsGroup, permissionsArray, "contract");

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
						{/* <TextField source="id" label="id" /> */}
						<TextField source="contract_number" label="contrato" />

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
							background: theme.palette.primary.secondary,
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
								{"✚"} {"Novo Contrato"}
							</span>
						</div>
					</DialogTitle>

					<DialogContent>
						<contractCreate onClose={() => setOpenCreate(false)} />
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
							background: theme.palette.primary.secondary,
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
								{"▤"} {"Editar Contrato"}
							</span>
						</div>
					</DialogTitle>
					<DialogContent>
						{selectedUser && (
							<contractEdit
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
