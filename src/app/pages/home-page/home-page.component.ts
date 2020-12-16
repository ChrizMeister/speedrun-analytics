import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service'; 
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
	title:string = 'Speedrun.com Analytics';

	//Manually compiled list of top 5 games based on number of runs submitted
	//Automatially creating a real-time list of the most played games is basically impossible due to the rate limits on the Speedrun.com API
	topFiveGames = ["Super Mario 64",
					"Super Mario Odyssey",
					"Mario Kart 8 Deluxe",
					"Celeste",
					"Super Metroid"]

	mostPopularGames;
	
	graphData1: any[];	
	showXAxis = true;
	showYAxis = true;
	gradient = true;
	showLegend = false;
	showXAxisLabel = true;
	xAxisLabel1 = 'Category';
	showYAxisLabel = true;
	yAxisLabel1 = '# of Runs';

	colorScheme = {
		domain: ['#31e7f7', '#2871d1', '#28d19b', '#5c4aff']
	};
	
	recentRuns;
	uniquePlayers;
	playerRunFrequency;

	constructor(private dataService: DataService) { 
		this.mostPopularGames = [];
		this.recentRuns = [];
		this.uniquePlayers = [];
		this.playerRunFrequency = [];
	}

	ngOnInit(): void {	
		this.getNewestRuns();
		//this.gameRunnersOverTime(this.dataService.gameNameToID("Super Mario Odyssey"));
		//this.gameRunnersOverTime(this.dataService.gameNameToID("Super Mario 64"));
		//this.gameRunnersOverTime(this.dataService.gameNameToID("Elephants and Snakes and Crocodiles"));
		//var localStorage = window.localStorage;
		//this.getMostPopularGames(localStorage);
		//localStorage.removeItem("gamesList")
		
		if (!localStorage.getItem("gamesList")){
			console.log("Local Storage Empty")
			localStorage.setItem("gamesList", "[]");
			this.getMostPopularGames(localStorage);
		} else {
			var gamesList = JSON.parse(localStorage.getItem("gamesList"));
			console.log("gamesList:", gamesList);
			this.mostPopularGames = gamesList; 
		}
	}

	async getMostPopularGames(localStorage){
		//var gameNames = [];
		const dataService = this.dataService;
		for(var i = 0; i < 5; i++){
			const name = this.topFiveGames[i];
			const id = dataService.gameNameToID(name);
			//console.log("NAME:", name)
			//console.log("ID:", id)

			await dataService.getGame(id).then(async (object) => {
				//console.log(object['data']);
				var data = object['data']
				var cover = data['assets']['cover-medium']['uri'];
				var genreArray = [];
				data['genres']['data'].forEach((genre)=>{
					genreArray.push(genre['name']);
				});
				var releaseDate = data['release-date'];
				var genres = genreArray.join(", ");
				var gamesList = JSON.parse(localStorage.getItem("gamesList"));
				var weblink = data['weblink'];
				var numRuns = 0;
				var allPlayers = [];
				await this.dataService.getGameRecords(id).then((object) =>{
					//console.log("full records:", object['data'])
					var data = object['data'];
					data.forEach((record) =>{
						//var category = record['category']['data'];
						numRuns += record['runs'].length
						record['players']['data'].forEach((player) => {
							if (!allPlayers.includes(player['id']) && player['id']){
								allPlayers.push(player['id'])
							}
						});
					});
				});

				var gameInfo = {name: data['names']['international'], id: data['id'], cover: cover, 
								genres: genres, releaseDate: releaseDate, weblink: weblink, 
								numPlayers: allPlayers.length, numRuns: numRuns};


				gamesList.push(gameInfo);
				console.log("gameInfo:", gameInfo)
				localStorage.setItem("gamesList", JSON.stringify(gamesList));
				this.mostPopularGames.push(gameInfo);
			});
			
		}

	}

	getNewestRuns(){

		const dataService = this.dataService;
		var recentRuns = [];
		var recentRunNames = [];
		var count = 0;
		function getRuns(object){
			//console.log("object:", object)

			if (count < 25){
				//console.log("Num runs:", this.totalNumRuns);
				object['data'].forEach((run) => {
					//recentRuns.push(run);
					//console.log("run:", run)
					var name = run['game']['data']['names']['international'];
					var id = run['game']['data']['id'];
					var playerId = run['players']['data'][0]['id'];
					if(!this.uniquePlayers.includes(playerId)){
						this.uniquePlayers.push(playerId);
						this.playerRunFrequency.push({id: playerId, numRuns: 1, name: run['players']['data'][0]['names']['international']});
					} else {
						var playerIndex = this.uniquePlayers.indexOf(playerId);
						this.playerRunFrequency[playerIndex]['numRuns'] = this.playerRunFrequency[playerIndex]['numRuns'] + 1;
					}
					if (!recentRunNames.includes(name)){
						recentRunNames.push(name);
						this.recentRuns.push({name: name, id: id, numRuns: 1})
					} else {
						var index = recentRunNames.indexOf(name);
						this.recentRuns[index]['numRuns'] = (this.recentRuns[index]['numRuns'] + 1)
					}
					//console.log("name:", name)
					//console.log("id:", id)
				});

				if (object['pagination']['links'].length > 1){ // Middle
					var nextURL = object['pagination']['links'][1]['uri'];
					count += 1;
					//console.log(count)
					dataService.makeRequest(nextURL).then(getRuns.bind(this));
				} else {
					if (object['pagination']['links'].length > 0){
						if (object['pagination']['links'][0]['rel'] == "next"){ // Start
							var nextURL = object['pagination']['links'][0]['uri'];
							count += 1;
							//console.log(count)
							dataService.makeRequest(nextURL).then(getRuns.bind(this));
						} else { // End
						}

					} else { // End

						//this.chartData = this.allRuns.sort((a, b) => (a.value < b.value) ? 1 : -1);
					}

				}
			}	else {
				this.recentRuns.sort((a, b) => (a.numRuns < b.numRuns) ? 1 : -1);
				this.playerRunFrequency.sort((a, b) => (a.numRuns < b.numRuns) ? 1 : -1);

				//console.log("length:", recentRuns.length)
				//console.log("recentRuns:", recentRuns)
				//console.log("this.recentRuns:", this.recentRuns)
				//console.log("this.uniquePlayers:", this.uniquePlayers)

				//console.log("playerRunFrequency:", this.playerRunFrequency)
			}	
		}
		dataService.getNewestRuns().then(getRuns.bind(this));
	}

	// WORK ON THIS. FINISH BY THURSDAY
	gameRunnersOverTime(gameID: string){
		console.log("id:", gameID)
		
		//records?miscellaneous=no&scope=full-game 
		
		var startDate = new Date("2014-03-01");
		var endDate = new Date("2020-12-01");
		/*
		this.dataService.getGame(gameID).then((object) => {
			var data = object['data'];
			console.log("data:", object['data'])
			var categories = data['categories']['data'];
			var startDate = new Date("2014-03-01");
			var endDate = new Date("2020-12-01");
			categories.forEach((category) => {
				if(category['type'] == "per-game"){
					console.log("category:", category['name'])
					this.dataService.categoryLeaderboard(gameID, category['id']).then((leaderboard) =>{
						console.log("leaderboard:", leaderboard['data'])
						//console.log("total # runs:", leaderboard['data']['runs'].length)
						var runsWithDate = [];
						leaderboard['data']['runs'].forEach((run) => {
							if(run['run']['date'] != null){
								runsWithDate.push(run)
							}
						});
						console.log(runsWithDate);
						//console.log("runs with dates:", runsWithDate.length);
					});
				}
			});
		});
		*/
	}

}
