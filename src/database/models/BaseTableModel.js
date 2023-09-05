/*imports*/
require('dotenv').config({ path: __dirname + "/../../../.env" });
const { Sequelize,Model,DataTypes } = require("sequelize");
const configDB  = require("../../database/config/config");
const { Utils } = require('../../controllers/utils/Utils');
const DBConnectionManager = require('../DBConnectionManager');


/**
 * base class model
 */
class BaseTableModel extends Model { 
    
    static schema = configDB[process.env.NODE_ENV].database;  
    

    /**
     * hooks for use in models
     * @returns 
     */
    static getBaseTableModelInitHooks = () => {
        const { Logs } = require('./Logs');
        const { Users } = require('./Users');
        return {
            afterCreate : (record, options) => {
                Logs.getModel().create({
                    IDUSER: options?.req?.user?.ID || Users.SYSTEM,
                    TABLENAME: record.constructor.name,
                    OPERATION: 'I',
                    MOMENT: Sequelize.literal('current_timestamp')
                });
            },
            afterUpdate : (record, options) => {
                console.log(record,record._changed,);
                Logs.getModel().create({
                    IDUSER: options?.req?.user?.ID || Users.SYSTEM,
                    TABLENAME: record.constructor.name,
                    OPERATION: 'U',
                    FIELDS: record.changed().join(','),
                    CURRENTSVALUES: JSON.stringify(record._previousDataValues),
                    MOMENT: Sequelize.literal('current_timestamp')
                });
            },
            afterDestroy : (record, options) => {
                console.log(record);
                Logs.getModel().create({
                    IDUSER: options?.req?.user?.ID || Users.SYSTEM,
                    TABLENAME: record.constructor.name,
                    OPERATION: 'D',
                    CURRENTSVALUES: JSON.stringify(record._previousDataValues),
                    MOMENT: Sequelize.literal('current_timestamp')
                });
            }
        };
    }

    /**
     * migrate constraints of model
     * @param {*} queryInterface 
     * @param {*} pClassModel 
     */
    static migrateConstraints = async (queryInterface,pClassModel) => {
        if (pClassModel.constraints && (pClassModel.constraints||[]).length > 0) {
            for(let i in pClassModel.constraints) {
                if (!pClassModel.constraints[i].name) {
                    pClassModel.constraints[i].name = pClassModel.name.toUpperCase() + '_C' + i;
                }
                console.log(' add constraint',pClassModel.name.toUpperCase(), pClassModel.constraints[i]);
                await queryInterface.addConstraint(pClassModel.name.toUpperCase(), pClassModel.constraints[i]);
            }
        }
    }

    /**
     * migrate foreign keys of model
     * @param {*} queryInterface 
     * @param {*} pClassModel 
     * @param {*} pClassModelRef 
     */
    static migrateForeignKeyContraint = async (queryInterface, pClassModel, pClassModelRef) => {
        for(let i in (pClassModel.foreignsKeys || [])) {
            let foreignKey = {};
            for(let key in pClassModel.foreignsKeys[i]) {
                if (key.trim().toLowerCase() != 'references') {
                    foreignKey[key] = pClassModel.foreignsKeys[i][key];
                } else {
                    foreignKey[key] = {};
                    foreignKey[key].field = pClassModel.foreignsKeys[i][key].field;
                    if (typeof pClassModel.foreignsKeys[i][key].table == 'string') {
                        foreignKey[key].table = pClassModel.foreignsKeys[i][key].table.toUpperCase();
                    } else {
                        foreignKey[key].table = pClassModel.foreignsKeys[i][key].table.name.toUpperCase();
                    }
                }
            }
            foreignKey.references.table = foreignKey.references.table.split('.');
            foreignKey.references.table = foreignKey.references.table[1] || foreignKey.references.table[0];
            if (!pClassModelRef || (foreignKey.references.table.trim().toUpperCase() == pClassModelRef.name.toUpperCase().trim())) {
                if (!foreignKey.name) {
                    foreignKey.name = pClassModel.name.toUpperCase() + '_FK' + i;
                }
                console.log(' add constraint',pClassModel.name.toUpperCase(), foreignKey);
                await queryInterface.addConstraint(pClassModel.name.toUpperCase(), foreignKey);                
            }
        }
    }

    
    /**
     * generic method to run up migrations
     * @param {*} queryInterface 
     * @param {*} pClassModel 
     * @param {*} options 
     */
    static runUpMigration = async (queryInterface, pClassModel, options) => {
        options = options || {};
        console.log('creating table',pClassModel.name.toUpperCase(), Object.keys(pClassModel.fields));
        await queryInterface.createTable(pClassModel.name.toUpperCase(), pClassModel.fields);
        await pClassModel.migrateConstraints(queryInterface,pClassModel);    
        if (Object.keys(options).indexOf('migrateForeignKeyContraint') == -1) options.migrateForeignKeyContraint = true;
        if (options.migrateForeignKeyContraint == true) {
            await pClassModel.migrateForeignKeyContraint(queryInterface,pClassModel);              
        }
    }

