'use strict';

const { Clients } = require('../models/Clients');
const { People } = require('../models/People');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {    
    await queryInterface.bulkInsert(Clients.name.toUpperCase(),[{      
      ID:Clients.ANONYMOUS,
      IDPEOPLE: People.ANONYMOUS
    }],{
      ignoreDuplicates:true,
      updateOnDuplicate:null
    });
     
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete(Clients.name.toUpperCase(), null, {});
  }
};
