const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");
const sha1 = require("sha1");
const autoAuthKey = require("../../config/autoAuth");
const whmcsLoginUrl = require("../../config/whmcs").loginUrl;
const whmcsmysqlConfig = require("../../config/whmcsinstallationsql");
var headers= {authorization: process.env.WHMHeader };
var axios = require("axios");
var fs = require('fs');
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
const cpanel = require("cpanel-lib");
const student = require("../../cron/cron_code");

// Id for the staff product
const staffProductId = process.env.whmcsstaffProductId;

// @route 	POST api/staff/
// @desc 	Creates the staff member
// @access 	Public

router.post("/",ensureAuthenticated, async (req, res) => {
    await addUserModules(req.body.ID, req.body.module)
    
    await user_idpdetailDal.updateLocation(req.body,function(){})
    const parsedModules = JSON.parse(req.body.module)
    
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
                                                                "modules count",
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
                                                        })
                                                            //module created 
                                                            //end module creation

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
router.post("/login", async (req, res) => {
    let connection = mysql.createConnection(whmcsmysqlConfig);
    
    let urlemail    = req.body.email;
    let clientQuery = "SELECT id FROM tblclients WHERE email='"+urlemail+"'"
    let clientData  = await getWhmcsData(connection, clientQuery)
    let client_id   = ''
    
    if(clientData.length){
        client_id = clientData[0].id
        let whmcsParams = { action:"CreateSsoToken", 
                            username:process.env.whmcsidentifier, 
                            password:process.env.whmcssecret, 
                            client_id:client_id,
                            responsetype:"json"
                        }
        //console.log(whmcsParams, "<< whmcsParams")
        let response = await axios.post('https://whmcs.educationhost.co.uk/includes/api.php', whmcsParams,{
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Credentials':'true',
                      'Access-Control-Allow-Headers':'content-type'
                    }});

        res.send({
            message: "Logged in successfully",
            data: {
                redirectTo: response.data.redirect_url 
            }
        });

    }else{
        res.send({
            message: "Logged in successfully",
            data: {
                redirectTo: '' 
            }
        });
    }
    
    
});
router.post("/createIntake", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        console.log(fields.intake_start_date);
        let intake_start_date = fields.intake_start_date;
        let intake_end_date = fields.intake_end_date;
        intake_start_date.replace('T', ' ');
        intake_end_date.replace('T', ' ');
        var intakedata = {'teaching_block_period_description':fields.teaching_block_period_description,'intake_start_date':intake_start_date.replace('T', ' '),'intake_end_date':intake_end_date.replace('T', ' ')}
        response = await user_idpdetailDal.createIntake(intakedata);
        res.send({status : 'success', message:'Intake saved successfully' })
    })
    
  });


router.post("/createBlock", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        
        let tb_start_date_time = fields.tb_start_date_time;
        let tb_end_date_time   = fields.tb_end_date_time;
        let course_id=fields.course_id;
        var blockData = {
                        'name':fields.name,
                        'tb_start_date_time':tb_start_date_time.replace('T', ' '),
                        'tb_end_date_time':tb_end_date_time.replace('T', ' ')
                    }
        //console.log(blockData, "<< blockData")
        response = await user_idpdetailDal.createBlock(blockData);
        var teaching_block_id=response.teaching_block_id;
        var courseData={
            'course_id':course_id,
            'teaching_block_id':teaching_block_id
        };
        
        await user_idpdetailDal.assignedCourseBlock(courseData);
        res.send({status : 'success', message:'Block saved successfully' })
    })
    
});

router.post("/editBlock", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        let id                 = fields.id;
        let tb_start_date_time = fields.tb_start_date_time;
        let tb_end_date_time   = fields.tb_end_date_time;
        
        var blockData = {
                        'name':fields.name,
                        'tb_start_date_time':tb_start_date_time.replace('T', ' '),
                        'tb_end_date_time':tb_end_date_time.replace('T', ' ')
                    }
        //console.log(blockData, "<< blockData")
        response = await user_idpdetailDal.editBlock(id, blockData);
        res.send({status : 'success', message:'Block saved successfully' })
    })
    
});

