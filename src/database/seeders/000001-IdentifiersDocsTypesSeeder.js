'use strict';

const { IdentifiersDocsTypes } = require('../models/IdentifiersDocsTypes');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {    
    await queryInterface.bulkInsert(IdentifiersDocsTypes.name.toUpperCase(),[{      
      ID:IdentifiersDocsTypes.CNPJ,
      NAME : 'CNPJ'
    },{      
      ID:IdentifiersDocsTypes.CPF,
      NAME : 'CPF'
    }],{
      ignoreDuplicates:true,
      updateOnDuplicate:null
    });
     
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete(IdentifiersDocsTypes.name.toUpperCase(), null, {});
  }
};
