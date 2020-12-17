import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  encapsulation: ViewEncapsulation.None // From https://angular.io/guide/view-encapsulation for customizing the search bar with CSS
})

export class SearchComponent implements OnInit {

	gamesList: Array<{name:string, id:string}>;

	constructor(private dataService: DataService) {}

	ngOnInit(): void {	
		this.gamesList = this.dataService.gamesList;
		this.addSuggestions();
	}

	// Generate game and user suggestions based on the user's input in the search bar
	// Adapted from https://www.w3schools.com/howto/howto_js_autocomplete.asp
	addSuggestions(){
		const gamesList = this.gamesList;
		var searchBar = <HTMLInputElement>document.getElementById("search");
		var classListName = "suggestionList";
		var classItemName = "suggestionItem";
		const dataService = this.dataService;
		var length = 0;
		var userResults;
		var numUsers = 21;
		searchBar.addEventListener("input", function(e){
			var val = this.value;
			var newLength = val.length;			

			var usersList = [];
			closeLists(searchBar.id)
			if(val.length > 2){
				
				var suggestions = document.createElement("div");
				suggestions.setAttribute("class", classListName);
				this.parentNode.appendChild(suggestions);
				var gamesHeader = document.createElement("div");
				gamesHeader.setAttribute("id", "gamesHeader");
				gamesHeader.setAttribute("class", "header");
				gamesHeader.innerHTML = "Games";
				suggestions.appendChild(gamesHeader);
				var gameResults = [];
				gamesList.forEach(function(item:{name: string, id: string}) {
					if(item['name'].toLowerCase().includes(val.toLowerCase())){
						var sugg = document.createElement("a");
						gameResults.push(item['name']);
						sugg.setAttribute("class", classItemName);
						sugg.setAttribute("href", '/game/' + item['id']);
						sugg.innerHTML += "<div class='" + classItemName + "'>" + item['name'] + "</div>";
						suggestions.appendChild(sugg);
					}
				});

				if(val.length > 3 && !val.includes(" ") && gameResults.length <= 10){
					if(newLength > length && userResults && numUsers < 20){

						userResults.then((data) =>{
							data['data'].forEach((user) =>{
								usersList.push({name: user['names']['international'], id: user['id']});
							});
							var usersHeader = document.createElement("div");
							usersHeader.setAttribute("id", "usersHeader");
							usersHeader.setAttribute("class", "header");
							usersHeader.innerHTML = "Users";
							suggestions.appendChild(usersHeader);
							usersList.forEach(function(item:{name, id}){
								if(item['name'].toLowerCase().includes(val.toLowerCase())){
									var sugg = document.createElement("a");
									sugg.setAttribute("class", classItemName);
									sugg.setAttribute("href", '/user/' + item['id']);
									sugg.innerHTML += "<div class='" + classItemName + "'>" + item['name'] + "</div>";
									suggestions.appendChild(sugg);
								}
							});
						});
					} else {

						var users = dataService.searchForUser(this.value);
						userResults = users;
						userResults.then((data) =>{
							data['data'].forEach((user) =>{
								usersList.push({name: user['names']['international'], id: user['id']});
							});
							numUsers = usersList.length;
							var usersHeader = document.createElement("div");
							usersHeader.setAttribute("id", "usersHeader");
							usersHeader.setAttribute("class", "header");
							usersHeader.innerHTML = "Users";
							suggestions.appendChild(usersHeader);
							usersList.forEach(function(item:{name, id}){
								if(item['name'].toLowerCase().includes(val.toLowerCase())){
									var sugg = document.createElement("a");
									sugg.setAttribute("class", classItemName);
									sugg.setAttribute("href", '/user/' + item['id']);
									sugg.innerHTML += "<div class='" + classItemName + "'>" + item['name'] + "</div>";
									suggestions.appendChild(sugg);
								}
							});
						});
					}	
				}
			}
			length = newLength;
		});

		function closeLists(element){
			var x = document.getElementsByClassName(classListName);
			for (var i = 0; i < x.length; i++) {
				if (element != x[i] && element.id != "search" && element.id != "gamesHeader") {
					x[i].parentNode.removeChild(x[i]);
				}
			}
		}

		document.addEventListener("click", function(e){
			closeLists(e.target);
		});
	}

}
