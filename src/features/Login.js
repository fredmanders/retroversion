import React, { Component } from 'react';
import { loginWithGoogle } from '../helpers/auth';
import { firebaseAuth } from '../config/constants';

const firebaseAuthKey = 'firebaseAuthInProgress';
const appTokenKey = 'appToken';

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
        	initialAuthStateReceived: false,
					loginInProgress: false
				};
        this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
    }

    handleGoogleLogin() {
    	this.setState({loginInProgress: true});
    	loginWithGoogle()
    	.catch(err => {
    		alert(`There was a problem logging in: ${err}`)
    	});

    	// this will set the splashscreen until its overridden by the real firebaseAuthKey
    }

    componentDidMount() {
    	
        this.cancel = firebaseAuth().onAuthStateChanged(user => {
        	console.log("Auth state received", user);
        	if (user) {
        		this.props.history.push('/app/home')
        	} else {
        		this.setState({initialAuthStateReceived: true, loginInProgress: false});
					}
        })
    }

	render() {

		if (!this.state.initialAuthStateReceived || this.state.loginInProgress)
			return <Splashscreen />;
		return <LoginPage handleGoogleLogin={this.handleGoogleLogin} />;

	}
}

// this is the URL we copied from firebase storage
const loginButtonUrl = 'https://firebasestorage.googleapis.com/v0/b/dobbelganger-ce311.appspot.com/o/google-icon-white.png?alt=media&token=468b2968-d8ef-4f7c-b850-2f73e408b1a8';

const styles = {
	backgroundImage: `url(${loginButtonUrl})`
}

const LoginPage = ({ handleGoogleLogin }) => (

	<div className="login-container">
		<h1 className="splash-header">Retroversion</h1>
		<button onClick={handleGoogleLogin} className="login-button">
			<div style={styles} className="google-logo">
				<span className="button-text">Sign In With Google</span>
			</div>
		</button>
	</div>	

)

const Splashscreen = () => (<p>Please Wait Loading...</p>);