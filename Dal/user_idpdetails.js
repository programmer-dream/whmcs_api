var Sequelize = require("sequelize");
var moment =require("moment");
const { DateTime } = require("luxon");
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
var teaching_block_intake_description     = models.teaching_block_period_description
var course_details                 = models.course_details
var course_location                = models.course_location
var courses_modules_assigned       = models.courses_modules_assigned
var courses_blocks_assigned        = models.courses_blocks_assigned
var teaching_block_intakes         =models.teaching_block_intakes


var client_availablemodules = models.client_availablemodules;
client_details.hasMany(user_idpdetails, { foreignKey: "universityid" });
user_idpdetails.belongsTo(client_details, { foreignKey: "universityid" });
modules_users_assigned.belongsTo(user_idpdetails, { foreignKey: "user_id" });
loginhistory.belongsTo(user_idpdetails, { foreignKey: "userid" });
teaching_location_details.belongsTo(teaching_location_ip_addresses, { foreignKey: "ip_address_id" });
module_details.hasMany(modules_due_dates, { foreignKey: "module_id" });
module_details.hasMany(module_location, { foreignKey: "module_id" });
module_details.hasOne(courses_modules_assigned, { foreignKey: "module_id" });
courses_modules_assigned.belongsTo(module_details, { foreignKey: "module_id" });
course_details.hasMany(courses_modules_assigned, { foreignKey: "course_id" });

