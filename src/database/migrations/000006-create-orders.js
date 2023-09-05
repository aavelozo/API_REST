'use strict';

/*imports*/
const { Orders } = require('../models/Orders');
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await Orders.runUpMigration(queryInterface,Orders);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(Orders.name.toUpperCase());
  }
};