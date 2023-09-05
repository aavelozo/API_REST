'use strict';

/*imports*/
const { DataTypes } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');

const { People } = require("./People");

/**
 * class model
 */
class Clients extends BaseTableModel {
  static #model = null;
  static ANONYMOUS = 1; //to use as anonymous clients
  static fields = {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,                
      autoIncrement: true,
      primaryKey: true,               
      allowNull: false 
    },           
    IDPEOPLE:{
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull:false
    }  
  };
  
  static uniqueFields = [
    'IDPEOPLE'
  ];

  static constraints = [{
    name: Clients.name.toUpperCase() + '_U1',
    fields: Clients.uniqueFields,
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
    if (Clients.#model == null) {
      Clients.#model = Clients.initModel(Clients,pSequelize);
    }
    return Clients.#model;
  }
  
  static initAssociations() {
      Clients.associates(Clients,Clients.#model);
  }  
};

module.exports = {Clients};
 