import { musicEnglish, conferenceEnglish } from "./languages";

const t = (key, count = 1) => {
	return musicEnglish[key];
};

export default t;