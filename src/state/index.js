const singleton = Symbol();
const singletonEnforcer = Symbol();

export function ERROR_CORRUPTED_DATA(){};
ERROR_CORRUPTED_DATA.prototype = new Error();

export function ERROR_SINGLETON(){};
ERROR_SINGLETON.prototype = new Error();

export function ERROR_NO_SAVED_DATA(){};
ERROR_NO_SAVED_DATA.prototype = new Error();

export default class State {
    constructor(enforcer, state){
        if (enforcer !== singletonEnforcer) {
			State._status = 'Fatal';
            throw new ERROR_SINGLETON('Cannot construct state singleton');
        }

        if(!state){
			state = localStorage.getItem('state');
			state = JSON.parse(state);

			if(state != null && (!state.account_id || !state.group_id || !state.pic_url ||
			!state.token || !state.first_name || !state.last_name)){
				console.log(state.account_id);
				localStorage.setItem('state',null);
				State._status = 'Corrupted saved data';
                throw new ERROR_CORRUPTED_DATA('Corrupted saved data');
            }
        }

        if(state){
            this.store = {
                account_id: state.account_id,
                group_id: state.group_id,
				pic_url: state.pic_url,
				token: state.token,
				first_name: state.first_name,
				last_name: state.last_name
            }
			localStorage.setItem('state',JSON.stringify(this.store));
			
			State._status = 'OK';

        }else{
			State._status = 'No data';
            throw new ERROR_NO_SAVED_DATA('No saved data found');
        }
    }

	set(key,value){
		this.store[key] = value;
		State.notifyRenderers();
	}
	
	pushTo(key,value,maxItems){
		if(!this.store[key]){
			this.store[key] = [];
		}
		while(this.store[key].length >= maxItems){
			this.store[key].shift();
		}
		this.store[key].push(value);
		State.notifyRenderers();
	}

	get(key){
		return this.store[key];
	}

    static get instance() {
        if (!this[singleton]) {
			this[singleton] = new State(singletonEnforcer);
			State.notifyRenderers();
        }
	
        return this[singleton];
    }

    static set instance(jsonObj) {
		this[singleton] = new State(singletonEnforcer,jsonObj);
		State.notifyRenderers();
        return this[singleton];
    }
   
    static clean(){
		this[singleton] = null;
		State._status = 'No data';
		State.notifyRenderers();
	}

	static get status(){
		return State._status;
	}

	static registerRenderer(render){
		State.registeredRenders.push(render);
	}

	static removeRenderer(render){
		var index = State.registeredRenders.indexOf(render);
		if (index > -1) {
			State.registeredRenders.splice(index, 1);
		}	
	}

	static notifyRenderers(){
		State.registeredRenders.map((r) => {
			try{
				r.forceUpdate();
			}catch(e){
				console.log(e);
			}
		})
	}
}

State.registeredRenders = [];
State._status = "No data";