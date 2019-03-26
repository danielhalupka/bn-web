let isLoaded;

export const getDataUriFromPNG = (src, callback) => {
	console.log(src);
	
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	make_base(src);

	function make_base(src) {
		const base_image = new Image();
		base_image.src = src;
		base_image.onload = function(){
			context.drawImage(base_image, 100, 100);
		};
	}

	const pngUrl = canvas.toDataURL(); // PNG is the default

	callback(pngUrl);
};

export const loadJsPDF = (onSuccess = () => {}) => {
	if (isLoaded) {
		onSuccess();
		return;
	}

	const script = document.createElement("script");
	script.src = "/scripts/jspdf.min.js";
	script.onload = script.onreadystatechange = () => {
		const html2CanvasScript = document.createElement("script");

		html2CanvasScript.src = "/scripts/html2canvas.min.js";
		html2CanvasScript.onload = html2CanvasScript.onreadystatechange = () => {
			onSuccess();
			isLoaded = true;
		};

		document.head.appendChild(html2CanvasScript);
	};

	document.head.appendChild(script);
};
