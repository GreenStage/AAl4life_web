import openSocket from 'socket.io-client';
import Server from './index.js';

var sock = null;

export class Socket {
	constructor(url){
		this.sock = openSocket(Server.baseUrl);
	}

	static getSocket(){
		if(sock == null){
			console.log("New socket");
			sock = new Socket();
		}
		return sock;
	}

	subUsersState(callback){
		this.sock.on('MOBILE_APP_CONNECTION0',(data)=>{
			console.log("User status" + data.account_id +": " + data.status);
			callback(data.account_id,data.status);
		});
	}
	unSubUsersState(){
		this.sock.removeAllListeners('MOBILE_APP_CONNECTION0');
	}

	subUserIbis4(account_id,callback){
		this.sock.on('USER_CH_IBIS4_' + account_id,(data)=>{
			console.log("User IBIS4" + data.account_id +": " + data.ibis4);
			callback(data.account_id,data.ibis4);
		});
	}
	unsubUserIbis4(account_id){
		this.sock.removeAllListeners('USER_CH_IBIS4_' + account_id);
	}

	subUserIbis10(account_id,callback){
		this.sock.on('USER_CH_IBIS10_' + account_id,(data)=>{
			console.log("User IBIS10" + data.account_id +": " + data.ibis10);
			callback(data.account_id,data.ibis10);
		});
	}
	unsubUserIbis10(account_id){
		this.sock.removeAllListeners('USER_CH_IBIS10_' + account_id);
	}

	subUserHR(account_id,callback){
		this.sock.on('USER_CH_HEART_RATE' + account_id,(data)=>{
			console.log("User HEARTRATE" + data.account_id +": " + data.value);
			callback(data.account_id,data.value,data.hr2,data.issued_at);
		});
	}
	unsubUserHR(account_id){
		this.sock.removeAllListeners('USER_CH_HEART_RATE' + account_id);
	}
	
	subUserTemp(account_id,callback){
		this.sock.on('USER_CH_TEMPERATURE' + account_id,(data)=>{
			console.log("User Temperature" + data.account_id +": " + data.value_skin);
			callback(data.account_id,data.value_amb,data.value_skin,data.issued_at);
		});
	}
	unsubUserTemp(account_id){
		this.sock.removeAllListeners('USER_CH_TEMPERATURE' + account_id);
	}

	subUserFall(account_id,callback){
		this.sock.on('USER_CH_FALL' + account_id,(data)=>{
			console.log("User Fall" + data.account_id +": " + data.value);
			callback(data.account_id,data.value,data.issued_at);
		});
	}
	unsubUserFall(account_id){
		this.sock.removeAllListeners('USER_CH_FALL' + account_id);
	}
}