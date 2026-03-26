import { BulkDeleteButton } from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";

export const MyCustomDeleteButton = (props) => (
	<Tooltip title="Excluir itens selecionados">
		<BulkDeleteButton
			label="Deletar isso"
			icon={<DeleteIcon />}
			// Adicione estilos como cor e tamanho
			sx={{ color: "red", "&:hover": { backgroundColor: "lightgray" } }}
			{...props}
		/>
	</Tooltip>
);

// E use-o em seu componente de bulk action
export const MyBulkActionButtons = () => <MyCustomDeleteButton />;
