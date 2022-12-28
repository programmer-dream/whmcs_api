var Sequelize = require("sequelize");

var config = require("../server/config/sql");
//database connection.
var sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  // data type
  dialect: config.dialect,

  pool: {
    max: config.max,
    min: config.min,
    idle: config.idle,
  },
  define: {
    timestamps: false,
  },
});

//for model import.
var models = require("sequelize-auto-import")(sequelize, config.dirPath);
var user_idpdetails = models.user_idpdetails;
var client_details = models.client_details;
var loginhistory = models.loginhistory;
var modules_users_assigned = models.modules_users_assigned
var module_details = models.module_details
var settings_details =models.settings_table
var teaching_block_modules         = models.teaching_block_modules
var teaching_block_blocks          = models.teaching_block_blocks
var teaching_block_periods         = models.teaching_block_periods
var teaching_block_period_description = models.teaching_block_period_description
var modules                        = models.modules
var module_location                = models.module_location
var teaching_location_details      = models.teaching_location_details
var teaching_location_ip_addresses = models.teaching_location_ip_addresses
var settings_table                 = models.settings_table
var modules_due_dates              = models.modules_due_dates


var client_availablemodules = models.client_availablemodules;
client_details.hasMany(user_idpdetails, { foreignKey: "universityid" });
user_idpdetails.belongsTo(client_details, { foreignKey: "universityid" });
loginhistory.belongsTo(user_idpdetails, { foreignKey: "userid" });
teaching_location_details.belongsTo(teaching_location_ip_addresses, { foreignKey: "ip_address_id" });
module_details.hasMany(modules_due_dates, { foreignKey: "module_id" });
module_details.hasMany(module_location, { foreignKey: "module_id" });

