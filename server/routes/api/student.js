const express = require("express");
const router = express.Router();
const generateRandomString = require("../../utils/generateRandomString");
const cpanel = require("cpanel-lib");
const btoa = require("btoa");
const base64_encode = require('locutus/php/url/base64_encode');
const serialize = require('locutus/php/var/serialize');

// Get the modules from whmcs-js
const { Clients, Orders, Services } = require("whmcs-js");

// Config for whmcs api calls
const whmcsConfig = require("../../config/whmcs");

// Id for the student product
const studentProductId = 64;

// @route 	GET api/student/example
// @desc 	Example student route
// @access 	Public
router.get("/example", (req, res) => {
  res.json({
    msg: "example student works"
  });
});

// @route 	POST api/student/
// @desc 	Example student route
// @access 	Public
router.post("/", (req, res) => {
  // Gets the student modules back from the student function
  // This will be used to create the module folders
  const studentModules = req.body.selected;

  if (studentModules != null) {
    console.log(studentModules);
  }

  // Set up the module with the config file
  // and store it in this variable - can be called anything you want
  const addClient = new Clients(whmcsConfig);


  const module = {
    47: studentModules[0]
  }

  // Serialize
  const moduleserial = serialize(module);

  // Call the getClients call and store the data in the variable called
  addClient
    .addClient({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      address1: req.body.Address1,
      address2: req.body.Address2,
      city: req.body.City,
      state: req.body.State,
      postcode: req.body.Postcode,
      country: req.body.Country,
      // Added to see if this will make it searchable in the admin pages for lecturers (sept 2019)
      customfields: base64_encode(moduleserial),
      phonenumber: req.body.Phone,
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

      addOrder
        .addOrder({
          clientid: addClientResponse.clientid,
          // This product id relates to the student service
          pid: studentProductId,
          domain: req.body.fulldomain,
          nameserver1: req.body.nameserver1,
          nameserver2: req.body.nameserver2,
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
                            host: "benu.zjnucomputing.com",
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
                            studentModules.length
                          );

                          do {
                            var smodules = studentModules[count];

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
                          } while (count != studentModules.length);
                          res.send("SUCCESS");
                        })
                        .catch(function (error) {
                          console.log("Error updating client password", error);
                          res.send(error);
                        });
                    })
                    .catch(function (error) {
                      console.log("Erro creating module", error);
                      res.send(error);
                    });
                })
                .catch(function (error) {
                  res.send(error);
                });
            })
            .catch(function (error) {
              res.send(error);
            });
        })
        .catch(function (error) {
          res.send(error);
        });
    })
    .catch(function (error) {
      res.send(error);
    });
});

module.exports = router;
