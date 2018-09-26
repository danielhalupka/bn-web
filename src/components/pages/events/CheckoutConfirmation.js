import React, { Component } from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import { Paper } from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";

import Button from "../../common/Button";
import notifications from "../../../stores/notifications";
import selectedEvent from "../../../stores/selectedEvent";
import user from "../../../stores/user";
import EventSummaryGrid from "./EventSummaryGrid";
import CreditCardForm from "../../common/CreditCardForm";
import { primaryHex } from "../../styles/theme";
import Divider from "../../common/Divider";
import cart from "../../../stores/cart";
import EditCartItemDialog from "./EditCartItemDialog";

const styles = theme => ({
	card: {
		padding: theme.spacing.unit * 4
	},
	buttonsContainer: {
		justifyContent: "flex-end",
		display: "flex"
	},
	ticketsContainer: {
		marginTop: theme.spacing.unit * 6,
		borderStyle: "solid",
		borderWidth: 0.5,
		borderColor: theme.palette.grey[200],
		borderRadius: theme.shape.borderRadius
	},
	ticketLineEntry: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	userContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2,
		display: "flex",
		alignItems: "center"
	},
	userName: {
		color: primaryHex
		//paddingTop: 2
	},
	userIcon: {
		color: primaryHex,
		marginRight: theme.spacing.unit
	}
});

const TicketLineEntry = ({ col1, col2, col3, col4, className }) => (
	<Grid alignItems="center" container className={className}>
		<Grid item xs={1} sm={1} md={1} lg={1}>
			{col1}
		</Grid>
		<Grid item xs={7} sm={7} md={6} lg={7}>
			{col2}
		</Grid>
		<Grid item xs={2} sm={2} md={5} lg={2}>
			{col3}
		</Grid>
		<Grid item xs={2} sm={2} md={6} lg={2}>
			{col4}
		</Grid>
	</Grid>
);

@observer
class CheckoutConfirmation extends Component {
	constructor(props) {
		super(props);

		this.state = {
			editingItemId: null
		};
	}

	componentDidMount() {
		cart.refreshCart();

		if (
			this.props.match &&
			this.props.match.params &&
			this.props.match.params.id
		) {
			const { id } = this.props.match.params;

			selectedEvent.refreshResult(id, errorMessage => {
				notifications.show({
					message: errorMessage,
					variant: "error"
				});
			});
		} else {
			//Don't show any event specific details
		}
	}

	renderTickets() {
		const { ticket_types } = selectedEvent;
		const { classes } = this.props;
		const { items } = cart;

		if (!items) {
			console.warn("No cart items");
			return null;
		}

		return items.map(item => {
			const {
				id,
				item_type,
				unit_price_in_cents,
				quantity,
				ticket_type_id,
				ticket_pricing_id,
				description
			} = item;

			if (!quantity || item_type === "Fees") {
				return null;
			}

			return (
				<TicketLineEntry
					key={id}
					col1={
						<IconButton
							onClick={() =>
								this.setState({
									editingItemId: id,
									editingTicketTypeId: ticket_type_id,
									editingItemName: description,
									editingItemQuantity: quantity,
									editingItemPriceInCents: unit_price_in_cents
								})
							}
							aria-label="Edit"
						>
							<EditIcon />
						</IconButton>
					}
					col2={
						<Typography variant="body1">
							{quantity} x {description}
						</Typography>
					}
					col3={
						<Typography variant="body1">
							$ {Math.round(unit_price_in_cents / 100)}
						</Typography>
					}
					col4={
						<Typography variant="body1">
							$ {Math.round((unit_price_in_cents / 100) * quantity)}
						</Typography>
					}
					className={classes.ticketLineEntry}
				/>
			);
		});
	}

	renderTotals() {
		const { classes } = this.props;
		const { tickets, id } = selectedEvent;
		const { fees, total_in_cents } = cart;

		return (
			<TicketLineEntry
				col1={null}
				col2={
					id ? (
						<Link
							to={`/events/${id}/tickets`}
							style={{ textDecoration: "none" }}
						>
							<Button>Change tickets</Button>
						</Link>
					) : null
				}
				col3={
					<span>
						<Typography variant="body1">Service fees:</Typography>
						<Typography variant="body1">Order total:</Typography>
					</span>
				}
				col4={
					<span>
						<Typography variant="body1">${fees}</Typography>
						<Typography variant="body1">
							${Math.round(total_in_cents / 100)}
						</Typography>
					</span>
				}
				className={classes.ticketLineEntry}
			/>
		);
	}

	render() {
		const { classes } = this.props;
		const {
			editingItemId,
			editingTicketTypeId,
			editingItemName,
			editingItemQuantity,
			editingItemPriceInCents
		} = this.state;

		//If the user has previously selected an event, it'll still be here
		//If they haven't selected an event but we have tickets in their cart from previously then display a generic checkout page
		const { event, venue, artists, organization, id } = selectedEvent;

		return (
			<Paper className={classes.card}>
				<EditCartItemDialog
					id={editingItemId}
					ticketTypeId={editingTicketTypeId}
					name={editingItemName}
					quantity={editingItemQuantity}
					priceInCents={editingItemPriceInCents}
					onClose={() => this.setState({ editingItemId: null })}
				/>
				{event ? (
					<EventSummaryGrid
						event={event}
						venue={venue}
						organization={organization}
						artists={artists}
					/>
				) : (
					<Typography variant="display2">Checkout</Typography>
				)}

				<Grid container spacing={24}>
					<Grid
						item
						xs={12}
						sm={12}
						lg={12}
						className={classes.ticketsContainer}
					>
						<TicketLineEntry
							col1={null}
							col2={<Typography variant="subheading">Ticket</Typography>}
							col3={<Typography variant="subheading">Price</Typography>}
							col4={<Typography variant="subheading">Subtotal</Typography>}
							className={classes.ticketLineEntry}
						/>

						{this.renderTickets()}

						<Divider />

						{this.renderTotals()}
					</Grid>

					<Grid item xs={12} sm={12} lg={12} className={classes.userContainer}>
						<AccountCircle
							style={{ fontSize: 45 }}
							className={classes.userIcon}
						/>
						<Typography className={classes.userName} variant="body1">
							{user.isAuthenticated
								? `Hi, ${user.firstName} ${user.lastName}!`
								: "Please login first"}
						</Typography>
					</Grid>

					{user.isAuthenticated ? (
						<Grid item xs={12} sm={12} lg={12}>
							<CreditCardForm />
						</Grid>
					) : null}

					{user.isAuthenticated ? (
						<Grid item xs={12} sm={12} lg={12}>
							<div className={classes.buttonsContainer}>
								<Button
									onClick={() => {
										//TODO go to submit()
										this.props.history.push(`/events/${id}/tickets/success`);
									}}
									size="large"
									customClassName="primary"
								>
									Purchase tickets
								</Button>
							</div>
						</Grid>
					) : null}
				</Grid>
			</Paper>
		);
	}
}

CheckoutConfirmation.propTypes = {
	match: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CheckoutConfirmation);
