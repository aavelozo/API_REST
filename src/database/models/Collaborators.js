'use strict';

/*imports*/
const { DataTypes } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');
const { People } = require("./People");

/**
 * class model
 */
class Collaborators extends BaseTableModel {
  static #model = null;

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
    }   
  };
  
  static uniqueFields = [
    'IDPEOPLE'
  ];

  static constraints = [{
    name: Collaborators.name.toUpperCase() + '_U1',
    fields: Collaborators.uniqueFields,
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
  }];
  
  static getModel(pSequelize) {
    if (Collaborators.#model == null) {
      Collaborators.#model = Collaborators.initModel(Collaborators,pSequelize);
    }
    return Collaborators.#model;
  }
  
  static initAssociations() {
      Collaborators.associates(Collaborators,Collaborators.#model);
  }

  
  
};


module.exports = {Collaborators};
 