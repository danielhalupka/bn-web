export default path => {
	if (process.env.PUBLIC_S3_IMAGES_PATH) {
		return process.env.PUBLIC_S3_IMAGES_PATH + path;
	} else {
		return path;
	}
};
