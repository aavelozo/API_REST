'use strict';

/*imports*/
const { DataTypes } = require("sequelize");
const { BaseTableModel } = require("./BaseTableModel");


/**
 * class model
 */
class Items extends BaseTableModel {
  static #model = null;  

  static fields = {
    ID: {
        type: DataTypes.BIGINT.UNSIGNED,                
        autoIncrement: true,
        primaryKey: true,               
        allowNull: false 
    },
    GTIN: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    NAME: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    AMOUNT: {
      type: DataTypes.DECIMAL(32,10).UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    UNVALUE: {
        type: DataTypes.DECIMAL(32,10).UNSIGNED,
        allowNull: false,
        defaultValue: 0
    }
  };
  
  static uniqueFields = [
    'GTIN'
  ];

  static constraints = [{
      name: Items.name.toUpperCase() + '_U1',
      fields: Items.uniqueFields,
      type:"unique"
  }];

  static foreignsKeys = [];
  
  static getModel(pSequelize) {
    if (Items.#model == null) {
      Items.#model = Items.initModel(Items,pSequelize);
    }
    return Items.#model;
  }
  
  static initAssociations() {
      Items.associates(Items,Items.#model);
  }

};


module.exports = {Items};
 