require('dotenv').config({ path: __dirname + "/../../../../../.env" });
const { Orders } = require("../../../../database/models/Orders");
const { OrdersXClients } = require("../../../../database/models/OrdersXClients");
const { OrdersXItems } = require("../../../../database/models/OrdersXItems");
const DBConnectionManager = require("../../../../database/DBConnectionManager");
const { Clients } = require("../../../../database/models/Clients");
const { Sequelize } = require("sequelize");

/**
 * Class controller to handle registers module
 * @author Alencar
 * @created 2023-25-08
 */
class OrdersController {


    /**
     * check if order can by finalized
     * @param {*} order 
     * @param {*} transaction 
     * @returns 
     * @created 2023-09-04
     * @reference RF 9
     */
    static async checkCanFinalizeOrder(order,transaction,qtpayers){
        let result = [];

        //check max payers
        if (qtpayers) {//arbitrary qtpayers
            if ((qtpayers-0) > (process.env.QT_MAX_CLI_PAY-0)) {
                result.push("quantity max of payers clients exceded");
            }
        } else { //qtpayers of database
            const { count, rows } = await OrdersXClients.getModel().findAndCountAll({
                where:{
                    IDORDER: order.ID,
                    ISPAYER : 1,
                    IDCLIENT: {
                        [Sequelize.Op.notIn]:[Clients.ANONYMOUS]
                    }
                },
                transaction:transaction,
            });  
            if (count > (process.env.QT_MAX_CLI_PAY-0)) {
                result.push("quantity max of payers clients exceded");
            } else {
                let anonymousPayers = await OrdersXClients.getModel().findOne({
                    raw:true,
                    attributes: ['QTCLIENTS'],
                    where:{
                        IDORDER: order.ID,
                        IDCLIENT: Clients.ANONYMOUS,
                        ISPAYER : 1
                    },
                    transaction:transaction,
                });  
                if (anonymousPayers && (anonymousPayers?.QTCLIENTS - 0 + count) > (process.env.QT_MAX_CLI_PAY-0)) {
                    result.push("quantity max of payers clients exceded");
                }
            }
        }

        //check items not serveds/delivereds
        let pendentItems = await OrdersXItems.getModel().findAll({
            raw:true,
            attributes:[
                Sequelize.literal('count(1) as qt')
            ],
            where:{
                IDORDER: order.ID,
                STATUS:{
                    [Sequelize.Op.notIn]: ['D','S','C']
                }
            }
        });
        if (pendentItems && pendentItems[0].qt > 0) {
            result.push(`exists ${pendentItems[0].qt} pendent(s) item(s)`);
        }

        if (result.length == 0) {
            result = true;
        }
        return result;
    }
    
    /**
     * create order
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 7
     */
    static async create(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'POST') throw new Error("method not allowed");
            let body = req.body || {};            

