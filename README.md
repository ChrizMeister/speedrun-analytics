# Project by Christopher Sommerville, cssommer@uci.edu

# Speedrun.com Analytics

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.2.

## How To Run
The project is hosted on https://speedrun-analytics.web.app. 

Alternatively, run `npm install` from the command line in the project directory to install the necessary components then run the command `ng serve --open` from the command line to open the project.

## Summary
This project uses HTML, CSS, and JavaScript within the Angular framework to create a webpage that analyzes current and past activity of the website Speedrun.com. Data regarding games and users is gathered from Speedrun.com's API, documentaion at https://github.com/speedruncomorg/api, and from the Speedrun.com website.

## Features I'd like to add in the future
- Embedding leaderboards on each game's page
- More statistical analysis of the most popular games
- More graphs or statistics on the home page
- Embedding video's of runs on game/user pages
- Getting per-level category information for games
- Add social media links to user page

## List of Installed Components
- ngx-charts
- file-saver
- material-icons
- Firebase

## References / Sources
- https://angular.io/guide/view-encapsulation To be able to customize more CSS for the search bar, used in search.component.ts
- https://www.w3schools.com/howto/howto_js_autocomplete.asp Tutorial on creating a drop down search bar with HTML, CSS, & JS. Used in search.component.ts
- https://www.npmjs.com/package/file-saver for saving Javascript JSON objects to a file, used in data.service.ts for saving the lists of games & platforms.
- https://allorigins.win/ Website service for fetching webpages while avoiding same-origin problems, used in user-page.component.ts to check if a user has uploaded a profile picture
- https://swimlane.gitbook.io/ngx-charts/examples Chart framework used on the Home page, Game page, and User page to display graphs. Used in all .ts and .html files within the pages folder
- https://material.io/resources/icons/?style=baseline for icons, used on game and user page HTML files
- https://www.w3schools.com/howto/howto_css_loader.asp For adding a loader when pages/charts are loading, used in all HTML files.
