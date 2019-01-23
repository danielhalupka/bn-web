import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import Hidden from "@material-ui/core/Hidden";

import Button from "../../elements/Button";
import OrgAnalytics from "../../common/OrgAnalytics";
import SocialButton from "../../common/social/SocialButton";
import Divider from "../../common/Divider";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import user from "../../../stores/user";
import Card from "../../elements/Card";
import EventHeaderImage from "../../elements/event/EventHeaderImage";
import { fontFamilyDemiBold } from "../../styles/theme";
import ArtistSummary from "../../elements/event/ArtistSummary";
import EventDetailsOverlayCard from "../../elements/event/EventDetailsOverlayCard";
import DateFlag from "../../elements/event/DateFlag";
import SocialIconLink from "../../elements/social/SocialIconLink";
import nl2br from "../../../helpers/nl2br";
import Meta from "./Meta";

import t from "../../../translations/translate";

const styles = theme => ({
	root: {},
	container: {
		paddingBottom: theme.spacing.unit * 15,
		minHeight: 600
	},
	eventDetailsContent: {
		paddingLeft: theme.spacing.unit * 2,
		paddingRight: theme.spacing.unit * 2,
		paddingTop: theme.spacing.unit * 4
	},
	artistContainer: {
		marginBottom: theme.spacing.unit * 2,
		padding: theme.spacing.unit * 2
	},
	heading: {
		fontSize: theme.typography.fontSize * 2,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit * 3,
		marginBottom: theme.spacing.unit * 2
	},
	description: {
		lineHeight: 1.67,
		fontSize: theme.typography.fontSize * 1.1,
		marginTop: theme.spacing.unit * 2,
		color: "#656d78"
	},
	eventSubCardContent: {
		paddingLeft: theme.spacing.unit * 4,
		paddingRight: theme.spacing.unit * 4,
		paddingBottom: theme.spacing.unit * 4
	},
	eventSubCardRow1: {
		display: "flex",
		justifyContent: "space-between"
	},
	eventSubCardRow2: { marginTop: theme.spacing.unit * 4 },
	eventSubCardRow3: { marginTop: theme.spacing.unit * 4 },
	eventSubCardRow4: { marginTop: theme.spacing.unit * 4 },
	eventSubCardHeading: {
		fontSize: theme.typography.fontSize * 1.5,
		fontFamily: fontFamilyDemiBold,
		marginTop: theme.spacing.unit * 4
	},
	textAndIconRow: {
		display: "flex",
		alignContent: "center",
		alignItems: "center"
	},
	eventSubCardIcon: {
		marginRight: theme.spacing.unit * 2
	},
	eventSubCardSubHeading: {
		textTransform: "uppercase",
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 0.8,
		lineHeight: 0,
		marginTop: 4
	},
	eventSubCardSubText: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		fontSize: theme.typography.fontSize * 0.8,
		color: "#9da3b4",
		lineHeight: 1.5
	},
	eventSubCardSubLink: {
		fontSize: theme.typography.fontSize * 0.75,
		color: "#ff22b2"
	},
	ticketPricing: {
		marginTop: theme.spacing.unit * 2,
		fontSize: theme.typography.fontSize * 1.1,
		fontFamily: fontFamilyDemiBold
	},
	ticketPricingValue: {
		fontSize: theme.typography.fontSize * 1.8,
		color: theme.palette.secondary.main
	},
	callToAction: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		width: "100%"
	},
	socialLinks: {
		marginTop: theme.spacing.unit * 2,
		display: "flex",
		justifyContent: "center"
	}
});

