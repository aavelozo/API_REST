'use strict';

/*imports*/
const { DataTypes, Sequelize } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');
const { Orders } = require("./Orders");
const { Clients } = require("./Clients");

/**
 * class model
 */
class OrdersXClients extends BaseTableModel {
  static #model = null;
  static fields = {
    IDORDER: {
      type: DataTypes.BIGINT.UNSIGNED,                
      allowNull: false 
    },           
    IDCLIENT: {
      type: DataTypes.BIGINT.UNSIGNED,                
      allowNull: false 
    },
    ISPAYER: {
      type: DataTypes.INTEGER(1),                
      allowNull: false,
      defaultValue: 0
    },
    QTCLIENTS: { //to use with anonymous client
      type: DataTypes.BIGINT.UNSIGNED
    }
  };
  
  static uniqueFields = [
    'IDORDER',
    'IDCLIENT',
    'ISPAYER'
  ];

  static constraints = [{
    name: OrdersXClients.name.toUpperCase() + '_U1',
    fields: OrdersXClients.uniqueFields,
    type:"unique"
  },{
    name: OrdersXClients.name.toUpperCase() + '_C1',
    fields: ['ISPAYER'],
    type:"check",
    where:{
      ISPAYER: {
          [Sequelize.Op.in]: [0,1]
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
    fields: ['IDCLIENT'],
    type: 'foreign key',
    references: { 
        table: Clients,
        field: 'ID'
    },
    onUpdate: 'cascade'
  }];
  
  static getModel(pSequelize) {
    if (OrdersXClients.#model == null) {
      OrdersXClients.#model = OrdersXClients.initModel(OrdersXClients,pSequelize);
      OrdersXClients.#model.removeAttribute('id');
    }
    return OrdersXClients.#model;
  }
  
  static initAssociations() {
      OrdersXClients.associates(OrdersXClients,OrdersXClients.#model);
  }  
};

module.exports = {OrdersXClients};
 