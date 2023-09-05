'use strict';

/*imports*/
const { People } = require('../models/People');
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await People.runUpMigration(queryInterface,People);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(People.name.toUpperCase());
  }
};