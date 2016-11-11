const votersRecords=require('../models/Voters');
exports.votedPoll=(pollID,twitterID,callback)=>{
	votersRecords.find({pollID:pollID,voterID:twitterID},function(err,results){
		if(err) throw err
		var data=results
		callback(data)
	})
}
exports.add=(pollID,twitterID)=>{
	var voted=new votersRecords({pollID:pollID,voterID:twitterID})
	voted.save(function(err){
		if(err) throw err
	})
}
exports.delete=(pollID)=>{
	votersRecords.findOneAndRemove({id:pollID},function(err,record){
		if(err) throw err
	})
}
