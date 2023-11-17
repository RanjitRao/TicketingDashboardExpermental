/*global com*/
sap.ui.define([
    'sap/ui/model/json/JSONModel'
], function (JSONModel) {
    "use strict";
    return ("com.ticketDashboard.util.service", {
        callService: function (oModel, sUrl, sMethod, oPayload) {
            return new Promise(function (resolve, reject) {

                switch (sMethod.toUpperCase()) {
                    case 'GET':
                        var that = this;
                        var fnSuccess = function (data) {
                            resolve(data);
                        };
                        var fnError = function (err) {
                            reject(err);
                        };
                        oModel.read(sUrl, null, null, null, fnSuccess, fnError);
                        break;
                    case 'POST':
                        break;
                    case 'PUT':
                        break;
                    case 'DELETE':
                        break;
                }
            })
        }

    });

});