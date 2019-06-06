import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import Button from "../elements/Button";
import { Typography, withStyles } from "@material-ui/core";
import { fontFamilyDemiBold } from "../../config/theme";
import errorReporting from "../../helpers/errorReporting";
import servedImage from "../../helpers/imagePathHelper";

const styles = theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		flexDirection: "column"
	},
	heading: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 3,
		color: "#AFC6D4",
		marginBottom: theme.spacing.unit * 2
	},
	image: {
		marginTop: theme.spacing.unit * 2,
		width: "45%",
		marginBottom: theme.spacing.unit * 2
	}
});

class NotFound extends Component {
	componentDidMount() {
		errorReporting.captureMessage(
			`React route not found: ${window.location.pathname}`,
			"warning"
		);
	}

	render() {
		const { classes, children } = this.props;

		return (
			<div className={classes.root}>
				<img
					className={classes.image}
					alt={"Page not found"}
					src={servedImage("/images/not-found.png")}
				/>
				<Typography className={classes.heading}>
					{children || "Page not found"}
				</Typography>
				<Link to="/">
					<Button variant={"callToAction"}>Home</Button>
				</Link>
			</div>
		);
	}
}

NotFound.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.string
};

export default withStyles(styles)(NotFound);
