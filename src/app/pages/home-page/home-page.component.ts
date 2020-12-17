import { Component, OnInit, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
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

	//Manually compiled list of top 10 games based on number of runs submitted
	//Automatially creating a real-time list of the most played games is basically impossible due to the rate limits on the Speedrun.com API
	topGames = ["Super Mario 64",
				"Super Mario Odyssey",
				"Mario Kart 8 Deluxe",
				"Celeste",
				"Super Metroid",
				"The Legend of Zelda: Ocarina of Time",
				"Super Mario World",
				"Super Mario Sunshine",
				"Getting Over It With Bennett Foddy",
				"Portal",]

	
	// Variables used/adapted from https://swimlane.gitbook.io/ngx-charts/examples
	chartData1: any[];	
	chartData2: any[];
	showXAxis = true;
	showYAxis = true;
	gradient = true;
	showLegend = true;
	showXAxisLabel = true;
	xAxisLabel1 = 'Game';
	xAxisLabel2 = "Date";
	showYAxisLabel = true;
	yAxisLabel1 = '# of Runs';

	colorScheme = {
		domain: ['#31e7f7', '#2871d1', '#28d19b', '#5c4aff']
	};
	
	recentRuns;
	uniquePlayers;
	playerRunFrequency;
	runsOverTime;
	mostPopularGames;
	
	constructor(private dataService: DataService) { 
		this.mostPopularGames = [];
		this.recentRuns = [];
		this.uniquePlayers = [];
		this.playerRunFrequency = [];
		this.chartData1 = [];
		this.runsOverTime = [];
	}

	ngOnInit(): void {	
		const dataService = this.dataService;
		this.getNewestRuns(dataService);
		
		var storage = window.sessionStorage;
		// storage.removeItem("gamesList");
		if (!storage.getItem("gamesList")){
			console.log("Storage Empty")
			storage.setItem("gamesList", "[]");
			this.getMostPopularGamesInfo(dataService, 10);
		} else {
			var gamesList: any[] = JSON.parse(storage.getItem("gamesList"));
			console.log("gamesList:", gamesList);
			this.mostPopularGames = gamesList;
			var tempChartData = [];
			gamesList.forEach((game) =>{
				tempChartData.push(game['chartData']);
				//console.log(game)
			}); 
			this.chartData2 = tempChartData;
		}
	}

	async getMostPopularGamesInfo(dataService: DataService, x: number = 10){
		var storage = window.sessionStorage;
		for (const name of this.topGames.slice(0, x)){
			await this.getGameInfo(storage, name, dataService);
			//await this.gameRunsOverTime(this.dataService.gameNameToID(game));
		}
		this.chartData2 = this.runsOverTime;
	}

	// Get info about the top five games on Speedrun.com
	async getGameInfo(storage, name:string, dataService: DataService){
		//var gameNames = [];
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
			var weblink = data['weblink'];
			var numRuns = 0;
			var allPlayers = [];
			var dates = [];
			var startDate = new Date("2014-03-01"); //Date that Speedrun.com was created
			for (var i = 0; i <= 13; i++){
				var date = new Date(startDate);
				date.setMonth(date.getMonth() + (6 * i))
				dates.push(date);
			}
			dates.push(new Date());
			var runs = [];
			await this.dataService.getPerGameRecords(id).then((records) =>{
				//console.log("full records:", records['data'])
				records['data'].forEach((record) =>{
					//var category = record['category']['data'];
					numRuns += record['runs'].length
					record['players']['data'].forEach((player) => {
						if (!allPlayers.includes(player['id']) && player['id']){
							allPlayers.push(player['id'])
						}
					});
					this.calculateRunsInPast(runs, dates, record);
				});
			});
			
			this.runsOverTime.push({name: name, series: runs});
			var gameInfo = {name: data['names']['international'], id: data['id'], cover: cover, 
							genres: genres, releaseDate: releaseDate, weblink: weblink, 
							numPlayers: allPlayers.length, numRuns: numRuns, chartData: {name: name, series: runs}};

			var gamesList = JSON.parse(storage.getItem("gamesList"));
			gamesList.push(gameInfo);
			//console.log("gameInfo:", gameInfo)
			storage.setItem("gamesList", JSON.stringify(gamesList));
			this.mostPopularGames.push(gameInfo);
		});
		
		//this.chartData2 = this.runsOverTime;
	}

	// For each date in dates, store how many runs from the record occured on or before that date
	calculateRunsInPast(runs, dates, record){
		dates.forEach((date) => {
			var numRuns = this.numRunsInPast(record['runs'], date);
			var year = date.toISOString().slice(0, 4);
			var month = date.toLocaleDateString('en-US', {month: 'short'})
			var dateString = month + " " + year;
			var index = this.dateIndex(runs, dateString);

			if (index == -1){
				runs.push({value: numRuns, name: dateString});
			} else {
				runs[index].value += numRuns;
			}
		});
	}

	// Return the index of the dateString within the array or -1 if it does not exist
	dateIndex(array, dateString){
		var index = -1;
		for(var i = 0; i < array.length; i++){
			if (array[i]['name'] === dateString){
				index = i;
				break;
			}
		}
		return index;
	}

	// Return the number of runs on or before the specified date
	numRunsInPast(runs, pastDate: Date): number{
        var count = 0;
        runs.forEach((run) => {
            var data = run['run'];
            var runDate = new Date(data['date']);
            if (runDate.getTime() <= pastDate.getTime()){
                count += 1;
            }
        });
        return count;
	}
	
	// Gather data about the most recent 500 speedruns submitted to the site
	getNewestRuns(dataService: DataService){
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
						this.playerRunFrequency.push({id: playerId, value: 1, name: run['players']['data'][0]['names']['international']});
					} else {
						var playerIndex = this.uniquePlayers.indexOf(playerId);
						this.playerRunFrequency[playerIndex]['value'] = this.playerRunFrequency[playerIndex]['value'] + 1;
					}
					if (!recentRunNames.includes(name)){
						recentRunNames.push(name);
						this.recentRuns.push({name: name, id: id, value: 1})
					} else {
						var index = recentRunNames.indexOf(name);
						this.recentRuns[index]['value'] = (this.recentRuns[index]['value'] + 1)
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
				this.recentRuns.sort((a, b) => (a.value < b.value) ? 1 : -1);
				this.playerRunFrequency.sort((a, b) => (a.value < b.value) ? 1 : -1);

				//console.log("this.recentRuns:", this.recentRuns)
				this.chartData1 = this.recentRuns.slice(0, 10);
				//console.log("chartData1:", this.chartData1);
			}	
		}
		dataService.getNewestRuns().then(getRuns.bind(this));
	}

}
