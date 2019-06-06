import checkWebPFeature from "../helpers/checkWebPFeature";

let settings;

export const settingsFactory = () => {
	if (!settings) {
		let webUrl = process.env.REACT_APP_WEB_URL;
		if (webUrl.substring(webUrl.length - 1) == "/") {
			webUrl = webUrl.substring(0, webUrl.length - 1);
		}

		settings = {
			promoImageAspectRatio: 1920 / 1080,
			webPSupported: null, //Does the browser support next gen image formats
			webUrl
			//TODO add all process.env variables here
		};

		checkWebPFeature("lossy", isSupported => {
			settings.webPSupported = isSupported;
		});
	}

	return settings;
};

export default settingsFactory;
