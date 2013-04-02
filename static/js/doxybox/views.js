define([ 'underscore',
    'jquery',
    'backbone'
], function (_, $, Backbone) {
    "use strict";

    var Views = {};


    var ItemBase = Backbone.View.extend({

        tagName: "div",

        className: "foolist-item-",
        template: _.template('<p><%=name%></p>'),

        events: {
            "click p": "open"
        },

        initialize: function() {
            this.listenTo(this.model, "change", this.render);
        },
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        open: function () {
            console.log(this.model);
        }
    });

    Views.SmallItem = ItemBase.extend({
        className: "foolist-item-small",
        template: _.template('<p><%=name%></p>')
    });

    Views.MiddleItem = ItemBase.extend({
        className: "foolist-item-middle",
        template: _.template('<p><%=name%></p>')
    });

    Views.LargeItem = ItemBase.extend({
        className: "foolist-item-large",
        template: _.template('<p><%=name%></p>')
    });

    var ItemsBase = Backbone.View.extend({

        tagName: "div",

        className: "foolist-items-",
        template: _.template(''),
        itemViews: {},
        itemView: Views.SmallItem,

        events: {
//            "click .icon": "open"
        },

        initialize: function() {
            this.listenTo(this.collection, "change", this.render);
        },
        render: function () {
            var self = this;
            this.$el.html(this.template(this.lang || {}));
            this.collection.forEach(function(model){
                var itemView = new self.itemView({
                    model: model
                });
                self.itemViews[model.id] = itemView;
                self.$el.append(itemView.render().el);
            });
            return this;
        }
    });

    Views.SmallListItems = ItemsBase.extend({
        className: "foolist-items-small",
        itemView: Views.SmallItem,
        template: _.template('<h3>SMALL Items</h3>')
    });

    Views.MiddleListItems = ItemsBase.extend({
        className: "foolist-items-middle",
        itemView: Views.MiddleItem,
        template: _.template('<h3>MIDDLE Items</h3>')
    });

    Views.LargeListItems = ItemsBase.extend({
        className: "foolist-items-large",
        itemView: Views.LargeItem,
        template: _.template('<h3>LARGE Items</h3>')
    });

    return Views;

});