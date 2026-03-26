// pages/_error.js

function Error({ statusCode }) {
	return (
		<p>
			{statusCode
				? `Erro ${statusCode}: Algo deu errado!`
				: "Erro desconhecido"}
		</p>
	);
}

Error.getInitialProps = ({ res, err, asPath }) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

	// ⚡ Se for uma API route e a página não existe, retorna JSON
	if (res && asPath.startsWith("/api")) {
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify({ error: "Route not found" }));
		return {};
	}

	return { statusCode };
};

export default Error;
