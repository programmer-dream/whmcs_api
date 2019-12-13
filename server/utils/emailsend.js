var nodemailer = require('nodemailer');
var config=require("../config/emailConfig.json");
var emailer=function (body,email) {
    var transport = nodemailer.createTransport({
         //service: 'gmail',
         host: "educationhost.co.uk",
         port: 465,
         secure: true, 
        auth: {
            user: config.authUser, 
            pass: config.authPassword 
        }
    });

    var mailOptions = {
        from: config.authUser,
        //to: email,
        to: config.staffApproval,
        subject: 'Account verification',
        text: body
    };
    transport.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports=emailer;