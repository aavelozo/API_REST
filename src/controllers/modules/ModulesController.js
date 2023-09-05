const { RegistersController } = require("./registers/RegistersController");
const { ReportsController } = require("./reports/ReportsController");

/**
 * Class controller to handle modules module
 * @author Alencar
 * @created 2023-25-08
 */
class ModulesController {


    

    
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
                case 'registers':                    
                    await RegistersController.processPostAsRoute(req,res,next,route,arrRoute,level);                    
                    break;
                case 'reports':                    
                    await ReportsController.processPostAsRoute(req,res,next,route,arrRoute,level);                    
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

module.exports = {ModulesController}