const { Setting } = require("../../modals/setting");
const ObjectId = require('mongoose').Types.ObjectId


const add_edit_setting = async(req, res) =>{
    let body = req.body
    try{
        
            const setting = await Setting.findOneAndUpdate({},body, {new : true});
            if (!setting) return await new Setting(body).save()
            
            return res.status(200).json("Setting successfully added!")
        
    }catch(error){
        console.log(error);
        return res.status(500).json("Internal Server Error!");
    }
}

module.exports = add_edit_setting