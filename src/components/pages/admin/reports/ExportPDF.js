import React, { Component } from "react";
import { Typography, withStyles } from "@material-ui/core";
import moment from "moment-timezone";
import { observer } from "mobx-react";

import getUrlParam from "../../../../helpers/getUrlParam";
import Loader from "../../../elements/loaders/Loader";
import Bigneon from "../../../../helpers/bigneon";
import NotFound from "../../../common/NotFound";
import notification from "../../../../stores/notifications";
import { fontFamilyDemiBold } from "../../../styles/theme";
import ExportMetaTags from "./ExportMetaTags";
import { EventSummaryReport } from "./eventSummary/EventSummary";
import Transactions from "./transactions/Transactions";
import TicketCounts from "./counts/TicketCounts";
import Audit from "./eventAudit/Audit";
import SummaryAudit from "./eventSummaryAudit/SummaryAudit";
import user from "../../../../stores/user";
import { loadJsPDF } from "../../../../helpers/jsPDF";

const styles = theme => ({
	root: {
		padding: theme.spacing.unit * 2,
		backgroundColor: "#FFFFFF"
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		paddingBottom: theme.spacing.unit * 2
	},
	logo: {
		height: 60,
		width: "auto"
	},
	title: {
		fontFamily: fontFamilyDemiBold,
		fontSize: theme.typography.fontSize * 2
	},
	detail: {
	}
});

const reportTypes = {
	summary: {
		label: "Event summary report",
		ReportComponent: EventSummaryReport
	},
	transactions: {
		label: "Event transaction report",
		ReportComponent: Transactions
	},
	ticket_counts: {
		label: "Event ticket counts report",
		ReportComponent: TicketCounts
	},
	audit: {
		label: "Event audit report",
		ReportComponent: Audit
	},
	summary_audit: {
		label: "Event summary audit report",
		ReportComponent: SummaryAudit
	}
};

@observer
class ExportPDF extends Component {
	constructor(props) {
		super(props);

		this.state = {
			event: null,
			venue: null,
			displayEventStartDate: null,
			jsPDFLoaded: false,
			containerStyle: {}
		};
	}

	componentDidMount() {
		loadJsPDF(() => {
			this.setState({ jsPDFLoaded: true });
		});

		const id = getUrlParam("event_id");

		if (id) {
			Bigneon()
				.events.read({ id })
				.then(response => {
					const { artists, venue, ...event } = response.data;
					const { event_start } = event;

					const eventStartDateMoment = moment.utc(event_start);
					const displayLocalVenueTime = eventStartDateMoment
						.tz(venue.timezone)
						.format("dddd, MMMM Do YYYY hh:mm:A");

					this.setState({ event, venue, displayLocalVenueTime });
				})
				.catch(error => {
					this.setState({ event: false });

					notification.showFromErrorResponse({
						defaultMessage: "Failed to load event.",
						error
					});
				});
		}
	}

	createAndDownloadPDF() {
		const filename = `${getUrlParam("type")}-${Math.floor(Date.now() / 1000)}.pdf`;

		const pdf = new jsPDF("l","pt","a4");
		const width = pdf.internal.pageSize.getWidth();

		this.setState({ containerStyle: { width } }, () => {
			const source = document.getElementById("export-container");

			//TODO Works but just saves an image which won't work for multi page reports
			// html2canvas(source).then(canvas => {
			// 	const pdf = new jsPDF("l", "pt", "a4");
			// 	pdf.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 10, 10, 800, 300);
			// 	pdf.save("html2canvas.pdf");
			// });

			pdf.html(source,
				{

					// overlay: null,
					// canvas: null,
					// img: null,
					pdf: null,
					pageSize: null,

					callback: (pdf) => {
						//pdf.output("dataurlnewwindow");

						pdf.save(filename);
						//window.close();

						this.setState({ containerStyle: {} });
					}
				});
		});
	}

	onReportLoad() {
		this.createAndDownloadPDF();
		//window.print();
	}

	render() {
		const { jsPDFLoaded, containerStyle } = this.state;
		const organizationId = user.currentOrganizationId;

		if (!organizationId || !jsPDFLoaded) {
			return <Loader/>;
		}

		const { classes } = this.props;
		const { event, venue, displayLocalVenueTime } = this.state;

 		const event_id = getUrlParam("event_id");
		const type = getUrlParam("type");

		const reportType = reportTypes[type];

		if (!reportType) {
			return <NotFound>Unknown report type</NotFound>;
		}
		
		if (event_id && event === null) {
			return <Loader>Loading event...</Loader>;
		}

		if (event_id && event === false) {
			return <NotFound>Event not found</NotFound>;
		}

		const { ReportComponent, label } = reportType;

		return (
			<div className={classes.root}>
				<ExportMetaTags eventName={event ? event.name : null} reportLabel={label}/>
				<div className={classes.header}>
					<img
						alt="Header logo"
						className={classes.logo}
						src={"/images/bn-logo-text-web.svg"}
					/>

					<div>
						{event ? <Typography className={classes.title}>{event.name}</Typography> : null}
						<Typography className={classes.detail}>Report: {label}</Typography>
						{venue ? <Typography className={classes.detail}>Venue: {venue.name}</Typography> : null}
						{displayLocalVenueTime ? <Typography className={classes.detail}>Event time: {displayLocalVenueTime}</Typography> : null}
					</div>
				</div>

				<div id={"export-container"} style={containerStyle}>
					<ReportComponent
						organizationId={organizationId}
						eventId={event_id}
						printVersion
						onLoad={this.onReportLoad.bind(this)}
					/>
				</div>
			</div>
		);
	}
}

export default withStyles(styles)(ExportPDF);
