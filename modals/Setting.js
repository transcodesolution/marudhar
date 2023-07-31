const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({ 
    version : {type : String}
})

const Setting = mongoose.model("Setting", settingSchema);

module.exports = {Setting} 
