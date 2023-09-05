'use strict';

const { Items } = require('../models/Items');

/*imports*/
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await Items.runUpMigration(queryInterface,Items);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(Items.name.toUpperCase());
  }
};