const countPollsRecords=require('../models/countPolls');

exports.getPollValues=(pollID,callback)=>{
	countPollsRecords.find({id:pollID},function(err,results){
		if(err) throw err
		callback(results[0])
	});
}
exports.add=(qi,curid,callback)=>{
	var countRecord=new countPollsRecords(qi)
	countRecord.save(function(err){
		if(err) throw err
		callback(curid)
	})
}
exports.update=(pollID,json)=>{
	countPollsRecords.findOneAndUpdate({id:pollID},json,function(err,results){
		if(err) throw err
	})
}
exports.delete=(pollID)=>{
	countPollsRecords.findOneAndRemove({id:pollID},function(err,record){
		if(err) throw err
	})
}