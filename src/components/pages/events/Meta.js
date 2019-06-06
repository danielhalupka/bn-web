import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import Settings from "../../../config/settings";
import { dollars } from "../../../helpers/money";

//Reference: https://github.com/nfl/react-helmet
const structuredEventData = (
	{
		venue,
		artists,
		type,
		id,
		name,
		additional_info,
		promo_image_url,
		event_start,
		event_end,
		ticket_types,
		...event
	},
	ticketSelectionUrl
) => {
	const offers = [];
	if (ticket_types) {
		ticket_types.forEach(tt => {
			const { status, ticket_pricing, start_date } = tt;

			if (ticket_pricing && status === "Published") {
				let availability;

				//Not all of our ticket status translate to the 'availability' field
				//Reference: https://schema.org/ItemAvailability/
				switch (status) {
					case "Published":
						availability = "InStock";
						break;
					case "TicketsAtTheDoor":
						availability = "InStoreOnly";
						break;
					case "SoldOut":
						availability = "SoldOut";
						break;
					case "OffSale":
						availability = "OutOfStock";
						break;
					case "OnSaleSoon":
					case "UseAccessCode":
					case "Free":
					case "Rescheduled":
					case "Cancelled":
					case "Ended":
					default:
						availability = false;
				}

				if (availability) {
					const { price_in_cents } = ticket_pricing;

					offers.push({
						"@type": "Offer",
						url: ticketSelectionUrl,
						price: price_in_cents ? dollars(price_in_cents, true, "") : "",
						priceCurrency: "USD",
						availability,
						validFrom: start_date
					});
				}
			}
		});
	}

	const result = {
		"@context": "https://schema.org",
		"@type": "Event",
		name,
		description:
			additional_info ||
			"Big Neon - Mobile-first event ticketing. We’re relentlessly focused on serving the needs of independent live music promoters.",
		startDate: event_start,
		endDate: event_end,
		location: {
			"@type": "Place",
			name: venue.name,
			address: {
				"@type": "PostalAddress",
				streetAddress: venue.address,
				addressLocality: venue.city,
				postalCode: venue.postal_code,
				addressRegion: venue.state,
				addressCountry: venue.country
			}
		},
		image: [promo_image_url],
		performer: artists.map(({ artist }) => ({
			"@type": "MusicGroup",
			name: artist.name
		}))
	};

	offers.length > 0 ? (result.offers = offers) : null;

	return result;
};

const structuredBreadcrumbData = (
	name,
	landingUrl,
	eventUrl,
	ticketSelectionUrl = ""
) => {
	const itemListElement = [
		{
			"@type": "ListItem",
			position: 1,
			name: "Concert Tickets",
			item: landingUrl
		},
		{
			"@type": "ListItem",
			position: 2,
			name: name,
			item: eventUrl
		}
	];

	//If we're on the ticket selection page, it's 3 breadcrumbs deep
	if (ticketSelectionUrl) {
		itemListElement.push({
			"@type": "ListItem",
			position: 3,
			name: `Buy tickets - ${name}`,
			item: ticketSelectionUrl
		});
	}

	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement
	};
};

const Meta = props => {
	const {
		venue,
		artists,
		type,
		id,
		name,
		additional_info,
		promo_image_url,
		event_start,
		event_end,
		ticket_types,
		...event
	} = props;

	//TODO use slug when it's ready
	const landingUrl = Settings().webUrl;
	const rootEventUrl = `${landingUrl}/events/${id}`;
	const ticketSelectionUrl = `${rootEventUrl}/tickets`;

	let googleStructuredData;
	let googleBreadcrumbData;
	let title;
	const description = `${name} - Find tickets to live events and concerts on Big Neon.`;
	//If they're at a later stage of the event checkout, adjust title accordingly
	switch (type) {
		case "eventView":
			googleStructuredData = structuredEventData(props, ticketSelectionUrl);
			googleBreadcrumbData = structuredBreadcrumbData(
				name,
				landingUrl,
				rootEventUrl,
				""
			);
			break;
		case "selection":
			title = `Buy tickets - ${name}`;
			googleStructuredData = structuredEventData(props, ticketSelectionUrl);
			googleBreadcrumbData = structuredBreadcrumbData(
				name,
				landingUrl,
				rootEventUrl,
				ticketSelectionUrl
			);

			break;
		case "checkout":
			title = `Checkout - ${name}`;
			break;
		case "success":
			title = `Success - ${name}`;
			break;
		default:
			title = `${name} Tickets on Big Neon`;
	}

	return (
		<Helmet
			title={title}
			meta={[
				{
					property: "og:title",
					content: title
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					property: "og:url",
					content: rootEventUrl
				},
				{
					property: "og:description",
					content: description
				},
				{
					property: "og:image",
					content: promo_image_url
				},
				{
					name: "twitter:site",
					content: "bigneon.com"
				},
				{
					name: "twitter:creator",
					content: "bigneon"
				},
				{
					name: "twitter:title",
					content: title
				},
				{
					name: "twitter:image",
					content: promo_image_url
				},
				{
					name: "description",
					content: description
				}
			]}
			link={[
				{
					rel: "canonical",
					href: rootEventUrl
				},
				{
					rel: "image_src",
					href: promo_image_url
				}
			]}
		>
			{googleBreadcrumbData ? (
				<script type="application/ld+json">
					{JSON.stringify(googleBreadcrumbData)}
				</script>
			) : null}
			{googleStructuredData ? (
				<script type="application/ld+json">
					{JSON.stringify(googleStructuredData)}
				</script>
			) : null}
		</Helmet>
	);
};

Meta.propTypes = {
	type: PropTypes.oneOf(["eventView", "selection", "checkout", "success"])
		.isRequired,
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	additional_info: PropTypes.string,
	promo_image_url: PropTypes.string,
	event_start: PropTypes.string.isRequired,
	event_end: PropTypes.string.isRequired,
	venue: PropTypes.object.isRequired,
	artists: PropTypes.array.isRequired
};

export default Meta;
