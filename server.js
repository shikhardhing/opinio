var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var twitterAPI = require('node-twitter-api');
var app = express();
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'shikhar',
  password : 'password',
  database : 'myDB'
});
connection.connect();

var sessionStore = new MySQLStore({},connection);
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store:sessionStore,
    resave: true,
    saveUninitialized: true
}));
app.use(function (req, res, next) {
	var twitterID;
	next();
})

//SIGN IN WITH TWITTER
var twitter = new twitterAPI({
    consumerKey: 'J5uwAAsAVCL5qXypuD2JvEZpH',
    consumerSecret: 'D9pID6kpYZ31J9hcbWWx8d1B4aBHAwhjjlrzeSEdGrK3k20hue',
    callback: 'http://localhost:8081/callback'
});
app.get('/login',function(req,res,next){
	twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results){
	    if (error) {
	        console.log("Error getting OAuth request token : " + error);
	    }
	    else {
	    	requestTokeng=requestToken;
	    	requestTokenSecretg=requestTokenSecret;
	    	res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+requestToken);
	    }
	});
});
app.get('/callback',function(req,res,next){
	oauth_verifierg=req.query.oauth_verifier;
	twitter.getAccessToken(requestTokeng, requestTokenSecretg, oauth_verifierg, function(error, accessToken, accessTokenSecret, results) {
	    if (error) console.log(error);
	    else {
	    	accessTokeng=accessToken;
	    	accessTokenSecretg=accessTokenSecret;
	    }
		twitter.verifyCredentials(accessTokeng,accessTokenSecretg,function(error,data,response){
			var time = 864000000;
			req.session.cookie.maxAge = time;
			req.session.sessionID=req.sessionID;
			req.session.twitterID=data.id;
			req.session.name=data.name;
			res.redirect('/');
		});
	});
})
//COOKIE HANDLING
app.get('/getcookie',function(req,res,next){
	res.send(req.session);
});
app.get('/logout',function(req,res,next){
	req.session.regenerate(function(e){
		if (e) throw e;
		res.redirect('/');
	});
})
//RETURNS LIST OF QUESTIONS
app.get('/getpolls',function (req, res, next) {
	connection.query('SELECT * FROM polls',function(err,results,fields){
		if(err) throw err;
		res.send(results);
	});
});
app.get('/getmypolls',function (req, res, next) {
	if(!req.session.twitterID)
		res.redirect('/');
	connection.query('SELECT * FROM polls WHERE madeby='+req.session.twitterID,function(err,results,fields){
		if(err) throw err;
		res.send(results);
	});
});
//RETURNS PARTICULAR QUESTION AND OPTIONS
app.get('/:id([0-9]+)/pollDetail', function (req, res) {
	connection.query('SELECT * FROM polls WHERE id='+req.params.id,function(err,results,fields){
		if(err) throw err;
		res.send(results[0]);
	});
});
app.get('/:id([0-9]+)/pollValues', function (req, res) {
	connection.query('SELECT * FROM countPolls WHERE id='+req.params.id,function(err,results,fields){
		if(err) throw err;
		res.send(results[0]);
	});
});
app.use(bodyParser.json());
//ADD ENTRY TO DB
app.post('/addquestion',function (req, res) {
	connection.query('SELECT MAX(id) FROM polls',function(err,results,fields){
		if(err) throw err;
		var curid=results[0]["MAX(id)"]+1;
		var q='INSERT INTO polls VALUES('+curid+','+req.session.twitterID;
		for(var i in req.body){
			q+=',"'+req.body[i]+'"';
		}
		for(i=req.body.countOptions;i<10;i++){
			q+=',"NULL"';
		}
		q+=');';
		connection.query(q,function(err,results,fields){
			if(err) throw err;
		});
		connection.query('INSERT INTO countPolls VALUES('+curid+',0,0,0,0,0,0,0,0,0,0);',function(err,results,fields){
			if(err) throw err;
			res.send('/'+curid);
			res.end();
		});
	});
});
app.post('/:id([0-9]+)/update', function (req, res) {
	if(req.body.new==1){
		connection.query('SELECT countOptions FROM polls WHERE id='+req.params.id,function(err,results,fields){
			if(err) throw err;
			var nopt=results[0].countOptions+1;
			q='UPDATE polls SET countOptions='+nopt+',option'+nopt+'="'+req.body.opt+'" WHERE id='+req.params.id;
			qi='UPDATE countPolls SET option'+nopt+'=1 WHERE id='+req.params.id;
			connection.query(q,function(err,results,fields){
				if(err) throw err;
			});
			connection.query(qi,function(err,results,fields){
				if(err) throw err;
				res.end();
			});
		});
	}
	else{
		q='UPDATE countPolls SET option'+req.body.opt+'=option'+req.body.opt+'+1 WHERE id='+req.params.id;
		connection.query(q,function(err,results,fields){
			if(err) throw err;
			res.end();
		});
	}
});
app.post('/:id([0-9]+)/delete', function (req, res) {
	connection.query('DELETE FROM polls WHERE id='+req.params.id,function(err,results,fields){
		if(err) throw err;
	});
	connection.query('DELETE FROM countPolls WHERE id='+req.params.id,function(err,results,fields){
		if(err) throw err;
		res.end();
	});
});
app.use(express.static(__dirname));
app.get('/poll',function (req, res, next) {
	res.sendFile("/index.html");
});
app.get('/my',function (req, res, next) {
	res.sendFile(__dirname+"/mypolls.html");
});
app.get('/:id([0-9]+)',function(req,res,next){
	res.sendFile(__dirname+"/poll.html");
});
app.get('/add',function (req, res, next) {
	if(req.session.twitterID)
		res.sendFile(__dirname+"/add.html");
	else
		res.redirect('/');
});

var server = app.listen(process.env.port||8081, function () {
var host = 'localhost'
var port = server.address().port
console.log("Example app listening at http://%s:%s", host, port)
});

//create table polls (id int, madeby varchar(10),countOptions int,question varchar(50),option1 varchar(50),option2 varchar(50),option3 varchar(50),option4 varchar(50),option5 varchar(50),option6 varchar(50),option7 varchar(50),option8 varchar(50),option9 varchar(50),option10 varchar(50));
//create table countPolls (id int,option1 int,option2 int,option3 int,option4 int,option5 int,option6 int,option7 int,option8 int,option9 int,option10 int);