            //create entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
            await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {
                //create order
                let order = await Orders.getModel().create({},{transaction:t,req:req});

                //anonymous clients
                if (body?.qtanonymousclients) await OrdersXClients.getModel().create({
                    IDORDER: order.ID,
                    IDCLIENT: Clients.ANONYMOUS,
                    QTCLIENTS: body.qtanonymousclients
                },{
                    transaction:t,
                    req:req
                });

                //identified clients
                if (body?.clients) { 
                    for(let key in body.clients) {                        
                        await OrdersXClients.getModel().create({
                            IDORDER: order.ID,
                            IDITEM: body.clients[key].id,
                            ISPAYER: body.clients[key]?.ispayer || false
                        },{
                            transaction:t,
                            req:req
                        });
                    }
                }

                //items
                if (body?.items) { 
                    for(let key in body.items) {                        
                        await OrdersXItems.getModel().create({
                            IDORDER: order.ID,
                            IDITEM: body.items[key].id,
                            AMOUNT: body.items[key]?.amount || 0,
                            UNVALUE: body.items[key]?.unvalue || 0,
                        },{
                            transaction:t,
                            req:req
                        });
                    }
                }

                return res.sendResponse(200,true,'order successfull created',order.dataValues);
            });
            
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
            if (req.method.trim().toUpperCase() != 'POST') throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.id) throw new Error("missing data");

            //check if order exists
            let order = await Orders.getModel().findOne({
                where:{ID:body.id}
            });
            if (!order) throw new Error('order not found')
            else if (order.STATUS == 'C' || order.STATUS == 'F') throw new Error('order not opened');

            //update entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
            await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {
               
                
                //anonymous clients
                if (body?.qtanonymousclients) {
                    let orderXClient = await OrdersXClients.getModel().findOne({
                        where : {
                            IDORDER: order.ID,
                            IDCLIENT: Clients.ANONYMOUS
                        },
                        transaction:t,
                    });
                    if (!orderXClient) {
                        await OrdersXClients.getModel().create({
                            IDORDER: order.ID,
                            IDCLIENT: Clients.ANONYMOUS,
                            QTCLIENTS : body?.qtanonymousclients
                        },{
                            transaction:t,
                            req:req
                        });
                     } else {
                        orderXClient.QTCLIENTS = body?.qtanonymousclients;
                        await orderXClient.save({
                            transaction:t,
                            req:req
                        });
                    }
                };  
                
                //identified clients
                if (body?.clients) { 
                    for(let key in body.clients) {  
                        let orderXClient = await OrdersXClients.getModel().findOne({
                            where:{
                                IDORDER: order.ID,
                                IDCLIENT: body.clients[key].id,
                            },
                            transaction:t,
                        });                        
                        if (!orderXClient) {
                            await OrdersXClients.getModel().create({
                                IDORDER: order.ID,
                                IDCLIENT: body.clients[key].id,
                                ISPAYER: body.clients[key]?.ispayer || false
                            },{
                                transaction:t,
                                req:req
                            });
                        } else {
                            orderXClient.ISPAYER = body.clients[key]?.ispayer || false;
                            await orderXClient.save({
                                transaction:t,
                                req:req
                            });
                        }
                    }
                }

                //identified clients
                if (body?.items) { 
                    for(let key in body.items) {  
                        let orderXItem = await OrdersXItems.getModel().findOne({
                            attributes:['IDORDER','IDITEM','AMOUNT','UNVALUE','STATUS'],
                            where:{
                                IDORDER: order.ID,
                                IDITEM: body.items[key].id,
                            },
                            transaction:t,
                        });                        
                        if (!orderXItem) {
                            await OrdersXItems.getModel().create({
                                IDORDER: order.ID,
                                IDITEM: body.items[key].id,
                                AMOUNT: body.items[key]?.amount || 0,
                                UNVALUE: body.items[key]?.unvalue || 0,
                            },{
                                transaction:t,
                                req:req
                            });
                        } else {
                            orderXItem.AMOUNT = body.items[key]?.amount || 0;
                            orderXItem.UNVALUE = body.items[key]?.unvalue || 0;
                            orderXItem.STATUS = 'P';
                            await orderXItem.save({
                                transaction:t,
                                req:req
                            });
                        }
                    }
                }


                if (body?.status) {
                    order.STATUS = body.status;
                    if (order.STATUS == 'F') {
                        let canFinalize = await OrdersController.checkCanFinalizeOrder(order,t);
                        if (canFinalize !== true) 
                            throw new Error(canFinalize.join(","));                        
                    }
                }

                return res.sendResponse(200,true,'order successfull updated',order.dataValues);
            });
            
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
            if (['POST','DELETE'].indexOf(req.method.trim().toUpperCase()) == -1) throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.id) throw new Error("missing data");

            //check if order exists
            let order = await Orders.getModel().findOne({
                where:{ID:body.id}
            });
            if (!order) throw new Error('order not found')
            else if (order.STATUS == 'C' || order.STATUS == 'F') throw new Error('order not opened');
            await order.destroy({req:req});
            return res.sendResponse(200,true,'order successfull deleted',order.dataValues);
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    } 
    
    /**
     * finalize order
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 9
     */
    static async finalize(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'POST') throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.id) throw new Error("missing data");

            //check if order exists
            let order = await Orders.getModel().findOne({
                where:{ID:body.id}
            });
            if (!order) throw new Error('order not found')
            else if (order.STATUS == 'C' || order.STATUS == 'F') throw new Error('order not opened');            
            let canFinalize = await OrdersController.checkCanFinalizeOrder(order,null,body?.qtpayers || null);          
            if (canFinalize !== true) throw new Error(canFinalize.join(",")); 
            order.STATUS = "F";
            await order.save({req:req});

            order = order.dataValues;

            let totalValue = await OrdersXItems.getModel().findAll({
                raw:true,
                attributes:[
                    Sequelize.literal(`sum(coalesce(${OrdersXItems.name.toUpperCase()}.AMOUNT,0) * coalesce(${OrdersXItems.name.toUpperCase()}.UNVALUE,0)) as total`)
                ],
                where:{
                    IDORDER : order.ID
                }
            });

            console.log(totalValue);
            order.TOTAL = totalValue[0].total;


            if (body?.qtpayers) {
                order.QTCLIENTSPAYERS = body.qtpayers;
            } else {
                let qtClients = await OrdersXClients.getModel().findAll({
                    raw:true,
                    attributes:[
                        Sequelize.literal(`count(case when IDCLIENT = ${Clients.ANONYMOUS} then null else 1 end) + sum(case when IDCLIENT = ${Clients.ANONYMOUS} then coalesce(qtclients,0) else 0 end) as qtClients`)
                    ],
                    where:{
                        IDORDER : order.ID,
                        ISPAYER : 1
                    }
                });
                console.log(qtClients);
                order.QTCLIENTSPAYERS = qtClients[0].qtClients;
            }
            
            if (order.QTCLIENTSPAYERS > 0) {
                order.VALUEBYCLIENT = order.TOTAL / order.QTCLIENTSPAYERS;
            }

            return res.sendResponse(200,true,'order successfull finalized',order);
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
                    await OrdersController.create(req,res,next);
                    break;
                case "update":
                    await OrdersController.update(req,res,next);
                    break;
                case "delete":
                    await OrdersController.delete(req,res,next);
                    break;
                case "finalize":
                    await OrdersController.finalize(req,res,next);
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

module.exports = {OrdersController}