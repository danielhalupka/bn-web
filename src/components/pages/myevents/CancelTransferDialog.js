import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Button from "../../elements/Button";
import notification from "../../../stores/notifications";
import Bigneon from "../../../helpers/bigneon";
import Dialog from "../../elements/Dialog";

const styles = {
	content: {
		minWidth: 400,
		alignContent: "center",
		textAlign: "center"
	},
	actionButtons: {
		display: "flex"
	}
};

class CancelTransferDialog extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isCancelling: false
		};

		this.onClose = this.onClose.bind(this);
	}

	onClose() {
		const { isCancelling } = this.state;
		if (isCancelling) {
			return;
		}

		const { onClose } = this.props;
		onClose();
	}

	onCancel() {
		const { transferId } = this.props;

		this.setState({ isCancelling: true });

		Bigneon()
			.transfers.cancel({
				id: transferId
			})
			.then(response => {
				this.setState({ isCancelling: false }, () => {
					this.onClose();

					notification.show({
						message: "Ticket transfer cancelled.",
						variant: "success"
					});
				});
			})
			.catch(error => {
				this.setState({ isCancelling: false });
				console.error(error);
				notification.showFromErrorResponse({
					error,
					defaultMessage: "Ticket transfer cancel failed.",
					variant: "error"
				});
			});
	}

	render() {
		const { transferId, classes, ...other } = this.props;
		const { isCancelling } = this.state;

		const iconUrl = "/icons/close-white.svg";
		return (
			<Dialog
				onClose={this.onClose}
				iconUrl={iconUrl}
				title={"Cancel ticket transfer"}
				open={!!transferId}
				{...other}
			>
				<br/>
				<div className={classes.actionButtons}>
					<Button
						size="large"
						style={{ flex: 1, marginRight: 5 }}
						disabled={isCancelling}
						onClick={this.onClose}
					>
						Close
					</Button>
					<Button
						size="large"
						style={{ flex: 1, marginLeft: 5 }}
						onClick={this.onCancel.bind(this)}
						variant="callToAction"
						disabled={isCancelling}
					>
						{isCancelling ? "Cancelling..." : "Cancel transfer"}
					</Button>
				</div>
			</Dialog>
		);
	}
}

CancelTransferDialog.propTypes = {
	classes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	transferId: PropTypes.string
};

export default withStyles(styles)(CancelTransferDialog);
