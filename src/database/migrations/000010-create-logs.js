'use strict';

const { Logs } = require('../models/Logs');

/*imports*/
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await Logs.runUpMigration(queryInterface,Logs);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(Logs.name.toUpperCase());
  }
};