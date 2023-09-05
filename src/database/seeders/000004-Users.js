'use strict';

const bcrypt = require("bcrypt");
const { People } = require('../models/People');
const { Users } = require('../models/Users');
const { AuthController } = require("../../controllers/auth/AuthController");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {    
    await queryInterface.bulkInsert(Users.name.toUpperCase(),[{      
      ID:Users.SYSTEM,
      IDPEOPLE: People.SYSTEM,
      EMAIL : 'system@system',
      PASSWORD : bcrypt.hashSync('system',AuthController.getCryptSalt())
    }],{
      ignoreDuplicates:true,
      updateOnDuplicate:null
    });
     
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete(Users.name.toUpperCase(), null, {});
  }
};
