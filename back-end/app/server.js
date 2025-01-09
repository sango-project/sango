"use strict";

const Hapi= require("@hapi/hapi");
const config= require("./config");

const SERVER= Hapi.server({
    host: config.server.host,
    port: config.server.port,
});
