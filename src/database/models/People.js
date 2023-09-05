'use strict';

/*imports*/
const { DataTypes } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');
const { IdentifiersDocsTypes } = require("./IdentifiersDocsTypes");

/**
 * class model
 */
class People extends BaseTableModel {
  static #model = null;

  static SYSTEM = 1;
  static ANONYMOUS = 2; //to use as clients anonimous

  static fields = {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,                
      autoIncrement: true,
      primaryKey: true,               
      allowNull: false 
    },
    IDIDENTIFIERDOCTYPE: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    IDENTIFIERDOC: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    NAME: {
      type: DataTypes.STRING(2000),
      allowNull: false
    }    
  };
  
  static uniqueFields = [
    'IDIDENTIFIERDOCTYPE',
    'IDENTIFIERDOC'
  ];

  static constraints = [{
    name: People.name.toUpperCase() + '_U1',
    fields: People.uniqueFields,
    type:"unique"
  }];

  static foreignsKeys = [{
    fields: ['IDIDENTIFIERDOCTYPE'],
    type: 'foreign key',
    references: { 
        table: IdentifiersDocsTypes,
        field: 'ID'
    },
    onUpdate: 'cascade'
  }];
  
  static getModel(pSequelize) {
    if (People.#model == null) {
      People.#model = People.initModel(People,pSequelize);
    }
    return People.#model;
  }
  
  static initAssociations() {
      People.associates(People,People.#model);
  }
  
};

module.exports = {People};
 