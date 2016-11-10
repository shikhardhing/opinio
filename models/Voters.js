const mongoose = require('mongoose');

var votersSchema=mongoose.Schema({
	pollID: Number,
	voterID:Number
});
const Voters=mongoose.model('votersSchema',votersSchema);
module.exports = Voters;
