let mongoose = require("mongoose")
let laserSchema = mongoose.Schema({


laserName:{
    type:String,
    required:true
},
laserPrice:{
    type:Number,
    required:true

},
laserTime:{
    type:Number,
    required:true

}

});
module.exports= mongoose.model("Laser",laserSchema, "lasers")