export default class Server{
	static get baseUrl(){return "http://localhost:3002";}
	static get loginUrl(){return Server.baseUrl+"/admin/login";}
	static get users(){return Server.baseUrl+"/admin";}
	static picture(picRoute){
		if(picRoute.substring(0,4) == "http"){
			return picRoute;
		}
		else return Server.baseUrl+"/pics?pic_url=" + picRoute;
	}
}
export {Socket} from './socket'