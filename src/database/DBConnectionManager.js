const { Sequelize } = require("sequelize");
const configDB  = require("./config/config");

/**
 * Class to manage connections to database
 * @author Alencar
 * @created 2023-08-10
 */
module.exports = class DBConnectionManager {

    //to storage singleton default connection according configDB
    static #defaultDBConnection = null;

    /**
     * get / start default database connection, according configDB
     * @returns database connection
     * @created 2023-08-10
     */
    static getDefaultDBConnection(){
        try {
            if (DBConnectionManager.#defaultDBConnection == null) {
                let connectionConfig = configDB[process.env.NODE_ENV];
                console.log('starting sequelize ', connectionConfig);
                DBConnectionManager.#defaultDBConnection = new Sequelize(connectionConfig);                
            }
            return DBConnectionManager.#defaultDBConnection;
        } catch (e) {
            console.log('error on start connection',e);
        }
        return DBConnectionManager.#defaultDBConnection;
    }


    
}
