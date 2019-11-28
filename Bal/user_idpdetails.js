var user_idpdetailDal=require("../Dal/user_idpdetails");
var User_idpdetailBal = {
    getUserBySessionId:function (id,callback) {
        user_idpdetailDal.getUserBySessionId(id,function (data,err) {
            callback(data);
        })
    },
    getUserIdpDetailByEmail:function (email,callback) {
        user_idpdetailDal.getUserIdpDetailByEmail(email,function (data,err) {
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
    }


};
module.exports = User_idpdetailBal;