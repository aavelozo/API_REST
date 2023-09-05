const { AuthController } = require("../auth/AuthController");
const { DataController } = require("../data/DataController");
const { Utils } = require("../utils/Utils");

class RoutesController {

    /**
     * Middleware that add customized fields and functions in req and res to use in this app 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static #reqresMiddleware = function(req,res,next) {

        res.success = false;
        res.data = null;
        res.message = null;
        res.exception = null;                    
            
        res.getJson = function(){
            return {
                success: this.success,
                data : this.data || null,
                message : this.message || null,
                exception : this.exception || null
            }
        }.bind(res);
    
        /**
         * Use this method to send response to client, independent if is redirect, view (render html) or json or message
         * this method choice if request is api (/api) or normal (! /api)
         * if is api, force return as json, else return conform configured in this req.res object
         */
        res.sendResponse = function(status,success,message,data,exception) {
            if (Utils.hasValue(success || null)) this.success = this.success || success;
            if (Utils.hasValue(message || null)) this.message = this.message || message;
            if (Utils.hasValue(data || null)) this.data = this.data || data;            
            if (Utils.hasValue(exception || null)) this.exception = this.exception || exception;            
            console.log('returning with result',status, this.success,this.getJson());        
            if (status) this.status(status).json(this.getJson())
            else this.json(this.getJson());
        }.bind(res);

        req.getClientIp = function() {
            return this.headers['x-forwarded-for']?.split(',').shift() || this.socket?.remoteAddress;
        }.bind(req);

        next();
    }

    static getReqResMiddleware() {
        return RoutesController.#reqresMiddleware;
    }


    static processRoute(req,res,next) {
        switch(req.url) {
            case "/api/auth/login": //(RF 2)
                AuthController.login(req,res,next);
                break;
            /*case "/api/auth/register": NOT ENABLED, RF 3 IS REGISTER OF COLABORATOR, NOT OF USER
                AuthController.register(req,res,next);
                break;*/
            default:
                DataController.processPostAsRoute(req,res,next);
                break;
        }
    }
}

module.exports = {RoutesController}