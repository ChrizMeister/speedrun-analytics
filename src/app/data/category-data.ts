export class CategoryData {
    id:string;
    name:string;
    gameName:string;
    gameID:string;
    public numRuns:number;
    bestTime;
    bestTimeString;
    worstTime;
    worstTimeString;
    averageTime;
    averageTimeString;
    runs;
    worldRecordHolder;
    worldRecordHolderNameShort;
    nameShort;
    worldRecordHolderLink;
    
    constructor(id:string = "", name:string = "", numRuns:number=0, bestTime: number = 999999, worstTime: number = 999999, 
                averageTime: number = 999999, runs = 0, worldRecordHolder = {}) {
        this.id = id;
        this.name = name;
        this.numRuns = numRuns;
        this.bestTime = bestTime;
        this.worstTime = worstTime;
        this.averageTime = averageTime;

        this.bestTimeString = this.convertTime(new Date(bestTime * 1000 * 60).toISOString().substr(11, 8));
        this.worstTimeString =  new Date(worstTime * 1000 * 60).toISOString().substr(11, 8);
        this.averageTimeString = this.convertTime(new Date(averageTime * 1000 * 60).toISOString().substr(11, 8));
        this.runs = runs;
        this.worldRecordHolder = worldRecordHolder;
        if (worldRecordHolder['name']){
            if(worldRecordHolder['name'].length > 15){
                this.worldRecordHolderNameShort = worldRecordHolder['name'].slice(0, 15) + "...";
            } else {
                this.worldRecordHolderNameShort = worldRecordHolder['name']
            }
        }
        
        if(name.length > 15){
            this.nameShort = this.categoryName.slice(0, 15) + "...";
        }
        if (worldRecordHolder['id'] && worldRecordHolder['id'] != "N/A"){
            this.worldRecordHolderLink = "/user/" + worldRecordHolder['id'];
        } else {
            this.worldRecordHolderLink = "/";
        }
    }
    
    public numRunsInPast(pastDate: Date): number{
        var count = 0;
        this.runs.forEach((run) => {
            var data = run['run'];
            var runDate = new Date(data['date']);
            if (runDate.getTime() <= pastDate.getTime()){
                count += 1;
            }
        });
        return count;
    }

    public convertTime(time: string){
        var str = "";
        var hours = time.substr(0, 2);
        var min = time.substr(3, 2);
        var sec = time.substr(6, 2);
        if(parseInt(hours) == 0){
            str += parseInt(min) + "m " + parseInt(sec) + "s";
        } else {
            str += parseInt(hours) + "h " + parseInt(min) + "m " + parseInt(sec) + "s";
        }
        return str
    }


    //Getters
	get categoryID(): string {
        return this.id;
	}

	get categoryName(): string {
		return this.name;
    }
    
    get numberOfRuns(): number{
        return this.numRuns;
    }

    get game(): string{
        return this.gameName;
    }

    get gameid(): string{
        return this.gameID;
    }
}
