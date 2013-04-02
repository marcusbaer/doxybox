define([ 'underscore',
    'jquery',
    'backbone'
], function (_, $, Backbone) {
    "use strict";

    var Models = {};

    var Foo = Models.Foo = Backbone.Model.extend({
        defaults: {
            name: '<unknown>',
            id: null
        }
    });

    Models.FooList = Backbone.Collection.extend({
        model: Foo,
        getList: function (id) {
            return this.toJSON();
        },
        addFoo: function (attrs) {
            this.push(new Foo(attrs));
        }
    });

    return Models;

});