# tmpls = require "../tmpls.js"
_ = require("underscore")
Backbone = require("backbone")
$ = require("jquery")
User = require("../models/user.coffee")
deparam = require("jquery-deparam")
class RegisterView extends Backbone.View
    events:
        "submit": (e)->
            e.preventDefault()
            data = deparam(@$("form").serialize())
            User.register(data).then (user)->
                alert("Register Successfully")
                User.login(data)
            .fail (xhr)->
                alert xhr.responseJSON.error.message
            .then ->
                App.router.navigate("profile",{trigger:yes})

        "click .btn-login": ()->
            App.router.navigate("login",{trigger:yes})
    initialize: ()->
        this.name = "title"
    tmpl: _.template """
        <form method="post" data-action="register" class="form form-register">
            <h2> User Register </h2>
            <input type="text" name="name" placeholder="Name"/>
            <input type="email" name="email" placeholder="Email"/>
            <input type="password" name="password" placeholder="Password"/>
            <div class="actions">
                <button class="btn btn-submit" type="submit">Register</button>
                <a class="btn btn-login btn-link" href="javascript:void(0)"> Already has account </a>
            </div>
        </form>
    """
    className: "view-user-index"
    render: (data={})->
        html = @tmpl(data)
        @$el.html(html)

module.exports = RegisterView
