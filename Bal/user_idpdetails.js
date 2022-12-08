var user_idpdetailDal=require("../Dal/user_idpdetails");
var User_idpdetailBal = {
    getTopLogins:function (callback) {
        user_idpdetailDal.getTopLogins(function (data,err) {
            callback(data);
        })
    },
    getAllLogins:function (callback) {
        user_idpdetailDal.getAllLogins(function (data,err) {
            callback(data);
        })
    },
    getUserBySessionId:function (id,callback) {
        user_idpdetailDal.getUserBySessionId(id,function (data,err) {
            callback(data);
        })
    },
    getUserByEmail:function (email,callback) {
        user_idpdetailDal.getUserByEmail(email,function (data,err) {
            callback(data);
        })
    },
    getAllUsers:function (callback) {
        user_idpdetailDal.getAllUsers(function (data,err) {
            callback(data);
        })
    },
    suspendUser:function (id,callback) {
        user_idpdetailDal.suspendUser(id,function (data,err) {
            callback(data);
        })
    },
    getUserLoginCount:function (callback) {
        user_idpdetailDal.getUserLoginCount(function (data,err) {
            callback(data);
        })
    },
    getUserIdpDetailByEmail:function (email,callback) {
        user_idpdetailDal.getUserIdpDetailByEmail(email,function (data,err) {
            callback(data);
        })
    },
    getModules:function (id,callback) {
        user_idpdetailDal.getModules(id,function (data,err) {
            callback(data);
        })
    },
    addUser_IdpDetail:function (para,callback) {
        user_idpdetailDal.addUser_IdpDetail(para,function (data,err) {
            callback(data);
        })
    },
    updateUser_IdpDetail:function (body,callback) {
        user_idpdetailDal.updateUser_IdpDetail(body,function (data,err) {
            callback(data);
        })
    },
    addUserByCsv:function (body,callback) {
        user_idpdetailDal.addUserByCsv(body,function (data,err) {
            callback(data);
        })
    },
    AddModulesUser:async function (body,callback) {
        let data = await user_idpdetailDal.AddModulesUser();
        return data;
    },
    updateStaf:function (body,callback) {
        user_idpdetailDal.updateStaf(body,function (data,err) {
            callback(data);
        })
    },
    approvStaff:function (body,callback) {
        user_idpdetailDal.approvStaff(body,function (data,err) {
            callback(data);
        })
    }
    


};
module.exports = User_idpdetailBal;