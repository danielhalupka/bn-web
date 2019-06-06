import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import Routes from "./components/routes/Routes";
import Bigneon from "./helpers/bigneon";
import analytics from "./helpers/analytics";
import errorReporting from "./helpers/errorReporting";
import insertScript from "./helpers/insertScript";
import Settings from "./config/settings";

window.bigneonVersion = REACT_APP_VERSION;
console.debug("BigNeon Version: ", REACT_APP_VERSION);

//Upload widget for cloudinary (Can be removed when we switch to S3)
insertScript({
	src: "//widget.cloudinary.com/global/all.js",
	id: "cloudinary-js"
});
insertScript({ src: "https://js.stripe.com/v3/", id: "stripe-js" });

Bigneon({}, {});
Settings();
analytics.init();
errorReporting.init();

ReactDOM.render(<Routes/>, document.querySelector("#root"));
