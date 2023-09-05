'use strict';

/*imports*/
const { DataTypes, Sequelize } = require("sequelize");
const { BaseTableModel } = require('./BaseTableModel');
const { Users } = require("./Users");

/**
 * class model
 */
class Logs extends BaseTableModel {
  static #model = null;
  static fields = {
    IDUSER: {
      type: DataTypes.BIGINT.UNSIGNED,                
      allowNull: false 
    },           
    TABLENAME: {
      type: DataTypes.STRING(256),
      allowNull: false 
    },
    OPERATION: {
      type: DataTypes.STRING(1),
      allowNull: false,
    },
    FIELDS: {
      type: DataTypes.STRING(2000)
    },  
    CURRENTSVALUES: { //ON UPDATE OR DELETE, STORAGE OLD VALUES
      type: DataTypes.STRING(2000)
    },
    MOMENT: {
      type: DataTypes.DATE
    },
  };
  
  static uniqueFields = [];

  static constraints = [{
    name: Logs.name.toUpperCase() + '_C1',
    fields: ['OPERATION'],
    type:"check",
    where:{
      OPERATION: {
          [Sequelize.Op.in]: ['I','U','D'] //[I=Insert,U=Update,D=Delete]
      }
    }
  }];

  static foreignsKeys = [{
    fields: ['IDUSER'],
    type: 'foreign key',
    references: { 
        table: Users,
        field: 'ID'
    },
    onUpdate: 'cascade'
  }];

  //@override
  static getBaseTableModelInitHooks = () => {
    return {
        beforeCreate : (record, options) => {
            record.dataValues.MOMENT = Sequelize.literal('current_timestamp');
        }
    };
  } 
  
  static getModel(pSequelize) {
    if (Logs.#model == null) {
      Logs.#model = Logs.initModel(Logs,pSequelize);
      Logs.#model.removeAttribute('id');
    }
    return Logs.#model;
  }
  
  static initAssociations() {
      Logs.associates(Logs,Logs.#model);
  }  
};

module.exports = {Logs};
 