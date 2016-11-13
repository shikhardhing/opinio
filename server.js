var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

const pollController = require('./controllers/poll');
const userController = require('./controllers/user');

var url= 'mongodb://opinio:password@ds153845.mlab.com:53845/opinio';
//var url= 'mongodb://localhost:27017/opinio';
mongoose.connect(url);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected");
});
//app configurations
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

app.get('/login',userController.login)
app.get('/callback',userController.callback)
app.get('/getcookie',userController.getCookie)
app.get('/logout',userController.logout)

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