// CRUD Array
var User_idpdetail = {
  createIntake: async function (para) {
    var teachingblockintake = await teaching_block_intake_description.create(para);
    if(teachingblockintake)
         teachingblockintake = teachingblockintake.toJSON();
    return teachingblockintake;
    
  },
  createBlock: async function (para) {
    var teachingBlock = await teaching_block_blocks.create(para);
    if(teachingBlock)
         teachingBlock = teachingBlock.toJSON();
    return teachingBlock;
    
  },
  assignedCourseBlock: async function (para) {
    var teachingBlock = await courses_blocks_assigned.create(para);
    if(teachingBlock)
         teachingBlock = teachingBlock.toJSON();
    return teachingBlock;
    
  },
  editBlock: async function (id, para) {
    var teachingBlock = await teaching_block_blocks.findOne({ where : {teaching_block_id: id } });
    if(teachingBlock)
         teachingBlock = teachingBlock.update(para);
    return teachingBlock;
    
  },
  getListIntakes: async function (userId, moduleId) {
  
    let intakeQuery  = "SELECT * FROM teaching_block_intake_description WHERE intake_end_date > NOW()";
    let allIntakes = await sequelize.query(intakeQuery,{ type: Sequelize.QueryTypes.SELECT });

    return allIntakes;
  },
  getTeachingBlocks: async function (userId, moduleId) {
    let past_2month=DateTime.now().minus({months:2}).toFormat('yyyy-MM-dd HH:mm:ss');
    console.log(past_2month, "<< past_2month")
    let blockQuery  = "SELECT teaching_block_blocks.*,courses_blocks_assigned.course_id ,course_details.course_name as course_name,course_details.course_id FROM teaching_block_blocks join courses_blocks_assigned on teaching_block_blocks.teaching_block_id=courses_blocks_assigned.teaching_block_id join course_details on course_details.id=courses_blocks_assigned.course_id WHERE teaching_block_blocks.tb_end_date_time > '"+past_2month+"'"
    let allBlocks = await sequelize.query(blockQuery,{ type: Sequelize.QueryTypes.SELECT });

    return allBlocks;
  },
  updateIntake: async function (data) {
    let intakedata = await teaching_block_intake_description.findOne({where :{ teaching_block_period_id: data.intake_id }})
    if(intakedata){
      var teaching_block_period_description = data.teaching_block_period_description;
      var intake_start_date = data.intake_start_date;
      var intake_end_date = data.intake_end_date;
      intakedata.update({teaching_block_period_description,intake_start_date,intake_end_date})
    }

  },
  deleteIntakedata: async function (IntakeID) {
    
    await teaching_block_intake_description.destroy({where:{teaching_block_period_id:IntakeID}});
    // await modules_users_assigned.destroy({where:{user_id:userId}});
    
  },
  deleteBlock: async function (id) {
    
    await teaching_block_blocks.destroy({where:{teaching_block_id:id}});
  
  },
  getIntake: async function (id) {
    
    const intakedata = await teaching_block_intake_description.findOne({
      where:{ teaching_block_period_id:id }
    });

    if(intakedata)
      return intakedata.toJSON();
    
    return intakedata
    
  },
  getBlock: async function (id) {
    
    let blockData = await teaching_block_blocks.findOne({
      where:{ teaching_block_id:id }
    });

    if(blockData){

      blockData = blockData.toJSON()
      blockData.tb_start_date_time = DateTime.fromISO(blockData.tb_start_date_time.toISOString().replace('Z','')).toFormat('yyyy-MM-dd HH:mm:ss');
      blockData.tb_end_date_time = DateTime.fromISO(blockData.tb_end_date_time.toISOString().replace('Z','')).toFormat('yyyy-MM-dd HH:mm:ss');

    }
    
    return blockData
    
  },
  createCourse: async function (para) {
    
      var createcoursedetails = await course_details.create(para);
      if(createcoursedetails)
           createcoursedetails = createcoursedetails.toJSON();
      return createcoursedetails;
    
  },
  createCourselocation: async function (para) {
    
      var createcourselocation = await course_location.create(para);
      if(createcourselocation)
           createcourselocation = createcourselocation.toJSON();
      return createcourselocation;
    
  },
  getCourse: async function (course_id) {
    const course_data = await course_details.findOne({
      where:{ course_id:course_id }
    });
    if(course_data){
      return course_data.toJSON();
    }else{
      return [];
    }
  },
  listcoursesdate: async function () {
    let queryStr  = "SELECT * FROM course_details";
    let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
    let html = "";
    await Promise.all(
        queryData.map( async function(module){
          let queryforcount  = `SELECT  COUNT(*) as course_id_count FROM course_location WHERE course_id =`;
          queryforcount += module.id;
      
            let querycountData = await sequelize.query(queryforcount,{ type: Sequelize.QueryTypes.SELECT });
            let count = querycountData[0].course_id_count;
            if(querycountData.shift().course_id_count == 0){
              count = 1;
            }
            html += '<tr><td rowspan="'+count+'" class="align-middle"><p class="text-center">'+module.course_name+'</p></td></tr>';
            let queryforlocation  = `SELECT  *  FROM course_location WHERE course_id =`;
              queryforlocation += module.id;
            let querycountlocationData = await sequelize.query(queryforlocation,{ type: Sequelize.QueryTypes.SELECT });
              querycountlocationData.map( async function(module){
                let queryforlocationdetails  = "SELECT * FROM teaching_location_details WHERE unique_id = "+module.teaching_location_id;
                let queryqueryforlocationdetailsData = await sequelize.query(queryforlocationdetails,{ type: Sequelize.QueryTypes.SELECT });
                html += "<tr><td>"+queryqueryforlocationdetailsData[0].name+"</td></tr>";
              // console.log(queryqueryforlocationdetailsData[0].name, "<<<<<<< quhhheryqueryforlocationdetailsData");
              })
             
          })
      )
    return html;
  },
  availableTeachingLocations: async function () {
    let queryStr  = "SELECT teaching_location_id, CONCAT('ID: ', teaching_location_id, ' - ', name) as name FROM teaching_location_details WHERE is_active = 1";
    let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
    return queryData;

  },
  availablecoursesbulkuploader: async function () {
    let queryStr  = "SELECT course_id, CONCAT(\" ID: \", course_id, ' - ', course_name) AS name FROM course_details";
    let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
    return queryData;

  },
  activeintakecount: async function () {
    let queryStr  = "SELECT COUNT(teaching_block_period_id) as name FROM teaching_block_intake_description WHERE intake_end_date > NOW()";
    let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
    return queryData;

  },
  availableintakesbulkuploader: async function () {
    let queryStr  = "SELECT CONCAT(\" ID: \", teaching_block_period_id, ' - ', teaching_block_period_description) as name FROM teaching_block_intake_description";
    let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
    return queryData;

  },  
  getAvailableModules: async function () {
    let sqlquery  = `SELECT module_id,CONCAT(module_code, ' - ' , module_type,' -' , module_name) AS Module_Details FROM module_details`;
    let queryData = await sequelize.query(sqlquery,{ type: Sequelize.QueryTypes.SELECT });
    return queryData;
  },
  getTopLogins: function (callback) {
    user_idpdetails
      .findAll({
        limit: 10,
        where : {isActive: 1},
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
        where : {to_be_deleted: 0},
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
  suspendCustomUser: function (obj, callback) {
    user_idpdetails
      .findAll({ where: { ID: obj.ID } })
      .then(function (itemInstance) {
        itemInstance[0]
          .update({
            isActive: obj.isActive,
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
    let teaching_block_intake_id = null
    let user_location_id = null

    if(para.user_location_id)
      user_location_id = para.user_location_id
    
    if(para.teaching_block_intake_id)
      teaching_block_intake_id = para.teaching_block_intake_id

    const user = user_idpdetails.build({
      email: para.email,
      firstname: para.firstname,
      userid: para.userid,
      lastname: para.lastname,
      sessionid: para.sessionid,
      isStaff: 0,
      expiryDate: new Date(),
      teaching_block_intake_id: teaching_block_intake_id,
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
      teaching_block_intake_id:para.teaching_block_period_id,
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
  updateLocationNew: async function (id, para) {
    
    let location = await teaching_location_details.findOne({
      where:{ unique_id:id }
    });
    if(location){
      let locationData = await location.update(para);
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
  updateModule: async function (id, para) {
    let moduleData;
    const modules = await module_details.findOne({
      where:{ module_id:id }
    });
    if(modules){
       moduleData = await modules.update(para);
      moduleData = moduleData.toJSON();
    }
     return moduleData;

    
  },
  deleteModule: async function (moduleID) {
    
    await module_details.destroy({where:{module_id:moduleID}});
    // await modules_users_assigned.destroy({where:{user_id:userId}});
    
  },
  createModulesDueDates: async function (para) {
    
    let modulesdates = await modules_due_dates.create(para);

      if(modulesdates)
         modulesdates = modulesdates.toJSON();

    return modulesdates;
    
  },

  deleteModulesLocations: async function (moduleID) {
    
    await module_location.destroy({where:{module_id:moduleID}});
    
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
     
    }
    
  },
  addModuleCourse: async function (module_id,course_id) {
    await courses_modules_assigned.create({module_id,course_id})
    
  },
  updateModuleCourse: async function (module_id,course_id, id) {
    console.log(module_id, course_id, id)
    let cma = await courses_modules_assigned.findOne({where :{id:id}})

    if(cma)
      cma.update({module_id, course_id});
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
  getModuleData: async function (id) {
    let allModules = []
    const modulesDates = await modules_due_dates.findAll({
      where:{module_id:id}
    });
    
    if(modulesDates.length){
        modulesDates.map( async function(moduleDate){
          moduleDate = moduleDate.toJSON()
          allModules.push(moduleDate)
        })
    }
        
    return allModules;
    
  },
  saveModuleData: async function ( modulesDates) {
    let modulesDate = {}
    if(modulesDates.length){
        modulesDates.map( async function(moduleDate){
          modulesDate = await modules_due_dates.findOne({where:{unique_id:moduleDate.unique_id}})
          modulesDate.update({modules_due_date:moduleDate.date})
        })
    }
        
    return true;
    
  }
  ,
   getModule: async function (id) {
    
    const ipModule = await module_details.findOne({
      where:{ module_id:id },
       include : [{ model: module_location },
                 { model: modules_due_dates },
                 { model: courses_modules_assigned}]
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
  getAllmodules: async function() {
    let allModules = []
    let modules= await module_details.findAll({include: [{ model: modules_due_dates, required: true }]});
    console.log(modules,"modules,modules")
    if(modules.length){
      await Promise.all(
        modules.map( async function(module){
            let obj = {
              module_id:module.module_id,
              module_code: module.module_code,
              module_name: module.module_name,
              module_due_date: module.modules_due_dates,
              number_of_occurance_per_year:module.number_of_occurance_per_year
            }
          allModules.push(obj)
        })
      ) 
     return allModules
    }else{
      return []
    }

  },
 
  listModuleswithdates: async function() {
    let allModules = []
    let due_dates
    var todayDate = moment().format('YYYY-MM-DD');
    let modules= await module_details.findAll();

    if(modules){
      await Promise.all(
        modules.map( async function(module){
          due_dates= await modules_due_dates.findOne(
            {
              where:{module_id: module.module_id,
              modules_due_date:sequelize.where(sequelize.fn('date', sequelize.col('modules_due_date')),'>',todayDate)
            },
            attributes: [[Sequelize.fn('min', Sequelize.col('modules_due_date')), 'min']],
            group: ['module_id']}
           );
           if(due_dates){
             let endDate= DateTime.fromISO(due_dates.dataValues.min.toISOString().replace('Z',''));
             let startDate = DateTime.now();
             let minDiff = endDate.diff(startDate,["days","hours"]).toObject();
             module['due_date'] = minDiff
           }else{
             module['due_date'] = "No due date";
           }
           let obj = {
                module_code: module.module_code,
                module_name: module.module_name,
                module_type: module.module_type,
                module_id:module.module_id,
                module_duedate: module.due_date
                }
            
            allModules.push(obj)
         })
      )
    let sorted = allModules.sort(function(a, b) { 
                      return a.module_duedate.days - b.module_duedate.days || a.module_duedate.hours - b.module_duedate.hours;
                    });
    console.log(sorted, "<<< sorted")
      return sorted  
      
    }else{
      return []
    }
    
  },
  
 modulesRecentlyEnd:async function () {
    let allModules = []
    let due_dates
    let todayDate = moment().format('YYYY-MM-DD');
    let modules= await module_details.findAll();
    if(modules){
      await Promise.all(
        modules.map( async function(module){
          due_dates= await modules_due_dates.findOne(
            {
              where:{module_id: module.module_id,
              modules_due_date:sequelize.where(sequelize.fn('date', sequelize.col('modules_due_date')),'<',todayDate)
            },
            attributes: [[Sequelize.fn('min', Sequelize.col('modules_due_date')), 'min']],
            group: ['module_id']}
           );
            if(due_dates){
              module['due_date'] = DateTime.fromISO(due_dates.dataValues.min.toISOString().replace('Z','')).toFormat('yyyy-MM-dd HH:mm:ss');
            }
            else{
              module['due_date'] = "";
            }
             let obj = {
                  module_code: module.module_code,
                  module_name: module.module_name,
                  module_type: module.module_type,
                  module_id:module.module_id,
                  module_duedate: module.due_date
                  }
              allModules.push(obj)
         })
      )
    let sorted = allModules.sort(function(a, b) { 
                      return a.module_id - b.module_id;
                    });
      return sorted  
        
    }else{
      return []
    }

  },
  getmoduleEndDate:async function (userId, moduleId) {

  },

  getListModules: async function (userId, moduleId) {
    let allModules = []
    let modules= await module_details.findAll();
    
    let settings= await settings_details.findOne();
    
    if(modules.length){
        await Promise.all(
          modules.map( async function(module){
           let location = {}
           let locationCount = 0

           if(settings.module_courses_enabled){
              let queryStr = "SELECT course_location.teaching_location_id FROM `courses_modules_assigned` JOIN course_location ON courses_modules_assigned.course_id = course_location.course_id WHERE module_id = "+module.module_id+" GROUP BY course_location.teaching_location_id";
              let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
              locationCount = queryData.length
              
           }else{
              location= await module_location.findAll({where:{module_id: module.module_id}});
              locationCount = location.length
           }
           let users= await modules_users_assigned.findAll({
            where:{module_id: module.module_id},
            include: [{ model: user_idpdetails, where:{to_be_deleted:0}, required: true }]
            });

            module['location_count'] = locationCount;
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
        let sorted = allModules.sort(function(a, b) { 
                      return a.module_id - b.module_id;
                    });
      return sorted
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
  clientDetail: async function (userId, moduleId){
     
     let settings= await client_details.findOne();
     if(settings){
        settings = settings.toJSON()
     }
     return settings
  },
  getIntakePeriod: async function (todayDate){
     let queryStr = "SELECT teaching_block_intake_description.*, Min(intake_end_date) as date FROM `teaching_block_intake_description` WHERE DATE(intake_end_date) > '"+todayDate+"' GROUP BY teaching_block_period_id limit 1"
            
      let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });

     return queryData
  },
  courseList: async function () {
    let allCourse = []
    let course_details_data= await course_details.findAll();
   
    if(course_details_data.length){
        await Promise.all(
          course_details_data.map( async function(course){
            let queryStr = "SELECT courses_modules_assigned.*, module_details.module_name, module_details.module_type, module_details.module_course_year   FROM `courses_modules_assigned` JOIN module_details ON module_details.module_id = courses_modules_assigned.module_id WHERE courses_modules_assigned.course_id="+course.id
            
            let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
            course = course.toJSON()
            course['modules'] = queryData
            allCourse.push(course)
          })
      )

      let sorted = allCourse.sort(function(a, b) { 
        return a.id - b.id;
      });
      
      return sorted

    }else{
      return []
    }
    
  },
  courseLocations: async function () {
    let allCourse = []
    let course_details_data= await course_details.findAll();


    if(course_details_data.length){
        await Promise.all(
          course_details_data.map( async function(course){
            let queryStr = "SELECT course_details.id , teaching_location_details.name location_name FROM `course_details` JOIN course_location ON course_details.id= course_location.course_id JOIN teaching_location_details ON course_location.teaching_location_id = teaching_location_details.unique_id WHERE course_details.id ="+course.id
            
            let queryData = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.SELECT });
            course = course.toJSON()
            course['locations'] = queryData
            allCourse.push(course)
          })
      )
      
      return allCourse
    }else{
      return []
    }
    
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
  updateModuleData: async function (data, where) {
    let moduleAssigned = await modules_users_assigned.findOne({where:where})
    await moduleAssigned.update(data)
  },
  addPinnedModule: async function (blockId, updateObj) {
    let query  = "SELECT courses_modules_assigned.module_id FROM `courses_blocks_assigned` JOIN courses_modules_assigned on courses_blocks_assigned.course_id = courses_modules_assigned.course_id JOIN module_details on module_details.module_id = courses_modules_assigned.module_id WHERE teaching_block_id = "+blockId+" AND module_details.module_type = 'pinned';"

    let allModules = await sequelize.query(query,{ type: Sequelize.QueryTypes.SELECT });

    await Promise.all(
      allModules.map(async function(module){
          let queryStr  = "Update modules_users_assigned SET block_moderation_start_date='"+updateObj.block_moderation_start_date+"', block_moderation_end_date='"+updateObj.block_moderation_end_date+"' WHERE module_id="+module.module_id
            console.log(queryStr, "<< queryStr")
            let allModules = await sequelize.query(queryStr,{ type: Sequelize.QueryTypes.UPDATE });
      })
    )
    
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
     
    if(para.module_date_enabled && para.module_date_enabled == 'true'){
      para['module_date_enabled']    = 1
      para['teaching_block_enabled'] = 0
    }else if(para.module_date_enabled && para.module_date_enabled == 'false'){
      para['module_date_enabled']    = 0
    }

    if(para.teaching_block_enabled && para.teaching_block_enabled == 'true'){
      para['module_date_enabled']    = 0
      para['teaching_block_enabled'] = 1
    }else if(para.teaching_block_enabled && para.teaching_block_enabled == 'false'){
      para['teaching_block_enabled'] = 0
    }

    if(para.disable_user_registration){
      para['disable_user_registration'] = 1
    }else{
      para['disable_user_registration'] = 0
    }

    const ipAddressData = await ipAddress.update(para);
    
    return ipAddressData.toJSON();
    
    
  },
  updateClientDetail: async function (para) {
     const ipAddress = await client_details.findOne();
    const ipAddressData = await ipAddress.update(para);
    
    return ipAddressData.toJSON();
    
    
  },
   updatePagetext: async function (para) {
     const ipAddress = await settings_table.findOne();
    const ipAddressData = await ipAddress.update(para);
    
    return ipAddressData.toJSON();
    
    
  },
  updateRunningStatus: async function (date) {
     const settingsTable = await settings_table.findOne();
     await settingsTable.update({block_cron_running: date});
    
  },
  linkModule: async function (para) {
     
    await teaching_block_periods.create(para);
    
    
  },
  unlinkModule: async function (module_id,teaching_block_period_id,teaching_block_id) {
     
    if(await teaching_block_intakes.destroy({where:{module_id:module_id,teaching_block_period_id:teaching_block_period_id,teaching_block_id:teaching_block_id}})){
      return {'status':'success'};
    }
    
    
  },
  listCourse: async function () {
     let blockQuery  = "SELECT * FROM course_details"
    let allCourse = await sequelize.query(blockQuery,{ type: Sequelize.QueryTypes.SELECT });

    return allCourse;
    
  },
  listCourseRelatedData: async function (id) {
     let blockQuery  = "SELECT course_details.*,teaching_block_blocks.name as block_name,teaching_block_blocks.tb_start_date_time,teaching_block_blocks.tb_end_date_time FROM course_details join courses_blocks_assigned on course_details.id=courses_blocks_assigned.course_id join teaching_block_blocks on teaching_block_blocks.teaching_block_id =courses_blocks_assigned.teaching_block_id where teaching_block_blocks.tb_end_date_time >NOW() and course_details.id="+id+"limit 2; "
    let allCourse = await sequelize.query(blockQuery,{ type: Sequelize.QueryTypes.SELECT });

    return allCourse;
    
  },
  listblockData: async function (id) {
    let release = ['Module Release Date']
    let submission = ['Submission Date']
    let pinned=[ 'Pinned Modules']
    let blockList=[]
    let intakeModule=[]
    
    let columns = [{ type:'html', readOnly:true, width:200, title:'Intake' }]
    let blockQuery  = "SELECT course_details.*,teaching_block_blocks.name as block_name,teaching_block_blocks.teaching_block_id as block_id, teaching_block_blocks.tb_start_date_time,teaching_block_blocks.tb_end_date_time FROM course_details join courses_blocks_assigned on course_details.id=courses_blocks_assigned.course_id join teaching_block_blocks on teaching_block_blocks.teaching_block_id =courses_blocks_assigned.teaching_block_id  where  course_details.id="+id

    let allBlocks = await sequelize.query(blockQuery,{ type: Sequelize.QueryTypes.SELECT });
    let moduleQuery="SELECT module_details.* from module_details JOIN courses_modules_assigned on courses_modules_assigned.module_id=module_details.module_id where courses_modules_assigned.course_id= "+id+" AND module_details.module_type='pinned'";
      let allModule = await sequelize.query(moduleQuery,{ type: Sequelize.QueryTypes.SELECT });

      //get all intake
      let intakeQuery="SELECT * from teaching_block_intake_description";
      let allIntake = await sequelize.query(intakeQuery,{ type: Sequelize.QueryTypes.SELECT });

      //get inake moudule 
      let intakeModuleQuery="SELECT module_details.module_name, module_details.module_code,module_details.module_id, module_details.module_type, teaching_block_intakes.teaching_block_period_id, teaching_block_intakes.teaching_block_id FROM teaching_block_intakes JOIN module_details ON module_details.module_id = teaching_block_intakes.module_id;";
      let allIntakeModule = await sequelize.query(intakeModuleQuery,{ type: Sequelize.QueryTypes.SELECT });

      //console.log(allIntakeModule,'<< allIntakeModule');

    let moduleStr = ''
      await Promise.all(
        allModule.map(function(module){
          //console.log(module, "<<< count")
          moduleStr += '<div class="alert pinned_color" role="alert">   '+module.module_code+' - '+module.module_name+' (pinned)</div>'
      })
    )
    
    

    //console.log(intakeobj, "<<< intakeobj")
    await Promise.all(
      allBlocks.map(function(block){
        let temp = { type:'html',readOnly:true, width:600, title: block.block_name}
        let course_id=block.id;
        
        release.push(DateTime.fromISO(block.tb_start_date_time.toISOString().replace('Z','')).toFormat('yyyy-MM-dd HH:mm:ss'))
        submission.push(DateTime.fromISO(block.tb_end_date_time.toISOString().replace('Z','')).toFormat('yyyy-MM-dd HH:mm:ss'))
        columns.push(temp)
        pinned.push(moduleStr);
        blockList.push(block.block_id)
      })

    )

    let blockobj = {}
    await Promise.all(
        allIntakeModule.map(function(intakemodule){
          
          if(!blockobj[intakemodule.teaching_block_period_id+","+intakemodule.teaching_block_id])
              blockobj[intakemodule.teaching_block_period_id+","+intakemodule.teaching_block_id] = ''

          let color = ''
          let type = ''
          if(intakemodule.module_type == 'pinned'){
            color = 'pinned_color'
            type = ' (pinned)'
          }else if(intakemodule.module_type == 'core'){
            color = 'core_color'
            type = ' (core)'
          }else{
            color = 'elective_color'
            type = ' (elective)'
          }
          blockobj[intakemodule.teaching_block_period_id+","+intakemodule.teaching_block_id] += '<div class="alert '+color+'" role="alert">'+intakemodule.module_code+' - '+intakemodule.module_name+type+'<span class="material-symbols-outlined deleteDynamicModule" module-id="'+intakemodule.module_id+'" intake-id="'+intakemodule.teaching_block_period_id+'" block_id="'+intakemodule.teaching_block_id+'" data-toggle="modal"  style="cursor: pointer;">close</span></div>'

      })
    )

    let intagelikeData = []
    let intagelikeDataArrayObj = {}
    await Promise.all(

      allIntake.map(async function(intakeData, intakeIndex){
        
        if(!intagelikeDataArrayObj[intakeData.teaching_block_period_id])
            intagelikeDataArrayObj[intakeData.teaching_block_period_id] = []

        await blockList.map(function(blockId, blockIndex){
          
          if(!blockobj[intakeData.teaching_block_period_id+","+blockId]){
           
            intagelikeDataArrayObj[intakeData.teaching_block_period_id].push('<span class="material-symbols-outlined addDynamicModule" block-id="'+blockId+'" intake-id="'+intakeData.teaching_block_period_id+'" data-toggle="modal" data-target="#addModuleModal" style="cursor: pointer;">add</span>')
          }else{
            
            intagelikeDataArrayObj[intakeData.teaching_block_period_id].push(blockobj[intakeData.teaching_block_period_id+","+blockId]+'<span class="material-symbols-outlined addDynamicModule" block-id="'+blockId+'" intake-id="'+intakeData.teaching_block_period_id+'" data-toggle="modal" data-target="#addModuleModal" style="cursor: pointer;">add</span>')
          }
        })
        
      })
    )
    
    return {columns, release, submission,pinned, allIntake,blockList, intagelikeDataArrayObj};
    
  }

};
module.exports = User_idpdetail;
