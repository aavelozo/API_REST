const { ClientsController } = require("./clients/ClientsController");
const { CollaboratorsController } = require("./collaborators/CollaboratosController");
const { ItemsController } = require("./items/ItemsController");
const { OrdersController } = require("./orders/OrdersController");
const { OrdersXItemsController } = require("./orders/OrdersXItemsController");

/**
 * Class controller to handle registers module
 * @author Alencar
 * @created 2023-25-08
 */
class RegistersController {

    
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
                case "collaborators":
                    await CollaboratorsController.processPostAsRoute(req,res,next,route,arrRoute,level);
                    break;
                case "clients":
                    await ClientsController.processPostAsRoute(req,res,next,route,arrRoute,level);
                    break;
                case "items":
                    await ItemsController.processPostAsRoute(req,res,next,route,arrRoute,level);
                    break;
                case "orders":
                    await OrdersController.processPostAsRoute(req,res,next,route,arrRoute,level);
                    break;
                case "ordersxitems":
                    await OrdersXItemsController.processPostAsRoute(req,res,next,route,arrRoute,level);
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

module.exports = {RegistersController}