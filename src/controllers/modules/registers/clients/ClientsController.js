const { Sequelize } = require("sequelize");
const { Clients } = require("../../../../database/models/Clients");
const { IdentifiersDocsTypes } = require("../../../../database/models/IdentifiersDocsTypes");
const { People } = require("../../../../database/models/People");
const DBConnectionManager = require("../../../../database/DBConnectionManager");

/**
 * Class controller to handle registers module
 * @author Alencar
 * @created 2023-25-08
 */
class ClientsController {

    
    /**
     * create client
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 4
     */
    static async create(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'POST') res.sendResponse(405,false,"method not allowed")
            else {
                let body = req.body || {};
                if (!body.identifierdoc || !body.name) throw new Error("missing data");

                //check if client exists
                let client = await Clients.getModel().findOne({
                    raw:true,
                    include:[{
                        model: People.getModel(),
                        required:true,
                        attributes:[],
                        on:{
                            IDIDENTIFIERDOCTYPE : IdentifiersDocsTypes.CPF,
                            IDENTIFIERDOC : body.identifierdoc,
                            [Sequelize.Op.and]:[
                                Sequelize.where(Sequelize.col(`${Clients.name.toUpperCase()}.IDPEOPLE`),'=',Sequelize.col(`${People.name.toUpperCase()}.ID`)),                            
                            ]
                        }
                    }]
                });
                if (client) throw new Error('client already exists with this identifier document');
                let people = await People.getModel().findOne({
                    raw:true,
                    where:{
                        IDIDENTIFIERDOCTYPE : IdentifiersDocsTypes.CPF,
                        IDENTIFIERDOC : body.identifierdoc
                    }
                });

                //create entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
                await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {
                    //create people if not exists
                    if (!people) people = await People.getModel().create({
                        IDIDENTIFIERDOCTYPE: IdentifiersDocsTypes.CPF,
                        IDENTIFIERDOC : body.identifierdoc,
                        NAME: body.name
                    },{
                        transaction:t,
                        req:req
                    });

                    //create client
                    client = await Clients.getModel().create({
                        IDPEOPLE: people.ID
                    },{
                        transaction:t,
                        req:req
                    });
                    return res.sendResponse(200,true,'client successfull created',client.dataValues);
                });
            }
            
        } catch (e) {
            res.sendResponse(417,false,e.message || e,null,e);
        }
    }

    /**
     * update client
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     */
    static async update(req,res,next) {        
        try {
            if (['POST','PATCH','PUT'].indexOf(req.method.trim().toUpperCase()) == -1) res.sendResponse(405,false,"method not allowed")
            else {
                let body = req.body || {};
                if (!body.id) throw new Error("missing data");

                //check if client exists
                let client = await Clients.getModel().findOne({
                    where:{ID:body.id}
                });
                if (!client) throw new Error('client not found');

                //update entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
                await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {

                    if (body?.idpeople) {
                        let people = await People.getModel().findOne({
                            where:{
                                ID : body?.idpeople
                            }
                        });
                        //console.log(people,)
                        if (!people) throw new Error("people not found");
                        client.IDPEOPLE = body.idpeople;
                        await client.save({req:req});
                        return res.sendResponse(200,true,'client successfull updated',client.dataValues);
                    } else throw new Error('not fields to updated');
                });
            }            
        } catch (e) {
            console.log(e);
            res.sendResponse(417,false,e.message || e,null,e);
        }
    }

    /**
     * delete client
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     */
    static async delete(req,res,next) {
        try {
            if (['POST','DELETE'].indexOf(req.method.trim().toUpperCase()) == -1) res.sendResponse(405,false,"method not allowed")
            else {
                let body = req.body || {};
                if (!body.id) throw new Error("missing data");

                //check if client exists
                let client = await Clients.getModel().findOne({
                    where:{ID:body.id}
                });
                if (!client) throw new Error('client not found');
                await client.destroy({req:req});
                return res.sendResponse(200,true,'client successfull deleted',client.dataValues);
            }
        } catch (e) {
            console.log(e);
            res.sendResponse(417,false,e.message || e,null,e);
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
                    await ClientsController.create(req,res,next);
                    break;
                case "update":
                    await ClientsController.update(req,res,next);
                    break;
                case "delete":
                    await ClientsController.delete(req,res,next);
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

module.exports = {ClientsController}