    /**
     * required for sequelize queries
     * @param {*} pClassModel 
     * @param {*} pModel 
     */
    static associates = (pClassModel,pModel) => {
        try {
            for(let i in (pClassModel.foreignsKeys || [])) {
                console.log(' associating',pClassModel.name.toUpperCase(),i,pClassModel.foreignsKeys[i]);

                let tableRefClassModel = pClassModel.foreignsKeys[i].references.table; //for re-declare if necessary
                if (typeof tableRefClassModel == 'string') {

                    //require.cache is case sensitive, avoid reload cached model
                    let path = require.resolve('./'+tableRefClassModel).toLowerCase();
                    let ind = Object.keys(require.cache).join(',').toLowerCase().split(',').indexOf(path);
                    console.log('loading module dinamic',path,ind);
                    if (ind > -1) {
                        tableRefClassModel = require.cache[Object.keys(require.cache)[ind]].exports[Utils.getKey(require.cache[Object.keys(require.cache)[ind]].exports,tableRefClassModel)];
                    } else {
                        let tempp = require('./'+tableRefClassModel);
                        tableRefClassModel = tempp[Utils.getKey(tempp,tableRefClassModel)]
                    }
                }        
                let model = null;
                let columnForeign = pClassModel.foreignsKeys[i].fields.join(',');
                let sourceParams = {
                    foreignKey : pClassModel.foreignsKeys[i].references.field,
                    sourceKey : columnForeign
                };
                let targetParams = {
                    foreignKey : columnForeign
                };
                if (tableRefClassModel.name.toUpperCase().trim() == pModel.tableName.trim().toUpperCase()) {
                    model = pModel;
                } else {
                    model = tableRefClassModel.getModel();
                }                
                sourceParams.targetKey = pClassModel.foreignsKeys[i].references.field;
                model.hasMany(pModel,targetParams);
                pModel.belongsTo(model,sourceParams);               
            }            
        } catch(e) {
            console.log(' error ',e);
        } 
    }

    static initModel(pClassModel,pSequelize) {
        console.log('Initializing model ',pClassModel.name);
        pSequelize = pSequelize || DBConnectionManager.getDefaultDBConnection();  
        let model = pClassModel.init(pClassModel.fields,{
            sequelize: pSequelize,
            underscore:false,
            freezeTableName:true,
            modelName:pClassModel.name.toUpperCase(),
            tableName:pClassModel.name.toUpperCase(),
            name:{
                singular:pClassModel.name.toUpperCase(),
                plural:pClassModel.name.toUpperCase()
            },
            timestamps:false,
            primaryKeyAttribute:false,
            id:false,
            _id:false,
            hooks: pClassModel.getBaseTableModelInitHooks()
        });
        console.log(' successfull initied model ',pClassModel.name);
        return model;
    }
};

module.exports = {BaseTableModel};
