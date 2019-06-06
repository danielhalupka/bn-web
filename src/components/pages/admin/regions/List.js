import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import InputGroup from "../../../common/form/InputGroup";

import notifications from "../../../../stores/notifications";
import Button from "../../../elements/Button";
import Bigneon from "../../../../helpers/bigneon";
import PageHeading from "../../../elements/PageHeading";
import Loader from "../../../elements/loaders/Loader";
import StyledLink from "../../../elements/StyledLink";
import Dialog from "../../../elements/Dialog";
import RegionRow from "./RegionRow";
import Card from "../../../elements/Card";
import { fontFamilyDemiBold } from "../../../../config/theme";
import servedImage from "../../../../helpers/imagePathHelper";

const styles = theme => ({
	paper: {
		display: "flex"
	},
	content: {
		padding: theme.spacing.unit * 2
	},
	heading: {
		fontFamily: fontFamilyDemiBold
	},
	cardContent: {
		padding: theme.spacing.unit * 2,
		marginBottom: theme.spacing.unit,
		flex: "1 0 auto"
	},
	media: {
		width: "100%",
		maxWidth: 150,
		height: 150
	},
	actionButtons: {
		display: "flex",
		alignItems: "flex-end",
		padding: theme.spacing.unit
	},
	icon: {
		marginLeft: theme.spacing.unit * 2,
		width: 14,
		height: 14,
		cursor: "pointer"
	}
});

class RegionsList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			createModalActive: false,
			deleteModalActive: false,
			updateModalActive: false,
			regions: null,
			currentRegion: {},
			isSubmitting: false
		};
	}

	componentDidMount() {
		this.getRegions();
	}

	getRegions() {
		Bigneon()
			.regions.index()
			.then(response => {
				const { data, paging } = response.data; //@TODO Implement pagination
				this.setState({ regions: data });
			})
			.catch(error => {
				let message = "Loading regions failed.";
				if (
					error.response &&
					error.response.data &&
					error.response.data.error
				) {
					message = error.response.data.error;
				}

				notifications.show({
					message,
					variant: "error"
				});
			});
	}

	toggleModal(key, region) {
		this.setState({
			currentRegion: region,
			[key]: !this.state[key]
		});
	}

	doActionWithCurrentRegion(key, event) {
		event.preventDefault();
		const { currentRegion } = this.state;
		this.setState(
			{
				isSubmitting: true
			},
			() => {
				Bigneon()
					.regions[key](currentRegion)
					.then(response => {
						this.getRegions();
						this.setState(
							{ isSubmitting: false },
							this.toggleModal.bind(this, `${key}ModalActive`, {})
						);
					})
					.catch(error => {
						notifications.showFromErrorResponse({
							defaultMessage: "Loading regions failed.",
							error
						});
					});
			}
		);
	}

	renderRegions() {
		const { regions, paging, isLoading } = this.state;
		const { classes } = this.props;

		if (regions === null) {
			return <Loader/>;
		}

		if (regions.length === 0) {
			return <Typography>No regions currently.</Typography>;
		}

		return (
			<Card>
				<div className={classes.content}>
					<RegionRow>
						<Typography className={classes.heading}>Name</Typography>
						<Typography className={classes.heading}>Action</Typography>
					</RegionRow>
					{regions.map((region, index) => {
						const { id, name } = region;
						return (
							<RegionRow shaded={!(index % 2)} key={`region-${id}`}>
								<Typography className={classes.itemText}>{name}</Typography>
								<Typography className={classes.itemText}>
									<span
										key={`region-update-${id}`}
										onClick={this.toggleModal.bind(
											this,
											"updateModalActive",
											region
										)}
									>
										<img
											alt={name}
											src={servedImage(`/icons/edit-gray.svg`)}
											className={classes.icon}
										/>
									</span>
									<br/>
									{/* <span
										key={`region-delete-${id}`}
										onClick={this.toggleModal.bind(
											this,
											"deleteModalActive",
											region
										)}
									>
										<img alt={name} src={servedImage(`/icons/delete-gray.svg`)} className={classes.icon}/>
									</span> */}
								</Typography>
							</RegionRow>
						);
					})}
				</div>
			</Card>
		);
	}

	renderDeletionDialog() {
		const { deleteModalActive, currentRegion, isSubmitting } = this.state;
		return (
			<Dialog
				onClose={this.toggleModal.bind(this, "deleteModalActive", {})}
				open={deleteModalActive}
				title={`Delete region`}
			>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.doActionWithCurrentRegion.bind(this, "delete")}
				>
					<div>
						<Typography>
							{`Are you sure to delete region ${currentRegion.name}?`}
						</Typography>
					</div>
					<div>
						<br/>
						<Button
							style={{ marginRight: 10 }}
							onClick={this.toggleModal.bind(this, "deleteModalActive", {})}
							color="primary"
						>
							Keep region
						</Button>
						<Button disabled={isSubmitting} type="submit" variant="warning">
							{isSubmitting ? "Deleting..." : "Delete region"}
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}

	renderDialog(key, loadingString) {
		const { isSubmitting, currentRegion } = this.state;
		return (
			<Dialog
				onClose={this.toggleModal.bind(this, `${key}ModalActive`, {})}
				open={this.state[`${key}ModalActive`]}
				title={`${key.charAt(0).toUpperCase() + key.slice(1)} region`}
			>
				<form
					noValidate
					autoComplete="off"
					onSubmit={this.doActionWithCurrentRegion.bind(this, key)}
				>
					<InputGroup
						value={currentRegion.name}
						name="name"
						label="Region name"
						type="text"
						onChange={e =>
							this.setState({
								currentRegion: { ...currentRegion, name: e.target.value }
							})
						}
					/>
					<div style={{ display: "flex", marginTop: 20 }}>
						<Button
							style={{ marginRight: 5, flex: 1 }}
							onClick={this.toggleModal.bind(this, `${key}ModalActive`, {})}
							color="primary"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							disabled={isSubmitting}
							type="submit"
							style={{ marginLeft: 5, flex: 1 }}
							variant="callToAction"
						>
							{isSubmitting
								? loadingString
								: key.charAt(0).toUpperCase() + key.slice(1)}
						</Button>
					</div>
				</form>
			</Dialog>
		);
	}

	render() {
		const { classes } = this.props;
		return (
			<div>
				{this.renderDialog("create", "Creating...")}
				{this.renderDialog("update", "Updating...")}
				{/* {this.renderDeletionDialog()} */}
				<PageHeading>Regions</PageHeading>

				<Grid container spacing={24}>
					<Grid item xs={12} sm={12} lg={12}>
						<Button
							variant="callToAction"
							onClick={this.toggleModal.bind(this, "createModalActive", {})}
						>
							Create region
						</Button>
					</Grid>
				</Grid>

				<br/>

				{this.renderRegions()}
			</div>
		);
	}
}

export default withStyles(styles)(RegionsList);
