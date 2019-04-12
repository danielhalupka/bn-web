import React, { Component } from "react";
import { Typography, withStyles, CardMedia } from "@material-ui/core";

import notifications from "../../../../../../../stores/notifications";
import Button from "../../../../../../elements/Button";
import Bigneon from "../../../../../../../helpers/bigneon";
import Divider from "../../../../../../common/Divider";
import HoldRow from "./ChildRow";
import ChildDialog from "./ChildDialog";
import Container from "../../Container";
import Loader from "../../../../../../elements/loaders/Loader";
import user from "../../../../../../../stores/user";

const styles = theme => ({
	root: {}
});

class ChildrenList extends Component {
	constructor(props) {
		super(props);

		this.eventId = this.props.match.params.id;
		this.holdId = this.props.match.params.holdId;

		this.state = {
			activeHoldId: null, //TODO check this is not used and remove if not
			showDialog: null,
			ticketTypes: [],
			children: [],
			holdDetails: {}
		};
	}

	componentDidMount() {
		this.loadEventDetails();

		Bigneon()
			.holds.read({ id: this.holdId })
			.then(response => {
				const holdDetails = response.data;
				this.setState({ holdDetails }, () => this.refreshChildren());

			}).catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load holds."
				});
			});
	}

	loadEventDetails() {
		Bigneon()
			.events.read({ id: this.eventId })
			.then(response => {
				const { name, ticket_types } = response.data;
				this.setState({
					ticketTypes: ticket_types
				});
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

	refreshChildren() {
		if (this.eventId && this.holdId) {
			Bigneon().holds.children.index({ hold_id: this.holdId })
				.then(response => {
					//TODO Pagination
					this.setState({ children: response.data.data });
				})
				.catch(error => {
					notifications.showFromErrorResponse({
						error,
						defaultMessage: "Refreshing holds failed."
					});
				});
		}
	}

	onAddHold() {
		this.setState({
			activeHoldId: null,
			showDialog: true
		});
	}

	renderList() {
		const { children, hoverId } = this.state;
		const { classes } = this.props;

		if (children === null) {
			return <Loader/>;
		}

		if (children && children.length > 0) {
			const ths = [
				"Name",
				"Code",
				"Status",
				"Total Held",
				"Claimed",
				"Remaining",
				"Action"
			];

			const onAction = (id, action) => {
				// if (action === "Edit") {
				// 	this.setState({ activeHoldId: id, showDialog: true, holdType: HOLD_TYPES.EDIT })
				// }
				// if (action === "Split") {
				// 	this.setState({ activeHoldId: id, showDialog: true, holdType: HOLD_TYPES.SPLIT });
				// }
				// console.log(action, id);
			};

			return (
				<div>
					<HoldRow heading>{ths}</HoldRow>
					{children.map((ticket, index) => {
						const {
							id,
							name,
							redemption_code,
							status = "Unclaimed",
							quantity,
							claimed = 0
						} = ticket;

						const tds = [
							name,
							redemption_code,
							status,
							quantity,
							claimed,
							`${quantity - claimed}`
						];

						const active = false; //Might use this later, right now no need to highlight
						const iconColor = active ? "white" : "gray";
						return (
							<HoldRow
								onMouseEnter={e => this.setState({ hoverId: id })}
								onMouseLeave={e => this.setState({ hoverId: null })}
								active={active}
								gray={!(index % 2)}
								key={id}
								actions={[
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
								]}
							>
								{tds}
							</HoldRow>
						);
					})}
				</div>
			);
		} else {
			return <Typography variant="body1">No names added yet</Typography>;
		}
	}

	renderDialog() {
		const { ticketTypes, activeHoldId } = this.state;
		const eventId = this.eventId;
		const holdId = this.holdId;
		return (
			<ChildDialog
				open={true}
				eventId={eventId}
				holdId={holdId}
				ticketTypes={ticketTypes}
				onSuccess={id => {
					this.refreshChildren();
					this.setState({ showDialog: null });
				}}
				onClose={() => this.setState({ showDialog: null })}
			/>
		);
	}

	render() {
		const { showDialog, holdDetails } = this.state;
		const { classes } = this.props;

		return (
			<Container eventId={this.eventId} subheading={"tools"} useCardContainer>
				{showDialog && this.renderDialog()}

				<div style={{ display: "flex" }}>
					<Typography variant="title">{holdDetails.name}</Typography>
					<span style={{ flex: 1 }}/>
					{user.hasScope("hold:write") ? (
						<Button onClick={e => this.onAddHold()}>Assign Name To List</Button>
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

export default withStyles(styles)(ChildrenList);
