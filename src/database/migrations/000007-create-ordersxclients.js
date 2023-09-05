'use strict';

const { OrdersXClients } = require('../models/OrdersxClients');

/*imports*/
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await OrdersXClients.runUpMigration(queryInterface,OrdersXClients);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(OrdersXClients.name.toUpperCase());
  }
};