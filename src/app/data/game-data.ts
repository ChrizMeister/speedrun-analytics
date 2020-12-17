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
	categories: CategoryData[];
	categoriesString: string;
	categories1;
	categories2;
	levelCategories;
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

	constructor(id:string = "", name: string = "", releaseDate = "", weblink = "https://speedrun.com") {
		this.releaseDate = releaseDate;
		this.id = id;
		this.name = name;
		this.weblink = weblink;
		this.numCategories = 0;
		this.categories = [];
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
		this.categoriesString = "";
	}

	// Return string of the fastest time in any category
	public fastestTimeString(){
		var bestString = new CategoryData().convertTime(new Date(this.fastestTime * 1000).toISOString().substr(11, 8));
		return bestString;
	}

	// Add a new per-game category to the game
	public addCategory(id:string = "", name:string, numRuns = 0, bestTime = 999999, worstTime = 999999, averageTime = 999999, 
					   runs = [], worldRecordHolder = {}, type:string = "per-game"){

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
		if (name.length > 0){
			this.numCategories += 1;
			if (this.categoriesString.length == 0){
				this.categoriesString = "'" + name + "'";
			} else {
				this.categoriesString += ", '" + name + "'";
			}
		}
	}

	// Add a new level category to the game
	public addLevelCategory(levelName, levelId, numRuns){
		/*
		if (!this.categoriesString.includes("Level Categories")){
			if (this.categoriesString.length == 0){
				this.categoriesString = "'" + "Level Categories" + "'";
			} else {
				this.categoriesString += ", '" + "Level Categories" + "'";
			}
		}*/
		var objectRuns = {name: "Level Categories", value: numRuns};
		var index = this.categoryNameToIndex("Level Categories");
		if (index == -1){
			this.levelCategories.push(objectRuns);
		} else {
			this.levelCategories[index].value += numRuns;
			//console.log(this.categories1[index])
		}
		this.totalRuns += numRuns;
		this.numCategories += 1;
	}

	// Return the index of a category name
	public categoryNameToIndex(name): number {
		for(var i = 0; i < this.categories1.length; i++){
			if(name == this.categories1[i]['name']){
				return i;
			}
		}
		return -1;
	}

	// Sort all categories in decreasing order by number of runs in that category
	public sortCategories(){
		var length = this.categories.length;
		if (this.categories.length > 0){
			for(var i = 0; i < length; i++){
				for(var j = i + 1; j < length; j++){
					if (this.categories[i].numRuns < this.categories[j].numRuns){
						var temp = this.categories[i];
						this.categories[i] = this.categories[j];
						this.categories[j] = temp;
						if (this.categories1.length > 0){
							var temp1 = this.categories1[i];
							this.categories1[i] = this.categories1[j];
							this.categories1[j] = temp1;
						}
						if (this.categories2.length > 0){
							temp = this.categories2[i];
							this.categories2[i] = this.categories2[j];
							this.categories2[j] = temp;
						}
					}
				}
			}
		}
		

		this.topCategories = this.categories.slice(0, 5);
		//console.log("top categories:", this.topCategories)
		if (this.categories[0]){
			this.mostPopularPercent = (100 * this.categories[0].numRuns / this.totalRuns).toFixed(0).toString() + "%";
		}
	}

	// Iterate through runs and analyze how many runs occurred before certain dates
	public analyzePastRuns(){
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
		} else if(releaseYear <= 2016){
			for(var i = (currentYear - releaseYear + 1); i >= 0; i--){
				var date = new Date();
				date.setFullYear(date.getFullYear() - i);
				dates.push(date);
			}
		} else {
			for(var i = 3; i >= 0; i--){
				var date = new Date();
				date.setFullYear(date.getFullYear() - i);
				dates.push(date);
				if (i > 0){
					var dateMid = new Date();
					dateMid.setFullYear(date.getFullYear());
					var month = dateMid.getMonth();
					if (month + 6 > 11){
						month = (month + 6) % 11;
						dateMid.setFullYear(dateMid.getFullYear() + 1)
						dateMid.setMonth(month);
					} else {
						dateMid.setMonth(month + 6);
					}
					dates.push(dateMid);
				}
			}
		}

		this.topCategories.forEach((category: CategoryData) =>{
			var runs = [];
			dates.forEach((date) =>{
				//console.log("category:", category)
				var numRuns = category.numRunsInPast(date);
				var year = date.toISOString().slice(0, 4);
				var month = date.toLocaleDateString('en-US', {month: 'short'})

				runs.push({value: numRuns, name: month + " " + year})
			});
			this.categoriesOverTime.push({name: category['name'], series: runs});
		});
	}

}
