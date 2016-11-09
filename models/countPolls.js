const mongoose = require('mongoose');
var countPollsSchema=mongoose.Schema({
	id: Number,
	option1:Number,option2:Number,option3:Number,option4:Number,option5:Number,
	option6:Number,option7:Number,option8:Number,option9:Number,option10:Number
});
const countPolls=mongoose.model('countPollsSchema',countPollsSchema);
module.exports = countPolls;
