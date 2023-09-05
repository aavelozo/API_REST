'use strict';

/*imports*/
const { Collaborators } = require('../models/Collaborators');
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await Collaborators.runUpMigration(queryInterface,Collaborators);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(Collaborators.name.toUpperCase());
  }
};