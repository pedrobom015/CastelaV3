const { spawn, execSync, exec } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

console.log(
	"\n\x1b[34m%s\x1b[0m",
	" ============================================",
);
console.log("\x1b[34m%s\x1b[0m", "  ADP - Controle de Processos da Funeraria");
console.log("\x1b[34m%s\x1b[0m", "  Presserv Informatica Ltda");
console.log(
	"\x1b[34m%s\x1b[0m",
	" ============================================\n",
);

const platform = os.platform();

// 1. Verifica node_modules
if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
	console.log(
		" \x1b[33m%s\x1b[0m",
		"Primeira execucao detectada. Instalando dependencias...",
	);
	try {
		execSync("npm install", { stdio: "inherit" });
	} catch (err) {
		console.error("Erro ao instalar dependencias:", err);
		process.exit(1);
	}
}

// 2. Função para abrir o navegador
const openBrowser = (url) => {
	const startCmd =
		platform === "darwin"
			? "open"
			: platform === "win32"
				? "start"
				: "xdg-open";
	setTimeout(() => {
		exec(`${startCmd} ${url}`);
	}, 3000);
};

// 3. Inicia o servidor Vite (npm run dev)
console.log(" Iniciando servidor em http://localhost:3000"); // Vite usa 5173 por padrão
console.log(" Pressione Ctrl+C para encerrar.\n");

openBrowser("http://localhost:3000");

const devProcess = spawn("npm", ["run", "dev"], {
	stdio: "inherit",
	shell: true,
});

devProcess.on("exit", (code) => process.exit(code || 0));