// CRUD Array
var User_idpdetail = {
  getTopLogins: function (callback) {
    user_idpdetails
      .findAll({
        limit: 10,
        order: [[Sequelize.col("logins"), "DESC"]],
      })
      .then(function (data) {
        callback({ message: "success", data: data });
      })
      .catch(function (err) {
        callback({ message: "error", data: err });
      });
  },
  getAllLogins: function (callback) {
    user_idpdetails
      .findAll({
        order: [[Sequelize.col("logins"), "DESC"]],
      })
      .then(function (data) {
        callback({ message: "success", data: data });
      })
      .catch(function (err) {
        callback({ message: "error", data: err });
      });
  },
  getAllUsers: function (callback) {
    user_idpdetails
      .findAll({
        attributes: [
          "userid",
          "email",
          "firstname",
          "lastname",
          "isActive",
          "is_admin",
        ],
      })
      .then(function (data) {
        callback({ message: "success", data: data });
      })
      .catch(function (err) {
        callback({ message: "error", data: err });
      });
  },
  suspendUser: function (body, callback) {
    user_idpdetails
      .findAll({ where: { userid: body.user } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            isActive: body.isActive,
          })
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  updateLocation: function (body, callback) {
    user_idpdetails
      .findAll({ where: { ID: body.ID } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            teaching_block_period_id: body.teaching_block_period,
            user_location_id:body.teaching_location
          })
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  inActiveUser: function (id, callback) {
    user_idpdetails
      .findAll({ where: { ID: id } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            isActive: 0,
            to_be_deleted:1
          })
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  getUserLoginCount: function (callback) {
    loginhistory
      .findAll()
      .then(function (value) {
        //returning the value here
        var prev = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var current = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < value.length; i++) {
          if (value[i].dataValues.date) {
            var month = value[i].dataValues.date.getMonth();
            var year = value[i].dataValues.date.getFullYear();
            var currentYear = new Date().getFullYear();
            var previousYear = new Date().getFullYear() - 1;
            if (year == currentYear) {
              current[month] = current[month] + 1;
            } else if (year == previousYear) {
              prev[month] = prev[month] + 1;
            }
          }
        }

        callback({ message: "success", current: current, prev: prev });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  getUserBySessionId: function (id, callback) {
    user_idpdetails
      .findAll({
        where: { sessionid: id },
        include: [{ model: client_details, required: true }],
      })
      .then(function (value) {
        //returning the value here
        callback({ message: "success", data: value });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  getUserByEmail: function (email, callback) {
    user_idpdetails
      .findAll({
        where: { email: email },
        include: [{ model: client_details, required: true }],
      })
      .then(function (value) {
        //returning the value here
        callback({ message: "success", data: value });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  getUserIdpDetailByEmail: function (email, callback) {
    user_idpdetails
      .findAll({ where: { email: email } })
      .then(function (value) {
        callback({ message: "success", data: value });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  getModules: function (id, callback) {
    client_availablemodules
      .findAll({ where: { universityid: id } })
      .then(function (value) {
        callback({ message: "success", data: value });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  addUser_IdpDetail: function (para, callback) {
    let teaching_block_period_id = null
    let user_location_id = null

    if(para.user_location_id)
      user_location_id = para.user_location_id
    
    if(para.teaching_block_period_id)
      teaching_block_period_id = para.teaching_block_period_id

    const user = user_idpdetails.build({
      email: para.email,
      firstname: para.firstname,
      userid: para.userid,
      lastname: para.lastname,
      sessionid: para.sessionid,
      isStaff: 0,
      expiryDate: new Date(),
      teaching_block_period_id: teaching_block_period_id,
      user_location_id:user_location_id,
      is_synced:1
    });
    user
      .save()
      .then(function (status) {
        const logg = loginhistory.build({
          userid: status.dataValues.ID,
        });
        logg
          .save()
          .then(function (data) {
            callback({ message: "success", data: status });
          })
          .catch(function (err1) {
            callback({ message: "error", data: err1.message });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
    //return db.query("Insert into category values(?)", [Task.Title], callback);
  },
  updateUser_IdpDetail: function (body, callback) {
    user_idpdetails
      .findAll({ where: { email: body.email } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            sessionid: body.sessionid,
            lastLogin: new Date(),
            logins: itemInstance[0].dataValues.logins + 1,
          })
          .then(function (self) {
            const logg = loginhistory.build({
              userid: itemInstance[0].dataValues.ID,
            });
            logg
              .save()
              .then(function (data) {
                callback({ message: "success", data: data });
              })
              .catch(function (err1) {
                callback({ message: "error", data: err1.message });
              });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  updateStaf: function (body, callback) {
    user_idpdetails
      .findAll({ where: { email: body.email } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            isStaff: body.staffnumber,
          })
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  approvStaff: function (body, callback) {
    user_idpdetails
      .findAll({ where: { email: body.email } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            is_approved_staff: 1,
          })
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  addUserByCsv: async function (para) {
    let is_synced = 0
    if(para.is_synced  == 1){
        is_synced = 1
    }
    const user = await user_idpdetails.create({
      email: para.email,
      firstname: para.firstname,
      userid: para.userid,
      student_id: para.student_id,
      lastname: para.lastname,
      sessionid: para.sessionid,
      isStaff   : para.isStaff,
      is_admin  : para.is_admin,
      is_synced : is_synced,
      expiryDate: new Date(),
      teaching_block_period_id:para.teaching_block_period_id,
      user_location_id:para.teaching_location
    });
    
    return user.toJSON();
    
  },
  createLocation: async function (para) {
    let location = await teaching_location_details.create(para);
    
    location = location.toJSON();
    let addedId = await teaching_location_details.findOne({where:{unique_id: location.unique_id}})
    let updated = addedId.update({teaching_location_id:location.unique_id})
    
    let latestData = await teaching_location_details.findOne({where:{unique_id: location.unique_id}})
    
    return latestData.toJSON();
    
  },
  updateLocation: async function (id, para) {
    
    const location = await teaching_location_details.findOne({
      where:{ unique_id:id }
    });
    if(location){
      const locationData = await location.update(para);
      location = location.toJSON();
    }
    return location

    
  },
  createModule: async function (para) {
    
    let modules = await module_details.create(para);
        modules = modules.toJSON();
    let addedId = await module_details.findOne({where:{module_id: modules.module_id}})
    
        addedId=addedId.toJSON()
    
    return addedId;
    
  },
  deleteModule: async function (moduleID) {
    
    await module_details.destroy({where:{module_id:moduleID}});
    // await modules_users_assigned.destroy({where:{user_id:userId}});
    
  },
  createModulesDueDates: async function (para) {
    
    let modulesdates = await modules_due_dates.create(para);
        modulesdates = modulesdates.toJSON();
    return modulesdates;
    
  },
  deleteModulesDueDates: async function (moduleID) {
    
    await modules_due_dates.destroy({where:{module_id:moduleID}});
    
  },
  addModuleLocation: async function (module_id,teaching_location_id) {
    if(teaching_location_id=="all"){
       let teaching_locations = await teaching_location_details.findAll({where:{is_active:1}})
          teaching_locations.map(async function(item){
          teaching_location_id=item.unique_id;
          await module_location.create({module_id, teaching_location_id})

       })
    }else if(teaching_location_id.length >1){
        var teaching_location_id = teaching_location_id.split(',');
         teaching_location_id.map(async function(item){
            teaching_location_id=item;
            await module_location.create({module_id, teaching_location_id})
         })
    }
    else{
      let modulesLocation = await module_location.create({module_id, teaching_location_id});
      // console.log(modulesLocation,"modulesLocation");
    }
    
  },
  createIpAddress: async function (para) {
    
    const ipAddress = await teaching_location_ip_addresses.create(para);
    
    return ipAddress.toJSON();
    
  },
  updateIpAddress: async function (id, para) {
    
    const ipAddress = await teaching_location_ip_addresses.findOne({
      where:{ ip_address_id:id }
    });
    
    const ipAddressData = await ipAddress.update(para);
    
    return ipAddressData.toJSON();
    
  },
  getLocation: async function (id) {
    
    const ipAddress = await teaching_location_details.findOne({
      where:{ unique_id:id },
      include : [{ model: teaching_location_ip_addresses, required: true }]
    });
    
    return ipAddress.toJSON();
    
  },
   getModule: async function (id) {
    
    const ipModule = await module_details.findOne({
      where:{ module_id:id },
       include : [{ model: module_location, required: true },
                 { model: modules_due_dates, required: true }]
    });

    if(ipModule)
      return ipModule.toJSON();
    
    return ipModule
  },
  AddModulesUser: async function (userId, moduleId) {
    
    let modules_user= await modules_users_assigned.create({
      user_id: userId,
      module_id:moduleId
    });
    
    return modules_user.toJSON();
  },
  listModules: async function (userId, moduleId) {
    let allModules = []
    let modules= await module_details.findAll();
    
    if(modules.length){
      
        modules.map( async function(module){
          let obj = {
            module_id:module.module_id,
            module_code: module.module_code,
            module_name: module.module_name,
          }
          allModules.push(obj)
        })
      
      return allModules
    }else{
      return []
    }
  },

  getListModules: async function (userId, moduleId) {
    let allModules = []
    let modules= await module_details.findAll();
    
    if(modules.length){
        await Promise.all(
          modules.map( async function(module){
           let location= await module_location.findAll({where:{module_id: module.module_id}});
           let users= await modules_users_assigned.findAll({where:{module_id: module.module_id}});
            module['location_count'] = location.length;
            module['user_count'] = users.length;
            let obj = {
              module_id:module.module_id,
              module_code: module.module_code,
              module_name: module.module_name,
              module_type: module.module_type,
              image:       module.image,
              number_of_occurance_per_year: module.number_of_occurance_per_year,
              module_start_date: module.module_start_date,
              module_due_date:   module.module_due_date,
              location_count:    module.location_count,
              user_count:module.user_count
            }
             
            allModules.push(obj)
            
          })
        )
      return allModules
    }else{
      return []
    }
  },
  listEnablevalue: async function (userId, moduleId){
     
     let settings= await settings_details.findOne();
     if(settings){
        settings = settings.toJSON()
     }
     return settings
  },
  listTeachingLocation: async function (allData = false) {
    let allLocation = []
    let include = []
    if(allData)
        include = [{ model: teaching_location_ip_addresses, required: true }]

    let teaching_location_data= await teaching_location_details.findAll({where:{is_active:1}, include});
   
    if(teaching_location_data.length){
      
        teaching_location_data.map( async function(location){
          location = location.toJSON()
          if(allData){
            allLocation.push(location)
          }else{
            let obj = {
              teaching_location_id:location.teaching_location_id,
              name: location.name
            }
            allLocation.push(obj)
          }
        })
      
      return allLocation
    }else{
      return []
    }
  },
  listBlockPeriods: async function (userId, moduleId) {
    let allBlocks = []
    let teaching_block_data= await teaching_block_period_description.findAll({
      attributes:['teaching_block_period_id','teaching_block_period_description']
    });
    
    if(teaching_block_data.length){
      
        teaching_block_data.map( async function(block){
          let obj = {
            teaching_block_period_id:block.teaching_block_period_id,
            teaching_block_period_description: block.teaching_block_period_description
          }
          allBlocks.push(obj)
        })
      
      return allBlocks
    }else{
      return []
    }
  },
  runRawQuery: async function (queryStr) {
    
    let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
    
    return queryData;
  },
  updateSyncStatus: async function (id,callback) {
     user_idpdetails
      .findAll({ where: { ID: id } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({is_synced: 1})
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  inActiveLocation: async function (id,callback) {
     teaching_location_details
      .findAll({ where: { unique_id: id } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({is_active: 0})
          .then(function (self) {
            callback({ message: "success", data: self });
          });
      })
      .catch(function (err) {
        callback({ message: "error", data: err.message });
      });
  },
  dropUser: async function (userId) {
    
    await user_idpdetails.destroy({where:{ID:userId}});
    await modules_users_assigned.destroy({where:{user_id:userId}});
    
  },
  enabledisablevalue: async function (para) {
     const ipAddress = await settings_table.findOne();
    const ipAddressData = await ipAddress.update(para);
    
    return ipAddressData.toJSON();
    
    
  },
};
module.exports = User_idpdetail;
