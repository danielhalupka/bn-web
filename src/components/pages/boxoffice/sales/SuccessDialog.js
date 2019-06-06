import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Dialog from "../../../elements/Dialog";
import Button from "../../../elements/Button";
import servedImage from "../../../../helpers/imagePathHelper";

const styles = theme => ({
	content: {
		minWidth: 350,
		alignContent: "center",
		textAlign: "center",
		paddingTop: theme.spacing.unit * 2,

		display: "flex",
		alignItems: "center",
		flexDirection: "column"
	},
	icon: {
		width: 120,
		height: "auto",
		marginBottom: theme.spacing.unit * 3
	}
});

const SuccessDialog = ({ message, classes, onClose }) => {
	return (
		<Dialog open={!!message} onClose={onClose} title={message}>
			<div className={classes.content}>
				<img
					className={classes.icon}
					src={servedImage("/icons/checkmark-circle-multi.svg")}
					alt={message}
				/>

				<Button
					style={{ width: "100%" }}
					variant="callToAction"
					onClick={onClose}
				>
					Return to Box Office
				</Button>
			</div>
		</Dialog>
	);
};

SuccessDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	message: PropTypes.string,
	onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(SuccessDialog);
