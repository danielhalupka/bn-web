import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";

import notifications from "../../../../../../stores/notifications";
import Button from "../../../../../elements/Button";
import Bigneon from "../../../../../../helpers/bigneon";
import Divider from "../../../../../common/Divider";
import StyledLink from "../../../../../elements/StyledLink";
import HoldRow from "./HoldRow";
import HoldDialog, { HOLD_TYPES } from "./HoldDialog";
import Container from "../Container";
import Dialog from "../../../../../elements/Dialog";
import Loader from "../../../../../elements/loaders/Loader";
import user from "../../../../../../stores/user";
import { secondaryHex } from "../../../../../../config/theme";

const styles = theme => ({
	root: {},
	shareableLinkContainer: {
		marginTop: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit * 2
	},
	shareableLinkText: {
		color: secondaryHex,
		fontSize: theme.typography.fontSize * 0.9
	}
});

class TicketHoldList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;

		this.state = {
			holdType: HOLD_TYPES.NEW,
			activeHoldId: null,
			showHoldDialog: null,
			ticketTypes: [],
			holds: [],
			deleteId: null
		};
	}

	componentDidMount() {
		this.loadEventDetails(this.eventId);

		this.refreshHolds();
	}

	loadEventDetails(id) {
		Bigneon()
			.events.ticketTypes.index({ event_id: id })
			.then(response => {
				const { data } = response.data;

				const ticketTypes = [];
				data.forEach((ticketType) => {
					if (ticketType.status !== "Cancelled") {
						ticketTypes.push(ticketType);
					}
				});

				this.setState({ ticketTypes });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Loading event details failed."
				});
			});
	}

	refreshHolds() {
		Bigneon()
			.events.holds.index({ event_id: this.eventId })
			.then(response => {
				const holds = response.data.data; //TODO Pagination

				this.setState({ holds });
			}).catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load holds."
				});
			});
	}

	onAddHold() {
		this.setState({
			activeHoldId: null,
			holdType: HOLD_TYPES.NEW,
			showHoldDialog: "-1"
		});
	}

	deleteHold(id) {
		Bigneon()
			.holds.delete({ id })
			.then(response => {
				this.refreshHolds();
				notifications.show({ message: "Hold deleted.", variant: "success" });
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to delete hold."
				});
			});
	}

	renderList() {
		const { holds, activeHoldId, showHoldDialog } = this.state;

		if (holds === null) {
			return <Loader/>;
		}

		if (holds && holds.length > 0) {
			const ths = [
				"Name",
				"Code",
				"Ticket Type",
				"Claimed from hold",
				"Remaining",
				"Action"
			];

			const onAction = (id, action) => {
				if (action === "Edit") {
					return this.setState({
						activeHoldId: id,
						showHoldDialog: true,
						holdType: HOLD_TYPES.EDIT
					});
				}
				if (action === "Split") {
					return this.setState({
						activeHoldId: id,
						showHoldDialog: true,
						holdType: HOLD_TYPES.SPLIT
					});
				}

				if (action === "Delete") {
					return this.setState({ deleteId: id });
				}

				if (action === "Link") {
					return this.setState({ showShareableLinkId: id });
				}
			};

			return (
				<div>
					<HoldRow heading>{ths}</HoldRow>
					{holds.map((hold, index) => {
						const {
							id,
							name,
							redemption_code,
							hold_type,
							quantity,
							available,
							parent_hold_id,
							...rest
						} = hold;

						let nameField = name;

						//Only show links to name list if it's not a child of another list
						if (!parent_hold_id) {
							nameField = (
								<StyledLink
									underlined
									key={id}
									to={`/admin/events/${this.eventId}/dashboard/holds/${id}`}
								>
									{name}
								</StyledLink>
							);
						}

						const tds = [
							nameField,
							redemption_code,
							hold_type,
							quantity - available,
							available
						];

						const active = activeHoldId === id && showHoldDialog;
						const iconColor = active ? "white" : "gray";
						return (
							<HoldRow
								active={active}
								gray={!(index % 2)}
								key={id}
								actions={
									user.hasScope("hold:write")
										? [
											{
												id: id,
												name: "Split",
												iconUrl: `/icons/split-${iconColor}.svg`,
												onClick: onAction.bind(this)
											},
											{
												id: id,
												name: "Link",
												iconUrl: `/icons/link-${iconColor}.svg`,
												onClick: onAction.bind(this)
											},
											{
												id: id,
												name: "Edit",
												iconUrl: `/icons/edit-${iconColor}.svg`,
												onClick: onAction.bind(this)
											},
											{
												id: id,
												name: "Delete",
												iconUrl: `/icons/delete-${iconColor}.svg`,
												onClick: onAction.bind(this)
											}
										  ]
										: [
											{
												id: id,
												name: "Link",
												iconUrl: `/icons/link-${iconColor}.svg`,
												onClick: onAction.bind(this)
											}
										  ]
								}
							>
								{tds}
							</HoldRow>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No holds created yet</Typography>;
		}
	}

	renderDialog() {
		const { ticketTypes, activeHoldId, holdType } = this.state;

		return (
			<HoldDialog
				holdType={holdType}
				open={true}
				eventId={this.eventId}
				holdId={activeHoldId}
				ticketTypes={ticketTypes}
				onSuccess={id => {
					this.refreshHolds();
					this.setState({ showHoldDialog: null });
				}}
				onClose={() => this.setState({ showHoldDialog: null })}
			/>
		);
	}

	renderDeleteDialog() {
		const { deleteId } = this.state;

		const onClose = () => this.setState({ deleteId: null });

		return (
			<Dialog title={"Delete hold?"} open={!!deleteId} onClose={onClose}>
				<div>
					<Typography>Are you sure you want to delete this hold?</Typography>

					<br/>
					<br/>
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1, marginRight: 5 }} onClick={onClose}>
							Cancel
						</Button>
						<Button
							style={{ flex: 1, marginLeft: 5 }}
							onClick={() => {
								this.deleteHold(deleteId);
								onClose();
							}}
						>
							Delete
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	renderShareableLink() {
		const { showShareableLinkId } = this.state;
		const { classes } = this.props;

		const onClose = () => this.setState({ showShareableLinkId: null });

		const { holds } = this.state;

		let url = null;
		if (showShareableLinkId) {
			const hold = holds.find(c => c.id === showShareableLinkId);
			const { redemption_code, event_id } = hold;

			url = `${window.location.protocol}//${window.location.host}/events/${event_id}/tickets?code=${redemption_code}`;
		}

		return (
			<Dialog iconUrl={"/icons/link-white.svg"} title={"Shareable link"} open={!!showShareableLinkId} onClose={onClose}>
				<div>
					<div className={classes.shareableLinkContainer}>
						<a href={url} target={"_blank"} className={classes.shareableLinkText}>{url}</a>
					</div>
					<div style={{ display: "flex" }}>
						<Button style={{ flex: 1 }} onClick={onClose}>
							Done
						</Button>
					</div>
				</div>
			</Dialog>
		);
	}

	render() {
		const { showHoldDialog } = this.state;
		const { classes } = this.props;

		return (
			<Container eventId={this.eventId} subheading={"tools"} useCardContainer>
				{showHoldDialog && this.renderDialog()}
				{this.renderDeleteDialog()}
				{this.renderShareableLink()}
				<div style={{ display: "flex" }}>
					<Typography variant="title">Manage Ticket Holds</Typography>
					<span style={{ flex: 1 }}/>
					{user.hasScope("hold:write") ? (
						<Button onClick={e => this.onAddHold()}>Create Hold</Button>
					) : (
						<span/>
					)}
				</div>

				<Divider style={{ marginBottom: 40 }}/>

				{this.renderList()}
			</Container>
		);
	}
}

export default withStyles(styles)(TicketHoldList);
