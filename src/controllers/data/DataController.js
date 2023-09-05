const { ModulesController } = require("../modules/ModulesController");

class DataController {

    /**
     * Process route as array of levels. ex: /modules/inputs/purchases/forecast/get as ['modules','inputs','purchases','forecast','get']
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @created 2023-08-25
     */
    static processPostAsRoute = (req, res, next) => {
        try {
            let route = req.url;
            console.log('processing post as route ',route); 
            let arrRoute = route.split('/');
            if (arrRoute.length > 0) {
                if (arrRoute[0].trim().length == 0) {
                    arrRoute.shift();
                }
                if (arrRoute[0].trim().toLowerCase() == 'api' ) {
                    arrRoute.shift();
                }
                if (arrRoute[arrRoute.length-1].trim().length == 0) {
                    arrRoute.pop();
                }
                if (arrRoute.length > 0) {
                    console.log('processing post as route',arrRoute);
                    let level = 0;
                    switch(arrRoute[level].trim().toLowerCase()) {
                        case 'modules':
                            ModulesController.processPostAsRoute(req,res,next,route,arrRoute,level);                            
                            break;
                        default:
                            throw new Error(`resource level not expected: ${arrRoute[level]} of ${route}`);
                            break;
                    }
                } else {
                    throw new Error("route empty");    
                }
            } else {
                throw new Error("route empty");
            }
        } catch(e) {
            res.sendResponse(404,false,e.message || e,null,e);
        }
    }

}

module.exports = { DataController }