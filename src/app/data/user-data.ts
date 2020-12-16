export class UserData {
    id:string;
    name:string;
    weblink:string;
    location:string;
    twitchLink:string;
    twitterLink:string;
    youtubeLink:string;
    userSince:string;
    personalBests: [];
    topFiveRuns: [];
    worldRecords:number;

	constructor(id:string = "", name:string = "") {
        this.id = id;
        this.name = name;
        this.weblink = "https://speedrun.com";
        this.location = "N/A";
        this.twitchLink = "https://twitch.tv";
        this.twitterLink = "https://twitter.com";
        this.youtubeLink = "https://youtube.com";
        this.worldRecords = 0;
	}

    //Getters
	get userID(): string {
        return this.id;
	}

	get userName(): string {
		return this.name;
    }

    //Setters
    set link(link:string){
        this.weblink = link;
    }

    set userLocation(location:string){
        this.location = location;
    }
    
    set twitch(link:string){
        this.twitchLink = link;
    }

    set twitter(link:string){
        this.twitterLink = link;
    }

    set youtube(link:string){
        this.youtubeLink = link;
    }
}
