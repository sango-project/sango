"use strict";

const fs= require("fs");
const path= require("path");
const Joi = require("@hapi/joi");

/**
 * Cette Fonction est chargée pour parser le fichier de configuration
 * @function loadConfig
 * @param filePath pour le chemin du fichier de configuration
 * @param environment environnement de travail valeur par defaut #defaul#
 * @return un obejt config contenant les paramètres nécessaires
 */

function loadConfig(filePath, environment= "default") {
    const config= {}
    const data= fs.readFileSync(filePath, "utf-8");
    let currentSection= "default";

    data.split("\n").forEach((line) => {
        line= line.trim();

        // Ignorer les commentaire commençant par #
        if (!line || line.startsWith("#") ) return;

        // Identifier une section
        if (line.startsWith("[") && line.endsWith("]")) {
            currentSection= line.slice(1, -1);
        } else if (currentSection === "default" || currentSection === environment) {
            const [key, value]= line.split("=");
            if (key&& value) {
                config[key.trim()] = value.trim();
            }
        }
    });

    return config;
}

// le schema Joi pour la validation des données
const schema= Joi.object({
    SERVER_HOST: Joi.string().hostname().required(),
    SERVER_PORT: Joi.number().integer().min(1024).max(65535).required(),
    DB_HOST: Joi.string().hostname().required(),
    DB_PORT: Joi.number().integer().min(1024).max(65535).required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required()
}).unknown(); // permettant de conserver les variable supplémentaires

const config_path= path.join(__dirname, 'config', 'app.config');
const config= loadConfig(config_path);

// valider la configuration
const {value: validate_config, err: error} = schema.validate(config);
if (error) {
    console.error("Configuration invalide", error.message);
    process.exit(1); // Stopper l'exécution en cas d'erreur
}

console.log(config)

module.exports = {
    server: {
        host: validate_config.SERVER_HOST,
        port: parseInt(validate_config.SERVER_PORT, 10),
    },

    dataBase: {
        host: validate_config.DB_HOST,
        port: parseInt(validate_config.DB_PORT, 10),
        username: validate_config.DB_USERNAME,
        password: validate_config.DB_PASSWORD, 
    },
};