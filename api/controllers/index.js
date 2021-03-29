
const ratioMicroserviceController = require('./ratio-microservice.controller.js');
module.exports = {
    ratioMicroserviceCreate:ratioMicroserviceController.create,
    ratioMicroserviceRetrive:ratioMicroserviceController.retrive,
    ratioMicroserviceRetriveAll:ratioMicroserviceController.retrive,
    ratioMicroserviceUpdate:ratioMicroserviceController.update,
    ratioMicroserviceDelete:ratioMicroserviceController.destroy
};
