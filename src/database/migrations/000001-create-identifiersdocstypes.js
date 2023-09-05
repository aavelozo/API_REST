'use strict';

/*imports*/
const { IdentifiersDocsTypes } = require('../models/IdentifiersDocsTypes');
/** @type {import('sequelize-cli').Migration} */

/*migration*/
module.exports = {
  async up(queryInterface, Sequelize) {
    await IdentifiersDocsTypes.runUpMigration(queryInterface,IdentifiersDocsTypes);                     
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(IdentifiersDocsTypes.name.toUpperCase());
  }
};