import React, { Component } from 'react';
import Server from  '../connector';
import State, {ERROR_NO_SAVED_DATA,ERROR_SINGLETON,ERROR_CORRUPTED_DATA} from '../state';
import JwtDecode from 'jwt-decode';

export class Login extends Component{
	constructor(props){
		super(props);
		this.username = React.createRef();
		this.password = React.createRef();
	}

	onSubmit = (e) =>{
		e.preventDefault();
		let username = this.username.current.value;
		let password = this.password.current.value;
		fetch(Server.loginUrl,{
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			  },
			body: JSON.stringify({
				username: username,
				password: password
			})
		}).then( (resp) =>{
			return resp.json();
		}).then((jsonObj)=>{
			let decoded = JwtDecode(jsonObj.token);
			decoded.token = jsonObj.token;
			console.log(decoded);
			State.instance = decoded;
		}).catch((e) => {
			if (e instanceof ERROR_SINGLETON){
				//Display fatal error
			}else if (e instanceof ERROR_CORRUPTED_DATA){
			}else if( e instanceof ERROR_NO_SAVED_DATA){
			};
		})
	}
	
	render(){
		return(<div id="login">
			<form>
				<div className="form-group">
					<label htmlFor="username">Username:</label>
					<input ref={this.username} className="form-control" type="text" id="username" name="username" />
				</div>
				<div className="form-group">
					<label htmlFor="password">Password:</label>
					<input ref={this.password} className="form-control" type="password" id="password" name="password" />
				</div>
				<button onClick={this.onSubmit.bind(this)} type="submit" className="btn btn-primary">Submit</button>
			</form>
		</div>);
	}
}