const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Users } = require("../../database/models/Users");


/**
 * class to handle authentication
 */
class AuthController{

    static #cryptSalt = 10;    

    /**
     * unsecure routes
     */
    static #unsecureRoutes = [
        "/api/auth/login"
    ];

    static getCryptSalt(){
        return AuthController.#cryptSalt;
    }

    /**
     * api login method
     * @returns object with token
     * @reference RNF 3
     */
    static async login(req,res,next) {
        if (req.method.trim().toUpperCase() != 'POST') res.sendResponse(405,false,'method not allowed')
        else {
            let body = req.body || {};
            if (!body.email || !body.password) return res.sendResponse(401,false,'missing data');
            let user = await Users.getModel().findOne({where:{email:body.email}},{raw:true});
            if (!user) return res.sendResponse(401,false,'user not found'); 
            if (!bcrypt.compareSync(body.password, user.PASSWORD)) return res.sendResponse(401,false,'password not math'); 
            let token = jwt.sign({ID: user.ID},process.env.API_SECRET, {expiresIn:process.env.API_TOKEN_TIMELIFE-0});
            res.sendResponse(200,true,'logged',{token:token});
        }
    }

    /**
     * api register method
     * @returns object with token
     */
    static async register(req,res,next) {
        if (req.method.trim().toUpperCase() != 'POST') res.sendResponse(405,false,'method not allowed')
        else {
            let body = req.body || {};
            if (!body.email || !body.password) return res.sendResponse(401,false,'missing data');
            let user = await Users.getModel().findOne({where:{email:body.email}},{raw:true});
            if (user) return res.sendResponse(401,false,'user already exists'); 
            user = await Users.getModel().create({
                EMAIL: body.email,
                PASSWORD: bcrypt.hashSync(body.password,(process.env.API_CRYPT_SALT || 10)-0)
            })
            let token = jwt.sign({ID: user.ID},process.env.API_SECRET, {expiresIn:process.env.API_TOKEN_TIMELIFE-0});
            res.sendResponse(200,true,'logged',{token:token});
        }
    }

    /**
     * middleware check autorization, called by all routes (app.use)
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     * @reference RNF 10
     */
    static checkToken(req,res,next) {
        if (AuthController.#unsecureRoutes.indexOf(req.url) > -1) {
            //unsecure route
            next(); 
        } else {       
            //secure route 
            let token = req.headers['x-access-token'];
            if (!token) return res.status(401).json({success:false,message:'no token'});
            jwt.verify(token,process.env.API_SECRET,function(error,decoded) {
                if (error) return res.status(401).json({success:false,message:error.message || error});
                req.user = {ID:decoded.ID};                
                next();
            });
        }
    }
}

module.exports = {AuthController}