var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var twitterAPI = require('node-twitter-api');
const MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

const pollController = require('./controllers/poll');

//var url= 'mongodb://opinio:password@ds153845.mlab.com:53845/opinio';
var url= 'mongodb://localhost:27017/opinio';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected");
});

var app = express();
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store:new MongoStore({mongooseConnection:db}),
    resave: true,
    saveUninitialized: true
}));
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));

//Routes
app.get('/getpolls',pollController.getPolls);
app.get('/getmypolls',pollController.myPolls);
app.post('/addquestion',pollController.addQuestion);
app.get('/:id([0-9]+)/pollDetail',pollController.pollDetails);
app.get('/:id([0-9]+)/pollValues',pollController.pollValues);
app.post('/:id([0-9]+)/update',pollController.update);
app.post('/:id([0-9]+)/delete',pollController.delete);
app.get('/:id/voted',pollController.voted);

var twitter
app.get('/login',function(req,res,next){
	//SIGN IN WITH TWITTER
	twitter = new twitterAPI({
	    consumerKey: 'J5uwAAsAVCL5qXypuD2JvEZpH',
	    consumerSecret: 'D9pID6kpYZ31J9hcbWWx8d1B4aBHAwhjjlrzeSEdGrK3k20hue',
	    callback: req.protocol + '://' + req.get('host') + '/callback'
	});
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

app.get('/',function (req, res, next) {
	res.sendFile(__dirname+"/views/index.html");
});
app.get('/my',function (req, res, next) {
	res.sendFile(__dirname+"/views/mypolls.html");
});
app.get('/:id([0-9]+)',function(req,res,next){
	res.sendFile(__dirname+"/views/poll.html");
});
app.get('/add',function (req, res, next) {
	if(req.session.twitterID)
		res.sendFile(__dirname+"/views/add.html");
	else
		res.redirect('/');
});
app.get('/*',function(req,res,next){
	res.redirect('/');
})

var server = app.listen(app.get('port'), function () {
	var host = 'localhost'
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
});
