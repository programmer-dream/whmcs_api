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
const user_idpdetailDal=require("../../../Dal/user_idpdetails");
// Get the modules from whmcs-js
const { Clients, Orders, Services, System } = require("whmcs-js");
var mailer=require("../../utils/emailsend");
// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");
var configEmail=require("../../config/emailConfig.json");
var formidable = require('formidable');
const csv=require('csvtojson')
const student = require("../../cron/cron_code");


// Id for the staff product
const staffProductId = process.env.whmcsstaffProductId;

// @route 	POST api/staff/
// @desc 	Creates the staff member
// @access 	Public

router.post("/",ensureAuthenticated, async (req, res) => {
    // Set the isStaff value in the database to 1
    await user_idpdetailDal.updateLocation(req.body,function(){})
   
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

router.post("/createIndividualUser", async (req, res) => {
    try{
        
        let emailResponse    = await emailExist(1, req.body.email)
        
        if(emailResponse){
            throw { status: 'error', message:'Email already exists.'}
        }
        
        let isLecturer = req.body?.is_lecturer
        let isAdmin = req.body?.is_admin

        if( isLecturer == 'on'){
            isLecturer = 1
        }else{
            isLecturer = 0
        }

        if( isAdmin == 'on'){
            isAdmin = 1
        }else{
            isAdmin = 0
        }
        let upn1        = req.body.email.split("@");
        let userid      = upn1[0].toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');

        let individualUser = {
          email: req.body.email,
          firstname: req.body.first_name,
          lastname: req.body.last_name,
          userid: userid,
          student_id: req.body.student_id,
          sessionid:  generateString(),
          isStaff   : isLecturer,
          is_admin  : isAdmin,
          is_synced : 1,
          expiryDate: new Date(),
          teaching_block_period_id:req.body.teaching_block_period,
          teaching_location:req.body.teaching_location
        }
        
        let createdUser = await user_idpdetailDal.addUserByCsv(individualUser);  
        if(createdUser){
            let moduleIdsArr = req.body.modules
            if(!Array.isArray(moduleIdsArr)){
                moduleIdsArr = [moduleIdsArr];
            }
            let modules = JSON.stringify(moduleIdsArr)
            
            await student.whmcsSync(createdUser, modules)
            await addUserModule(createdUser.ID, req.body.modules)
        }
        
        res.send({status : 'success', message:'User added successfully'})
    }catch(error){
        res.send(error)
    }
})
router.post("/uploadUserCsv", async (req, res) => {
    
    let connection = mysql.createConnection(mysqlConfig);
    let sessionid  = req.session.id;

    await csvData(req, async function(csvData){
        let row_number = 1
        if(csvData.length > 1 )
            delete csvData[0]

            try {
                if(csvData.length == 1)
                    throw {status : 'error', message:'Please add few rows in the csv file.'}

                await Promise.all(
                    csvData.map( async function(user){
                        let emailResponse    = await emailExist(row_number, user.field3)
                        let moduleResponse   = await moduleExist(row_number, user)
                        let teachingLocation = await teachingLocationExist(row_number, user)
                        let blockPeriod      = await blockPeriodExist(row_number, user)
                        let trueFalseCheck   = await onlyTrueFalse(row_number, user)
                        
                        if(emailResponse){
                            throw emailResponse
                        }else if(moduleResponse){
                            throw moduleResponse
                        }else if(teachingLocation){
                            throw teachingLocation
                        }else if(blockPeriod){
                            throw blockPeriod
                        }else if(trueFalseCheck){
                            throw trueFalseCheck
                        }
                        row_number++; 
                    })
                )

                csvData.map( async function(user){
                    let upn1        = user.field3.split("@");
                    let userid      = upn1[0].toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');
                    let userData    =  {
                                        email     : user.field3,
                                        firstname : user.field1,
                                        lastname  : user.field2,
                                        userid    : userid,
                                        student_id: user.field4,
                                        sessionid : generateString(),
                                        isStaff   : user.field5,
                                        is_admin  : user.field6, 
                                        teaching_block_period_id: user.field8,
                                        teaching_location:user.field7
                                      }
                    let createdUser = await user_idpdetailDal.addUserByCsv(userData);
                    
                    if(createdUser){
                        await saveUserModule(createdUser.ID, user)
                    }
                })
                res.send({status : 'success', message:'Csv uploaded successfully' })
            }catch(err) {
                res.send(err)
            }
            
    })
    
});



function generateString(length=15) {
    let characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function csvData(req,callback){
    let form  = new formidable.IncomingForm();
    
    form.parse(req, async function (err, fields, files) {
        const jsonArray= await csv({ noheader:true }).fromFile(files.csv_file.filepath);
        callback(jsonArray)
    })
     
}

async function emailExist(row_number, email){
    
    let queryStr  = "SELECT count(ID) as count FROM user_idpdetails WHERE email='"+email+"'";
    let result = await user_idpdetailDal.runRawQuery(queryStr)
    if(result[0].count){
        return {status : 'error', message:'Email already exist in the system csv row number '+row_number }
    }
    return ''

}


async function moduleExist(row_number, user){
    let modulesArray = []

    if(user.field9 != '')
        modulesArray.push(user.field9)
    if(user.field10 != '')
        modulesArray.push(user.field10)
    if(user.field11 != '')
        modulesArray.push(user.field11)
    if(user.field12 != '')
        modulesArray.push(user.field12)
    if(user.field13 != '')
        modulesArray.push(user.field13)
    if(user.field14 != '')
        modulesArray.push(user.field14)

    if(modulesArray.length > 0 ){
        let moduleStr = modulesArray.join("','");
        let queryStr  = "SELECT count(module_id) as count FROM module_details WHERE module_code IN ('"+moduleStr+"')";
        let result = await user_idpdetailDal.runRawQuery(queryStr)
        if(modulesArray.length != result[0].count){
            return {status : 'error', message:'module not exist in the system csv row number '+row_number }
        }
    }else{
        return {status : 'error', message:'please select atleast one module' }
    }
}

async function teachingLocationExist(row_number, user){
    
    let queryStr  = "SELECT count(teaching_location_id) as count FROM teaching_location_details WHERE teaching_location_id = '"+user.field7+"'";
    let result = await user_idpdetailDal.runRawQuery(queryStr)
    if(result[0].count == 0){
        return {status : 'error', message:'teaching location not exist in the system csv row number '+row_number }
    }
    return ''
}

async function blockPeriodExist(row_number, user,callback){
    
    let queryStr  = "SELECT count(teaching_block_period_id) as count FROM teaching_block_period_description WHERE teaching_block_period_id = '"+user.field8+"'";
    let result = await user_idpdetailDal.runRawQuery(queryStr)
    if(result[0].count == 0){
        return {status : 'error', message:'block period not exist in the system csv row number '+row_number }
    }
    return ''
}

async function onlyTrueFalse(row_number, user,callback){
    
    if(user.field5 != 0 && user.field5 != 1 && user.field6 != 0 && user.field6 != 1){
        return {status : 'error', message:'Is lecturer? or Is admin? field should be 0 or 1 csv row number '+row_number }
    }
    return ''
}

async function saveUserModule(userId, user){
    let connection = mysql.createConnection(mysqlConfig);

    let modulesArray = []

    if(user.field9 != '')
        modulesArray.push(user.field9)
    if(user.field10 != '')
        modulesArray.push(user.field10)
    if(user.field11 != '')
        modulesArray.push(user.field11)
    if(user.field12 != '')
        modulesArray.push(user.field12)
    if(user.field13 != '')
        modulesArray.push(user.field13)
    if(user.field14 != '')
        modulesArray.push(user.field14)

    if(modulesArray.length > 0 ){
        let moduleStr = modulesArray.join("','");
                 
        connection.query(
            "SELECT module_id FROM module_details WHERE module_code IN ('"+moduleStr+"')",
            (err, module_result, fields) => {
                if(module_result.length > 0){
                    module_result.map( async function(moduleData){
                        await user_idpdetailDal.AddModulesUser(userId, moduleData.module_id)
                    })
                }
            }
        );
    }
}

async function addUserModule(userId, moduleIdsArr){
    let connection = mysql.createConnection(mysqlConfig);
    if(!Array.isArray(moduleIdsArr)){
        moduleIdsArr = [moduleIdsArr];
    }
    if(moduleIdsArr.length > 0 ){
        let moduleStr = moduleIdsArr.join("','");
                 
        connection.query(
            "SELECT module_id FROM module_details WHERE module_code IN ('"+moduleStr+"')",
            (err, module_result, fields) => {
                if(module_result.length > 0){
                    module_result.map( async function(moduleData){
                        await user_idpdetailDal.AddModulesUser(userId, moduleData.module_id)
                    })
                }
            }
        );
    }
}

module.exports = router;
