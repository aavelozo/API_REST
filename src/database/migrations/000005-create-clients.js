'use strict';

/*imports*/
const { Clients } = require('../models/Clients');
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await Clients.runUpMigration(queryInterface,Clients);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(Clients.name.toUpperCase());
  }
};