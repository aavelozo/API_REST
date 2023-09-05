'use strict';

const { OrdersXItems } = require('../models/OrdersXItems');

/*imports*/
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await OrdersXItems.runUpMigration(queryInterface,OrdersXItems);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(OrdersXItems.name.toUpperCase());
  }
};