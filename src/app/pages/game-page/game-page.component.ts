import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GameData } from '../../data/game-data';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.css']
})
export class GamePageComponent implements OnInit {

  gameID:string;
  game:GameData;
  //view: any[] = [800, 400];
  runsData: any[];
  timesData: any[];
  runsOverTimeData: any[];

  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Category';
  xAxisLabel1 = "Date";
  showYAxisLabel = true;
  yAxisLabel1 = '# of Runs';
  yAxisLabel2 = 'Time (in minutes)';
  yAxisLabel3 = "# of Runs"

  colorScheme = {
    domain: ['#31e7f7', '#2871d1', '#28d19b', '#5c4aff']
  };

  constructor(private route: ActivatedRoute, private dataService: DataService) {
    Object.assign(this);
   }

  ngOnInit(): void {
    this.gameID = this.route.snapshot.paramMap.get('id');
    this.getGameInfo();
  }

  // Get all info about this game
  private async getGameInfo(){
    const dataService = this.dataService;
    var gameObject = await dataService.getGame(this.gameID);
    var data = gameObject['data'];
    var gameData = new GameData(data['id'], data['names']['international'], data['release-date'], data['weblink']);
    
    //console.log("game:", gameObject['data'])
    //gameData.releaseDate = data['release-date'];
    //gameData.weblink = data['weblink'];
    //var links = data['links'];
    //gameData.seriesLink=links[6]['uri'];
    this.processGenres(data, gameData);
    this.processPlatforms(data, gameData);
    this.processDevelopers(data, gameData);

    //var categories = data['categories']['data'];
    //this.processCategories(data['categories']['data'], gameData);

    
    await this.processRecords(gameData);

    if(data['assets']['background'] != null){
      gameData.backgroundLink = data['assets']['background']['uri'];
    }
    if(data['assets']['logo'] != null){
      gameData.logoLink = data['assets']['logo']['uri'];
    }
    if(data['assets']['cover-large'] != null){
      gameData.coverLink= data['assets']['cover-large']['uri'];
    }

    this.game = gameData;
    this.runsData = this.game.categories1;
    this.timesData = this.game.categories2;
    this.game.getPastRuns();
    this.runsOverTimeData = this.game.categoriesOverTime;
    console.log(this.runsOverTimeData)
    //console.log(this.game.categories)
    //console.log("full data:", this.runsOverTimeData);
  }


  // Set category info for this game
  private processCategories(categories, gameData: GameData){
    var categoryNames = [];
    categories.forEach((category) => {
      if(category['type'] == "per-game"){
        categoryNames.push(category.name);
        gameData.numCategories += 1;
      }
    });
    gameData.categoriesString = "'";
    gameData.categoriesString += categoryNames.join("', '");
    gameData.categoriesString += "'";
  }

  private async processRecords(gameData){
    await this.dataService.getPerGameRecords(this.gameID).then((object) =>{
      console.log("full per-game records:", object['data'])
      var data = object['data'];
      var runnerIds = [];
      data.forEach((record) =>{
        //console.log("record:", record);
        if (record['category']['data']['type'] == 'per-level'){
          //console.log("record:", record);
          var runs = record['runs'].length;
          gameData.addPerLevelCategory(runs);
          gameData.sortCategories();
        }

        var category = record['category']['data'];
        if(record['runs'].length > 0){

          var bestTime = record['runs'][0]['run']['times']['primary_t'];
          if (gameData.fastestTime == -1 || gameData.fastestTime > bestTime){
            gameData.fastestTime = bestTime;
            gameData.fastestCategory = category['name'];
            if (record['players']['data'][0]['rel'] == "guest"){
              gameData.fastestRunner = "Guest";
            } else {
              gameData.fastestRunner = record['players']['data'][0]['names']['international']
            }
          }
          var worstTime = record['runs'][record['runs'].length - 1]['run']['times']['primary_t'];
          var averageTime;
          var total = 0;
          record['runs'].forEach((run) => {
            total += run['run']['times']['primary_t'];
            var runnerId = run['run']['players'][0]['id'];
            if(!runnerIds.includes(runnerId) && runnerId){
              runnerIds.push(run['run']['players'][0]['id']);
            }
          });
          //console.log("runnerIds length:", runnerIds.length)
          gameData.numRunners = runnerIds.length;
          averageTime = parseInt((total /record['runs'].length).toFixed(0));
          var wrhData = record['players']['data'][0]; //worldRecordHolderData
          var worldRecordHolder;
          if (wrhData['rel'] == "guest"){
            worldRecordHolder = {name: "Guest", id: "N/A"}
          } else {
            worldRecordHolder = {name: wrhData['names']['international'], id: wrhData['id']}
          }
          if (category['name'].length > 0 && record['runs'].length > 0){
            gameData.addCategory(category['id'], category['name'], record['runs'].length, bestTime, worstTime, averageTime, 
                                record['runs'], worldRecordHolder);
            gameData.sortCategories(); 
          }
        }
        
      });
      //console.log("runnerIds length:", runnerIds.length)
    });

    if (false)
    await this.dataService.getLevelRecords(this.gameID).then((object) =>{
      console.log("full level records:", object['data'])
      var data = object['data'];
      var runnerIds = [];
      data.forEach((record) =>{
        console.log("record:", record);
        if (record['category']['data']['type'] == 'per-level'){
          //console.log("record:", record);
          var numRuns = record['runs'].length;
          gameData.addCategory("N/A", "Level Categories", numRuns, );
          gameData.sortCategories();
        }  
      });
    });
  }

  private processDevelopers(data, gameData: GameData){
    if (data['romhack']){
      gameData.developers = ["Romhack (Fan Made)"];
      gameData.developersString = "Romhack (Fan Made)";
    } else {
      gameData.developers = data['developers']['data'];
      var devNames = [];
      gameData.developers.forEach((developer) => {
        devNames.push(developer['name'])
      })
      gameData.developersString = devNames.join(", ");
    }
  }

  private processGenres(data, gameData){
    var genres = data['genres']['data'];
    var genreNames = [];
    gameData.genres = genres;
    genres.forEach((genre) => {
      genreNames.push(genre['name']);
    });
    gameData.genresString = genreNames.join(", ");
  }

  private processPlatforms(data, gameData){
    var platforms = data['platforms']['data'];
    var platformNames = [];
    platforms.forEach((platform) => {
      platformNames.push(platform['name']);
    });
    gameData.platforms = platforms;
    gameData.platformsString = platformNames.join(", ");
  }

}
