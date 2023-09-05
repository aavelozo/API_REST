'use strict';

/*imports*/
const { Users } = require('../models/Users');
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await Users.runUpMigration(queryInterface,Users);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(Users.name.toUpperCase());
  }
};