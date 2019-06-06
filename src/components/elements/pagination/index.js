import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import NumberBlock from "./NumberBlock";
import MiddleSpace from "./MiddleSpace";
import { fontFamilyDemiBold, secondaryHex } from "../../../config/theme";
import changeUrlParam from "../../../helpers/changeUrlParam";
import getUrlParam from "../../../helpers/getUrlParam";
import classnames from "classnames";
import servedImage from "../../../helpers/imagePathHelper";

const styles = theme => {
	return {
		root: {
			width: "100%",
			display: "flex",
			justifyContent: "space-between",
			alignItems: "center",
			marginTop: theme.spacing.unit * 2,
			marginBottom: theme.spacing.unit * 2
		},
		endPointActionContainer: {
			cursor: "pointer",
			display: "flex",
			alignItems: "center"
		},
		endPointActionText: {
			textTransform: "uppercase",
			fontFamily: fontFamilyDemiBold,
			fontSize: theme.typography.fontSize * 0.85,
			marginLeft: theme.spacing.unit * 0.6,
			marginRight: theme.spacing.unit * 0.6
		},
		endPointActionTextDisabled: {
			color: "#DEE2E8"
		},
		endPointActionIcon: {
			width: 10,
			height: 10,
			marginBottom: 4
		},
		endPointActionIconDisabled: {
			display: "none"
		},
		pages: {
			display: "flex"
		},
		pageNumberContainer: {
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			width: 30,
			height: 30,
			marginRight: theme.spacing.unit / 2,
			marginLeft: theme.spacing.unit / 2,
			borderRadius: 6,
			borderStyle: "solid",
			borderWidth: 0.8,
			borderColor: "#DEE2E8"
		},
		activePageNumberContainer: {
			backgroundColor: secondaryHex
		},
		pageNumber: {
			lineHeight: 0,
			marginTop: 2,
			fontSize: theme.typography.fontSize * 0.85
		},
		activePageNumber: {
			color: "#FFFFFF"
		}
	};
};

const defaults = { maxPageBlocks: 2, marginPagesDisplayed: 3 };

class PaginationBlock extends Component {
	handlePageSelected = selected => {
		this.callCallback(selected);
	};

	getForwardJump() {
		const { paging } = this.props;
		const { page, total, limit } = paging;
		const totalPages = Math.ceil(total / limit);

		const forwardJump = page + defaults.maxPageBlocks;
		return forwardJump >= totalPages ? totalPages - 1 : forwardJump;
	}

	getBackwardJump() {
		const { paging } = this.props;
		const { page } = paging;

		const backwardJump = page - defaults.maxPageBlocks;
		return backwardJump < 0 ? 0 : backwardJump;
	}

	handleBreakClick = index => {
		const { paging } = this.props;
		const { page } = paging;
		this.handlePageSelected(
			page < index ? this.getForwardJump() : this.getBackwardJump()
		);
	};

	callCallback = selectedItem => {
		if (
			typeof this.props.onChange !== "undefined" &&
			typeof this.props.onChange === "function"
		) {
			this.props.onChange(selectedItem);
		}
		changeUrlParam("page", selectedItem + 1);
	};

	getPageElement(index) {
		const { paging, classes } = this.props;
		const { page } = paging;

		return (
			<NumberBlock
				key={index}
				onClick={this.handlePageSelected.bind(this, index)}
				active={page === index}
				classes={classes}
				page={index + 1}
			/>
		);
	}

	pagination = () => {
		const items = [];
		const { paging, classes } = this.props;
		const { page, total, limit } = paging;
		const totalPages = Math.ceil(total / limit);

		if (totalPages <= defaults.maxPageBlocks) {
			for (let index = 0; index < totalPages; index++) {
				items.push(this.getPageElement(index));
			}
		} else {
			let leftSide = defaults.maxPageBlocks / 2;
			let rightSide = defaults.maxPageBlocks - leftSide;

			if (page > totalPages - defaults.maxPageBlocks / 2) {
				rightSide = totalPages - page;
				leftSide = defaults.maxPageBlocks - rightSide;
			} else if (page < defaults.maxPageBlocks / 2) {
				leftSide = page;
				rightSide = defaults.maxPageBlocks - leftSide;
			}

			let index;
			let pageNumber;
			let middleSpace;
			const createPageView = index => this.getPageElement(index);

			for (index = 0; index < totalPages; index++) {
				pageNumber = index + 1;

				if (pageNumber <= defaults.marginPagesDisplayed) {
					items.push(createPageView(index));
					continue;
				}

				if (pageNumber > totalPages - defaults.marginPagesDisplayed) {
					items.push(createPageView(index));
					continue;
				}

				if (index >= page - leftSide && index <= page + rightSide) {
					items.push(createPageView(index));
					continue;
				}

				if (items[items.length - 1] !== middleSpace) {
					middleSpace = (
						<MiddleSpace
							key={index}
							classes={classes}
							onClick={this.handleBreakClick.bind(null, index)}
						/>
					);
					items.push(middleSpace);
				}
			}
		}

		return items;
	};

	render() {
		const { classes, paging } = this.props;

		const { page, limit, total } = paging;
		const totalPages = Math.ceil(total / limit);

		if (!paging) {
			return null;
		}

		const previousDisabled = page === 0;
		const nextDisabled = page === totalPages - 1;

		let onPrevious;
		if (!previousDisabled) {
			onPrevious = () => this.handlePageSelected(page - 1);
		}

		let onNext;
		if (!nextDisabled) {
			onNext = () => this.handlePageSelected(page + 1);
		}

		return (
			<div className={classes.root}>
				<div className={classes.endPointActionContainer} onClick={onPrevious}>
					<img
						className={classnames({
							[classes.endPointActionIcon]: true,
							[classes.endPointActionIconDisabled]: previousDisabled
						})}
						alt="Previous page"
						src={servedImage("/icons/left-active.svg")}
					/>
					<Typography
						className={classnames({
							[classes.endPointActionText]: true,
							[classes.endPointActionTextDisabled]: previousDisabled
						})}
					>
						Previous
					</Typography>
				</div>

				<div className={classes.pages}>{this.pagination()}</div>

				<div className={classes.endPointActionContainer} onClick={onNext}>
					<Typography
						className={classnames({
							[classes.endPointActionText]: true,
							[classes.endPointActionTextDisabled]: nextDisabled
						})}
					>
						Next
					</Typography>
					<img
						className={classnames({
							[classes.endPointActionIcon]: true,
							[classes.endPointActionIconDisabled]: nextDisabled
						})}
						alt="Next page"
						src={servedImage("/icons/right-active.svg")}
					/>
				</div>
			</div>
		);
	}
}

PaginationBlock.propTypes = {
	classes: PropTypes.object.isRequired,
	paging: PropTypes.shape({
		page: PropTypes.number.isRequired,
		limit: PropTypes.number.isRequired,
		total: PropTypes.number.isRequired
	}),
	onChange: PropTypes.func.isRequired,
	isLoading: PropTypes.bool //To prevent too many api calls
};

export const urlPageParam = () => {
	const pageString = getUrlParam("page");

	let page = 0;

	if (pageString) {
		page = Number(pageString) - 1;
	}

	return page;
};

export const Pagination = withStyles(styles)(PaginationBlock);
