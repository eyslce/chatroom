var db = require('./db.js');

var sequelize = db.sequelize;
var Sequelize = db.Sequelize;

var userAccount =sequelize.define('useraccounts',{
    id:{type:Sequelize.INTEGER,autoIncrement : true, primaryKey : true, unique : true},
    account:{type:Sequelize.STRING,allowNull:false},
    pwd:{type:Sequelize.STRING,allowNull:true},
    createdAt:{type:Sequelize.DATE,allowNull:false},
    updatedAt:{type:Sequelize.DATE,allowNull:false}
});

/*userAccount.create({account:'test',pwd:'test',createdAt:'2015-12-02 12:23:23',updatedAt:'2015-12-02 12:23:23'}).then(function(userAccout){
    console.log(userAccout.get('account'));
});*/


module.exports=userAccount;