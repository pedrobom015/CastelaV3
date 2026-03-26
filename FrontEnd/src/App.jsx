import React, { useEffect, useState, useMemo } from "react";
import {
	Admin,
	Resource,
	CustomRoutes,
	ListBase,
	usePermissions,
} from "react-admin";
import { Box, GlobalStyles } from "@mui/material";
import { BarChart } from "@mui/x-charts";

import dataProvider from "./routes/dataProvider";
import authProvider from "./routes/authProvider";
import Login from "./components/login/Login";
import { myTheme } from "./assets/themes/themes";
import { ModuleProvider } from "./routes/context/ModuleContext";
import { UnitsList } from "./resources/units";
import { UsersList } from "./resources/users";
import { PermissionList } from "./resources/permission";
import { GendersList } from "./resources/GendersList";
import { BeneficiaryList } from "./resources/Beneficiary";
import { ContractList } from "./resources/contract";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import Stack from "@mui/material/Stack";
import { LineChart } from "@mui/x-charts/LineChart";
import MyLayout from "./components/layout/MyLayout";
import { Margin } from "@mui/icons-material";
import { MyDashboard } from "./resources/Fisrtdashboard";
import { Route } from "react-router-dom";
import { useModule } from "./routes/context/ModuleContext";
import { getServerStatus } from "./services/serverStatus";

const SplashScreen = () => {
	const {
		allpermissions,
		setsStatus,
		activePermissionContext,
		hasModules,
		permissions,
	} = useModule();
	const [user, setUser] = useState(null);
	const resServer = allpermissions?.length > 0 ? true : false;
	const serverstatus = getServerStatus();

	useEffect(() => {
		const checkServer = async () => {
			try {
				setsStatus(getServerStatus());
			} catch (error) {}
		};

		// checa a cada 5 segundos
		const interval = setInterval(checkServer, 5000);
		const timeout = setTimeout(checkServer, 1000);

		return () => {
			clearTimeout(timeout);
			clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const identity = await authProvider.getIdentity(); // <-- await a Promise

				setUser(identity);
			} catch (err) {
				setUser(null);
			}
		};

		fetchUser();
	}, [allpermissions]);

	return false ? (
		<Box
			position="absolute"
			zIndex="99"
			display="flex"
			width="100%"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			height="100vh"
			bgcolor="#00000069"
		>
			<img src="/loadding.webp" alt="Logo" style={{ height: 200 }} />
		</Box>
	) : null;
};

export default function App() {
	const { isLoading, setIsLoading } = useState(false);
	const MyCustomPage = () => (
		<Box display="flex" flexDirection="column" gap={2}>
			<ListBase resource="users">
				<UsersList resourceData="users" />
			</ListBase>
			<ListBase resource="units-group-permission">
				<PermissionList resourceData="units-group-permission" />
			</ListBase>
		</Box>
	);

	const uData = [4000, 3000, 2000, 2780];
	const pData = [2400, 1398, 9800, 3908];
	const xLabels = ["Page A", "Page B", "Page C", "Page D"];

	const data = [
		{ label: "Group A", value: 400, color: "#0088FE" },
		{ label: "Group B", value: 300, color: "#00C49F" },
		{ label: "Group C", value: 300, color: "#FFBB28" },
		{ label: "Group D", value: 200, color: "#FF8042" },
	];

	const sizing = {
		margin: { right: 5 },
		width: 200,
		height: 200,
		hideLegend: true,
	};
	const TOTAL = data.map((item) => item.value).reduce((a, b) => a + b, 0);

	const getArcLabel = (params) => {
		const percent = params.value / TOTAL;
		return `${(percent * 100).toFixed(0)}%`;
	};

	const Charts = () => (
		<>
			<Box
				sx={{
					width: "100%",
					height: 350,
					display: "flex",
					marginTop: 2,
				}}
			>
				<BarChart
					series={[
						{
							data: pData,
							label: "pv",
							id: "pvId",
							stack: "total",
							color: "#4A90E2",
						},
						{
							data: uData,
							label: "uv",
							id: "uvId",
							stack: "total",
							color: "#FF8042",
						},
					]}
					xAxis={[{ data: xLabels }]}
					yAxis={[{ width: 30 }]}
				/>
				<PieChart
					series={[
						{
							outerRadius: 80,
							data,
							arcLabel: getArcLabel,
						},
					]}
					sx={{
						[`& .${pieArcLabelClasses.root}`]: {
							fill: "white",
							fontSize: 14,
						},
					}}
					{...sizing}
				/>
				<Stack direction="row">
					<PieChart
						series={[
							{
								paddingAngle: 5,
								innerRadius: "60%",
								outerRadius: "90%",
								data,
							},
						]}
						hideLegend
					/>
				</Stack>
			</Box>
			<Box width={"100%"} height={300}>
				<LineChart
					series={[
						{ data: pData, label: "pv" },
						{ data: uData, label: "uv" },
					]}
					xAxis={[{ scaleType: "point", data: xLabels }]}
					yAxis={[{ width: 50 }]}
				/>
			</Box>
		</>
	);

	return (
		<>
			<ModuleProvider>
				<SplashScreen />

				<Admin
					layout={MyLayout}
					authProvider={authProvider}
					loginPage={Login}
					dataProvider={dataProvider}
					dashboard={MyDashboard}
					theme={myTheme}
				>
					<Resource
						name="units-group-permission"
						list={(props) => (
							<PermissionList
								{...props}
								resourceData="units-group-permission"
							/>
						)}
					/>
					<Resource
						name="licenses-group-permission"
						list={(props) => (
							<PermissionList
								{...props}
								resourceData="licenses-group-permission"
							/>
						)}
					/>
					<Resource name="units" list={UnitsList} />

					<Resource
						name="users"
						list={(props) => (
							<UsersList {...props} resourceData="users" />
						)}
					/>
					<Resource
						name="licenses"
						list={(props) => (
							<UsersList {...props} resourceData="licenses" />
						)}
					/>

					<Resource name="genders" list={GendersList} />
					<Resource name="beneficiary" list={BeneficiaryList} />
					<Resource name="contract" list={ContractList} />
					<CustomRoutes>
						<Route path="/dashboard" element={<MyCustomPage />} />
						<Route path="/charts" element={<Charts />} />
					</CustomRoutes>
				</Admin>
			</ModuleProvider>
		</>
	);
}
