/*

Config script for transforming raw NFL News JSON data to expected Dynamo DB Format

*/

TEAM_DATA_FILE_NAME = './service_files/nfl_team_data.json';

_loadAllTeamData = function(){

	try {

		let fs = require('fs');
		let teamFileData = fs.readFileSync(TEAM_DATA_FILE_NAME, 'utf8');

		return JSON.parse(teamFileData);

	} catch (e) {

		console.log("Unable to load team data: " + e);

	}

}


_loadAllTeams = function(allTeamData){

	let teams = [];
	for(let i = 0; i < allTeamData.teams.length; i++){

		let team = allTeamData.teams[i];
		teams.push(team);

	}

	return teams;

}

let Article = function(article, teams){

	this.teams = teams;
	this.article_name = article.title;
	this.description = article.description;
	this.url = article.url;
	this.modified_at = article.publishedAt;

}


let DataTransformer = function(){

	let allTeamData = _loadAllTeamData();
	this.teams = _loadAllTeams(allTeamData);

}


DataTransformer.prototype.transformResponseToDocument = function(nflArticleData){

	let articles = [];

	let teamArticleData = this._getTeamArticleData(JSON.parse(nflArticleData).articles);
	articles = articles.concat(teamArticleData);	

	return articles;

}

DataTransformer.prototype._getTeamArticleData = function(nflArticles){

	let articles = [];
	let earliestTimeStamp = null;

	for(var i = 0; i < nflArticles.length; i++){

		var article = nflArticles[i];

		var teams = [];

		for(var j = 0; j < this.teams.length; j++){

			var team = this.teams[j];

			for(var k = 0; k < team.keyWords.length; k++){

				var keyWord = team.keyWords[k];

				if(article.title.toUpperCase().includes(keyWord) ||
				article.description.toUpperCase().includes(keyWord)){
					teams.push(team.name);
					break;
				}		
				
			}

		}

		if(teams.length > 0){
			articles.push(new Article(article, teams));
		}

	}

	return articles;

}

module.exports.DataTransformer = DataTransformer;