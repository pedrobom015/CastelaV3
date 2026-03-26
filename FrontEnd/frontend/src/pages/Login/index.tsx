import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
	sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

const GoogleIcon = () => (
	<svg viewBox="0 0 48 48" width="18" height="18">
		<path
			fill="#4285F4"
			d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.1c-.6 3-2.4 5.6-5 7.3v6h8.1c4.7-4.4 7.3-10.8 7.3-17.6z"
		/>
		<path
			fill="#34A853"
			d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-8.1-6c-2.1 1.4-4.8 2.2-7.8 2.2-6 0-11-4-12.8-9.4H3v6.2C7 42.9 14.9 48 24 48z"
		/>
		<path
			fill="#FBBC05"
			d="M11.2 29c-.5-1.4-.7-2.9-.7-4.5s.2-3.1.7-4.5V13.8H3A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.8L11.2 29z"
		/>
		<path
			fill="#EA4335"
			d="M24 9.5c3.4 0 6.4 1.2 8.8 3.4l6.6-6.6C35.9 2.5 30.4 0 24 0 14.9 0 7 5.1 3 12.8l8.2 6.2C13 13.5 18 9.5 24 9.5z"
		/>
	</svg>
);

const MicrosoftIcon = () => (
	<svg viewBox="0 0 21 21" width="18" height="18">
		<rect width="10" height="10" fill="#F25022" />
		<rect x="11" width="10" height="10" fill="#7FBA00" />
		<rect y="11" width="10" height="10" fill="#00A4EF" />
		<rect x="11" y="11" width="10" height="10" fill="#FFB900" />
	</svg>
);

