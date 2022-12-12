const generateRandomString = require("../utils/generateRandomString");
const generateRandomPassword = require("../utils/generaterandompassword");
const cpanel = require("cpanel-lib");
const btoa = require("btoa");

const user_idpdetailBal=require("../../Bal/user_idpdetails");
const user_idpdetailDal=require("../../Dal/user_idpdetails");
// Get the modules from whmcs-js
const { Clients, Orders, Services, System } = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../config/whmcs");
var mailer=require("../utils/emailsend");
var configEmail=require("../config/emailConfig.json");
// Id for the student product
const studentProductId = process.env.whmcsstudentProductID;
const whmcsstaffProductId = process.env.whmcsstaffProductId;

const studentUtils = require('../utils/student')
const azureConfig=require(process.env.configwithinUpdated);


let studentData = async function () {
    let moduleArr       = {}
    let usersData       = []
    
    let user_sync_count = process.env.USER_SYNC_COUNT;
    //console.log(process.env.USER_SYNC_TIME,'USER_SYNC_TIME')

    //query for the get user detials 
    let queryStr  = "SELECT user_idpdetails.ID, user_idpdetails.email, user_idpdetails.universityid, user_idpdetails.is_synced, user_idpdetails.isStaff, client_details.*, modules_users_assigned.module_id, modules_users_assigned.user_id, module_details.module_code FROM user_idpdetails join client_details on  user_idpdetails.universityid=client_details.universityid join modules_users_assigned on user_id = ID join module_details on module_details.module_id = modules_users_assigned.module_id WHERE is_synced = 0 LIMIT "+user_sync_count;
    let result    = await user_idpdetailDal.runRawQuery(queryStr)
    console.log(result,"<<<<")
    try{
        if(result.length){
            //prepair data for the sync
            await Promise.all(
                result.map( async function(user){
                    
                    if(!moduleArr[user.ID]){
                        moduleArr[user.ID] = []
                        usersData.push(user)
                    }
                      
                    if(moduleArr[user.ID])  
                        moduleArr[user.ID].push(user.module_code)   
                    
                }),
                usersData.map( async function(user){
                    let modules = JSON.stringify(moduleArr[user.ID])
                    
                    await whmcs_sync(user, modules)
                    await user_idpdetailDal.updateSyncStatus(user.ID,function(response){});
                })
            )
            //sent response 
            console.log({status:"success", message:"user synced successfully"})
        }else{
            //sent response 
            console.log({status:"success", message:"nothing to sync"})
        }
        
    }catch( error ){
        console.log({status:"error", message:error })
        
    }
};


async function whmcs_sync(user, modules){
    const parsedModules  = JSON.parse(modules)
    //const parsedModules = JSON.parse(req.body.module)  
    const encodedModules = studentUtils.encodeModules(parsedModules)

    user_idpdetailBal.getUserByEmail(user.email,function (data,err) {
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
                    customfields: encodedModules,
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
                    let productId   = studentProductId
                    if(user.isStaff == 1)
                        productId   = whmcsstaffProductId
                    addOrder
                        .addOrder({
                            clientid: addClientResponse.clientid,
                            // This product id relates to the student service
                            pid: productId,
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
                                                    var url="http://"+process.env.basePath+"/api/user/staffapprov?email="+user.email;
                                                    if(user.isStaff ==1 )
                                                        mailer(url,configEmail.staffApproval)
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
                                                                    //res.status(401).json({error:error});
                                                                });                                                           
                                                            //res.status(200).json({message:"SUCCESS"});
                                                        })
                                                        .catch(function (error) {
                                                            console.log("Error updating client password", error);
                                                            //res.status(401).json({error:error});
                                                        });
                                                })
                                                .catch(function (error) {
                                                    console.log("Error creating module", error);
                                                    //res.status(401).json({error:error});
                                                });
                                        })
                                        .catch(function (error) {
                                            //res.status(401).json({error:error});
                                        });
                                })
                                .catch(function (error) {
                                    //res.status(401).json({error:error});
                                });
                        })
                        .catch(function (error) {
                            //res.status(401).json({error:error});
                        });
                })
                .catch(function (error) {
                    //res.status(401).json({error:error});
                });

            //res.status(200).json({message:"SUCCESS"});
        }

    })

}


module.exports = { studentData };
