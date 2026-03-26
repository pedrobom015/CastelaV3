import { useState } from "react";

export function LogoWithPopup({ imghelp, setShowPopup }) {
	const [showTooltip, setShowTooltip] = useState(false); // hover

	return (
		<div style={{ position: "relative" }}>
			{/* Ícone */}
			<img
				src={imghelp}
				alt="Logo da Empresa"
				style={{
					height: 25,
					cursor: "pointer",
					transition: "opacity 0.2s",
					opacity: showTooltip ? 0.8 : 1,
				}}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				onClick={() => setShowPopup(true)}
			/>

			{/* Tooltip no hover */}
			{showTooltip && (
				<div
					style={{
						position: "absolute",
						top: "-35px",
						left: "-20px",
						transform: "translateX(-50%)",
						background: "#333",
						color: "#fff",
						padding: "5px 10px",
						borderRadius: "6px",
						fontSize: "12px",
						whiteSpace: "nowrap",
						zIndex: 999,
					}}
				>
					Falar com cassie
				</div>
			)}

			{/* Popup ao clicar */}
		</div>
	);
}

export function ChatPopup({ showPopup, setShowPopup }) {
	const [messages, setMessages] = useState([
		{ from: "bot", text: "Bom dia Karine, Como posso ajudar hoje? 😊" },
	]);
	const [input, setInput] = useState("");

	if (!showPopup) return null;

	function sendMessage() {
		if (!input.trim()) return;

		// adiciona mensagem do usuário
		setMessages((prev) => [...prev, { from: "user", text: input }]);

		// limpa o campo
		setInput("");

		// apenas para demo — resposta automática
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{
					from: "bot",
					text: "Claro! Preparando relatório! Aguarde... 🗂️",
				},
			]);
		}, 1000);
	}

	return (
		<div
			style={{
				position: "absolute",
				bottom: "20px",
				left: "280px",
				width: 420,
				height: 420,
				background: "#f6f6f6",
				borderRadius: "12px",
				boxShadow: "0 8px 22px rgba(0,0,0,0.2)",
				display: "flex",
				flexDirection: "column",
				zIndex: 9999,
			}}
		>
			{/* Header */}
			<div
				style={{
					padding: "12px",
					background: "#343541",
					color: "#fff",
					borderTopLeftRadius: "12px",
					borderTopRightRadius: "12px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					fontSize: 15,
				}}
			>
				<b>Cassie</b>
				<button
					onClick={() => setShowPopup(false)}
					style={{
						background: "transparent",
						border: "none",
						color: "#fff",
						cursor: "pointer",
						fontSize: 16,
					}}
				>
					✕
				</button>
			</div>

			{/* Área de mensagens */}
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "12px",
				}}
			>
				{messages.map((msg, i) => (
					<div
						key={i}
						style={{
							marginBottom: "12px",
							display: "flex",
							justifyContent:
								msg.from === "user" ? "flex-end" : "flex-start",
						}}
					>
						<div
							style={{
								maxWidth: "80%",
								padding: "10px 12px",
								borderRadius: "12px",
								fontSize: "13px",
								lineHeight: "1.4",
								background:
									msg.from === "user" ? "#3b82f6" : "#e0e0e0",
								color: msg.from === "user" ? "#fff" : "#333",
							}}
						>
							{msg.text}
						</div>
					</div>
				))}
			</div>

			{/* Área de digitação */}
			<div
				style={{
					padding: "10px",
					borderTop: "1px solid #ddd",
					background: "#fff",
					borderBottomLeftRadius: "12px",
					borderBottomRightRadius: "12px",
				}}
			>
				<div style={{ display: "flex", gap: "8px" }}>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Digite sua mensagem..."
						style={{
							flex: 1,
							height: "50px",
							resize: "none",
							padding: "8px",
							fontSize: "13px",
							borderRadius: "8px",
							border: "1px solid #ccc",
							outline: "none",
						}}
					/>

					<button
						onClick={sendMessage}
						style={{
							padding: "0 16px",
							background: "#10a37f",
							color: "#fff",
							border: "none",
							borderRadius: "8px",
							cursor: "pointer",
							fontSize: 14,
							whiteSpace: "nowrap",
						}}
					>
						Enviar
					</button>
				</div>
			</div>
		</div>
	);
}
