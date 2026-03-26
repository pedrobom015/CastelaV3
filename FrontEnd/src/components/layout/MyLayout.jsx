// src/components/layout/MyLayout.jsx
import React, { useState } from "react";
import { Layout } from "react-admin";
import MyAppBar from "./MyAppBar";
import MySidebar from "./MySidebar";
import { ChatPopup } from "./Chatpopup";

export default function MyLayout(props) {
	const [showPopup, setShowPopup] = useState(false); // clique
	return (
		<>
			<Layout
				{...props}
				appBar={MyAppBar}
				sidebar={(props) => (
					<MySidebar {...props} setShowPopup={setShowPopup} />
				)}
				sx={{
					"& .RaLayout-content": {
						overflowX: "auto",
						overflowy: "auto",

						transition: (theme) =>
							theme.transitions.create("margin-left", {
								easing: theme.transitions.easing.sharp,
								duration:
									theme.transitions.duration.leavingScreen,
							}),
					},
				}}
			/>
			<ChatPopup showPopup={showPopup} setShowPopup={setShowPopup} />
		</>
	);
}
