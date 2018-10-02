import React, { Component } from 'react';
import State, {ERROR_NO_SAVED_DATA,ERROR_SINGLETON,ERROR_CORRUPTED_DATA} from './state';
import {Admin,Login} from './admin';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	constructor(props){
		super(props);
		let state = null;
		try{
			state = State.instance;
		}catch(e){
			console.log(e);
			if (e instanceof ERROR_SINGLETON){
				//Display fatal error
			}else if (e instanceof ERROR_CORRUPTED_DATA){
			}else if (e instanceof ERROR_NO_SAVED_DATA){
			}
			
		}finally{
			this.state = {
				_state: state
			}
			State.registerRenderer(this);
		}
	}

  render() {
	let showElement = null;

	switch(State.status){
		case 'Fatal':	showElement = <div id="error">Error</div>; break;
		case 'OK': showElement = <Admin/>; break;
		default: showElement = <Login/>; break;
	}
	console.log("render now " + State.status);
    return (
      <div className="App">
    		{showElement}
      </div>
    );
  }
}

export default App;
