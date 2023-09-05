'use strict';

/*imports*/
const { DataTypes } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');
const { People } = require("./People");
const { Collaborators } = require("./Collaborators");
/**
 * class model
 */
class Users extends BaseTableModel {
  static #model = null;

  static SYSTEM = 1;

  static fields = {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,                
      autoIncrement: true,
      primaryKey: true,               
      allowNull: false 
    },
    IDPEOPLE: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    IDCOLLABORATOR: {
      type: DataTypes.BIGINT.UNSIGNED
    },
    EMAIL: {
      type: DataTypes.STRING(512),
      allowNull:false
    },
    PASSWORD: {
      type: DataTypes.STRING(1000),
      allowNull:false
    }
  };
  
  static uniqueFields = [];

  static constraints = [{
    name: Users.name.toUpperCase() + '_U1',
    fields: ['IDPEOPLE'],
    type:"unique"
  },
  {
    name: Users.name.toUpperCase() + '_U2',
    fields: ['IDCOLLABORATOR'],
    type:"unique"
  },
  {
    name: Users.name.toUpperCase() + '_U3',
    fields: ['IDPEOPLE'],
    type:"unique"
  }];

  static foreignsKeys = [{
    fields: ['IDPEOPLE'],
    type: 'foreign key',
    references: { 
        table: People,
        field: 'ID'
    },
    onUpdate: 'cascade'
  },
  {
    fields: ['IDCOLLABORATOR'],
    type: 'foreign key',
    references: { 
        table: Collaborators,
        field: 'ID'
    },
    onUpdate: 'cascade'
  }];
  
  static getModel(pSequelize) {
    if (Users.#model == null) {
      Users.#model = Users.initModel(Users,pSequelize);
    }
    return Users.#model;
  }
  
  static initAssociations() {
      Users.associates(Users,Users.#model);
  }  
}

module.exports = { Users };