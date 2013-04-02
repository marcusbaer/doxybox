define([ 'underscore',
    'jquery',
    'backbone'
], function (_, $, Backbone) {
    "use strict";

    var SmarthomeModels = {};

    var Device = SmarthomeModels.Device = Backbone.Model.extend({
        defaults: {
            name: '<unknown>',
            type: null,
            id: null
        }
    });

    SmarthomeModels.DeviceList = Backbone.Collection.extend({
        model: Device,
        getList: function (id) {
            return this.toJSON();
        },
        addDevice: function (attrs) {
            this.push(new Device(attrs));
        }
    });

    return SmarthomeModels;

});