router.post("/createCourse", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        let course_id = fields.course_id
        if(course_id){
            
            if(fields.teaching_location == 'all' || fields.teaching_location.includes("all")){
                await user_idpdetailDal.addCourseOnlocation(course_id);
            }else{
                let teaching_location_id = fields.teaching_location.split(",");
                    teaching_location_id.forEach(async function(item, index) {

                await user_idpdetailDal.createCourselocation({'teaching_location_id':item, 'course_id':course_id})
                });
            }
            
            res.send({status : 'success', message:'Course assigned successfully' })
            
        }
    })
    
});
router.post("/editCourseLocation", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        let course_id = fields.course_id
        if(course_id){
            
            let queryStr  = "DELETE FROM `course_location` WHERE course_id='"+course_id+"'";

            let result = await user_idpdetailDal.deleteRawQuery(queryStr)
            if(fields.teaching_location == 'all' || fields.teaching_location.includes("all")){
                await user_idpdetailDal.addCourseOnlocation(course_id);
            }else{
                let teaching_location_id = fields.teaching_location.split(",");
                    teaching_location_id.forEach(async function(item, index) {

                await user_idpdetailDal.createCourselocation({'teaching_location_id':item, 'course_id':course_id})
                });
            }
            
            res.send({status : 'success', message:'Course assigned successfully' })
            
        }
    })
    
});

router.post("/addCourse", async (req, res) => {
    let course_name = req.body.course_name

    await user_idpdetailDal.createCourse({course_name:course_name})
      
    res.send({status : 'success', message:'Course created successfully' })
            
  });

  router.post("/updateIntake", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        var intakedata = {'intake_id':fields.intake_id,'teaching_block_period_description':fields.teaching_block_period_description,'intake_start_date':fields.intake_start_date.replace('T', ' '),'intake_end_date':fields.intake_end_date.replace('T', ' ')}
        response = await user_idpdetailDal.updateIntake(intakedata);
        res.send({status : 'success', message:'Intake update successfully' })
    })
  });
  router.get("/deleteIntake/:id", async (req, res) => {
    let id = req.params.id
    let allModulesDates = await user_idpdetailDal.deleteIntakedata(id)
    res.send({status : 'success'})
  });

  router.get("/deleteBlock/:id", async (req, res) => {
    let id = req.params.id
    await user_idpdetailDal.deleteBlock(id)
    res.send({status : 'success'})
  });

  router.get("/getintakedata/:id", async (req, res) => {
    let id = req.params.id
    
    let allModulesDates = await user_idpdetailDal.getIntake(id)
    res.send({status : 'success', message:'Module data', data: allModulesDates})
  });
  router.get("/getblockdata/:id", async (req, res) => {
    let id = req.params.id
    
    let allBlocks = await user_idpdetailDal.getBlock(id)
    res.send({status : 'success', message:'Block data', data: allBlocks})
  });
  router.get("/getCourseLocation/:id", async (req, res) => {
    let id = req.params.id
    
    let allCourseLocations = await user_idpdetailDal.getCourseWithLocation(id)
    res.send({status : 'success', message:'course location', data: allCourseLocations })
  });

