var twitterAPI = require('node-twitter-api');
var twitter
exports.login=(req,res,next) => {
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
}
exports.callback=(req,res,next) =>{
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
}
exports.getCookie=(req,res,next) =>{
	res.send(req.session);
}
exports.logout=(req,res,next) =>{
	req.session.regenerate(function(e){
		if (e) throw e;
		res.redirect('/');
	});
}