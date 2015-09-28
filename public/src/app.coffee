App = {}
let Router = Backbone.Router.extend({
    routes: {
        "*viewName":function(viewName){
            viewName = viewName||"login"
            this.loadView(viewName)
        }
    },
    viewClasses:{
        login: require("./views/login.coffee"),
        profile: require("./views/profile.coffee"),
        register: require("./views/register.coffee")
    },
    loadView(viewName){
        let View = this.viewClasses[viewName]
        let view = new View()
        view.render()
        $("body").empty().append(view.el);
    }
});
App.router = new Router()

module.exports = App