router.get("/login/:email", async (req, res) => {
    let connection = mysql.createConnection(whmcsmysqlConfig);
    
    let urlemail    = req.params.email;
    let clientQuery = "SELECT id FROM tblclients WHERE email='"+urlemail+"'"
    let clientData  = await getWhmcsData(connection, clientQuery)
    let client_id   = ''
    
    if(clientData.length){
        client_id = clientData[0].id
        let whmcsParams = { action:"CreateSsoToken", 
                            username:process.env.whmcsidentifier, 
                            password:process.env.whmcssecret, 
                            client_id:client_id,
                            responsetype:"json"
                        }
        //console.log(whmcsParams, "<< whmcsParams")
        let response = await axios.post('https://whmcs.educationhost.co.uk/includes/api.php', whmcsParams,{
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Credentials':'true',
                      'Access-Control-Allow-Headers':'content-type'
                    }});
        res.redirect(response.data.redirect_url)
        
    }
    
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
        let student_id = null 

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
        if(req.body.student_id)
            student_id = req.body.student_id

        let upn1        = req.body.email.split("@");
        let userid      = upn1[0].toLowerCase().replace(/[\*\^\'\!\.]/g, '').split(' ').join('-');

        let individualUser = {
          email: req.body.email,
          firstname: req.body.first_name,
          lastname: req.body.last_name,
          userid: userid,
          student_id: student_id,
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
        let settingEnabled = await user_idpdetailDal.listEnablevalue()
        
        let row_number = 1
        if(csvData.length > 1 )
            delete csvData[0]

            try {
                if(csvData.length == 1)
                    throw {status : 'error', message:'Please add few rows in the csv file.'}

                await Promise.all(
                    csvData.map( async function(user){
                        let emailResponse    = await emailExist(row_number, user.field3)
                        let moduleResponse   = {}

                        if(settingEnabled.module_courses_enabled){
                            
                            moduleResponse     = await moduleExistWithCourse(row_number, user)
                            let courseLocation = await iscourseExistOnLocation(row_number, user) 
                            
                            if(courseLocation){
                                throw courseLocation
                            }
                        }else{
                            moduleResponse   = await moduleExist(row_number, user)
                        }

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
                        if(settingEnabled.module_courses_enabled){
                            await saveUserCourseModule(createdUser.ID, user)
                        }else{
                            await saveUserModule(createdUser.ID, user)
                        }
                    }
                })
                res.send({status : 'success', message:'Csv uploaded successfully' })
            }catch(err) {
                res.send(err)
            }
            
    })
    
});

router.post("/createLocation", async (req, res) => {
    let form  = new formidable.IncomingForm();

    form.parse(req, async function (err, fields, files) {
        let ipAddress = {
            ip_address_v4 : fields.ipv4,
            ip_address_v6 : fields.ipv6
        }
        let createdIps = await user_idpdetailDal.createIpAddress(ipAddress)
        if(createdIps){
            fields.ip_address_id = createdIps.ip_address_id;
            if(files.image){
                let img = fs.readFileSync(files.image.filepath);
                fields.image=new Buffer(img).toString('base64');
            }
            let response = await user_idpdetailDal.createLocation(fields)
        }
        
    })
    res.send({status : 'success', message:'Location saved successfully' })
});

router.post("/updateLocation", async (req, res) => {
    let form  = new formidable.IncomingForm();

    form.parse(req, async function (err, fields, files) {
        let ipAddress = {
            ip_address_v4 : fields.ipv4,
            ip_address_v6 : fields.ipv6
        }
        let createdIps = await user_idpdetailDal.updateIpAddress(fields.ip_address_id, ipAddress)
        if(createdIps){
            fields.ip_address_id = createdIps.ip_address_id;
            if(files.image){
                let img = fs.readFileSync(files.image.filepath);
                fields.image=new Buffer(img).toString('base64');
            }
            let response = await user_idpdetailDal.updateLocationNew(fields.id, fields)
        }
        
    })
    res.send({status : 'success', message:'Location saved successfully' })
});

router.post("/inActiveLocation", async (req, res) => {
    let id = req.body.id
    
    let response = await user_idpdetailDal.inActiveLocation(id,function(data){})
    
    res.send({status : 'success', message:'Location data' })
});

