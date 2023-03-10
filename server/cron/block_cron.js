const user_idpdetailDal=require("../../Dal/user_idpdetails");
const user_idpdetailBal=require("../../Bal/user_idpdetails");

const { DateTime } = require("luxon");
const { Clients, Orders, Services, System } = require("whmcs-js");
const whmcsConfig = require("../config/whmcs");

let updateDatesInModule = async function  () {
  let start     = DateTime.now().toFormat('yyyy-MM-dd HH:mm:00');
  let end       = DateTime.now().toFormat('yyyy-MM-dd HH:mm:59');
  let dueQuery  = "SELECT teaching_block_intakes.teaching_block_id, teaching_block_blocks.tb_start_date_time, teaching_block_blocks.tb_end_date_time, teaching_block_intakes.module_id, modules_users_assigned.user_id , modules_users_assigned.block_is_extended, modules_users_assigned.is_block_resit_enabled from teaching_block_blocks join teaching_block_intakes ON teaching_block_blocks.teaching_block_id=teaching_block_intakes.teaching_block_id JOIN modules_users_assigned ON modules_users_assigned.module_id = teaching_block_intakes.module_id WHERE teaching_block_blocks.tb_end_date_time BETWEEN '"+start+"' and '"+end+"' GROUP by teaching_block_intakes.teaching_block_id,teaching_block_intakes.module_id, modules_users_assigned.user_id, modules_users_assigned.block_is_extended, modules_users_assigned.is_block_resit_enabled"
  let setQuery  = "SELECT * FROM settings_table"
  

  let dueDates  = await user_idpdetailDal.runRawQuery(dueQuery);
  let setting   = await user_idpdetailDal.runRawQuery(setQuery);
  
  let extension    = setting[0].block_extension_duration
  let markDuration = setting[0].block_marking_duration
  let block_resit_duration   = setting[0].block_resit_duration
  //let is_block_resit_enabled = setting[0].is_block_resit_enabled

  let userAssignedQuery = ''
  let startDate  = ''
  let endDate    = ''
  if(dueDates.length){
      await Promise.all(
        dueDates.map(async function(moduleData){
          
          let tb_start_date_time = moduleData.tb_start_date_time.toISOString().replace('Z','');
          let tb_end_date_time = moduleData.tb_end_date_time.toISOString().replace('Z','');

          let isoDateStart = DateTime.fromISO(tb_start_date_time)
          let isoDateEnd = DateTime.fromISO(tb_end_date_time)

          if(moduleData.is_block_resit_enabled){
            startDate = isoDateStart.plus({days:block_resit_duration})
            endDate   = isoDateEnd.plus({days:block_resit_duration})
          }

          if(moduleData.block_is_extended){
            startDate = isoDateStart.plus({days:extension}).toFormat('yyyy-MM-dd HH:mm:ss')
            endDate   = isoDateEnd.plus({days:extension}).plus({days:markDuration}).toFormat('yyyy-MM-dd HH:mm:ss')
          }else{
            startDate = isoDateStart.toFormat('yyyy-MM-dd HH:mm:ss')
            endDate   = isoDateEnd.plus({days:markDuration}).toFormat('yyyy-MM-dd HH:mm:ss')
          }  
          

          let updateObj = {block_moderation_start_date: startDate, block_moderation_end_date: endDate, block_is_extended:0, is_block_resit_enabled:0 }
          let whereObj  = {user_id: moduleData.user_id, module_id: moduleData.module_id }
           //console.log(updateObj, whereObj, "<<< ")
          await user_idpdetailDal.updateModuleData(updateObj, whereObj)
          await user_idpdetailDal.addPinnedModule(moduleData.teaching_block_id, updateObj)
        })
      )
      
  }else{
    console.log('noting to update')
  }
  
}

let suspend_user = async function(){
 
  let startDate = DateTime.now().toFormat('yyyy-MM-dd HH:mm:00');
  let endDate   = DateTime.now().plus({minutes:5}).toFormat('yyyy-MM-dd HH:mm:ss');
  
  let getDueDateModule = "SELECT * FROM modules_users_assigned WHERE block_moderation_start_date BETWEEN '"+startDate+"' AND '"+endDate+"'"
  
  let userModule = await user_idpdetailDal.runRawQuery(getDueDateModule)
                   await user_idpdetailDal.updateRunningStatus(startDate)
  await Promise.all(
    userModule.map(async function(moduleAssigned){
        //console.log(moduleAssigned, "<<< suspend")
        await suspendActiveUser(moduleAssigned.user_id, 0)
    })
  )
    
}

let active_suspend_user = async function(){
  
  let startDate = DateTime.now().toFormat('yyyy-MM-dd HH:mm:00');
  let endDate   = DateTime.now().plus({minutes:5}).toFormat('yyyy-MM-dd HH:mm:ss');
  
  let getDueDateModule = "SELECT * FROM modules_users_assigned WHERE block_moderation_end_date BETWEEN '"+startDate+"' AND '"+endDate+"'"

  let userModule = await user_idpdetailDal.runRawQuery(getDueDateModule);
  
  Promise.all(
    userModule.map(async function(moduleAssigned){
                  
        let updateObj = {block_moderation_start_date: null, block_moderation_end_date: null }
        let whereObj  = {user_id: moduleAssigned.user_id, module_id: moduleAssigned.module_id }
        
        await user_idpdetailDal.updateModuleData(updateObj, whereObj)

        let activeQuery = 'UPDATE user_idpdetails SET isActive = 1 WHERE ID="'+moduleAssigned.user_id+'"'
        await user_idpdetailDal.updateRawQuery(activeQuery)
        
    }),
    
  )
    
}

let suspendActiveUser = async function (userId, status) {

user_idpdetailDal.suspendCustomUser({ID:userId,isActive:status},function (data,err) {
        if(data.message=="success"){
            //console.log(data.data.toJSON(), "<<<")
            let jsonData       = data.data.toJSON()
            let email          = jsonData.email

            const whmcsClient  = new Clients(whmcsConfig);
            const servicClient = new Services(whmcsConfig);
            const newuserpassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            
            whmcsClient.getClientsDetails({email:email}).then(function (clientResponse) {
                
                if(clientResponse.result == 'success'){

                     whmcsClient.getClientsProducts({clientid:clientResponse.userid}).then(async function (productsResponse) {
                        await Promise.all(
                            productsResponse.products.product.map( async function(service){
                                console.log(service.orderid,"<<<< service")
                                await servicClient.moduleChangePw({serviceid:service.orderid, servicepassword:newuserpassword}).then(function (changeResponse) {
                                    console.log(changeResponse, "<<< changeResponse")
                                })
                            })
                        )
                                                
                    })
                }
            })
            
        }

    })
}

let isBlockModerationEnabled = async function () {

    let blockStatusQuery = "SELECT block_module_in_moderation FROM settings_table;"

    let setting = await user_idpdetailDal.runRawQuery(blockStatusQuery);

    if(setting)
        return setting[0].block_module_in_moderation

    return false
}


module.exports = { updateDatesInModule, active_suspend_user, suspend_user, isBlockModerationEnabled};