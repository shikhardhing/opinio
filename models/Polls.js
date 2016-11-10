const mongoose = require('mongoose');

var pollsSchema=mongoose.Schema({
	id: Number,
	madeby:String,
	countOptions:Number,
	question:String,
	option1:String,option2:String,option3:String,option4:String,option5:String,
	option6:String,option7:String,option8:String,option9:String,option10:String
});
const Polls=mongoose.model('pollsSchema',pollsSchema);



module.exports = Polls;
