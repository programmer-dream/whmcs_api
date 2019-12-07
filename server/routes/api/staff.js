const express = require("express");

const router = express.Router();
const mysql = require("mysql");
const mysqlConfig = require("../../config/sql");
const sha1 = require("sha1");
const autoAuthKey = require("../../config/autoAuth");
const whmcsLoginUrl = require("../../config/whmcs").loginUrl;
var headers= {authorization: 'WHM aauapmff:906448e04b994861336c7a3521ed08b251c455f3332edd010c12bde883b83dea527ef7ec623f23e831a32b15e02ba5425814a8d235c575a70c179fb246afe6ccf3b2dfbe6e2de754d331a406052a0d6754225cb4d1e4e77c3f45bae592d1a25f77040633ac552ce35755a2291cc84338fac070023b0471d2e2b74056f6d1fbca86186213f2428208d4beaf34044fd0ff325e705f004eb42a0d0deac200be1703b0a0fccf47007d982dfad50706a3e0470ab4b3d8b68cccc7e45e4de2f1be8282e35e81f9fc9408a14874e0e5e418aeddab60a25e9d1b6c1359b9619907c88c6c6575e2b1d3b3b38f11588390bdcf83c65bea8faebf55f1f199ea6cc5286055a79a4cac57b2c4f10fc530298f9f7287099071b448000b5ce9b5705754e15def9299c3f54c6e3d9d843f4ffaa5aa762da9b1d7fe9ad45a5e35ca43683217c73cc208ff1f47652b609e5919c250f74ea3625ef92a0aa447a7824bf3484181c48677782d21aa3686d27d88921d1a8118980296e40faaccd5bd63cf3a718b2fd1f083903014214db0746c06ee8d1976467179f03bbbafe47079c6109613286b426a98286924c74c80102cd69d3d275d52970fdc9503081cce3bf85ac336499b0adb529d8a9d6469735aa11addc90dd18517b12bcb1c3e7ab63df9e76151c45dc7e81f' };
var axios = require("axios");
// Import utility functions
const generateRandomString = require("../../utils/generateRandomString");
const getTimestamp = require("../../utils/getTimestamp");
const user_idpdetailBal=require("../../../Bal/user_idpdetails");
// Get the modules from whmcs-js
const { Clients, Orders, Services } = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

// Id for the staff product
const staffProductId = 3;

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
                            phonenumber: data.data[0].dataValues.client_detail.dataValues.Phone,
                            notes: "Staff account - Created through Education Host AD login",
                            language: "english",
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
                        var nameserver1 = 'ns1.' + data.data[0].client_detail.dataValues.domainname;
                        var nameserver2 = 'ns2.' + data.data[0].client_detail.dataValues.domainname;

                        // Once the user is added in WHMCS, then add the service
                        const addOrder = new Orders(whmcsConfig);
                        addOrder.addOrder({
                                clientid: addClientResponse.clientid,
                                // This product id relates to the staff service
                                pid: staffProductId,
                                domain: fulldomain,
                                nameserver1: nameserver1,
                                nameserver2: nameserver2,
                                paymentmethod: "banktransfer",
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
                                        sendemail: 1
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
                                                        res.status(200).json({message:"SUCCESS"});
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
        }else{
            res.status(401).json({error:error});
        }
    
  })
});

const moment = require("moment");

const path = require("path");

// Gets the client folder which is needed to serve html files

const root = path.join(__dirname, "../../../../AD-saml/client/staff");

// @route 	GET /staff/dashboard

// @desc 	Serves the staff dashboard

// @access 	Public

router.get("/dashboard", ensureAuthenticated, function(req, res) {
  res.render("dashboard", {
    email: req.user.upn,
    user: req.user,
    supportMenu: {
      main: [
        {
          label: "Raise Support",
          url: "http://support.example.com/",
          icon: "local_offer"
        },
        {
          label: "FAQ",
          url: "https://ssotesting.educationhost.co.uk/staff/faq.html",
          icon: "help_outline"
        },
        {
          label: "Knowledge Base",
          url:
            "https://webhosting.canterbury.ac.uk/clientarea/index.php?rp=/knowledgebase",
          icon: "info_outline"
        }
      ],
      other: [
        {
          label: "Admin Area",
          url: "https://ssotesting.educationhost.co.uk/staff/news-feed.html",
          icon: "list_alt"
        },
        {
          label: "Network Monitor",
          url: "https://uptime.statuscake.com/?TestID=PzBTSXZwia",
          icon: "list_alt"
        }
      ]
    },
    copyrightDate: `${moment().format("YYYY")}/${moment()
      .add(1, "year")
      .format("YY")}`
  });
});

// @route 	GET /staff/login

// @desc 	Serves the staff login page

// @access 	Public

router.get("/login", ensureAuthenticated1, function(req, res) {
  res.render("stafflogin");
});

function ensureAuthenticated1(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.isStaff == 1) {
    return next();
  }

  res.redirect("/");
}

module.exports = router;
