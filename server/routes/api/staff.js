const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");
const sha1 = require("sha1");
const autoAuthKey = require("../../config/autoAuth");
const whmcsLoginUrl = require("../../config/whmcs").loginUrl;
var headers= {authorization: process.env.WHMHeader };
var axios = require("axios");
// Import utility functions
const generateRandomString = require("../../utils/generateRandomString");
const generateRandomPassword = require("../../utils/generaterandompassword");
const getTimestamp = require("../../utils/getTimestamp");
const user_idpdetailBal=require("../../../Bal/user_idpdetails");
// Get the modules from whmcs-js
const { Clients, Orders, Services, System } = require("whmcs-js");
var mailer=require("../../utils/emailsend");
// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");
var configEmail=require("../../config/emailConfig.json");
// Id for the staff product
const staffProductId = process.env.whmcsstaffProductId;

// @route 	POST api/staff/
// @desc 	Creates the staff member
// @access 	Public

router.post("/",ensureAuthenticated, (req, res) => {
    // Set the isStaff value in the database to 1

    const staffnumber = 1;
    user_idpdetailBal.getUserBySessionId(req.sessionID,function (data,err) {
        if(data.message=="success"){
            user_idpdetailBal.updateStaf({email:data.data[0].dataValues.email,staffnumber:staffnumber},function (data1,err1) {
                if(data1.message=="success"){
                        // Set the staff user up on WHMCS - this account will require manual approval
                        // The thing that will change here is that there will be a different product ID and it will require approval by admin user
                    // Password 2 is now a requirement of the WHMCS function - added to create a random password for the user 15/6/22 by NW
                    const randomstaffpassword = generateRandomPassword();
                    const addClient = new Clients(whmcsConfig);
                    var a=data.data[0].dataValues.client_detail.dataValues.Address1
                    addClient
                        .addClient({
                            firstname: data.data[0].dataValues.firstname,
                            lastname: data.data[0].dataValues.lastname,
                            email: data.data[0].dataValues.email,
                            address1: data.data[0].dataValues.client_detail.dataValues.Address1,
                            address2: data.data[0].dataValues.client_detail.dataValues.Address2,
                            city: data.data[0].dataValues.client_detail.dataValues.City,
                            state: data.data[0].dataValues.client_detail.dataValues.State,
                            postcode: data.data[0].dataValues.client_detail.dataValues.Postcode,
                            country: data.data[0].dataValues.client_detail.dataValues.Country,
                            // Password 2 is now a requirement of the WHMCS function - added to create a random password for the user 15/6/22 by NW
                            password2: randomstaffpassword,
                            phonenumber: data.data[0].dataValues.client_detail.dataValues.Phone,
                            notes: process.env.whmcsaccountnotes,
                            language: process.env.whmcsdefaultlanguage,
                            skipvalidation: true
                        })  .then(function(addClientResponse) {
                        /* RETURNS
                                  {
                                      result: 'success',
                                      clientid: 72
                                  }
                              */
                        console.log(addClientResponse);
                        var fulldomain = data.data[0].dataValues.userid+"."+data.data[0].client_detail.dataValues.domainname;
                        //var nameserver1 = 'ns1.' + data.data[0].client_detail.dataValues.domainname;
                        //var nameserver2 = 'ns2.' + data.data[0].client_detail.dataValues.domainname;
                        var nameserver1 = process.env.newAccountNameserver1;
                        var nameserver2 = process.env.newAccountNameserver2;

                        // Once the user is added in WHMCS, then add the service
                        const addOrder = new Orders(whmcsConfig);
                        addOrder.addOrder({
                                clientid: addClientResponse.clientid,
                                // This product id relates to the staff service
                                pid: staffProductId,
                                domain: fulldomain,
                                nameserver1: nameserver1,
                                nameserver2: nameserver2,
                                paymentmethod: process.env.whmcspaymenttype,
                                noemail: true,
                                noinvoice: true,
                                noinvoiceemail: true
                            }).then(function(addOrderResponse) {
                                /* RETURNS
                                              {
                                                  result: 'success',
                                                  orderid: 47,
                                                  productids: '43',
                                                  addonids: '',
                                                  domainids: ''
                                              }
                                          */

                                console.log(addOrderResponse);
                                // Once the service is added approve the service automatically
                                const acceptOrder = new Orders(whmcsConfig);
                                acceptOrder
                                    .acceptOrder({
                                        orderid: addOrderResponse.orderid,
                                        acceptOrder: 1,
                                        sendemail: 0
                                    }).then(function(acceptOrder) {
                                        /* RETURNS
                                                          {
                                                              result: 'success'
                                                          }
                                                      */

                                        console.log(acceptOrder);
                                        // Usernames can be tricky, and because there could be two people with the same name, we need to create a new service username
                                        // This will be a random string with the mat.random function
                                        const updateClientProduct = new Services(whmcsConfig);
                                        const randomstring = generateRandomString();
                                        console.log(randomstring);
                                        updateClientProduct.updateClientProduct({
                                                serviceid: addOrderResponse.productids,
                                                serviceusername: randomstring
                                            }).then(function(updateClientProductResponse) {
                                                /* RETURNS
                                                                        sonsfa9
                                                                        {
                                                                          result: 'success',
                                                                          serviceid: '34'
                                                                      }
                                                                    */

                                                console.log(updateClientProductResponse);
                                                // create the accepted order
                                                const moduleCreate = new Services(whmcsConfig);
                                                moduleCreate.moduleCreate({
                                                        serviceid: updateClientProductResponse.serviceid
                                                    }).then(function(moduleCreateResponse) {
                                                     var url="http://"+req.headers.host+"/api/user/staffapprov?email="+req.user.upn;

                                                    mailer(url,configEmail.staffApproval)
                                                    
                                                                                                        // This section sends the New Account Information Email at the correct time after account setup
                                        
                                        const sendEmail = new System(whmcsConfig);                    
                                                   sendEmail.sendEmail({
                                                                action: "SendEmail",
                                                                messagename: 'Hosting Account Welcome Email',
                                                                id: addOrderResponse.productids
                                                            }).then(function (sendEmailresponse) {


                                                    console.log(
                                                        "Email Sending response",
                                                        sendEmailresponse
                                                    );



                                                            })

                                                                .catch(function (error) {
                                                                    console.log("Error sending email", error);
                                                                    res.status(401).json({error:error});
                                                                });          
                                        
                                        // End of Hosting account email sender
                                                        //res.status(200).json({message:"SUCCESS"});
                                                    }).catch(function(error) {
                                                        res.status(401).json({error:error});
                                                    });
                                            })
                                            .catch(function(error) {
                                                res.status(401).json({error:error});
                                            });
                                    })
                                    .catch(function(error) {
                                        res.status(401).json({error:error});
                                    });
                            })
                            .catch(function(error) {
                                res.status(401).json({error:error});
                            });
                    })
                        .catch(function(error) {
                            res.status(401).json({error:error});
                        });
                }else{
                    res.status(401).json({error:error});
                }
            })

            res.status(200).json({message:"SUCCESS"});
        }else{
            res.status(401).json({error:error});
        }
    })

});

