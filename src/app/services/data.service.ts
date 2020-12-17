import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver'; // https://www.npmjs.com/package/file-saver
import fullGamesList from '../../assets/fullGamesList.json';
import fullPlatformsList from '../../assets/fullPlatformsList.json';

@Injectable({
  providedIn: 'root'
})

export class DataService {
	apiURL:string = "https://www.speedrun.com/api/v1";
	public gamesList: Array<{name:string, id:string}>;
	public platformsList: Array<{name:string, id:string}> = [];
	private trackAPICalls = false;
	constructor() { 
		this.gamesList = fullGamesList;
		this.platformsList = fullPlatformsList;

	}

	// Make request and return a promise with an object representing the response data
	makeRequest(uri: string):Promise<{}>{
		if (this.trackAPICalls) console.log("API Called");
		return fetch(uri).then((response) =>{
			return response.json().then((object) =>{
				return object;
			});
		});
	}

	searchForUser(string):Promise<{}>{
		const endpoint = "/users?name=" + encodeURIComponent(string);
		return this.makeRequest(this.apiURL + endpoint);
	}

	getUserInfo(id:string):Promise<{}>{
		const endpoint = "/users/" + id;
		return this.makeRequest(this.apiURL + endpoint);
	}

	//Get all runs of a user in no order
	getRunsByUser(userID:string){
		const endpoint = "/runs?user=" + userID;
		return this.makeRequest(this.apiURL + endpoint);
	}

	//Get runs of a user sorted by recency
	getRecentRunsByUser(userID: string, gameID: string = null):Promise<{}>{
		if(gameID == null){
			const endpoint = "/runs?user=" + userID + "&orderby=submitted&direction=desc&embed=game,category";
			return this.makeRequest(this.apiURL + endpoint);
		} else {
			const endpoint = "/runs?user=" + userID + "&game=" + gameID + "&orderby=submitted&direction=desc&embed=game,category";
			return this.makeRequest(this.apiURL + endpoint);
		}
	}

	// Return id of a game when given it's name
	gameNameToID(name:string):string{
		var id = "_";
		this.gamesList.forEach((game) => {
			if(game['name'] === name){
				id = game['id'];
			}
		});
		return id;
	}

	// Return id of a game when given it's name
	gameIDToName(id:string):string{
		var name = "_";
		this.gamesList.forEach((game) => {
			if(game['id'] === id){
				name = game['name'];
			}
		});
		return name;
	}

	//Get data of a given game
	getGame(id:string): Promise<{}>{
		const endpoint = "/games/" + id + "?embed=categories,platforms,genres,developers";
		return this.makeRequest(this.apiURL + endpoint);
	}

	//Get the records for all categories which are per-game in a given game
	getPerGameRecords(id:string){
		const endpoint = "/games/" + id + "/records?scope=full-game&embed=category,players&top=4000";
		//const endpoint = "/games/" + id + "/records?embed=category,players&top=4000";
		return this.makeRequest(this.apiURL + endpoint);
	}

	//Get the records for all categories which are per-game in a given game
	getLevelRecords(id:string){
		const endpoint = "/games/" + id + "/records?scope=levels&embed=category,players,level&top=4000";
		return this.makeRequest(this.apiURL + endpoint);
	}

	// Return all runs for a given game
	getAllRuns(gameID, offset:number = 0):Promise<{}>{
		var endpoint = "/runs?game=" + gameID + "?embed=category";
		if (offset > 0){
			endpoint += "&offset=" + offset
		}
		return this.makeRequest(this.apiURL + endpoint);
	}

	// Request API to return the leaderboard of a given game and category
	categoryLeaderboard(gameID: string, categoryID: string, date:string = ""){
		if (date == ""){
			var endpoint = "/leaderboards/" + gameID + "/category/" + categoryID + "?embed=players";
			return this.makeRequest(this.apiURL + endpoint);
		} else {
			var endpoint = "/leaderboards/" + gameID + "/category/" + categoryID + "?date=" + date + "&embed=players";
			return this.makeRequest(this.apiURL + endpoint);
		}
		
	}

	// Return all games (increments of 20) in order of when they were added to Speedrun.com
	getNewestGames():Promise<{}>{
		var endpoint = "/games?orderby=created&direction=desc&embed=categories";
		return this.makeRequest(this.apiURL + endpoint);
	}

	// Request API to return runs in order of recency
	getNewestRuns():Promise<{}>{
		var endpoint = "/runs?status=new&orderby=date&direction=desc&embed=game,players";
		return this.makeRequest(this.apiURL + endpoint);
	}

	// Make recursive calls to Speedrun.com API to build list of all games on Speedrun.com (20719 unique games as of 12/7/2020)
	getAllGames() {
		function addGamesToList(response){
			response.json().then(function(data){
				data['data'].forEach(function(item){
					this.gamesList.push({name: item['names']['international'], id: item['id']});
				}.bind(this));
				if (data['pagination']['links'].length > 1){ // Middle
					var nextURL = data['pagination']['links'][1]['uri'];
					if(this.trackAPICalls) console.log("API Called")
					fetch(nextURL).then(addGamesToList.bind(this));
				} else {
					if (data['pagination']['links'][0]['rel'] == "next"){ // Start
						var nextURL = data['pagination']['links'][0]['uri'];
						if(this.trackAPICalls) console.log("API Called")
						fetch(nextURL).then(addGamesToList.bind(this));
					} else { // End
						var blob = new Blob([JSON.stringify(this.gamesList)], {type: "application/json"});
						console.log(this.gamesList.length);
						//saveAs(blob, "fullGamesList.json"); // FileSaver function
					}
				}		
			}.bind(this));
		}
		var endpoint = "/games?_bulk=yes&max=1000";
		if(this.trackAPICalls) console.log("API Called")
		fetch(this.apiURL + endpoint).then(addGamesToList.bind(this));
	}

	
	// Make calls to Speedrun.com API to compile list of all platforms
	getPlatforms(){
		function addPlatformsToList(response){
			response.json().then(function(data){
				//console.log("data:", data);
				data['data'].forEach(function(item){
					this.platformsList.push({name: item['name'], id: item['id']});
				}.bind(this));
				//console.log("length:", this.gamesList.length);
				if (data['pagination']['links'].length > 1){ // Middle
					var nextURL = data['pagination']['links'][1]['uri'];
					if(this.trackAPICalls) console.log("API Called")
					fetch(nextURL).then(addPlatformsToList.bind(this));
				} else {
					if (data['pagination']['links'][0]['rel'] == "next"){ // Start
						var nextURL = data['pagination']['links'][0]['uri'];
						if(this.trackAPICalls) console.log("API Called")
						fetch(nextURL).then(addPlatformsToList.bind(this));
					} else { // End
						var blob = new Blob([JSON.stringify(this.platformsList)], {type: "application/json"});
						//console.log(this.platformsList.length);
						//saveAs(blob, "fullPlatformsList.json"); // FileSaver function
					}
				}		
			}.bind(this));
		}
		var endpoint = "/platforms";
		if(this.trackAPICalls) console.log("API Called")
		fetch(this.apiURL + endpoint).then(addPlatformsToList.bind(this));
	}

}

