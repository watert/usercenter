'use strict';

let $ = require("jquery")
let Backbone = require('backbone')
let _ = require('underscore')

// class AuthView extends Backbone.View {
//     constructor(args) {
//         super(...args)
//     }
//     initialize(){
//         this.tmpl = tmpls
//         this.name = "title"
//     }
//     get className() { return "view-user-index"}
//     render(name="login", data={}) {
//         let html = _.template(tmpls[name])(data)
//         this.$el.html(html);
//     }
// }

let Router = Backbone.Router.extend({
    routes: {
        "*viewName":function(viewName){
            viewName = viewName||"login"
            if (viewName.slice(-1) == "/"){
                viewName = viewName.slice(0,-1)
            }
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
let init = (options)=> {
    App.router = new Router()
    $(()=>{
        Backbone.history.start({root:$("base").attr("href"), pushState:true})
        // let LoginView = require("./views/login.coffee")
        // let view = new LoginView()
        // view.render();
        // $("body").empty().append(view.el);
    });
}
window.App = {};

_.extend(window, {Backbone, $});
_.extend(window.App, {
    init, $, User:require("./models/user.js")
});