router.get("/getLocation/:id", async (req, res) => {
    let id = req.params.id
    
    let location = await user_idpdetailDal.getLocation(id)
    
    res.send({status : 'success', message:'Location data', data: location})
});
router.get("/getmoduledata/:id", async (req, res) => {
    let id = req.params.id
    
    let allModulesDates = await user_idpdetailDal.getModule(id)
    res.send({status : 'success', message:'Module data', data: allModulesDates})
});
router.get("/getModule/:id", async (req, res) => {
    let id = req.params.id
    
    let allModulesDates = await user_idpdetailDal.getModule(id)
    res.send({status : 'success', message:'Module data', data: allModulesDates})
});
router.get("/getCourseModule/:id", async (req, res) => {
    let courseId = req.params.id

    let queryStr  = "SELECT module_details.module_id,module_details.module_code,module_details.module_type, module_details.module_name FROM module_details JOIN courses_modules_assigned ON courses_modules_assigned.module_id=module_details.module_id WHERE course_id ='"+courseId+"'";

    let result = await user_idpdetailDal.runRawQuery(queryStr)

    res.send({status : 'success', message:'Module data', data: result})
});
router.post("/savemoduledata", async (req, res) => {

    let moduleDatesArray = req.body.module_dates
    let allModulesDates = await user_idpdetailDal.saveModuleData(moduleDatesArray)
    res.send({status : 'success', message:'Dates updated successfully', data: []})
});

