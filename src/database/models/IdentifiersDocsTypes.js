'use strict';

/*imports*/
const { DataTypes } = require("sequelize");
const { BaseTableModel } = require("./BaseTableModel");


/**
 * class model
 */
class IdentifiersDocsTypes extends BaseTableModel {
  static #model = null;
  static CNPJ = 1;
  static CPF = 2;
  
  static fields = {
    ID: {
        type: DataTypes.BIGINT.UNSIGNED,                
        autoIncrement: true,
        primaryKey: true,               
        allowNull: false 
    },
    NAME: {
        type: DataTypes.STRING(256),
        allowNull: false
    }
  };
  
  static uniqueFields = [
    'NAME'
  ];

  static constraints = [{
      name: IdentifiersDocsTypes.name.toUpperCase() + '_U1',
      fields: IdentifiersDocsTypes.uniqueFields,
      type:"unique"
  }];

  static foreignsKeys = [];
  
  static getModel(pSequelize) {
    if (IdentifiersDocsTypes.#model == null) {
      IdentifiersDocsTypes.#model = IdentifiersDocsTypes.initModel(IdentifiersDocsTypes,pSequelize);
    }
    return IdentifiersDocsTypes.#model;
  }
  
  static initAssociations() {
      IdentifiersDocsTypes.associates(IdentifiersDocsTypes,IdentifiersDocsTypes.#model);
  }

};


module.exports = {IdentifiersDocsTypes};
 