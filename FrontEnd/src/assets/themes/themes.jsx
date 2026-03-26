import { defaultTheme } from "react-admin";
import { deepmerge } from "@mui/utils";
import { MarginOutlined } from "@mui/icons-material";

export const myTheme = deepmerge(defaultTheme, {
	palette: {
		primary: {
			main: "#ff914d",
			secondary: "#69628c",
			contrastText: "#fff",
		},
		secondary: {
			main: "#ff914d",
			contrastText: "#fff",
		},

		sidebar: "#eff2f5",
		primarySoft: "#fcf1ea",
	},
	components: {
		// Seus estilos originais
		RaTopToolbar: {
			styleOverrides: {
				root: ({ theme }) => ({
					width: "100%",
					/* backgroundColor: "#f0efefff", */

					// aplica só no mobile
					[theme.breakpoints.down("sm")]: {
						backgroundColor: "#fff",
						padding: 10,
						paddingBottom: 15,
					},
				}),
			},
		},

		MuiToolbar: {
			styleOverrides: {
				root: {
					"&.RaBulkActionsToolbar-toolbar": {
						boxShadow: "none", // remove sombra se houver
						position: "fixed!important",
						bottom: "-42px",
						marginLeft: "280px",
					},
				},
			},
		},

		RaMenuItemLink: {
			styleOverrides: {
				root: {
					padding: "8px 16px",
					fontSize: "14px",
					"&.RaMenuItemLink-active": {
						backgroundColor: "#fff",
					},
					"&:hover": {
						backgroundColor: "#eee",
					},
				},
			},
		},
		/* 	MuiIconButton: {
			styleOverrides: {
				root: {
					backgroundColor: "transparent",
					color: "white",
					margin: "2px",
					"&:hover": {
						backgroundColor: "rgb(62 56 134)",
					},
				},
			},
		}, */
		MuiButton: {
			styleOverrides: {
				root: {
					"&:hover": {
						backgroundColor: "#eae9eeff",
					},
				},
				containedPrimary: {
					"&:hover": {
						backgroundColor: "#f97935ff",
					},
				},
			},
		},

		// **Estilos globais adicionados aqui**
		MuiCardContent: {
			styleOverrides: {
				root: {
					maxWidth: "100vw !important",
					width: "100%",
					padding: "0 0px !important",
				},
			},
		},
		MuiTablePagination: {
			styleOverrides: {
				root: {
					padding: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexDirection: "column",
					boxShadow: "none",
				},
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: {
					padding: "8px 8px !important",
					borderBottom: "1px solid rgb(231, 189, 127) !important",
					fontSize: "12px !important",
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					"&.MuiCard-root": {
						boxShadow: "none !important",
					},
				},
			},
		},
		RaDatagrid: {
			styleOverrides: {
				root: {
					"& .RaDatagrid-headerCell": {
						padding: "10px 10px !important",
						fontWeight: "400",
						fontSize: "14px !important",
					},
				},
			},
		},

		RaList: {
			styleOverrides: {
				root: {
					"& .RaList-content": {
						marginTop: "8px",
					},
				},
			},
		},
		RaLayout: {
			styleOverrides: {
				content: {
					width: "0vw !important",
				},
			},
		},
	},
});

const make = (main) =>
	deepmerge(defaultTheme, {
		palette: {
			primary: { main, contrastText: "#fff" },
			secondary: { main },
			sidebar: "#eff2f5",
		},
	});

export const THEMES = {
	orange: make("#ff914d"),
	blue: make("#1976d2"),
	red: make("#d32f2f"),
};
