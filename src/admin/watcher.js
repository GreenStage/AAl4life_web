import State, {ERROR_NO_SAVED_DATA,ERROR_SINGLETON,ERROR_CORRUPTED_DATA} from '../state';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React, { Component } from 'react';
import Server,{Socket} from  '../connector';

export default class Watcher extends Component{

	constructor(props){
		super(props);
		this.Socket = Socket.getSocket();
		this.state={
			currentHR: 110,
			lastHR: [],
			lastTemp: [],
			lastFall: [],
			lastIbis: [],
		}
	}
	
	//_calculateAge
	//As in https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
	//by André Snede Kock
	_calculateAge(birthday) { // birthday is a date
		var ageDifMs = Date.now() - birthday.getTime();
		var ageDate = new Date(ageDifMs); // miliseconds from epoch
		return Math.abs(ageDate.getUTCFullYear() - 1970);
	}

	componentDidMount(){
		this.subscribeToSignals(this.props.account_id);
	}

	componentWillUnmount(){
		this.unsubscribeToSignals(this.props.account_id);
	}

	componentDidUpdate(prevProps,prevState){
		this.unsubscribeToSignals(prevProps.account_id);
		this.subscribeToSignals(this.props.account_id);
	}

	unsubscribeToSignals(account_id){
		this.Socket.unsubUserFall(account_id);
		this.Socket.unsubUserHR(account_id);
		this.Socket.unsubUserTemp(account_id);
		this.Socket.unsubUserIbis10(account_id);
		this.Socket.unsubUserIbis4(account_id);
	}

	subscribeToSignals(account_id){
		this.Socket.subUserFall(account_id,(account_id,value,issued_at) => {
			State.instance.pushTo('lastFalls_' + account_id,{value,issued_at},10);
		});

		this.Socket.subUserTemp(account_id,(account_id,value_amb,value_skin,issued_at) => {
			State.instance.pushTo('lastTemps' + account_id,{value_amb,value_skin,issued_at},10);
		});

/*For now, ignore the 2min values from the server, and use the ones stored here*/
		this.Socket.subUserHR(account_id,(account_id,value,values2Min,issued_at) => {
			State.instance.pushTo('lastHR_' + account_id,{value,issued_at},10);
		});		

		this.Socket.subUserIbis10(account_id,(account_id,values) => {
			State.instance.pushTo('lastIbis10_' + account_id,values,2);
		});

		this.Socket.subUserIbis4(account_id,(account_id,values) => {
			State.instance.pushTo('lastIbis4_' + account_id,values,2);
		});
	}

	render(){
		let user = State.instance.get('selectedUser');
		let age = this._calculateAge(new Date(user.birthday));
		let HR_s = 0;
		if(this.state.currentHR && this.state.currentHR > 0){
			HR_s = 60 / this.state.currentHR;
		}

		return(
			<div id="contentUser" style={{paddingLeft: this.props.left + 'em'}}>
				<div id="userPInfo">
				<img style={{float: 'left'}} id="user_big_thumb" src={Server.picture(user.pic)}/>
				<div style={{float: 'left',paddingLeft:0.8 + 'em',paddingTop:0.2+'em'}}>
					<h1>{user.first_name} {user.last_name}</h1>
					<p>{age} years old</p>

					<img  src="img/heart.png" width='35em' style={{
						WebkitAnimation: 'heartbeat ' + HR_s + 's infinite linear',
						animation: 'heartbeat ' + HR_s + 's infinite linear'
					}}/>
					<span style={{paddingLeft:0.2+'em'}}> {this.state.currentHR} bpm</span>
				</div>
				</div>
			</div>
		);
	}
}