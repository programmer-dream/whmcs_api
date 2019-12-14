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
var loginhistory=models.loginhistory;
var client_availablemodules=models.client_availablemodules;
client_details.hasMany(user_idpdetails, { foreignKey: 'universityid' });
user_idpdetails.belongsTo(client_details, { foreignKey: 'universityid' });
loginhistory.belongsTo(user_idpdetails, { foreignKey: 'userid' });

// CRUD Array
var User_idpdetail = {
    getTopLogins:function (callback) {
        user_idpdetails.findAll({
            limit: 10 ,
            order: [[Sequelize.col("logins"),'DESC']],

        }).then(function (data) {
            callback({message:"success",data:data})
        }).catch(function (err) {
            callback({message:"error",data:err})
        })

    },
    getAllLogins:function (callback) {
        user_idpdetails.findAll({
            order: [[Sequelize.col("logins"),'DESC']],

        }).then(function (data) {
            callback({message:"success",data:data})
        }).catch(function (err) {
            callback({message:"error",data:err})
        })

    },
    getAllUsers:function (callback) {
        user_idpdetails.findAll({
            attributes: ['userid','email', 'firstname','lastname','isActive']

        }).then(function (data) {
            callback({message:"success",data:data})
        }).catch(function (err) {
            callback({message:"error",data:err})
        })

    },
    suspendUser:function (body,callback) {
        user_idpdetails.findAll({where:{userid:body.user}}).then(function (itemInstance) {
            itemInstance[0].update({
                isActive:body.isActive,
            }).then(function (self) {
                callback({message:"success",data:self});
            });
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });

    },
    getUserLoginCount:function (callback) {
        loginhistory.findAll().then(function (value) {
            //returning the value here
           var prev=[0,0,0,0,0,0,0,0,0,0,0,0];
            var current=[0,0,0,0,0,0,0,0,0,0,0,0];
            for(var i=0;i<value.length;i++){
                if(value[i].dataValues.date){
                    var month = (value[i].dataValues.date).getMonth();
                    var year = (value[i].dataValues.date).getFullYear();
                    var currentYear = (new Date).getFullYear();
                    var previousYear = (new Date).getFullYear()-1;
                    if(year==currentYear){
                        current[month]=current[month]+1;
                    }else if(year==previousYear){
                        prev[month]=prev[month]+1;
                    }
                }

            }

            callback({message:"success",current:current,prev:prev});
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
    },
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
    getModules:function (id,callback) {
        client_availablemodules.findAll({where:{universityid:id}}).then(function (value) {
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
            expiryDate:new Date()
        });
        user.save().then(function (status) {
            const logg = loginhistory.build({
                userid: status.dataValues.ID
            });
            logg.save().then(function (data) {
                callback({message:"success",data:status});
            }).catch(function (err1) {
                callback({message:"error",data:err1.message});
            })

        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
        //return db.query("Insert into category values(?)", [Task.Title], callback);
    },
    updateUser_IdpDetail:function (body,callback) {
        user_idpdetails.findAll({where:{email:body.email}}).then(function (itemInstance) {
            itemInstance[0].update({
                sessionid:body.sessionid,
                lastLogin:new Date(),
                logins:itemInstance[0].dataValues.logins+1
            }).then(function (self) {
                const logg = loginhistory.build({
                    userid: itemInstance[0].dataValues.ID
                });
                logg.save().then(function (data) {
                    callback({message:"success",data:data});
                }).catch(function (err1) {
                    callback({message:"error",data:err1.message});
                })
            });
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
    },
    updateStaf:function (body,callback) {
        user_idpdetails.findAll({where:{email:body.email}}).then(function (itemInstance) {
            itemInstance[0].update({
                isStaff:body.staffnumber,
            }).then(function (self) {
                callback({message:"success",data:self});
            });
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
    },
    approvStaff:function (body,callback) {
        user_idpdetails.findAll({where:{email:body.email}}).then(function (itemInstance) {
            itemInstance[0].update({
                is_approved_staff:1,
            }).then(function (self) {
                callback({message:"success",data:self});
            });
        }).catch(function (err) {
            callback({message:"error",data:err.message});
        });
    }

};
module.exports = User_idpdetail;