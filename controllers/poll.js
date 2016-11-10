const pollsRecords = require('../models/Polls');
const countPollsRecords = require('../models/countPolls');
const votersRecords=require('../models/Voters');

//RETURNS LIST OF QUESTIONS
exports.getPolls=(req,res,next) => {
	pollsRecords.find({},function(err,results){
		if(err) throw err;
		console.log(results);
		res.send(results);
		res.end();
	})
}
//RETURNS PARTICULAR QUESTION AND OPTIONS
exports.pollDetails=(req,res,next) => {
	pollsRecords.find({id:req.params.id},function(err,results){
		if(err) throw err;
		res.send(results[0]);
	});
}
exports.getMyPolls=(req,res,next) => {
	//res.end();
	//res.send(pollsSchema.returnAllPolls(req.session.twitterID));
	pollsRecords.find({madeby:req.session.twitterID},function(err,results){
		if(err) throw err;
		console.log(results[0]);
		res.send(results[0]);
	});
}
exports.voted=(req,res,next) => {
	votersRecords.find({pollID:req.params.id,voterID:req.session.twitterID},function(err,results){
		if(err) throw err;
		res.send(results);
	})
}
exports.pollValues=(req,res,next) => {
	countPollsRecords.find({id:req.params.id},function(err,results){
		if(err) throw err;
		res.send(results[0]);
	})
}
//ADD ENTRY TO DB
exports.addQuestion=(req,res,next) => {
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
}
exports.update=(req,res,next) => {
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
	var voted=new votersRecords({pollID:req.params.id,voterID:req.session.twitterID})
	voted.save(function(err){
		if(err) throw err
		res.end()
	})
}
exports.delete=(req,res,next) => {
	pollsRecords.findOneAndRemove({id:req.params.id},function(err,record){
		if(err) throw err
	})
	countPollsRecords.findOneAndRemove({id:req.params.id},function(err,record){
		if(err) throw err
	})
	votersRecords.findOneAndRemove({id:req.params.id},function(err,record){
		if(err) throw err
		res.end()
	})
}
