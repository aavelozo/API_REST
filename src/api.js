
//requires
const express = require('express');
require('dotenv').config();
console.log('NODE_ENV =',process.env.NODE_ENV);
const { AuthController } = require('./controllers/auth/AuthController');
const bodyParser = require("body-parser");
const { RoutesController } = require('./controllers/routes/RoutesController');
const { ModelsController } = require('./controllers/database/ModelsController');

//api create (RF 1, RNF 1,2)
const api = express(); 

//api configure midlewares
api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(bodyParser.urlencoded({ extended: true }));
api.use(bodyParser.json());
api.use(RoutesController.getReqResMiddleware());
api.use(AuthController.checkToken); //auth token check middleware (RF 1.1,RNF 3)


//init database models
ModelsController.initModels();


/**
 * handle all methods and routes 
 * routes are handled spliting route by delimiter (/) and handling all partes separatelly, according controlers
 * example:
 * /api/modules/registers/collaborators/create are splited and handled as: [api,modules,registers,collaborators,create]
 * api - RoutesController
 *      modules - ModulesController
 *          registers - RegistersController
 *              collaborators - CollaboratorsController
 *                  ...
 * */
api.all('*', RoutesController.processRoute)


//api start
api.listen(process.env.API_PORT,function(){
    console.log(`server api running on port ${process.env.API_PORT}`)
})