import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import BnServer from "bn-api-node/dist/bundle.client";

import notifications from "../../../../../../../stores/notifications";
import Button from "../../../../../../elements/Button";
import Bigneon from "../../../../../../../helpers/bigneon";
import Dialog from "../../../../../../elements/Dialog";
import InputGroup from "../../../../../../common/form/InputGroup";

const createHold = BnServer.ResourceInterfaces.createHold;

const styles = {
	dialogContent: {},
	group: {
		// margin: `${theme.spacing.unit}px 0`,
	}
};

class ChildDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			child: {
				hold_id: this.props.holdId,
				name: "",
				phone: "",
				email: "",
				quantity: 1,
				redemption_code: ""
			},
			hold: createHold(),
			errors: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		this.loadHold();
	}

	loadHold() {
		const { holdId } = this.props;

		//Load the hold
		Bigneon()
			.holds.read({ id: holdId })
			.then(response => {
				const hold = response.data;
				this.setState({ hold });
			}).catch(error => {
				notifications.showFromErrorResponse({
					error,
					defaultMessage: "Failed to load hold."
				});
			});
	}

	validateFields() {
		if (this.hasSubmitted) {
			const errors = {};

			const { child } = this.state;

			const { name, quantity, redemption_code } = child;

			console.log(name);

			if (!name) {
				errors.name = "Name required.";
			}

			if (!redemption_code) {
				errors.redemption_code = "Redemption code required.";
			}

			if (!quantity) {
				errors.quantity = "Quantity required.";
			}

			console.log(errors);

			if (Object.keys(errors).length > 0) {
				this.setState({ errors });
				return false;
			}
		}

		this.setState({ errors: {} });

		return true;
	}

	submit() {
		this.hasSubmitted = true;

		if (!this.validateFields()) {
			notifications.show({
				variant: "warning",
				message: "There are invalid details."
			});
			return false;
		}

		const { child, hold } = this.state;
		const { onSuccess } = this.props;

		this.setState({ isSubmitting: true });

		const { ...saveData } = child;
		if (saveData.email === "") {
			delete saveData.email;
		}
		if (saveData.phone === "") {
			delete saveData.phone;
		}

		const { id, hold_type, discount_in_cents, max_per_order, end_at } = hold;
		const parentHoldInheritance = { id, hold_type, discount_in_cents, max_per_order, end_at };

		Bigneon()
			.holds.children.create({ ...parentHoldInheritance, ...saveData })
			.then(response => {
				const { id } = response.data;
				this.setState({ isSubmitting: false });
				const message = `Successfully ${child.id ? "updated" : "added"} name`;
				notifications.show({
					message,
					variant: "success"
				});
				onSuccess(id);
			})
			.catch(error => {
				console.error(error);
				this.setState({ isSubmitting: false });

				notifications.showFromErrorResponse({
					error,
					defaultMessage: `${child.id ? "Update" : "Create"} name failed.`
				});
			});
	}

	render() {
		const {
			onClose,
			classes,
			holdId,
			ticketTypes,
			eventId,
			onSuccess,
			...other
		} = this.props;

		const iconUrl = "/icons/tickets-white.svg";

		const { child, errors } = this.state;

		return (
			<Dialog
				onClose={onClose}
				title="Add Name to Hold"
				iconUrl={iconUrl}
				{...other}
			>
				<div>
					<InputGroup
						error={errors.name}
						value={child.name}
						name="name"
						label={"Name *"}
						placeholder="- Please enter name"
						autofocus={true}
						type="text"
						onChange={e => {
							child.name = e.target.value;
							this.setState({ child });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
					<InputGroup
						error={errors.contact}
						value={child.email || child.phone}
						name="email"
						label="Mobile Number or Email Address"
						placeholder="- Enter share method (optional)"
						type="text"
						onChange={e => {
							const value = e.target.value.trim();
							if (value.indexOf("@") !== -1) {
								child.email = value;
								child.phone = "";
							} else {
								child.email = "";
								child.phone = value;
							}
							this.setState({ child });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>

					<InputGroup
						error={errors.redemption_code}
						value={child.redemption_code}
						name="redemption_code"
						label="Redemption code *"
						placeholder="Please enter a code (min 6 chars)"
						type="text"
						onChange={e => {
							child.redemption_code = e.target.value.toUpperCase();
							this.setState({ child });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>

					<InputGroup
						error={errors.quantity}
						value={child.quantity}
						name="quantity"
						label="Total Tickets"
						placeholder="1"
						type="text"
						onChange={e => {
							child.quantity = +e.target.value;
							this.setState({ child });
						}}
						// onBlur={this.validateFields.bind(this)}
					/>
				</div>

				<div style={{ display: "flex" }}>
					<Button
						style={{ marginRight: 5, flex: 1 }}
						onClick={onClose}
						color="primary"
					>
						Cancel
					</Button>
					<Button
						style={{ marginLeft: 5, flex: 1 }}
						type="submit"
						variant="callToAction"
						onClick={this.submit.bind(this)}
					>
						Create
					</Button>
				</div>
			</Dialog>
		);
	}
}

ChildDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	holdId: PropTypes.string.isRequired,
	eventId: PropTypes.string,
	ticketTypes: PropTypes.array,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired
};

export default withStyles(styles)(ChildDialog);
