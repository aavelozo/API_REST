const { Items } = require("../../../../database/models/Items");
const DBConnectionManager = require("../../../../database/DBConnectionManager");
const { OrdersXItems } = require("../../../../database/models/OrdersXItems");
const { Orders } = require("../../../../database/models/Orders");
const { Sequelize } = require("sequelize");

/**
 * Class controller to handle registers module
 * @author Alencar
 * @created 2023-25-08
 */
class ItemsController {

    
    /**
     * create item
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 5
     */
    static async create(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'POST') throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.gtin || !body.name) throw new Error("missing data");

            //check if item exists
            let item = await Items.getModel().findOne({
                raw:true,
                where:{
                    GTIN: body.gtin
                }
            });
            if (item) throw new Error('item already exists with this gtin');
            

            //create entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
            await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {
                //create item
                item = await Items.getModel().create({
                    GTIN: body.gtin,
                    NAME: body.name,
                    AMOUNT: body?.amount || 0,
                    UNVALUE: body?.unvalue || 0
                },{
                    transaction:t,
                    req:req
                });
                return res.sendResponse(200,true,'item successfull created',item.dataValues);
            });
            
        } catch (e) {
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * update item
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     */
    static async update(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'POST') throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.id) throw new Error("missing data");

            //check if item exists
            let item = await Items.getModel().findOne({
                where:{ID:body.id}
            });
            if (!item) throw new Error('item not found');

            //update entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
            await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {

                for (let key in body) {                
                    item[key.trim().toUpperCase()] = body[key];
                } 
                await item.save({req:req});
                return res.sendResponse(200,true,'item successfull updated',item.dataValues);
            });
            
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * delete item
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     */
    static async delete(req,res,next) {
        try {
            if (['POST','DELETE'].indexOf(req.method.trim().toUpperCase()) == -1) throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.id) throw new Error("missing data");

            //check if item exists
            let item = await Items.getModel().findOne({
                where:{ID:body.id}
            });
            if (!item) throw new Error('item not found');
            await item.destroy({req:req});
            return res.sendResponse(200,true,'item successfull deleted',item.dataValues);
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * update item
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 6
     */
    static async get(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'GET') throw new Error("method not allowed");
            let body = req.body || {};
            let where = {};
            if (body.id) where.ID = body.id;

            //check if item exists
            let items = await Items.getModel().findAll({
                raw:true,
                where:where
            });            
            return res.sendResponse(200,true,null,items);
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }


    /**
     * * Process route as array of levels. ex: /modules/inputs/purchases/forecast/get as ['modules','inputs','purchases','forecast','get']
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @param {*} arrRoute 
     * @param {*} level 
     * @created 2023-08-25
     */
    static processPostAsRoute = async(req,res,next,route,arrRoute,level) => {
        try {            
            level++;
            console.log(route,level,arrRoute[level]);
            switch(arrRoute[level].trim().toLowerCase()) {
                case "create":
                    await ItemsController.create(req,res,next);
                    break;
                case "update":
                    await ItemsController.update(req,res,next);
                    break;
                case "delete":
                    await ItemsController.delete(req,res,next);
                    break;
                case "get":
                    await ItemsController.get(req,res,next);
                    break;
                default:
                    throw new Error(`resource level not expected: ${arrRoute[level]} of ${route}`);
                    break;
            }
        } catch (e) {
            res.sendResponse(404,false,e.message || e,null,e);
        }
    }

}

module.exports = {ItemsController}