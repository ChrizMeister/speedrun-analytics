import { CategoryData } from './category-data';

export class GameData {
	id:string;
    name:string;
	abbreviation:string;
	releaseDate:string;
	platforms: Array<{}>;
	platformsString:string;
	weblink: string;
	developers;
	developersString = "";
	genres;
	genresString: string = "";
	numCategories: number;
	categories: Array<CategoryData> = [];
	categoriesString: string = "";
	categories1;
	categories2;
	categoriesOverTime;
	topCategories;
	recordsLink;
	seriesLink;
	leaderboardLink;
	backgroundLink = "https://upload.wikimedia.org/wikipedia/commons/b/b2/A_black_background.jpg";
	logoLink = "https://www.speedrun.com/themes/Default/logo-light.png";
	coverLink;
	totalRuns: number = 0;
	mostPopularPercent;
	series:string;
	fastestCategory:string;
	fastestTime;
	fastestRunner;
	numRunners;

	constructor(id:string = "", name: string = "") {
		this.id = id;
		this.name = name;
		this.weblink = "https://speedrun.com";
		this.numCategories = 0;
		this.categories1 = [];
		this.categories2 = [];
		this.mostPopularPercent = "100%";
		this.series = "";
		this.fastestCategory = "";
		this.fastestTime = -1;
		this.topCategories = [];
		this.categoriesOverTime = [];
		this.numCategories = 0;
		this.numRunners = 0;
		this.fastestRunner = "";
	}

	public fastestTimeString(){

		var bestString = new CategoryData().convertTime(new Date(this.fastestTime * 1000).toISOString().substr(11, 8));
		return bestString;
	}

	public addCategory(id, name, numRuns = 0, bestTime = 999999, worstTime = 999999, averageTime = 999999, runs = null, worldRecordHolder = {}){
		var objectRuns = {name: name, value: numRuns};
		var bestString = new CategoryData().convertTime(new Date(bestTime * 1000).toISOString().substr(11, 8));
		var averageString = new CategoryData().convertTime(new Date(averageTime * 1000).toISOString().substr(11, 8));
		//var worstString = new Date(worstTime * 1000).toISOString().substr(11, 8)
		bestTime = bestTime / 60;
		averageTime = averageTime / 60;
		worstTime = worstTime / 60;
		var objectTimes = {"name": name, "series": [{name: "World Record: " + bestString, value: bestTime}, 
													{name: "Average Time: " + averageString, value: averageTime}]};
													//{name: "Worst Time: " + worstString, value: worstTime}]}
		this.categories.push(new CategoryData(id, name, numRuns, bestTime, worstTime, averageTime, runs, worldRecordHolder))

		this.categories1.push(objectRuns);
		this.categories2.push(objectTimes)
		//console.log(objectTimes)
		this.totalRuns += numRuns;
	}

	public categoryNameToIndex(name): number {
		for(var i = 0; i < this.categories1.length; i++){
			if(name == this.categories1[i]['name']){
				return i;
			}
		}
		return -1;
	}

	public sortCategories(){
		var length = this.categories.length;
		for(var i = 0; i < length; i++){
			for(var j = i + 1; j < length; j++){
				if (this.categories[i].numRuns < this.categories[j].numRuns){
					var temp = this.categories[i];
					this.categories[i] = this.categories[j];
					this.categories[j] = temp;

					var temp1 = this.categories1[i];
					this.categories1[i] = this.categories1[j];
					this.categories1[j] = temp1;

					temp = this.categories2[i];
					this.categories2[i] = this.categories2[j];
					this.categories2[j] = temp;
				}
			}
		}

		this.topCategories = this.categories.slice(0, 5);
		//console.log("top categories:", this.topCategories)
		this.mostPopularPercent = (100 * this.categories[0].numRuns / this.totalRuns).toFixed(0).toString() + "%";
	}

	public getPastRuns(){
		var dates: Date[] = [];
		var now = new Date();
		var currentYear = now.getFullYear();
		var releaseYear = parseInt(this.releaseDate.slice(0, 4));
		if (releaseYear <= 2014){
			for(var i = 6; i >= 0; i--){
				var date = new Date();
				date.setFullYear(date.getFullYear() - i);
				dates.push(date);
			}
		} else {
			for(var i = (currentYear - releaseYear + 1); i >= 0; i--){
				var date = new Date();
				date.setFullYear(date.getFullYear() - i);
				dates.push(date);
			}
		}
		
		

		this.topCategories.forEach((category: CategoryData) =>{
			var array = [];
			dates.forEach((date) =>{
				//console.log("category:", category)
				var numRuns = category.numRunsInPast(date);
				array.push({value: numRuns, name: date.toISOString().slice(0, 4)})
			});
			this.categoriesOverTime.push({name: category['name'], series: array});
			//console.log("array:", array);
		});
	}

}
