import State, {ERROR_NO_SAVED_DATA,ERROR_SINGLETON,ERROR_CORRUPTED_DATA} from '../state';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React, { Component } from 'react';
import Server,{Socket} from  '../connector';
import Watcher from './watcher';

export class Admin extends Component{
	constructor(props){
		super(props);
		this.leftBar = React.createRef();
		this.searchBox = React.createRef();

		this.Socket = Socket.getSocket();
		this.state = {
			toggle:false,
			selectedUserIdx: -1,
			usersState : {}
		}

		if(!State.instance.get("usersOnline")){
			State.instance.set("usersOnline",{});
		}
	}

	getUsers(){
		fetch(Server.users,{
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': State.instance.store.token
			}
		}).then( (resp) =>{
			return resp.json();
		}).then((jsonObj)=>{
			State.instance.set('users',jsonObj.result);
			let st = {};
			jsonObj.result.onlineUsers.map((account_id)=>{
				st[account_id] = 1;
			})
			State.instance.set("usersOnline",st);
		}).catch( (e) =>{
			console.log(e);
		});
	}

	onToggle(newState){
		switch(newState){
			case 0:
				this.setState({toggle: !this.state.toggle});
				break;
			case 1:
				this.setState({toggle:true});
				break;
			case 2:
				this.setState({toggle: false});
				break;

		}
	}

	componentDidMount(){
		State.registerRenderer(this);
		this.getUsers();
		this.Socket.subUsersState((account_id,isUserOnline) =>{
			let st = State.instance.get("usersOnline");
			st[account_id] = isUserOnline;
			State.instance.set("usersOnline",st);
		});
	}

	componentWillUnmount(){
		State.removeRenderer(this);
		this.Socket.unSubUsersState();
	}

	selectUser(user){
		this.setState({selectedUserIdx: user.account_id});
		State.instance.set("selectedUser",user);
	}

	logOut(){
		State.clean();
	}

	handleChangeSearch(e){
		this.setState({search: e.target.value});
	}

	render(){
		let users = State.instance.get('users');
		let className;
		let listUsers = null;
		let usersState = State.instance.get("usersOnline");
		if(users && users !== null){
			listUsers = users.map( (usr) =>{
				if(!this.state.search || usr.first_name.includes(this.state.search) || usr.last_name.includes(this.state.search) ){
					return (
						<li className={this.state.selectedUserIdx === usr.account_id? "selectedusr" : " "}
							onClick={() => {this.selectUser(usr)}} key={usr.account_id}>
	
							{usersState[usr.account_id] === 1 ? <span className='onlineUsr'></span> :" "}
	
							<img id="user_thumb" src={Server.picture(usr.pic)} className={
								usersState[usr.account_id] === 1 ? " ":"offlineUsr"
							}/>
	
							<div className="userSmallInfo">
								<div>{usr.first_name + " " + usr.last_name}</div>
								
								{usersState[usr.account_id] === 1 ? <div style={{fontSize:0.7+'em'}}>Online now</div>:" "}
							</div>
						</li>
					);
				}
				else{
					return " "
				}
			});
		}
		
		if(this.state.toggle){
			className = "leftBarShow"
		}else{
			className=" "
		}

		let contentShow = <img id="logo" src="img/logo.jpg"/>;
		if(this.state.selectedUserIdx !== -1){
			if(this.state.toggle){
				contentShow = <Watcher account_id = {this.state.selectedUserIdx} left={22}/>
			}else contentShow = <Watcher  account_id = {this.state.selectedUserIdx} left={4}/>
			
		}	

		return(<div id="admin">
			<nav id="topBar" className="navbar navbar-expand-lg navbar-dark bg-dark">
				<span onClick={() =>{this.onToggle(0)}} className="navbar-brand navbar-nav mr-auto ">
					<span className="togglerIcon pointer navbar-toggler-icon"></span>
					<span style={{padding:0.2+'em'}}>Users</span>
				</span>
				<ul className="navbar-nav mr-auto">
					<li className="nav-item">test</li>
				</ul>
				<span onClick={()=>{this.logOut()}}className="whiteLink pointer navbar-text nav-item" style={{fontSize:1.1+'em'}}>
					<span className=" fa fa-sign-out" aria-hidden="true"/>
					<span style={{paddingLeft:0.2+'em'}}>Sign out</span>
				</span>
			</nav>
			<div id="restOfBody">
				<div id="" ref={this.leftBar} className={"leftBar "+ className}>
					<ul>
						<form style={{paddingLeft:0.3+'em',paddingTop:0.3+'em',paddingBottom:0.3+'em'}} className="form-inline">
							<input onChange={this.handleChangeSearch.bind(this)} className="form-control mr-sm-2 searchBox" type="search" placeholder="Search" aria-label="Search"/>
							<i style={{fontSize:1.1+'em'}} className="pointer fa fa-search" aria-hidden="true"></i>
							<input onClick={()=>{alert("oi")}} type="submit" style={{display:'none'}}/>
						</form>
						{listUsers}			
					</ul>
				</div>
				<div id="content" onClick={() =>{this.onToggle(2)}}>
				{contentShow}
				</div>
			</div>

		</div>);
	}
}