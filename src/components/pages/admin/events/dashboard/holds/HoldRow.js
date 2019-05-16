import React from "react";
import PropTypes from "prop-types";
import { withStyles, Typography, Hidden, Collapse } from "@material-ui/core";
import classNames from "classnames";
import Card from "../../../../../elements/Card";
import Divider from "../../../../../common/Divider";
import {
	fontFamilyDemiBold,
	textColorPrimary
} from "../../../../../../config/theme";
import CustomTooltip from "../../../../../elements/Tooltip";
import ColorTag from "../../../../../elements/ColorTag";

const styles = theme => {
	return {
		root: {
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2,

			paddingTop: theme.spacing.unit * 2,
			paddingBottom: theme.spacing.unit * 2,

			display: "flex",
			borderRadius: 4
		},
		default: {},
		gray: {
			backgroundColor: "#f5f7fa"
		},
		active: {
			backgroundColor: theme.palette.secondary.main,
			color: "#FFFFFF"
		},
		text: {},
		activeText: {
			color: "#FFFFFF"
		},
		headingText: {
			fontSize: theme.typography.caption.fontSize,
			color: "#b8bdbf",
			textTransform: "uppercase"
		},
		icon: {
			marginLeft: theme.spacing.unit * 2,
			width: 14,
			height: 14,
			cursor: "pointer"
		},
		desktopCard: {
			display: "flex",
			height: 70,
			alignItems: "center",
			marginTop: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2,
			paddingRight: theme.spacing.unit * 2
		},
		desktopIcon: {
			marginLeft: theme.spacing.unit * 2,
			width: 14,
			height: 14,
			cursor: "pointer"
		},
		mobileRow: {
			display: "flex",
			flex: 1,
			justifyContent: "space-between"
		},
		mobileCard: {
			borderRadius: 6,
			marginTop: theme.spacing.unit * 2,
			padding: theme.spacing.unit * 2
		},
		mobileHoldRow: {
			display: "flex",
			flexDirection: "column",
			width: "100%"
		},
		holdName: {
			marginBottom: theme.spacing.unit,
			underline: "none"
		},
		holdCode: {
			marginBottom: theme.spacing.unit,
			color: "#b1b0b2",
			textTransform: "uppercase"
		},
		mobileValue: {
			fontSize: theme.typography.fontSize * 0.75,
			fontFamily: fontFamilyDemiBold
		},
		timesUsedActiveTextMobile: {
			textAlign: "right"
		},
		codeTextMobile: {
			color: textColorPrimary,
			overflow: "hidden",
			textOverflow: "ellipsis"
			// fontFamily: fontFamilyDemiBold
		},
		mobileExpandedSection: {
			paddingTop: theme.spacing.unit * 2
		},
		mobileTicketTypesContainer: {
			paddingTop: theme.spacing.unit
		},
		mobileActionButtonGroup: {
			flex: 1,
			display: "flex",
			justifyContent: "space-between",
			paddingTop: theme.spacing.unit * 2
		},
		mobileActionLabel: {
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 0.75,
			marginLeft: 4
		},
		mobileActionButtonContainer: {
			display: "flex"
		},
		mobileIcon: {
			width: 12,
			height: 12,
			cursor: "pointer"
		},
		remainingNoColour: {
			color: theme.palette.secondary.main
		}
	};
};

