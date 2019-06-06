export default ({ src, id, type, content }) => {
	const script = document.createElement("script");

	if (id) {
		script.id = id;
	}

	if (type) {
		script.type = type;
	}

	if (src) {
		script.src = src;
	}

	if (content) {
		script.text = JSON.stringify(content);
	}

	script.async = true;
	script.crossorigin = true;
	document.body.appendChild(script);
};
