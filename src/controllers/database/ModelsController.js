const { Clients } = require("../../database/models/Clients");
const { Collaborators } = require("../../database/models/Collaborators");
const { IdentifiersDocsTypes } = require("../../database/models/IdentifiersDocsTypes");
const { Items } = require("../../database/models/Items");
const { Logs } = require("../../database/models/Logs");
const { Orders } = require("../../database/models/Orders");
const { OrdersXItems } = require("../../database/models/OrdersXItems");
const { OrdersXClients } = require("../../database/models/OrdersxClients");
const { People } = require("../../database/models/People");
const { Users } = require("../../database/models/Users");


/**
 * Class to handle start models (actualy using sequelize). This models require that it is initied, because
 * models is implemented as class models (according https://sequelize.org/docs/v6/core-concepts/model-basics/).
 * Init method in models not create fisical tables, these only initialize model and associations (FKs). Fisical tables
 * are created by run migrations commands (vide sequelize-cli module in https://github.com/sequelize/cli)
 * @author Alencar
 * @created 2023-08-10
 */
class ModelsController{

    /**
     * Method to init models, need this to can use model as class, according sequelize documentation.
     * this method must have called on start server
     * @created 2023-08-10
     */
    static initModels(){           
           
        IdentifiersDocsTypes.getModel();        
        People.getModel();
        Collaborators.getModel();
        Users.getModel();        
        Clients.getModel();
        Orders.getModel();
        OrdersXClients.getModel();
        Items.getModel();
        OrdersXItems.getModel();
        Logs.getModel();     
        
        ModelsController.initAssociations();
    }


    /**
     * method to call all models associations init, 
     * @created 2023-08-10
     */
    static initAssociations(){
        IdentifiersDocsTypes.initAssociations();        
        People.initAssociations();
        Collaborators.initAssociations();
        Users.initAssociations();        
        Clients.initAssociations();
        Orders.initAssociations();
        OrdersXClients.initAssociations();
        Items.initAssociations();
        OrdersXItems.initAssociations();
        Logs.initAssociations();         
    }

}

module.exports = { ModelsController };