const ErpIllustration = () => (
	<svg
		viewBox="0 0 280 260"
		width="100%"
		height="100%"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="140" cy="130" r="110" fill="white" fillOpacity="0.06" />
		<circle cx="140" cy="130" r="80" fill="white" fillOpacity="0.06" />
		{/* Dashboard card */}
		<rect
			x="30"
			y="50"
			width="140"
			height="90"
			rx="10"
			fill="white"
			fillOpacity="0.18"
		/>
		<rect
			x="30"
			y="50"
			width="140"
			height="22"
			rx="10"
			fill="white"
			fillOpacity="0.25"
		/>
		<rect
			x="30"
			y="61"
			width="140"
			height="11"
			fill="white"
			fillOpacity="0.25"
		/>
		<circle cx="45" cy="61" r="5" fill="#ff6b1a" />
		<rect
			x="56"
			y="58"
			width="60"
			height="6"
			rx="3"
			fill="white"
			fillOpacity="0.7"
		/>
		{/* Bar chart */}
		<rect
			x="44"
			y="100"
			width="12"
			height="28"
			rx="3"
			fill="#ff6b1a"
			fillOpacity="0.9"
		/>
		<rect
			x="62"
			y="88"
			width="12"
			height="40"
			rx="3"
			fill="white"
			fillOpacity="0.55"
		/>
		<rect
			x="80"
			y="95"
			width="12"
			height="33"
			rx="3"
			fill="#ff6b1a"
			fillOpacity="0.6"
		/>
		<rect
			x="98"
			y="80"
			width="12"
			height="48"
			rx="3"
			fill="white"
			fillOpacity="0.4"
		/>
		<rect
			x="116"
			y="90"
			width="12"
			height="38"
			rx="3"
			fill="#ff6b1a"
			fillOpacity="0.7"
		/>
		<rect
			x="134"
			y="85"
			width="12"
			height="43"
			rx="3"
			fill="white"
			fillOpacity="0.5"
		/>
		{/* Line chart card */}
		<rect
			x="185"
			y="45"
			width="70"
			height="55"
			rx="8"
			fill="white"
			fillOpacity="0.18"
		/>
		<rect
			x="193"
			y="53"
			width="40"
			height="5"
			rx="2.5"
			fill="white"
			fillOpacity="0.6"
		/>
		<rect
			x="193"
			y="62"
			width="25"
			height="4"
			rx="2"
			fill="white"
			fillOpacity="0.35"
		/>
		<polyline
			points="193,88 203,80 213,84 223,72 233,76 243,68"
			stroke="#ff6b1a"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
		<circle cx="243" cy="68" r="3" fill="#ff6b1a" />
		{/* Users card */}
		<rect
			x="185"
			y="112"
			width="70"
			height="55"
			rx="8"
			fill="white"
			fillOpacity="0.18"
		/>
		<rect
			x="193"
			y="120"
			width="30"
			height="5"
			rx="2.5"
			fill="white"
			fillOpacity="0.6"
		/>
		<circle cx="205" cy="140" r="8" fill="white" fillOpacity="0.28" />
		<circle cx="205" cy="137" r="4" fill="white" fillOpacity="0.7" />
		<path
			d="M197 151 C197 145 213 145 213 151"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
			fill="none"
		/>
		<circle cx="221" cy="139" r="3" fill="white" fillOpacity="0.42" />
		<path
			d="M216 151 C216 148 226 148 226 151"
			stroke="white"
			strokeWidth="1.5"
			strokeLinecap="round"
			fill="none"
		/>
		{/* Docs card */}
		<rect
			x="30"
			y="155"
			width="85"
			height="60"
			rx="8"
			fill="white"
			fillOpacity="0.18"
		/>
		<rect
			x="40"
			y="165"
			width="50"
			height="5"
			rx="2.5"
			fill="white"
			fillOpacity="0.6"
		/>
		<rect
			x="40"
			y="175"
			width="60"
			height="4"
			rx="2"
			fill="white"
			fillOpacity="0.35"
		/>
		<rect
			x="40"
			y="183"
			width="45"
			height="4"
			rx="2"
			fill="white"
			fillOpacity="0.35"
		/>
		<rect
			x="40"
			y="191"
			width="55"
			height="4"
			rx="2"
			fill="white"
			fillOpacity="0.35"
		/>
		<rect
			x="40"
			y="199"
			width="38"
			height="4"
			rx="2"
			fill="white"
			fillOpacity="0.35"
		/>
		{/* Gear card */}
		<rect
			x="128"
			y="155"
			width="60"
			height="60"
			rx="8"
			fill="white"
			fillOpacity="0.18"
		/>
		<circle
			cx="158"
			cy="185"
			r="13"
			stroke="white"
			strokeWidth="2"
			fill="none"
			fillOpacity="0.5"
		/>
		<circle cx="158" cy="185" r="5" fill="white" fillOpacity="0.7" />
		<line
			x1="158"
			y1="168"
			x2="158"
			y2="172"
			stroke="white"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
		<line
			x1="158"
			y1="198"
			x2="158"
			y2="202"
			stroke="white"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
		<line
			x1="141"
			y1="185"
			x2="145"
			y2="185"
			stroke="white"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
		<line
			x1="171"
			y1="185"
			x2="175"
			y2="185"
			stroke="white"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
		<line
			x1="146"
			y1="173"
			x2="149"
			y2="176"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<line
			x1="167"
			y1="194"
			x2="170"
			y2="197"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const [erro, setErro] = useState("");
	const [loading, setLoading] = useState(false);
	const [resetEnviado, setResetEnviado] = useState(false);
	const navigate = useNavigate();

	const handleSuccess = () => navigate("/", { replace: true });

	const loginEmailSenha = async () => {
		if (!email || !senha) {
			setErro("Preencha o e-mail e a senha.");
			return;
		}
		setErro("");
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, senha);
			handleSuccess();
		} catch {
			setErro("E-mail ou senha inválidos.");
		} finally {
			setLoading(false);
		}
	};

	const loginGoogle = async () => {
		setErro("");
		setLoading(true);
		try {
			await signInWithPopup(auth, new GoogleAuthProvider());
			handleSuccess();
		} catch {
			setErro("Não foi possível entrar com o Google.");
		} finally {
			setLoading(false);
		}
	};

	const loginMicrosoft = async () => {
		setErro("");
		setLoading(true);
		try {
			const p = new OAuthProvider("microsoft.com");
			p.addScope("openid");
			p.addScope("profile");
			p.addScope("email");
			p.setCustomParameters({ prompt: "select_account" });
			await signInWithPopup(auth, p);
			handleSuccess();
		} catch {
			setErro("Não foi possível entrar com a Microsoft.");
		} finally {
			setLoading(false);
		}
	};

	const esqueceuSenha = async () => {
		if (!email) {
			setErro("Digite seu e-mail para redefinir a senha.");
			return;
		}
		setErro("");
		setLoading(true);
		try {
			await sendPasswordResetEmail(auth, email);
			setResetEnviado(true);
		} catch {
			setErro("Não foi possível enviar o e-mail de redefinição.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center p-4"
			style={{
				background: "linear-gradient(135deg, #f0ede8 0%, #e8e2da 100%)",
			}}
		>
			<div
				className="flex rounded-2xl shadow-2xl overflow-hidden w-full"
				style={{ maxWidth: 860 }}
			>
				{/* Painel esquerdo — branding + ilustração */}
				<div
					className="flex flex-col p-10 flex-1 min-w-0"
					style={{
						background:
							"linear-gradient(145deg, #ff914d 0%, #e85a10 100%)",
					}}
				>
					{/* Logo */}
					<div className="flex items-center gap-3 mb-1">
						<div
							className="w-9 h-9 rounded-xl flex items-center justify-center"
							style={{ background: "rgba(255,255,255,0.2)" }}
						>
							<svg
								viewBox="0 0 24 24"
								width="20"
								height="20"
								fill="none"
							>
								<rect
									x="2"
									y="2"
									width="8"
									height="8"
									rx="2"
									fill="white"
									fillOpacity="0.95"
								/>
								<rect
									x="14"
									y="2"
									width="8"
									height="8"
									rx="2"
									fill="white"
									fillOpacity="0.5"
								/>
								<rect
									x="2"
									y="14"
									width="8"
									height="8"
									rx="2"
									fill="white"
									fillOpacity="0.5"
								/>
								<rect
									x="14"
									y="14"
									width="8"
									height="8"
									rx="2"
									fill="white"
									fillOpacity="0.75"
								/>
							</svg>
						</div>
						<div>
							<p className="text-white font-bold text-base leading-none">
								Castela ERP
							</p>
							<p className="text-orange-200 text-xs">
								Presserv Informática
							</p>
						</div>
					</div>

					{/* Ilustração */}
					<div className="flex-1 flex items-center justify-center">
						<ErpIllustration />
					</div>

					{/* Tagline */}
					<div>
						{/* 		<p className="text-white font-semibold text-sm leading-snug">
							Consultoria que você confia
						</p> */}
						<p className="text-orange-200 text-xs mt-2">
							© 2025 · v2.0 Web
						</p>
					</div>
				</div>

				{/* Painel direito — form */}
				<div
					className="flex flex-col justify-center bg-white px-10 py-10"
					style={{ width: 360, flexShrink: 0 }}
				>
					{resetEnviado ? (
						<div className="text-center">
							<div className="text-5xl mb-4">📧</div>
							<p className="font-bold text-gray-700 text-lg">
								E-mail enviado!
							</p>
							<p className="text-sm text-gray-400 mt-2 mb-6">
								Verifique sua caixa de entrada para redefinir a
								senha.
							</p>
							<button
								onClick={() => setResetEnviado(false)}
								className="text-sm font-medium"
								style={{ color: "#ff914d" }}
							>
								← Voltar ao login
							</button>
						</div>
					) : (
						<>
							<h2 className="text-2xl font-bold text-gray-800">
								Bem-vindo
							</h2>
							<p className="text-sm text-gray-400 mt-1 mb-8">
								Acesse sua conta para continuar
							</p>

							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-1">
									<label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
										E-mail
									</label>
									<input
										type="email"
										placeholder="seu@email.com"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										onKeyDown={(e) =>
											e.key === "Enter" &&
											loginEmailSenha()
										}
										disabled={loading}
										className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50 text-gray-700"
									/>
								</div>

								<div className="flex flex-col gap-1">
									<label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
										Senha
									</label>
									<input
										type="password"
										placeholder="••••••••"
										value={senha}
										onChange={(e) =>
											setSenha(e.target.value)
										}
										onKeyDown={(e) =>
											e.key === "Enter" &&
											loginEmailSenha()
										}
										disabled={loading}
										className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-gray-50 text-gray-700"
									/>
								</div>

								{erro && (
									<p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
										{erro}
									</p>
								)}

								<button
									onClick={loginEmailSenha}
									disabled={loading}
									className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 shadow-sm mt-1"
									style={{
										background: loading
											? "#f4a97a"
											: "linear-gradient(135deg, #ff914d 0%, #e85a10 100%)",
									}}
								>
									{loading ? "Entrando..." : "Entrar"}
								</button>

								<button
									onClick={esqueceuSenha}
									disabled={loading}
									className="text-xs text-center"
									style={{ color: "#ff914d" }}
								>
									Esqueceu sua senha?
								</button>
							</div>

							<div className="flex items-center gap-3 my-6">
								<div className="flex-1 h-px bg-gray-100" />
								<span className="text-xs text-gray-300 font-semibold tracking-widest">
									OU
								</span>
								<div className="flex-1 h-px bg-gray-100" />
							</div>

							<div className="flex gap-3">
								<button
									onClick={loginGoogle}
									disabled={loading}
									title="Google"
									className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
								>
									<GoogleIcon /> Google
								</button>
								<button
									onClick={loginMicrosoft}
									disabled={loading}
									title="Microsoft"
									className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
								>
									<MicrosoftIcon /> Microsoft
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
