'use strict';

/*imports*/
const { DataTypes, Sequelize } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');

const { People } = require("./People");

/**
 * class model
 */
class Orders extends BaseTableModel {
  static #model = null;
  static fields = {
    ID: {
      type: DataTypes.BIGINT.UNSIGNED,                
      autoIncrement: true,
      primaryKey: true,               
      allowNull: false 
    },           
    STATUS:{
      type: DataTypes.STRING(1),
      allowNull:false,
      defaultValue : 'O' //Opened
    }  
  };
  
  static uniqueFields = [];

  static constraints = [{
    name: Orders.name.toUpperCase() + '_C1',
    fields: ['STATUS'],
    type:"check",
    where:{
      STATUS: {
          [Sequelize.Op.in]: ['O','C','F'] //[O=Opened, C=Canceled, F=Finalized]
      }
    }
  }];

  static foreignsKeys = [];
  
  static getModel(pSequelize) {
    if (Orders.#model == null) {
      Orders.#model = Orders.initModel(Orders,pSequelize);
    }
    return Orders.#model;
  }
  
  static initAssociations() {
      Orders.associates(Orders,Orders.#model);
  }  
};

module.exports = {Orders};
 