const HoldRow = props => {
	const {
		heading,
		gray,
		active,
		onExpand,
		children,
		classes,
		expanded,
		actions,
		...rest
	} = props;

	const columnStyles = [
		{ flex: 3, textAlign: "left" },
		{ flex: 2, textAlign: "left" },
		{ flex: 3, textAlign: "center" },
		{ flex: 2, textAlign: "center" },
		{ flex: 2, textAlign: "center" },
		{ flex: 2, textAlign: "left" },
		{ flex: 2, textAlign: "left" }
	];

	const columns = children.map((text, index) => {
		const className = heading
			? classes.headingText
			: active
				? classes.activeText
				: classes.text;
		if (index == 2) {
			return (
				<div style={columnStyles[index]}>
					<ColorTag size={"small"} variant={"gray"}>
						{text}
					</ColorTag>
				</div>
			);
		} else if (index == 4) {
			return (
				<Typography
					className={classes.remainingNoColour}
					style={columnStyles[index]}
				>
					{text}
				</Typography>
			);
		} else {
			return (
				<Typography
					className={className}
					key={index}
					style={columnStyles[index]}
				>
					{text}
				</Typography>
			);
		}
	});

	const mobiHold = children => {
		return (
			<div className={classes.mobileHoldRow}>
				<Typography className={classes.holdName}>{children[0]}</Typography>
				<Typography className={classes.holdCode}>{children[1]}</Typography>
				<div>
					<div className={classes.mobileRow}>
						<Typography className={classes.headingText}>Type</Typography>
						<Typography className={classes.headingText}>Claimed</Typography>
						<Typography className={classes.headingText}>Remaining</Typography>
					</div>
					<div className={classes.mobileRow}>
						<ColorTag size={"small"} variant={"gray"}>
							{children[2]}
						</ColorTag>
						{/*<Typography>{children[2]}</Typography>*/}
						<Typography>{children[3]}</Typography>
						<Typography className={classes.remainingNoColour}>
							{children[4]}
						</Typography>
					</div>
				</div>
			</div>
		);
	};

	let actionButtons = <span>&nbsp;</span>;
	if (actions) {
		actionButtons = (
			<span>
				{actions.map(({ id, name, iconName, active, onClick }) => (
					<span
						key={name}
						onClick={e => {
							// e.stopPropagation();
							// e.nativeEvent.stopImmediatePropagation();
							onClick && onClick(id, name);
						}}
					>
						{/*<img alt={name} src={iconUrl} className={classes.icon}/>*/}
						<img
							alt={name}
							src={`/icons/${iconName}-${active ? "active" : "gray"}.svg`}
							className={classes.icon}
						/>
					</span>
				))}
			</span>
		);
	}

	let mobileActionButtons = <span>&nbsp;</span>;
	if (actions) {
		mobileActionButtons = (
			<div className={classes.mobileActionButtonGroup}>
				{actions.map(({ id, name, iconName, onClick }) => (
					<div
						key={name}
						className={classes.mobileActionButtonContainer}
						onClick={e => {
							// e.stopPropagation();
							// e.nativeEvent.stopImmediatePropagation();
							onClick && onClick(id, name);
						}}
					>
						<img
							alt={name}
							src={`/icons/${iconName}-${active ? "gray" : "active"}.svg`}
							className={classes.icon}
						/>
						<Typography className={classes.mobileActionLabel}>
							{name}
						</Typography>
					</div>
				))}
			</div>
		);
	}

	return (
		<div>
			{/*DESKTOP*/}
			<Hidden smDown>
				<Card variant={"raisedLight"} className={classes.desktopCard} {...rest}>
					{columns}

					{actionButtons}
				</Card>
			</Hidden>

			{/*MOBILE*/}
			<Hidden mdUp>
				<Card variant={"block"} className={classes.mobileCard}>
					<div className={classes.mobileRow} onClick={onExpand}>
						<div className={classes.mobileRow}>{mobiHold(children)}</div>
					</div>

					<Collapse in={expanded}>
						<Divider/>
						{mobileActionButtons}
					</Collapse>
				</Card>
			</Hidden>
		</div>
	);
};

HoldRow.propTypes = {
	classes: PropTypes.object.isRequired,
	children: PropTypes.array.isRequired,
	gray: PropTypes.bool,
	active: PropTypes.bool,
	heading: PropTypes.bool,
	actions: PropTypes.array
};

export default withStyles(styles)(HoldRow);
