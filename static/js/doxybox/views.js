define([ 'underscore',
    'jquery',
    'backbone'
], function (_, $, Backbone) {
    "use strict";

    var SmarthomeViews = {};


    var ItemBase = Backbone.View.extend({

        tagName: "div",

        className: "devicelist-item-",
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

    SmarthomeViews.SmallItem = ItemBase.extend({
        className: "devicelist-item-small",
        template: _.template('<p><%=name%></p>')
    });

    SmarthomeViews.MiddleItem = ItemBase.extend({
        className: "devicelist-item-middle",
        template: _.template('<p><%=name%></p>')
    });

    SmarthomeViews.LargeItem = ItemBase.extend({
        className: "devicelist-item-large",
        template: _.template('<p><%=name%></p>')
    });

    var ItemsBase = Backbone.View.extend({

        tagName: "div",

        className: "devicelist-items-",
        template: _.template(''),
        itemViews: {},
        itemView: SmarthomeViews.SmallItem,

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

    SmarthomeViews.SmallListItems = ItemsBase.extend({
        className: "devicelist-items-small",
        itemView: SmarthomeViews.SmallItem,
        template: _.template('<h3>SMALL Items</h3>')
    });

    SmarthomeViews.MiddleListItems = ItemsBase.extend({
        className: "devicelist-items-middle",
        itemView: SmarthomeViews.MiddleItem,
        template: _.template('<h3>MIDDLE Items</h3>')
    });

    SmarthomeViews.LargeListItems = ItemsBase.extend({
        className: "devicelist-items-large",
        itemView: SmarthomeViews.LargeItem,
        template: _.template('<h3>LARGE Items</h3>')
    });

    return SmarthomeViews;

});