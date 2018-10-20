import State, {ERROR_NO_SAVED_DATA,ERROR_SINGLETON,ERROR_CORRUPTED_DATA} from '../state';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React, { Component } from 'react';
import Server,{Socket} from  '../connector';
import Chart from './chart';

export default class Watcher extends Component{

	constructor(props){
		super(props);
		this.Socket = Socket.getSocket();
		this.state={
			currentHR: 0,
			games:[],
			mocas:[],
			hrv4: 0,
			hrv10: 0,
			hrInc: false,
			tempInc: 0,
			hrvInc: false,
			happy: 0
		}
	}

	getUserData(account_id){
		fetch(Server.userData(account_id),{
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': State.instance.store.token
			},
		}).then( (resp) =>{
			return resp.json();
		}).then((jsonObj)=>{
			console.log(jsonObj)
			this.setState({
				games: jsonObj.last_games,
				mocas: jsonObj.last_moca
			})
		}).catch( (e) =>{
			console.log(e);
		});
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
		State.registerRenderer(this);
		this.subscribeToSignals(this.props.account_id);
		this.getUserData(this.props.account_id);
	}

	componentWillUnmount(){
		State.removeRenderer(this);
		this.unsubscribeToSignals();
	}

	componentDidUpdate(prevProps,prevState){
		if(prevProps.account_id !== this.props.account_id){
			this.unsubscribeToSignals(prevProps.account_id);
			this.subscribeToSignals(this.props.account_id);
			this.getUserData(this.props.account_id);
			this.setState({currentHR: 0});
		}
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

		this.Socket.subUserTemp(account_id,(account_id,value_amb,value_skin,values2Min,issued_at) => {
			let inc = 0;
			if(values2Min > this.state.tempInc + 0.5){
				inc = 1;
			}else if(values2Min < this.state.tempInc - 0.5){
				inc = -1;
			}
			this.setState({tempInc:inc});
			State.instance.pushTo('lastTemps' + account_id,{value_amb,value_skin,issued_at},10);
			this.calculateHappiness();
		});

		this.Socket.subUserHR(account_id,(account_id,value,values2Min,issued_at) => {
			let inc = false;
			if(values2Min > this.state.hrInc + 4){
				inc = true;
			}
			this.setState({currentHR:value,hrInc:inc});
			State.instance.pushTo('lastHR_' + account_id,{value,issued_at},10);
			this.calculateHappiness();
		});		

		this.Socket.subUserIbis10(account_id,(account_id,values) => {
			State.instance.pushTo('lastIbis10_' + account_id,values,2);
			let hrv10 = Math.max(values) / values.length;
			this.setState({hrv10:hrv10});
		});

		this.Socket.subUserIbis4(account_id,(account_id,values) => {
			State.instance.pushTo('lastIbis4_' + account_id,values,2);
			let hrv4 = Math.max(values) / values.length;
			let inc = false;
			if(hrv4 > this.state.hrv4 + 40){
				inc = true;
			}
			
			this.setState({hrv4:hrv4,hrvInc:inc});
			this.calculateHappiness();
		});
	}

	calculateHappiness(){
		if(this.state.hrvInc && this.state.hrInc){
			this.setState({happy:this.state.tempInc})
		}
	}

	render(){
		console.log("render watch")
		let user = State.instance.get('selectedUser');
		let age = this._calculateAge(new Date(user.birthday));
		let HR_s = 0;
		if(this.state.currentHR && this.state.currentHR > 0){
			HR_s = 60 / this.state.currentHR;
		}

		let mocaTable = (
			<div className="gamesWrapper">
			<table className="table table-striped gamesTb">
					<thead>
						<tr><th scope="col">Game</th>
						<th scope="col">Level</th>
						<th scope="col">Score</th>
						<th scope="col">Obs</th>
						<th scope="col">At</th></tr>
					</thead>
					<tbody>
					{this.state.mocas.map((moca)=>{
							return (
								<tr><td>{moca.game_name}</td>
								<td>{moca.session}</td>
								<td>{moca.result}</td>
								<td>{moca.obs}</td>
								<td>{moca.issued_at}</td></tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);

		let gamesTable = (
			<table className="table table-striped gamesTb">
					<thead>
						<tr><th scope="col">Game</th>
						<th scope="col">Level</th>
						<th scope="col">Score</th>
						<th scope="col">Obs</th>
						<th scope="col">At</th></tr>
					</thead>
					<tbody>
					{this.state.games.map((game)=>{
							return (
								<tr><td>{game.game_name}</td>
								<td>{game.level}</td>
								<td>{game.points}</td>
								<td>{game.obs}</td>
								<td>{game.issued_at}</td></tr>
							);
						})}
					</tbody>
				</table>
		);

		let chartData= State.instance.get('lastHR_'+ this.props.account_id);
		let element =[];
		element[0] = <Chart label="HeartRate" data ={chartData} />
		element[1] = gamesTable;

		return(
			<div id="contentUser" style={{paddingLeft: this.props.left + 'em'}}>
				<div className="firstRow">
					<div id="userPInfo">
						<img style={{float: 'left'}} id="user_big_thumb" src={Server.picture(user.pic)}/>
						<div style={{float: 'left',paddingLeft:0.8 + 'em',paddingTop:0.2+'em'}}>
							<h1>{user.first_name} {user.last_name}</h1>
							<p>{age} years old</p>

							
						</div>
					</div>
					<div className="selectSignals">
						<img  src="img/heart.png" width='33em' style={{
									WebkitAnimation: 'heartbeat ' + HR_s + 's infinite linear',
									animation: 'heartbeat ' + HR_s + 's infinite linear'
								}}/>
						<span style={{paddingLeft:0.2+'em',fontSize:0.75+'em',color:'white'}}> <b>{this.state.currentHR}</b> bpm</span>
					</div>
					<div className="selector"></div>
					<div className="selector"></div>
				</div>
				<div className="clear"/>
				<div className="wp wrapper1">{element[0]}</div>
				<div className="wp wrapper2">{element[1]}</div>
				
			</div>
		);
	}
}