router.post("/createModule", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {

        if(files.image){
            let img = fs.readFileSync(files.image.filepath);
            fields.image=new Buffer(img).toString('base64');
        }
        if(fields.number_of_occurance_per_year == 'undefined')
            delete fields.number_of_occurance_per_year

        response = await user_idpdetailDal.createModule(fields)
        if(response){
            let due_date = JSON.parse(fields.module_due_date);
            if(due_date.length){
                due_date.forEach(async function(item, index) {        
                    response = await user_idpdetailDal.createModulesDueDates({'module_id':response.module_id, 'modules_due_date':item.replace('T', ' ')})
                });
            }
            let settingEnabled = await user_idpdetailDal.listEnablevalue()
            if(!settingEnabled.module_courses_enabled){
                let resdata = await user_idpdetailDal.addModuleLocation(response.module_id,fields.teaching_location_id)
            }else{
                await user_idpdetailDal.addModuleCourse(response.module_id,fields.courseId)
            }
        }

    })
    
    res.send({status : 'success', message:'Module saved successfully' })
});
router.post("/deleteModule", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        await user_idpdetailDal.deleteModule(fields.moduleid);
        await user_idpdetailDal.deleteModulesDueDates(fields.moduleid);

    })
    
    res.send({status : 'success', message:'Module deleted successfully' })
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
async function iscourseExistOnLocation(row_number, user){
    let courseId   = user.field9
    let locationId = user.field7

    let queryStr  = "SELECT count(id) as count FROM course_location WHERE teaching_location_id='"+locationId+"' AND course_id='"+courseId+"'";
    //console.log(queryStr)
    let result = await user_idpdetailDal.runRawQuery(queryStr)
    //console.log(result, queryStr)
    if(result[0].count == 0){
        return {status : 'error', message:'Course not exist on that location in the system csv row number '+row_number }
    }
    return ''
}
async function moduleExistWithCourse(row_number, user){
    let modulesArray = []

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
    if(user.field15 != '')
        modulesArray.push(user.field15)

    if(modulesArray.length > 0 ){
        let moduleStr = modulesArray.join("','");
        let queryStr  = "SELECT count(module_id) as count FROM module_details WHERE module_code IN ('"+moduleStr+"')";
        let result = await user_idpdetailDal.runRawQuery(queryStr)
        if(modulesArray.length != result[0].count){
            return {status : 'error', message:'module not exist in the system csv row number '+row_number }
        }
    }
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

async function saveUserCourseModule(userId, user){    

    let courseId = user.field9
    let modulesArray = []

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
    if(user.field15 != '')
        modulesArray.push(user.field15)

    let resultIds = []
    if(modulesArray.length > 0 ){
        let moduleStr = modulesArray.join("','");
        let electiveStr  = "SELECT module_id FROM module_details WHERE module_code IN ('"+moduleStr+"')";
        resultIds = await user_idpdetailDal.runRawQuery(electiveStr)
    }   

    let queryStr  = "SELECT module_details.module_id FROM module_details JOIN courses_modules_assigned ON courses_modules_assigned.module_id=module_details.module_id WHERE course_id ='"+courseId+"'";
    let result = await user_idpdetailDal.runRawQuery(queryStr)

    
    if(result){
        Promise.all(
            result.map(async function(module){
                await user_idpdetailDal.AddModulesUser(userId, module.module_id)
            }),
            resultIds.map(async function(module){
                await user_idpdetailDal.AddModulesUser(userId, module.module_id)
            })
        )
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

async function addUserModules(userId, moduleIdsArr){
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

let getWhmcsData = (whmcsconnection, queryStr) =>{
    return new Promise((resolve, reject)=>{
        whmcsconnection.query(queryStr,  (error, elements)=>{
            if(error){
                return reject(error);
            }
            return resolve(elements);
        });
    });
};

router.post("/enableDisable", async (req, res) => {
    let response = await user_idpdetailDal.enabledisablevalue(req.body)
    res.send({status : 'success', message:'Status updated successfully'})
   
});
router.post("/updateClientDetail", async (req, res) => {
    let response = await user_idpdetailDal.updateClientDetail(req.body)
    res.send({status : 'success', message:'Status updated successfully'})
   
});

router.post("/updatePagetext", async (req, res) => {
    let data={};
        data[req.body.index] = req.body.text
    let response = await user_idpdetailDal.updatePagetext(data)
    //console.log(response,'es->>>>>>>');
    res.send({status : 'success', message:'Status updated successfully'})
   
});
router.post("/linkModule", async (req, res) => {

    let response = await user_idpdetailDal.linkModule(req.body)
    res.send({status : 'success', message:'Module added successfully'})
   
});
router.post("/unlinkModule", async (req, res) => {
    
    let response = await user_idpdetailDal.unlinkModule(req.body.unique_id)
    if(response.status=="success"){
        res.send({status : 'success', message:'Module unlinked successfully'})
    }
    
   
});

router.post("/updateModule", async (req, res) => {
    let response;
    let form  = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if(files.image){
            let img = fs.readFileSync(files.image.filepath);
            fields.image=new Buffer(img).toString('base64');
        }
        if(fields.number_of_occurance_per_year == 'undefined')
            delete fields.number_of_occurance_per_year
      
        response = await user_idpdetailDal.updateModule(fields.id, fields)
        if(response){
            let due_date = JSON.parse(fields.module_due_date);
            if(due_date.length){
                due_date.forEach(async function(item, index) {  
                    res = await user_idpdetailDal.deleteModulesDueDates(fields.id)
                    response = await user_idpdetailDal.createModulesDueDates({'module_id':fields.id, 'modules_due_date':item.replace('T', ' ')})
                });
            }

            let settingEnabled = await user_idpdetailDal.listEnablevalue()
            if(!settingEnabled.module_courses_enabled){
                res = await user_idpdetailDal.deleteModulesLocations(fields.id)
                let resdata = await user_idpdetailDal.addModuleLocation(fields.id,fields.teaching_location_id)
            }else{
                await user_idpdetailDal.updateModuleCourse(fields.id,fields.courseId, fields.courseUniqueId)
            }
            
        
        }

    })
   
     res.send({status : 'success', message:'Module updated successfully' })
});
router.get("/getCourseListdata/:id", async (req, res) => {
    let id = req.params.id
    let blockData = await user_idpdetailDal.listblockData(id);
    
    let data = [
       blockData.release,
       blockData.submission,
       blockData.pinned
    ]
    
    let intakeModule=blockData.allIntakeModule;

    await Promise.all(
      blockData.allIntake.map(async function(intake){
        
        if(blockData.intagelikeDataArrayObj[intake.teaching_block_period_id]){
            let tempArr = [intake.teaching_block_period_description]
            
            tempArr = tempArr.concat(blockData.intagelikeDataArrayObj[intake.teaching_block_period_id])
            
            data.push(tempArr)
        }

      })
    )

    options = {
        data: data,
        columns: blockData.columns,
        columnSorting:false,
        minDimensions:[2,2],
    };
    let parseOptions = JSON.stringify(options)
    
    res.send({status : 'success', message:'Module updated successfully', data: parseOptions})
  });
module.exports = router;