// @route 	POST api/staff/login
// @desc 	Redirect and log the staff member into whmcs
// @access 	Public
router.post("/login", (req, res) => {
    // get the timestamp for WHMCS url
    var timestamp = getTimestamp();

    // get the email address that is returned from the IDP
    console.log(req.body);
    var urlemail = req.body.email;

    // URL to where the user is to go once logged into WHMCS
    var goto = "clientarea.php";

    // Auto auth key, this needs to match what is setup in the WHMCS config file (see https://docs.whmcs.com/AutoAuth)
    // add the three variables together that are required for the WHMCS hash
    var hashedstrings = urlemail + timestamp + autoAuthKey;

    // use the sha1 node module to hash the variable
    var hash = sha1(hashedstrings);

    // Send the URL back to the frontend
    res.send({
        message: "Logged in successfully",
        data: {
            redirectTo:
            whmcsLoginUrl +
            "?email=" +
            urlemail +
            "&timestamp=" +
            timestamp +
            "&hash=" +
            hash +
            "&goto=" +
            goto
        }
    });
});
router.get("/opencpanel/:id?",function (req,res) {
    var query=process.env.whmopencpanel+req.params.id+'&service=cpaneld';

    axios.get(query,{headers:headers}).then(function (body) {
        if(body.data.data){
            res.redirect(body.data.data.url)
        }else {
            res.send(body.data.metadata.reason)
        }

    }).catch(function (err) {
        res.send(err.message);
    })

})


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};
module.exports = router;
