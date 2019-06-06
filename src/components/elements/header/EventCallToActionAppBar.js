import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import classnames from "classnames";

import {
	fontFamilyDemiBold,
	secondaryHex,
	toolBarHeight
} from "../../../config/theme";
import AppBarLogo from "./AppBarLogo";
import Button from "../Button";
import { Slide, Typography } from "@material-ui/core";
import Settings from "../../../config/settings";
import user from "../../../stores/user";

const eventImageHeight = 45;

const displayTime = ({ event_start, door_time, timezone }) => {
	const displayDate = moment(event_start)
		.tz(timezone)
		.format("ddd, D MMM YYYY");
	const displayDoorTime = moment(door_time)
		.tz(timezone)
		.format("hh:mm A");
	const displayShowTime = moment(event_start)
		.tz(timezone)
		.format("hh:mm A");

	return `${displayDate}, Doors ${displayDoorTime} - Show ${displayShowTime}`;
};

const styles = theme => {
	return {
		toolBar: {
			display: "flex",
			justifyContent: "center",
			paddingRight: theme.spacing.unit * 2,
			paddingLeft: theme.spacing.unit * 2,
			...toolBarHeight
		},
		barContent: {
			display: "flex",
			justifyContent: "space-between",
			maxWidth: 1250,
			width: "100%"
		},
		rightMenuOptions: {
			alignItems: "center",
			display: "flex"
		},
		eventDetailsContainer: {
			display: "flex",
			flex: 1,
			alignItems: "center",
			paddingRight: theme.spacing.unit * 4,
			paddingLeft: theme.spacing.unit * 4
			//
			// borderStyle: "solid",
			// borderColor: "blue",
			// borderWidth: 0.5
		},
		mobileHeaderImage: {
			height: eventImageHeight,
			width: eventImageHeight * Settings().promoImageAspectRatio,
			backgroundImage: "linear-gradient(255deg, #e53d96, #5491cc)",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
			backgroundPosition: "center",
			borderRadius: 4
		},
		textContainer: {
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			paddingLeft: theme.spacing.unit * 2
		},
		eventTitle: {
			fontFamily: fontFamilyDemiBold
		},
		subHeading: {
			fontSize: theme.typography.fontSize * 0.8,
			color: "#9DA3B4",
			lineHeight: 1
		},
		authButtonText: {
			fontFamily: fontFamilyDemiBold
		},
		signUpText: {
			color: secondaryHex
		}
	};
};

const showOnScrollHeight = 450;

class EventCallToActionAppBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			show: false
		};

		this.onWindowScroll = this.onWindowScroll.bind(this);
	}

	componentDidMount() {
		window.addEventListener("scroll", this.onWindowScroll);
	}

	componentWillUnmount() {
		window.removeEventListener("scroll", this.onWindowScroll);
	}

	onWindowScroll() {
		if (window.pageYOffset > showOnScrollHeight && !this.state.show) {
			this.setState({ show: true });
		} else if (window.pageYOffset < showOnScrollHeight && this.state.show) {
			this.setState({ show: false });
		}
	}

	onAuth(type) {
		user.showAuthRequiredDialog(() => {}, type);
	}

	render() {
		const {
			classes,
			ctaButton,
			isAuthenticated,
			promo_image_url,
			name,
			venue,
			event_start,
			door_time
		} = this.props;

		const { timezone } = venue;

		const { show } = this.state;

		return (
			<Slide direction="down" in={show}>
				<AppBar>
					<Toolbar className={classes.toolBar}>
						<div className={classes.barContent}>
							<Link to={"/"}>
								<AppBarLogo/>
							</Link>

							<div className={classes.eventDetailsContainer}>
								<div
									className={classes.mobileHeaderImage}
									style={{
										backgroundImage: `url(${promo_image_url})`
									}}
								/>
								<div className={classes.textContainer}>
									<Typography className={classes.eventTitle}>{name}</Typography>
									<Typography className={classes.subHeading}>
										{venue.name} -{" "}
										{displayTime({ event_start, door_time, timezone })}
									</Typography>
								</div>
							</div>

							<span className={classes.rightMenuOptions}>
								{ctaButton}
								{isAuthenticated === false ? (
									<span>
										<Button
											variant={"text"}
											classes={{ label: classes.authButtonText }}
											onClick={() => this.onAuth("login")}
										>
											Log in
										</Button>
										<Button
											variant={"text"}
											classes={{
												label: classnames({
													[classes.authButtonText]: true,
													[classes.signUpText]: true
												})
											}}
											onClick={() => this.onAuth("signup")}
										>
											Sign up
										</Button>
									</span>
								) : null}
							</span>
						</div>
					</Toolbar>
				</AppBar>
			</Slide>
		);
	}
}

EventCallToActionAppBar.propTypes = {
	classes: PropTypes.object.isRequired,
	ctaButton: PropTypes.element.isRequired,
	isAuthenticated: PropTypes.oneOf([true, false, null]),
	name: PropTypes.string.isRequired,
	venue: PropTypes.object.isRequired,
	event_start: PropTypes.string.isRequired,
	door_time: PropTypes.string.isRequired,
	promo_image_url: PropTypes.string.isRequired
};

export default withStyles(styles)(EventCallToActionAppBar);
