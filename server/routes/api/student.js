const express = require("express");
const router = express.Router();
const generateRandomString = require("../../utils/generateRandomString");
const cpanel = require("cpanel-lib");
const btoa = require("btoa");

const user_idpdetailBal=require("../../../Bal/user_idpdetails");
// Get the modules from whmcs-js
const { Clients, Orders, Services, System } = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

// Id for the student product
const studentProductId = 1;

const studentUtils = require('../../utils/student')
const azureConfig=require("../../config/config.live");

// @route 	POST api/student/
// @desc 	Example student route
// @access 	Public
router.post("/",ensureAuthenticated, (req, res) => {
    const parsedModules = JSON.parse(req.body.module)
    const encodedModules = studentUtils.encodeModules(parsedModules)

    user_idpdetailBal.getUserBySessionId(req.sessionID,function (data,err) {
        if(data.message=="success"){
            // Call the getClients call and store the data in the variable called
            const addClient = new Clients(whmcsConfig);
            addClient.addClient({
                    firstname: data.data[0].dataValues.firstname,
                    lastname: data.data[0].dataValues.lastname,
                    email: data.data[0].dataValues.email,
                    address1: data.data[0].dataValues.client_detail.dataValues.Address1,
                    address2: data.data[0].dataValues.client_detail.dataValues.Address2,
                    city: data.data[0].dataValues.client_detail.dataValues.City,
                    state: data.data[0].dataValues.client_detail.dataValues.State,
                    postcode: data.data[0].dataValues.client_detail.dataValues.Postcode,
                    country: data.data[0].dataValues.client_detail.dataValues.Country,
                    // Added to see if this will make it searchable in the admin pages for lecturers (sept 2019)
                    customfields: encodedModules,
                    phonenumber: data.data[0].dataValues.client_detail.dataValues.Phone,
                    notes: "Created through Education Host AD login",
                    language: "english",
                    skipvalidation: true
                })
                .then(function (addClientResponse) {
                    /* RETURNS
                              {
                                  result: 'success',
                                  clientid: 72
                              }
                          */

                    console.log(addClientResponse);

                    // Once the user is added in WHMCS, then add the service
                    const addOrder = new Orders(whmcsConfig);
                    var fulldomain = data.data[0].dataValues.userid+"."+data.data[0].client_detail.dataValues.domainname;
                    //var nameserver1 = 'ns1.' + data.data[0].client_detail.dataValues.domainname;
                    //var nameserver2 = 'ns2.' + data.data[0].client_detail.dataValues.domainname;
                    var nameserver1 = "ns1.demo.educationhost.co.uk";
                    var nameserver2 = "ns2.demo.educationhost.co.uk";
                    addOrder
                        .addOrder({
                            clientid: addClientResponse.clientid,
                            // This product id relates to the student service
                            pid: studentProductId,
                            domain: fulldomain,
                            nameserver1: nameserver1,
                            nameserver2: nameserver2,
                            paymentmethod: "banktransfer",
                            noemail: true,
                            noinvoice: true,
                            noinvoiceemail: true
                        })
                        .then(function (addOrderResponse) {
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
                                })

                                .then(function (acceptOrder) {
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

                                    updateClientProduct
                                        .updateClientProduct({
                                            serviceid: addOrderResponse.productids,
                                            serviceusername: randomstring
                                        })
                                        .then(function (updateClientProductResponse) {
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
                                            moduleCreate
                                                .moduleCreate({
                                                    serviceid: updateClientProductResponse.serviceid
                                                })
                                                .then(function (moduleCreateResponse) {
                                                    console.log(
                                                        "Module creation response",
                                                        moduleCreateResponse
                                                    );

                                                    ////////////////////////////////////////////////////////
                                                    // There needs to be a password change here to a random charater password
                                                    // This is to authenticate the user so that folders can be created
                                                    ////////////////////////////////////////////////////////

                                                    // update client password so that we can connect to the cpanel API
                                                    const updateClientPassword = new Services(whmcsConfig);
                                                    const newuserpassword =
                                                        Math.random()
                                                            .toString(36)
                                                            .slice(2) +
                                                        Math.random()
                                                            .toString(36)
                                                            .slice(2);

                                                    updateClientPassword
                                                        .moduleChangePw({
                                                            serviceid: updateClientProductResponse.serviceid,
                                                            servicepassword: newuserpassword
                                                        })
                                                        .then(function (updateClientPasswordResponse) {
                                                            console.log(
                                                                "Password update response",
                                                                updateClientPasswordResponse
                                                            );
                                                            // Set the cPanel variables for connection

                                                            ////////////////////////////////////////////////////////
                                                            // The password below should be the password that has been changed above and passed into the options
                                                            ////////////////////////////////////////////////////////
                                                            console.log(updateClientPasswordResponse);

                                                            var cpoptions = {
                                                                host: "demowhserver.educationhost.co.uk",
                                                                // EH Live host
                                                                //host: 'benu.zjnucomputing.com',
                                                                port: 2083,
                                                                secure: true,
                                                                // The username is driven from the random username created when creating the service
                                                                username: randomstring,
                                                                // USE the newly generated password
                                                                password: newuserpassword,
                                                                ignoreCertError: true
                                                            };

                                                            ////////////////////////////////////////////////////////
                                                            //Setup the folders/////////////////////////////////////
                                                            ////////////////////////////////////////////////////////

                                                            var cpanelClient = cpanel.createClient(cpoptions);
                                                            var count = 0;

                                                            console.log(
                                                                "studentModules count",
                                                                parsedModules.length
                                                            );

                                                            do {
                                                                var smodules = parsedModules[count];

                                                                console.log(
                                                                    "DO while ran, Number of modules: ",
                                                                    smodules
                                                                );

                                                                cpanelClient.callApi2(
                                                                    "Fileman",
                                                                    "mkdir",
                                                                    {
                                                                        path: "/home/" + randomstring + "/public_html/",
                                                                        name: smodules,
                                                                        permissions: "755"
                                                                    },
                                                                    function (err, res) {
                                                                        if (err) {
                                                                            console.log(
                                                                                `error creating cPanel folfder, on do-while iteration number ${count}`,
                                                                                err
                                                                            );
                                                                        } else {
                                                                            console.log("Result: %j", res);
                                                                        }
                                                                    }
                                                                );
                                                                count++;
                                                            } while (count != parsedModules.length);
<<<<<<< Updated upstream
                                                        
                                                        // This sends the Hosting account welcome email AFTER the user has signed up
=======
                                                            
                                                            
        // This sends the Hosting account welcome email AFTER the user has signed up
>>>>>>> Stashed changes
                                                        
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
<<<<<<< Updated upstream
                                                                });      
                                                        
=======
                                                                });                                                           
>>>>>>> Stashed changes
                                                            //res.status(200).json({message:"SUCCESS"});
                                                        })
                                                        .catch(function (error) {
                                                            console.log("Error updating client password", error);
                                                            res.status(401).json({error:error});
                                                        });
                                                })
                                                .catch(function (error) {
                                                    console.log("Error creating module", error);
                                                    res.status(401).json({error:error});
                                                });
                                        })
                                        .catch(function (error) {
                                            res.status(401).json({error:error});
                                        });
                                })
                                .catch(function (error) {
                                    res.status(401).json({error:error});
                                });
                        })
                        .catch(function (error) {
                            res.status(401).json({error:error});
                        });
                })
                .catch(function (error) {
                    res.status(401).json({error:error});
                });

            res.status(200).json({message:"SUCCESS"});
        }

    })

});

router.get("/verify",function (req,res) {
    res.redirect(azureConfig.destroySessionUrl);
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};
module.exports = router;
