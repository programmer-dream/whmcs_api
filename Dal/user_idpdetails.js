var Sequelize = require('sequelize');

var config = require('../server/config/sql');
//database connection.
var sequelize = new Sequelize(config.database, config.user, config.password,{ host: config.host,
    // data type
    dialect: config.dialect,

    pool: {
        max: config.max,
        min: config.min,
        idle: config.idle
    }, define: {
        timestamps: false
    }
});

//for model import.
var models = require('sequelize-auto-import')(sequelize, config.dirPath);
var user_idpdetails=models.user_idpdetails;
var client_details=models.client_details;
client_details.hasMany(user_idpdetails, { foreignKey: 'universityid' });
user_idpdetails.belongsTo(client_details, { foreignKey: 'universityid' });


// CRUD Array
var User_idpdetail = {
    getUserBySessionId:function (id,callback) {
        user_idpdetails.findAll({
            where:{sessionid:id},
            include:[{model:client_details,required:true}],
        }).then(function (value) {
            //returning the value here
            callback({message:"success",data:value});
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
    },
    getUserIdpDetailByEmail:function (email,callback) {
        user_idpdetails.findAll({where:{email:email}}).then(function (value) {
            callback({message:"success",data:value});
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
    },
    addUser_IdpDetail: function(para, callback) {

        const user = user_idpdetails.build({
            email: para.email,
            firstname:para.firstname,
            userid:para.userid,
            lastname: para.lastname,
            sessionid:para.sessionid,
            isStaff:0,
            expiryDate:"0000-00-00"
        });
        user.save().then(function (status) {
            callback({message:"success",data:status});
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
        //return db.query("Insert into category values(?)", [Task.Title], callback);
    },
    updateUser_IdpDetail:function (body,callback) {
        user_idpdetails.findAll({where:{email:body.email}}).then(function (itemInstance) {
            itemInstance[0].update({
                sessionid:body.sessionid,
            }).then(function (self) {
                callback({message:"success",data:self});
            });
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });



    }

};
module.exports = User_idpdetail;