const { Orders } = require("../../../../database/models/Orders");
const { OrdersXItems } = require("../../../../database/models/OrdersXItems");
const { Items } = require("../../../../database/models/Items");
const { Sequelize } = require("sequelize");

/**
 * Class controller to handle registers module
 * @author Alencar
 * @created 2023-25-08
 */
class OrdersXItemsController {

    
    /**
     * create order
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 8
     */
    static async create(req,res,next) {
        try {
            let body = req.body || {};            
            if (!body?.idorder || !body.iditem) throw new Error("missing data");
            let order = await Orders.getModel().findByPk(body.idorder);
            if (!order) throw new Error("order not found")
            else if (order.STATUS == 'C' || order.STATUS == 'F') throw new Error('order not opened');
            let item = await Items.getModel().findByPk(body.iditem);
            if (!item) throw new Error("item not found");
            let orderXItem = await OrdersXItems.getModel().findOne({
                attributes:['IDORDER','IDITEM','AMOUNT','UNVALUE'],
                where:{
                    IDORDER: order.ID,
                    IDITEM: item.ID,
                    STATUS: {
                        [Sequelize.Op.notIn]: ['C']
                    }
                }
            });
            if (orderXItem) throw new Error("item already exists in this order");
            orderXItem = await OrdersXItems.getModel().create({
                IDORDER: order.ID,
                IDITEM: item.ID,
                AMOUNT: body?.amount || 0,
                UNVALUE : body?.unvalue || 0
            },{
                req:req
            });
            
            return res.sendResponse(200,true,'item successfull created',orderXItem.dataValues);
            
        } catch (e) {
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * update order
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     */
    static async update(req,res,next) {
        try {
            let body = req.body || {};            
            if (!body?.idorder || !body.iditem) throw new Error("missing data");
            let order = await Orders.getModel().findByPk(body.idorder);
            if (!order) throw new Error("order not found")
            else if (order.STATUS == 'C' || order.STATUS == 'F') throw new Error('order not opened');
            let item = await Items.getModel().findByPk(body.iditem);
            if (!item) throw new Error("item not found");
            let orderXItem = await OrdersXItems.getModel().findOne({
                attributes:['IDORDER','IDITEM','AMOUNT','UNVALUE','STATUS'],
                where:{
                    IDORDER: order.ID,
                    IDITEM: item.ID,
                    STATUS: {
                        [Sequelize.Op.notIn]: ['C']
                    }
                }
            });
            if (!orderXItem) throw new Error("item not exists in this order");
            orderXItem.AMOUNT = body?.amount || 0;
            orderXItem.UNVALUE = body?.unvalue || 0;
            orderXItem.STATUS = body?.status || orderXItem.STATUS;
            await orderXItem.save({
                req:req
            });
            
            return res.sendResponse(200,true,'item successfull updated',orderXItem.dataValues);
            
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * delete order
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     */
    static async delete(req,res,next) {
        try {
            let body = req.body || {};            
            if (!body?.idorder || !body.iditem) throw new Error("missing data");
            let order = await Orders.getModel().findByPk(body.idorder);
            if (!order) throw new Error("order not found")
            else if (order.STATUS == 'C' || order.STATUS == 'F') throw new Error('order not opened');
            let item = await Items.getModel().findByPk(body.iditem);
            if (!item) throw new Error("item not found");
            let orderXItem = await OrdersXItems.getModel().findOne({
                attributes:['IDORDER','IDITEM','AMOUNT','UNVALUE'],
                where:{
                    IDORDER: order.ID,
                    IDITEM: item.ID
                }
            });
            if (!orderXItem) throw new Error("item not exists in this order");            
            await orderXItem.destroy({
                req:req
            });
            
            return res.sendResponse(200,true,'item successfull deleted',orderXItem.dataValues);
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }    


    /**
     * Get list of items for production
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @reference RF 10
     */
    static async getItemsForProduction(req,res,next) {
        try {
            let result = await OrdersXItems.getModel().findAll({
                raw:true,
                attributes:['IDORDER','IDITEM','AMOUNT','STATUS'],
                include:[{
                    model:Orders.getModel(),
                    attributes:[],
                    on:{
                        [Sequelize.Op.and]:[
                            Sequelize.where(
                                Sequelize.col(`${Orders.name.toUpperCase()}.ID`),
                                '=',
                                Sequelize.col(`${OrdersXItems.name.toUpperCase()}.IDORDER`)
                            ),                            
                        ],
                        STATUS:{
                            [Sequelize.Op.notIn]:['C','F']
                        },
                    }
                }],
                where:{
                    STATUS:'P'
                }   
            });
            res.sendResponse(200,true,null,result);
        } catch (e) {
            res.sendResponse(404,false,e.message || e,null,e);
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
                    await OrdersXItemsController.create(req,res,next);
                    break;
                case "update":
                    await OrdersXItemsController.update(req,res,next);
                    break;
                case "delete":
                    await OrdersXItemsController.delete(req,res,next);
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

module.exports = {OrdersXItemsController}