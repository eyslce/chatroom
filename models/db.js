var Sequelize = require('sequelize');
var config = require('../config.json');

var db = {};
var sequelize = new Sequelize(config.connString);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;