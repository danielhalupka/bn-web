import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import Typography from "@material-ui/core/Typography";
import {
	fontFamilyDemiBold,
	primaryHex,
	secondaryHex
} from "../../config/theme";

const styles = theme => ({
	root: {
		borderRadius: "6px 6px 6px 0px",
		display: "inline-block"
	},
	small: {
		padding: theme.spacing.unit / 2,
		paddingBottom: theme.spacing.unit / 4
	},
	medium: {
		paddingLeft: theme.spacing.unit,
		paddingRight: theme.spacing.unit,
		paddingTop: theme.spacing.unit,
		paddingBottom: theme.spacing.unit / 2
	},
	secondary: {
		backgroundColor: "#FFE8F7",
		color: secondaryHex
	},
	green: {
		backgroundColor: "#EAF8EA",
		color: "#47C68A"
	},
	disabled: {
		backgroundColor: "rgb(93, 158, 198, 0.1)",
		color: "#ACBFCB"
	},
	gray: {
		backgroundColor: "rgb(93, 158, 198, 0.1)",
		color: "#000000"
	},
	text: {
		color: "inherit",
		fontSize: theme.typography.fontSize * 0.9,
		fontFamily: fontFamilyDemiBold,
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden"
	}
});

const ColorTag = props => {
	const { classes, children, style, variant, size } = props;

	return (
		<div
			style={style}
			className={classNames({
				[classes.root]: true,
				[classes[variant]]: true,
				[classes[size]]: true
			})}
		>
			<Typography className={classes.text}>{children}</Typography>
		</div>
	);
};

ColorTag.defaultProps = {
	style: {},
	variant: "secondary",
	size: "medium"
};

ColorTag.propTypes = {
	classes: PropTypes.object.isRequired,
	variant: PropTypes.oneOf(["secondary", "green", "disabled", "gray"]),
	children: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.array,
		PropTypes.string
	]).isRequired,
	size: PropTypes.oneOf(["small", "medium"])
};

export default withStyles(styles)(ColorTag);
