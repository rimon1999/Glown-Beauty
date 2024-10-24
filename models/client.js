let mongoose = require("mongoose");

let clientSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true // Fixed 'require' to 'required'
  },
  lastName: {
    type: String,
    required: true // Fixed 'require' to 'required'
  },
  phoneNumber: {
    type: Number,
    required: true // Fixed 'require' to 'required'
  },
  email: {
    type: String,
    required: true // Fixed 'require' to 'required'
  },
  appointmentDate: {
    type: String,
    required: true // Fixed 'require' to 'required'
  },
  laserName: {
    type: String,
    required: true // Fixed 'require' to 'required'
  },
  laserPrice: {
    type: Number,
    required: true // Fixed 'require' to 'required'
  },
  laserTime: {
    type: Number,
    required: true // Fixed 'require' to 'required'
  },
  additionalServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Laser'
}]
});

module.exports = mongoose.model("Client", clientSchema, "clients");
