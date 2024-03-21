let mongoose = require("mongoose")
let clientSchema = mongoose.Schema({


firstName:{
    type: String,
    require: true
},
lastName:{
    type:String,
    require: true

},
phoneNumber:{
    type:Number,
    require:true
},
email:{
    type:String,
    require:true

},
appointmentDate:{
    type:String,
    require:true
},
laserName:{
    type:String,
    require:true
},
laserPrice:{
    type:Number,
    require:true

},
laserTime:{
    type:Number,
    require:true

}



});
module.exports= mongoose.model("Client",clientSchema, "clients")