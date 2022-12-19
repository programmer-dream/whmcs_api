const express = require("express");
const router = express.Router();
const generateRandomString = require("../../utils/generateRandomString");
const generateRandomPassword = require("../../utils/generaterandompassword");
const cpanel = require("cpanel-lib");
const btoa = require("btoa");

const user_idpdetailBal=require("../../../Bal/user_idpdetails");
const user_idpdetailDal=require("../../../Dal/user_idpdetails");
// Get the modules from whmcs-js
const { Clients, Orders, Services, System } = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

// Id for the student product
const studentProductId = process.env.whmcsstudentProductID;

const studentUtils = require('../../utils/student')
const azureConfig=require(process.env.configwithin);

// @route 	POST api/student/
// @desc 	Example student route
// @access 	Public
router.post("/",ensureAuthenticated, async (req, res) => {
    
    await addUserModule(req.body.ID, req.body.module)
    await user_idpdetailDal.updateLocation(req.body,function(){})
   
    const parsedModules = JSON.parse(req.body.module)  
    //const encodedModules = studentUtils.encodeModules(parsedModules)

    user_idpdetailBal.getUserBySessionId(req.sessionID,function (data,err) {
        if(data.message=="success"){
            // Call the getClients call and store the data in the variable called
            // Password 2 is now a requirement of the WHMCS function - added to create a random password for the user 15/6/22 by NW
            const randompassword = generateRandomPassword();
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
                    // Password 2 is now a requirement of the WHMCS function - added to create a random password for the user 15/6/22 by NW
                    password2: randompassword,
                    // Added to see if this will make it searchable in the admin pages for lecturers (sept 2019)
                    //customfields: encodedModules,
                    phonenumber: data.data[0].dataValues.client_detail.dataValues.Phone,
                    notes: process.env.whmcsaccountnotes,
                    language: process.env.whmcsdefaultlanguage,
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
                    var nameserver1 = process.env.newAccountNameserver1;
                    var nameserver2 = process.env.newAccountNameserver2;
                    addOrder
                        .addOrder({
                            clientid: addClientResponse.clientid,
                            // This product id relates to the student service
                            pid: studentProductId,
                            domain: fulldomain,
                            nameserver1: nameserver1,
                            nameserver2: nameserver2,
                            paymentmethod: process.env.whmcspaymenttype,
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
                                                                host: process.env.webserverhostname,
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
                                                            
                                                            
        // This sends the Hosting account welcome email AFTER the user has signed up
                                                        
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

async function addUserModule(userId, moduleIdsArr){
    moduleIdsArr = JSON.parse(moduleIdsArr)
    if(!Array.isArray(moduleIdsArr)){
        moduleIdsArr = [moduleIdsArr];
    }
    
    if(moduleIdsArr.length > 0 ){
        let moduleStr = moduleIdsArr.join("','");
        let query = "SELECT module_id FROM module_details WHERE module_code IN ('"+moduleStr+"')"
        
        let module_result = await user_idpdetailDal.runRawQuery(query);    
        
        if(module_result.length > 0){
            module_result.map( async function(moduleData){
                await user_idpdetailDal.AddModulesUser(userId, moduleData.module_id)
            })

        }
        
    }
}

// async function updateUserDetail(userId, ){
    
//     if(userId &&  location && period){
        
//         let query = "UPDATE  user_idpdetails SET teaching_block_period_id='"+period+"', user_location_id='"+location+"' where ID='"+userId+"'"
        
//         await user_idpdetailDal.runRawQuery(query);    
        
//     }
// }

router.get("/verify",function (req,res) {
    res.redirect(azureConfig.destroySessionUrl);
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
};
module.exports = router;
