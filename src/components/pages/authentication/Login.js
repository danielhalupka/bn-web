import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

import Container from "./Container";
import LoginForm from "./forms/LoginForm";
import user from "../../../stores/user";
import Button from "../../elements/Button";
import Meta from "./Meta";

class Login extends Component {
	componentDidMount() {
		user.refreshUser(() => {
			//Already logged in, make them go home
			this.props.history.push("/");
		});
	}

	render() {
		return (
			<Container {...this.props} type="login">
				<Meta type="login"/>
				<Typography variant="headline">Login to your account</Typography>
				<Link to="/sign-up">
					<Button variant="text">New here? Create a free account.</Button>
				</Link>
				<LoginForm
					onSuccess={(href) => {
						let redirectTo = "/";
						if (href) {
							redirectTo = href;
						} else if (user.canViewStudio) {
							redirectTo = "/admin/events";
						}

						this.props.history.push(redirectTo);
					}}
				/>
			</Container>
		);
	}
}

export default Login;
