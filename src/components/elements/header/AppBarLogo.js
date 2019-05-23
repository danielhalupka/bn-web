import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { withStyles } from "@material-ui/core/styles";
import layout from "../../../stores/layout";
import servedImage from "../../../helpers/imagePathHelper";

const styles = () => {
	return {
		headerImage: {
			maxWidth: 140
		}
	};
};

const AppBarLogo = observer(({ classes }) => {
	const { showStudioLogo } = layout;

	return (
		<img
			alt="Header logo"
			className={classes.headerImage}
			src={
				showStudioLogo
					? servedImage("/images/bn-logo-text.svg")
					: servedImage("/images/bn-logo-text-web.svg")
			}
		/>
	);
});

AppBarLogo.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AppBarLogo);