@observer
class ViewEvent extends Component {
	componentDidMount() {
		if (this.props.match && this.props.match.params && this.props.match.params.id) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//TODO return 404
		}
	}

	toggleUserInterest() {
		if (!user.isAuthenticated) {
			//Show dialog for the user to signup/login, try again when they're authenticated
			user.showAuthRequiredDialog(this.toggleUserInterest.bind(this));
			return;
		}

		selectedEvent.toggleUserInterest();
	}

	renderInterestedButton() {
		if (!selectedEvent) {
			return null;
		}

		const { id, user_is_interested } = selectedEvent;

		if (user_is_interested === null) {
			//Unknown
			return null;
		}

		return (
			<Button
				style={{ width: "100%", marginTop: 10 }}
				variant={user_is_interested ? "default" : "primary"}
				onClick={this.toggleUserInterest.bind(this)}
			>
				{user_is_interested ? "I'm not interested" : "I'm interested"}
			</Button>
		);
	}

	get getDetailPageButtonCta() {
		const { event, hasAvailableTickets } = selectedEvent;

		if (hasAvailableTickets === false && !event.is_external) {
			return { ctaText: "No available tickets", enabled: false };
		}

		switch (event.override_status) {
			case "PurchaseTickets":
				return { ctaText: "Purchase Tickets", enabled: true };
			case "SoldOut":
				return {
					ctaText: "Sold Out",
					enabled: event.is_external ? false : true
				};
			case "OnSaleSoon":
				return {
					ctaText: "On Sale Soon",
					enabled: event.is_external ? false : true
				};
			case "TicketsAtTheDoor":
				return {
					ctaText: "Tickets At The Door",
					enabled: event.is_external ? false : true
				};
			case "UseAccessCode":
				return { ctaText: "Use Access Code", enabled: true };
			case "Free":
				return { ctaText: "Free", enabled: true };
			case "Rescheduled":
				return { ctaText: "Rescheduled", enabled: false };
			case "Cancelled":
				return { ctaText: "Cancelled", enabled: false };
			case "OffSale":
				return { ctaText: "Off-Sale", enabled: false };
			case "Ended":
				return { ctaText: "Sale Ended", enabled: false };
			default:
				return { ctaText: "Purchase Tickets", enabled: true };
		}
	}

	get getDetailPageButton() {
		const { classes } = this.props;
		const { event, id } = selectedEvent;
		const { is_external, external_url } = event;

		const { ctaText, enabled } = this.getDetailPageButtonCta;

		if (!enabled) {
			return (
				<Button disabled className={classes.callToAction}>
					{ctaText}
				</Button>
			);
		}
		if (is_external) {
			return (
				<a href={external_url} target="_blank">
					<Button className={classes.callToAction} variant={"callToAction"}>
						{ctaText}
					</Button>
				</a>
			);
		} else {
			return (
				<Link to={`/events/${id}/tickets`}>
					<Button className={classes.callToAction} variant={"callToAction"}>
						{ctaText}
					</Button>
				</Link>
			);
		}
	}

	render() {
		const { classes } = this.props;
		const {
			event,
			venue,
			artists,
			organization,
			id,
			ticket_types,
			hasAvailableTickets
		} = selectedEvent;

		if (event === null) {
			return <Typography variant="subheading">Loading...</Typography>;
		}

		if (event === false) {
			return <Typography variant="subheading">Event not found.</Typography>;
		}

		const {
			name,
			displayEventStartDate,
			additional_info,
			top_line_info,
			age_limit,
			promo_image_url,
			displayDoorTime,
			displayShowTime,
			eventStartDateMoment,
			is_external,
			tracking_keys,
			external_url
		} = event;

		const subCardContent = (
			<div className={classes.eventSubCardContent}>
				<div className={classes.eventSubCardRow1}>
					<Typography className={classes.eventSubCardHeading}>Time and location</Typography>
					<DateFlag date={eventStartDateMoment}/>
				</div>
				<div className={classes.eventSubCardRow2}>
					<div className={classes.textAndIconRow}>
						<img className={classes.eventSubCardIcon} src="/icons/events-black.svg"/>
						<Typography className={classes.eventSubCardSubHeading}>Date and time</Typography>
					</div>

					<Typography className={classes.eventSubCardSubText}>
						{displayEventStartDate}
						<br/>
						Doors {displayDoorTime} - {t("SHOW_TIME")} {displayShowTime}
						<br/>
						{age_limit
							? `This event is for over ${age_limit} year olds`
							: "This event is for all ages"}
					</Typography>
				</div>

				<Divider/>

				<div className={classes.eventSubCardRow3}>
					<div className={classes.textAndIconRow}>
						<img className={classes.eventSubCardIcon} src="/icons/location-black.svg"/>
						<Link to={`/venues/${venue.id}`}>
							<Typography className={classes.eventSubCardSubHeading}>{venue.name}</Typography>
						</Link>
					</div>

					<Typography className={classes.eventSubCardSubText}>
						{venue.address},<br/>
						{venue.city}, {venue.state}<br/>
						{venue.country}
						{venue.googleMapsLink ? (
							<a target="_blank" href={venue.googleMapsLink}>
								<span className={classes.eventSubCardSubLink}>&nbsp;-&nbsp;view map</span>
							</a>
						) : null}
					</Typography>
				</div>

				<Divider/>

				<div className={classes.eventSubCardRow4}>
					{hasAvailableTickets ? (
						<Typography className={classes.eventSubCardSubHeading}>Tickets</Typography>
					) : null}
					<br/>

					{ticket_types.map(({ id, name, status, ticket_pricing }) => {
						let price = "";
						if (ticket_pricing) {
							price = `$${(ticket_pricing.price_in_cents / 100).toFixed(2)}`;
							//description = ticket_pricing.name;
						}

						//TODO check if they're available, if none are available change the layout
						if (price) {
							return (
								<Typography key={id} className={classes.ticketPricing}>
									<span className={classes.ticketPricingValue}>{price}</span>
									&nbsp;&nbsp;
									{name}
								</Typography>
							);
						}
					})}
					{this.getDetailPageButton}

					{/* <div className={classes.socialLinks}>
						<SocialIconLink
							color="black"
							style={{ marginRight: 4 }}
							icon={"facebook"}
							size={40}
						/>
						<SocialIconLink
							color="black"
							style={{ marginLeft: 4 }}
							icon={"twitter"}
							size={40}
						/>
					</div> */}
				</div>
			</div>
		);

		//On mobile we need to move the description and artist details down. But we don't know how much space the overlayed div will take.
		const mobileMarginAdjustment = 600 + (ticket_types ? ticket_types.length * 50 : 50);

		return (
			<div>
				<OrgAnalytics trackingKeys={tracking_keys}/>
				<Meta {...event}/>

				<EventHeaderImage {...event} artists={artists}/>

				<Grid container spacing={0} direction="row" justify="center">
					<Grid item xs={12} sm={12} md={11} lg={9}>
						<Card variant="plain">
							<Hidden mdUp>
								<div
									style={{ marginTop: mobileMarginAdjustment }}
								/>
							</Hidden>
							<Grid
								container
								spacing={0}
								direction="row"
								justify="center"
								className={classes.container}
							>
								<Grid item xs={12} sm={12} md={6} lg={6}>
									<div className={classes.eventDetailsContent}>
										<Typography className={classes.description}>
											{nl2br(additional_info)}
										</Typography>
										<Grid container direction="row" justify="flex-start" alignItems="flex-start">
											{artists.map(({ artist }, index) => (
												<Grid
													item
													xs={12}
													sm={6}
													md={6}
													key={index}
													className={classes.artistContainer}
												>
													<ArtistSummary headliner={index === 0} {...artist}/>
												</Grid>
											))}
										</Grid>
									</div>
								</Grid>

								<Grid item xs={12} sm={12} md={6} lg={6}>
									{/* Desktop */}
									<Hidden smDown implementation="css">
										<EventDetailsOverlayCard
											style={{
												width: "30%",
												maxWidth: 550,
												top: 220,
												right: 200
											}}
											imageSrc={promo_image_url}
										>
											{subCardContent}
										</EventDetailsOverlayCard>
									</Hidden>

									{/* Mobile */}
									<Hidden mdUp>
										<EventDetailsOverlayCard
											style={{
												width: "100%",
												paddingLeft: 20,
												paddingRight: 20,
												top: 300
											}}
											imageSrc={promo_image_url}
										>
											{subCardContent}
										</EventDetailsOverlayCard>
									</Hidden>
								</Grid>
							</Grid>
						</Card>
					</Grid>
				</Grid>
			</div>
		);
	}
}

ViewEvent.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ViewEvent);
