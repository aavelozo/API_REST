'use strict';

/*imports*/
const { DataTypes, Sequelize } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');
const { Orders } = require("./Orders");
const { Items } = require("./Items");

/**
 * class model
 */
class OrdersXItems extends BaseTableModel {
  static #model = null;
  static fields = {
    IDORDER: {
      type: DataTypes.BIGINT.UNSIGNED,                
      allowNull: false 
    },           
    IDITEM: {
      type: DataTypes.BIGINT.UNSIGNED,                
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
    },           
    STATUS:{
      type: DataTypes.STRING(1),
      allowNull:false,
      defaultValue : 'P'//Pendent
    }
  };
  
  static uniqueFields = [
    'IDORDER',
    'IDITEM',
    'UNVALUE',
    'STATUS'
  ];

  static constraints = [{
    name: OrdersXItems.name.toUpperCase() + '_U1',
    fields: OrdersXItems.uniqueFields,
    type:"unique"
  },{
    name: OrdersXItems.name.toUpperCase() + '_C1',
    fields: ['STATUS'],
    type:"check",
    where:{
      STATUS: {
          [Sequelize.Op.in]: ['P','D','S','C'] //[P=Pendent, D=Disponible to serve, S=Served, C=Canceled]
      }
    }
  }];

  static foreignsKeys = [{
    fields: ['IDORDER'],
    type: 'foreign key',
    references: { 
        table: Orders,
        field: 'ID'
    },
    onUpdate: 'cascade',
    onDelete: 'cascade'
  },{
    fields: ['IDITEM'],
    type: 'foreign key',
    references: { 
        table: Items,
        field: 'ID'
    },
    onUpdate: 'cascade'
  }];
  
  static getModel(pSequelize) {
    if (OrdersXItems.#model == null) {
      OrdersXItems.#model = OrdersXItems.initModel(OrdersXItems,pSequelize);
      OrdersXItems.#model.removeAttribute('id');
    }
    return OrdersXItems.#model;
  }
  
  static initAssociations() {
      OrdersXItems.associates(OrdersXItems,OrdersXItems.#model);
  }  
};

module.exports = {OrdersXItems};
 