// src/constants/modules.js
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BathtubIcon from "@mui/icons-material/Bathtub";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import HomeIcon from "@mui/icons-material/Home";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import CarRentalIcon from "@mui/icons-material/CarRental";
import StoreIcon from "@mui/icons-material/Store";
import SettingsIcon from "@mui/icons-material/Settings";

const modules = [
	{
		id: "configuracoes",
		label: "Configurações",
		icon: SettingsIcon,
		sessions: [
			{ label: "Usuarios", resource: "users" },
			{ label: "Permissoes", resource: "units-group-permission" },
		],
	},
	{
		id: "units",
		label: "Unidades",
		icon: HomeIcon,
		sessions: [{ label: "Unidades", resource: "units" }],
	},
	/* {
		id: "configuracoes",
		label: "Configurações",
		icon: SettingsIcon,
		sessions: [{ label: "Preferências", resource: "preferencias" }],
	}, */
];

export default modules;
