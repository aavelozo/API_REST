const { Sequelize } = require("sequelize");
const { Collaborators } = require("../../../../database/models/Collaborators");
const { IdentifiersDocsTypes } = require("../../../../database/models/IdentifiersDocsTypes");
const { People } = require("../../../../database/models/People");
const DBConnectionManager = require("../../../../database/DBConnectionManager");

/**
 * Class controller to handle registers module
 * @author Alencar
 * @created 2023-25-08
 */
class CollaboratorsController {

    
    /**
     * create collaborator
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-09-03
     * @reference RF 3
     */
    static async create(req,res,next) {
        try {
            if (req.method.trim().toUpperCase() != 'POST') throw new Error("method not allowed");
            let body = req.body || {};
            if (!body.identifierdoc || !body.name) throw new Error("missing data");

            //check if collaborator exists
            let collaborator = await Collaborators.getModel().findOne({
                raw:true,
                include:[{
                    model: People.getModel(),
                    required:true,
                    attributes:[],
                    on:{
                        IDIDENTIFIERDOCTYPE : IdentifiersDocsTypes.CPF,
                        IDENTIFIERDOC : body.identifierdoc,
                        [Sequelize.Op.and]:[
                            Sequelize.where(Sequelize.col(`${Collaborators.name.toUpperCase()}.IDPEOPLE`),'=',Sequelize.col(`${People.name.toUpperCase()}.ID`)),                            
                        ]
                    }
                }]
            });
            if (collaborator) throw new Error('collaborator already exists with this identifier document');
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

                //create collaborator
                collaborator = await Collaborators.getModel().create({
                    IDPEOPLE: people.ID
                },{
                    transaction:t,
                    req:req
                });
                return res.sendResponse(200,true,'collaborator successfull created',collaborator.dataValues);
            });
            
        } catch (e) {
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * update collaborator
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

            //check if collaborator exists
            let collaborator = await Collaborators.getModel().findOne({
                where:{ID:body.id}
            });
            if (!collaborator) throw new Error('collaborator not found');

            //update entities with *** TRANSACTION ***, if error, sequelize rollback automatically, else, commit automatically
            await DBConnectionManager.getDefaultDBConnection().transaction(async (t) => {

                if (body?.idpeople) {
                    let people2 = await People.getModel().findOne({
                        where:{
                            ID : body?.idpeople
                        }
                    });
                    //console.log(people2,)
                    if (!people2) throw new Error("people not found");
                    collaborator.IDPEOPLE = body.idpeople;
                    await collaborator.save({req:req});
                    return res.sendResponse(200,true,'collaborator successfull updated',collaborator.dataValues);
                } else throw new Error('not fields to updated');
            });
            
        } catch (e) {
            console.log(e);
            res.sendResponse(501,false,e.message || e,null,e);
        }
    }

    /**
     * delete collaborator
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

            //check if collaborator exists
            let collaborator = await Collaborators.getModel().findOne({
                where:{ID:body.id}
            });
            if (!collaborator) throw new Error('collaborator not found');
            await collaborator.destroy({req:req});
            return res.sendResponse(200,true,'collaborator successfull deleted',collaborator.dataValues);
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
                    await CollaboratorsController.create(req,res,next);
                    break;
                case "update":
                    await CollaboratorsController.update(req,res,next);
                    break;
                case "delete":
                    await CollaboratorsController.delete(req,res,next);
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

module.exports = {CollaboratorsController}