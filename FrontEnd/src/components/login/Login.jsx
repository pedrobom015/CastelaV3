import { useState, useEffect } from "react";
import {
	GoogleAuthProvider,
	OAuthProvider,
	signInWithPopup,
	signInWithRedirect,
	updateProfile,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../auth/firebase";
import authProvider from "../../routes/authProvider"; // 👈 importa seu authProvider
import "./Login.css";
import google from "../../assets/img/google.svg";
import microsoft from "../../assets/img/microsoft.svg";
import logo from "../../assets/img/logo.svg";
import { useModule } from "../../routes/context/ModuleContext";
export default function Login() {
	const [email, setEmail] = useState("");
	const [senha, setSenha] = useState("");
	const {
		setPermissions,
		setActivePermissionContext,
		setGerais,
		setActiveModule,
	} = useModule();
	useEffect(() => {
		setPermissions([]);
		setActivePermissionContext([]);
		setGerais([]);
		setActiveModule([]);
	}, []);

	const navigate = useNavigate();

	const handlePostLogin = async () => {
		try {
			await authProvider.login(); // 👈 chama login do authProvider
			navigate("/"); // 👈 redireciona para o admin
		} catch (err) {
			console.error("Erro pós-login:", err);
		}
	};

	const loginEmailSenha = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, senha);
			await handlePostLogin();
		} catch (err) {
			console.error("Erro ao logar com email/senha:", err);
		}
	};

	const loginGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			await handlePostLogin();
		} catch (err) {
			console.error("Erro ao logar com Google:", err);
		}
	};

	/* 	const loginMicrosoft = async () => {
		try {
			const provider = new OAuthProvider("microsoft.com");
			await signInWithPopup(auth, provider);
			await handlePostLogin();
		} catch (err) {
			console.error("Erro ao logar com Microsoft:", err);
		}
	}; */

	const loginMicrosoft = async () => {
		try {
			const provider = new OAuthProvider("microsoft.com");
			provider.addScope("openid");
			provider.addScope("profile");
			provider.addScope("email");
			provider.setCustomParameters({ prompt: "select_account" });

			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			const credential = OAuthProvider.credentialFromResult(result);
			const accessToken = credential.accessToken;

			// Obter a foto do perfil da Microsoft
			const response = await fetch(
				"https://graph.microsoft.com/v1.0/me/photo",
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				}
			);

			/* 	// 3. Atualizar o perfil do usuário com a nova URL
				await updateProfile(user, {
					photoURL: photoURL,
				}); */
			const blob = await response.blob();

			await handlePostLogin();
		} catch (err) {
			console.error("Erro ao logar com Microsoft:", err);
		}
	};

	return (
		<div className="main-login">
			<div className="div_login">
				<div className="div-logo">
					<img src={logo} alt="logo" className="logo" />
				</div>

				<div className="default_login">
					<input
						placeholder="Email"
						onChange={(e) => setEmail(e.target.value)}
					/>
					<input
						placeholder="Senha"
						type="password"
						onChange={(e) => setSenha(e.target.value)}
					/>
					<button onClick={loginEmailSenha}>Entrar</button>
					<h5>Esqueceu sua senha?</h5>
				</div>

				<div className="social_login">
					<h5>entre com</h5>
					<div className="social_buttons">
						<button onClick={loginGoogle}>
							<img
								src={google}
								alt="Google"
								className="social_icons"
							/>
						</button>
						<button onClick={loginMicrosoft}>
							<img
								src={microsoft}
								alt="Microsoft"
								className="social_icons"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
