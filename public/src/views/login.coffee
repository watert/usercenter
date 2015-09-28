# tmpls = require "../tmpls.js"
_ = require("underscore")
Backbone = require("backbone")
deparam = require("jquery-deparam")
User = require("../models/user.coffee")
class LoginView extends Backbone.View
    events:
        "click .btn-register": ()->
            App.router.navigate("register",{trigger:yes})
        "submit": (e)->
            e.preventDefault()
            data = deparam(@$("form").serialize())
            User.login(data).then ->
                App.router.navigate("profile",{trigger:yes})
                

    initialize: ()->
        this.name = "title"
    tmpl: _.template """
        <form method="post" data-action="login" class="form form-login">
            <h2> User Login </h2>
            <input type="text" name="name" placeholder="Name"/>
            <input type="password" name="password" placeholder="Password"/>
            <div class="actions">
                <button class="btn btn-submit" type="submit">Login</button>
                <button class="btn btn-register" type="button">Register</button>
            </div>
        </form>"""
    className: "view-user-index"
    render: (data={})->
        html = @tmpl(data)
        @$el.html(html)

module.exports = LoginView
