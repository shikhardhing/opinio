var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var twitterAPI = require('node-twitter-api');
var app = express();
const MongoStore = require('connect-mongo')(session);

var mongoose = require('mongoose');
//var url="mongodb://<shikhar97>:<(xyz123)>@ds145315.mlab.com:45315/qwerty";
var url = 'mongodb://localhost:27017/opinio'
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected");
});
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store:new MongoStore({mongooseConnection:db}),
    resave: true,
    saveUninitialized: true
}));
var pollsSchema=mongoose.Schema({
	id: Number,
	madeby:String,
	countOptions:Number,
	question:String,
	option1:String,option2:String,option3:String,option4:String,option5:String,
	option6:String,option7:String,option8:String,option9:String,option10:String
})
var pollsRecords=mongoose.model('pollsSchema',pollsSchema)
var countPollsSchema=mongoose.Schema({
	id: Number,
	option1:Number,option2:Number,option3:Number,option4:Number,option5:Number,
	option6:Number,option7:Number,option8:Number,option9:Number,option10:Number
})
var countPollsRecords=mongoose.model('countPollsSchema',countPollsSchema)

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
//RETURNS LIST OF QUESTIONS
app.get('/getpolls',function (req, res, next) {
	pollsRecords.find({},function(err,results){
		if(err) throw err
		res.send(results)
	})
});
app.get('/getmypolls',function (req, res, next) {
	if(!req.session.twitterID)
		res.redirect('/');
	pollsRecords.find({madeby:req.session.twitterID},function(err,results){
		if(err) throw err
		res.send(results)
	})
});
//RETURNS PARTICULAR QUESTION AND OPTIONS
app.get('/:id([0-9]+)/pollDetail', function (req, res) {
	pollsRecords.find({id:req.params.id},function(err,results){
		if(err) throw err;
		res.send(results[0]);
	})
});
app.get('/:id([0-9]+)/pollValues', function (req, res) {
	countPollsRecords.find({id:req.params.id},function(err,results){
		if(err) throw err;
		res.send(results[0]);
	})
});
app.use(bodyParser.json());
//ADD ENTRY TO DB
app.post('/addquestion',function (req, res) {
	pollsRecords.find().sort('-id').exec(function(err,results){
		if(err) throw err
		if(!!results[0])
			var curid=results[0]["id"]+1
		else
			var curid=1;
		
		var q='{"id":'+curid+',"madeby":'+req.session.twitterID
		for(var i in req.body){
			if(i=="countOptions")
				q+=',"'+i+'":'+req.body[i]
			else
				q+=',"'+i+'":"'+req.body[i]+'"'
		}
		q+='}'
		var record=new pollsRecords(JSON.parse(q))
		record.save(function(err){
			if(err) throw err
		})
		var qi='{"id":'+curid
		for(var i=1;i<11;i++){
			qi+=',"option'+i+'":'+0
		}
		qi+='}'
		var countRecord=new countPollsRecords(JSON.parse(qi))
		countRecord.save(function(err){
			if(err) throw err
			res.send('/'+curid)
			res.end()
		})
	})
});
app.post('/:id([0-9]+)/update', function (req, res) {
	if(req.body.new==1){
		pollsRecords.find({id:req.params.id},function(err,results){
			if(err) throw err;
			var nopt=results[0].countOptions+1;
			var q='{"countOptions":'+nopt+',"option'+nopt+'":"'+req.body.opt+'"}'
			pollsRecords.findOneAndUpdate({id:req.params.id},JSON.parse(q),function(err,results){
				if(err) throw err
			})
			var qi='{"option'+nopt+'":1}'
			countPollsRecords.findOneAndUpdate({id:req.params.id},JSON.parse(qi),function(err,results){
				if(err) throw err
				res.end()
			})
		})
	}
	else{
		countPollsRecords.find({id:req.params.id},function(err,results){
			var ne=results[0]["option"+req.body.opt]+1
			var q='{"option'+req.body.opt+'":'+ne+'}'
			countPollsRecords.findOneAndUpdate({id:req.params.id},JSON.parse(q),function(err,results){
				if(err) throw err
				res.end()
			})
		})
	}
});
app.post('/:id([0-9]+)/delete', function (req, res) {
	pollsRecords.findOneAndRemove({id:req.params.id},function(err,record){
		if(err) throw err
	})
	countPollsRecords.findOneAndRemove({id:req.params.id},function(err,record){
		if(err) throw err
		res.end()
	})
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

//app.set('port', (process.env.PORT || 5000));
var server = app.listen(/*app.get('port')*/process.env.PORT || 5000, function () {
	var host = 'localhost'
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port)
});