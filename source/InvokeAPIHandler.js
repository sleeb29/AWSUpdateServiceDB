let InvokeAPIHandler = function(serviceInfo){
	this.host = serviceInfo.host;
	this.path = serviceInfo.path;
	console.log(this.path);
}

InvokeAPIHandler.prototype.invoke = function(callback){

	let https = require('https');
	let host = this.host;
	let path = this.path;

	console.log(path);

	let optionsget = {
	    host : host,
	    port : 443,
	    path : path,
	    method : 'GET'
	};

	console.log(typeof optionsget.path);
	 
	let reqGet = https.request(optionsget, function(res) {

	    let resData = []; 
	 
	    res.on('data', function(d) {
	        resData.push(d);
	    });

	    res.on('end', function(){

	    	callback(resData);
	    	
	    })
	 
	});
	 
	reqGet.end();
	reqGet.on('error', function(e) {
		console.log("--error getting data from service--");
	    console.error(e);
	});

}

module.exports.InvokeAPIHandler = InvokeAPIHandler;