import { Component, OnInit } from '@angular/core';
import { UserData } from '../../data/user-data';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent implements OnInit {

  userID:string;
  user:UserData;
  pictureLink:string;
  totalNumRuns:number;
  allRunsData; //Array containing all runs and their data
  allRuns; //Array of runs containing object with the name of the game and the number of runs
  
  // Variables used/adapted from https://swimlane.gitbook.io/ngx-charts/examples
  chartData: any[];
  chartData1: any[];
  recentRuns;

  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Game';
  showYAxisLabel = true;
  yAxisLabel = '# of Runs';

  colorScheme = {
    domain: ['#31e7f7', '#2871d1', '#28d19b', '#5c4aff', '#ffbb00']
  };

  worldRecords;
  firstRun;
  latestRun;

  constructor(private route: ActivatedRoute, private dataService: DataService) { 
    this.pictureLink = "../../../assets/unknown.png";
    this.user = new UserData();
    this.totalNumRuns = 0;
    this.allRuns = [];
    this.allRunsData = [];
    this.worldRecords = [];
    this.recentRuns = [];
  }

  ngOnInit(): void {
    this.userID = this.route.snapshot.paramMap.get('id');
    this.getUserInfo();
  }

  // Get all information about the user
  private async getUserInfo(){
    const dataService = this.dataService;
    var userObject = await dataService.getUserInfo(this.userID);
    var data = userObject['data'];
    //console.log("user data:", data);
    var userData = new UserData(data['id'], data['names']['international']);
    userData.link = data['weblink'];
    if (data['location']){
      if (data['location']['region']){
        userData.userLocation = data['location']['region']['names']['international'];
      } else {
        userData.userLocation = data['location']['country']['names']['international'];
      }
    }
    
    if(data['twitch'] != null){
      userData.twitch = data['twitch']['uri']
    }
    if(data['twitter'] != null){
      userData.twitter = data['twitter']['uri']
    }
    userData.userSince = (new Date(data['signup'])).toLocaleDateString();
    var personalBestsLink = data['links'][3]['uri'];
    await this.getPersonalBestsInfo(dataService, userData, personalBestsLink);
    this.user = userData;
    var picLink = "https://speedrun.com/themes/user/" + this.user.name + "/image.png";
    
    this.getAllRuns();
    this.testPictureLink(picLink);
  }

  // Use https://allorigins.win/ to test if the user has uploaded a profile picture.
  // If they have, load that picture otherwise use the default image.
  testPictureLink(picLink){
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(picLink)}`).then(response => {
        if (response.ok){
          return response.json();
        } else {
          throw new Error('Network error');
        }
      }).then((data) => {
        if(!data.contents.includes("error")){
          this.pictureLink = picLink;
        }
      });
  }

  // Get info about user's personal best runs
  async getPersonalBestsInfo(dataService, userData, personalBestsLink){
    dataService.makeRequest(personalBestsLink + "?embed=game,category,run").then((object) =>{
      //console.log("pbs:", object)
      object['data'].sort((a, b) => (a.place > b.place) ? 1 : -1);
      userData.personalBests = object['data'];
      //userData.topFiveRuns = object['data'].slice(0,5);
      object['data'].forEach((pb) => {
        var category = pb['category']['data'];
        var game = pb['game']['data'];
        var gameName = game['names']['international'];
        var shortGameName = gameName;
        if (gameName.length > 16){
          shortGameName = gameName.substr(0, 16) + "...";
        }
        var catName = category['name'];
        var shortCatName = catName;
        if (catName.length > 11){
          shortCatName = catName.substr(0, 11) + "...";
        }
        
        var wrObject = {game: gameName, category: catName, gameId: game['id'], link: "/game/" + game['id'], weblink: pb['run']['weblink'],
                        shortGameName: shortGameName, shortCatName: shortCatName}
        if(pb['place'] == 1){
          if (this.worldRecords.length == 0){
            userData.worldRecords += 1;
            this.worldRecords.push(wrObject);
          } else {
            var found = false;
            for(var i = 0; i < this.worldRecords.length; i++){
              if(this.worldRecords[i]['category'] == wrObject['category'] && this.worldRecords[i]['gameId'] == wrObject['gameId']){
                found = true;
                break;
              }
            }
            if (!found){
              userData.worldRecords += 1;
              this.worldRecords.push(wrObject);
            }
          }
        }
      });  
    }); 
  }

  // Recursively call the API to get all runs that this user has submitted to Speedrun.com
  async getAllRuns(){
    const userID = this.userID;
    const dataService = this.dataService;
    function getRuns(object){
      this.totalNumRuns += object['data'].length;
      object['data'].forEach((run) => {
        this.allRunsData.push(run);
        var name = run['game']['data']['names']['international'];
        if(this.nameToIndex(this.allRuns, name) == -1){
          this.allRuns.push({name: name, value: 1, gameId: run['game']['data']['id']});
        } else {
          this.allRuns[this.nameToIndex(this.allRuns, name)]['value'] += 1;
        }
        var total = 0;
        this.recentRuns.forEach((run) => {
          total += run['value'];
        })
        if(total < 20){
          if(this.nameToIndex(this.recentRuns, name) == -1){
            this.recentRuns.push({name: name, value: 1, gameId: run['game']['data']['id']});
          } else {
            this.recentRuns[this.nameToIndex(this.recentRuns, name)]['value'] += 1;
          }
        }
      });
      if (object['pagination']['links'].length > 1){ // Middle
        var nextURL = object['pagination']['links'][1]['uri'];
        dataService.makeRequest(nextURL).then(getRuns.bind(this));
      } else {
        if (object['pagination']['links'].length > 0){
          if (object['pagination']['links'][0]['rel'] == "next"){ // Start
            var nextURL = object['pagination']['links'][0]['uri'];
            dataService.makeRequest(nextURL).then(getRuns.bind(this));
          } else { // End
            this.firstRun = this.allRunsData[this.allRunsData.length - 1];
            this.latestRun = this.allRunsData[0];
            this.chartData = this.allRuns.sort((a, b) => (a.value < b.value) ? 1 : -1);
            this.chartData1 = this.recentRuns.sort((a, b) => (a.value < b.value) ? 1 : -1);
          }
        } else { // End
          this.firstRun = this.allRunsData[this.allRunsData.length - 1];
          this.latestRun = this.allRunsData[0];
          this.chartData = this.allRuns.sort((a, b) => (a.value < b.value) ? 1 : -1);
          this.chartData1 = this.recentRuns.sort((a, b) => (a.value < b.value) ? 1 : -1);
        }
      }		
    }
    await dataService.getRecentRunsByUser(userID).then(getRuns.bind(this));
  }

  // Takes an array of objects and a name as arguments, returns the index of first object which contains the name
  nameToIndex(array: [{name: string,}], name:string): number{
    var index = -1;
    for(var i = 0; i < array.length; i++){
      if(array[i]['name'] == name){
        return i;
      }
    }
    return index;
  }

}
