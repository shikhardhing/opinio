const pollsRecords=require('../models/Polls');
exports.pollList=(callback)=>{
	pollsRecords.find({},function(err,results){
		if(err) throw err
		callback(results)
	})
}
exports.getPollDetail=(pollID,callback)=>{
	pollsRecords.find({id:pollID},function(err,results){
		if(err) throw err
		callback(results[0])
	});
}
exports.getMyPolls=(twitterID,callback)=>{
	pollsRecords.find({madeby:twitterID},function(err,results){
		if(err) throw err
		callback(results[0])
	});
}
exports.getCurrentID=(callback)=>{
	pollsRecords.find().sort('-id').exec(function(err,results){
		if(err) throw err
		callback(results)		
	})
}
exports.add=(json)=>{
	var record=new pollsRecords(json)
	record.save(function(err){
		if(err) throw err
	})
}
exports.update=(pollID,json)=>{
	pollsRecords.findOneAndUpdate({id:pollID},json,function(err,results){
		if(err) throw err
	})
}
exports.delete=(pollID)=>{
	pollsRecords.findOneAndRemove({id:pollID},function(err,record){
		if(err) throw err
	})
}