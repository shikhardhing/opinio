const pollsDB = require('../middleware/pollMW');
const countPollsDB = require('../middleware/countPollsMW');
const votersDB=require('../middleware/VoterMW');

//RETURNS LIST OF QUESTIONS
exports.getPolls=(req,res,next) => {
	pollsDB.pollList(function(data){
		res.send(data)
		res.end()
	})
}
//RETURNS PARTICULAR QUESTION AND OPTIONS
exports.pollDetails=(req,res,next) => {
	pollsDB.getPollDetail(req.params.id,function(data){
		res.send(data)
	})
}
exports.myPolls=(req,res,next) => {
	pollsDB.getMyPolls(req.session.twitterID,function(data){
		res.send(data)
	})
}
exports.voted=(req,res,next) => {
	votersDB.votedPoll(req.params.id,req.session.twitterID,function(data){
		console.log(data)
		res.send(data)
	})
}
exports.pollValues=(req,res,next) => {
	countPollsDB.getPollValues(req.params.id,function(data){
		res.send(data)
	})
}
//ADD ENTRY TO DB
exports.addQuestion=(req,res,next) => {
	pollsDB.getCurrentID(function(data){
		console.log(data[0])
		if(!!data[0])
			var curid=data[0]["id"]+1
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
		pollsDB.add(JSON.parse(q))
		var qi='{"id":'+curid
		for(var i=1;i<11;i++){
			qi+=',"option'+i+'":'+0
		}
		qi+='}'
		countPollsDB.add(JSON.parse(qi),curid,function(){
			res.send('/'+curid)
			res.end()
		})
	})
}
exports.update=(req,res,next) => {
	if(req.body.new==1){
		pollDB.getPollDetail(req.params.id,function(results){
			var nopt=results[0].countOptions+1;
			var q='{"countOptions":'+nopt+',"option'+nopt+'":"'+req.body.opt+'"}'
			pollDB.update(req.params.id,JSON.parse(q))
			var qi='{"option'+nopt+'":1}'
			countPollDB.update(req.params.id,JSON.parse(qi))
		})
	}
	else{
		countPollsDB.getPollValues(req.params.id,function(results){
			var ne=results["option"+req.body.opt]+1
			var q='{"option'+req.body.opt+'":'+ne+'}'
			countPollsDB.update(req.params.id,JSON.parse(q))
		})
	}	
	votersDB.add(req.params.id,req.session.twitterID)
	res.end()
}
exports.delete=(req,res,next) => {
	pollsDB.delete(req.params.id)
	countPollsDB.delete(req.params.id)
	votersDB.delete(req.params.id)
	res.end()
}
