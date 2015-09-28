# tmpls = require "../tmpls.js"
_ = require("underscore")
Backbone = require("backbone")
User = require("../models/user.coffee")
class ProfileView extends Backbone.View
    tmpl: _.template """
        <div class="profile">
            <div class="avatar">
                <img src="http://www.gravatar.com/avatar/<%=emailHash%>?s=200" alt="" />
                <h3> <%=name%> </h3>
            </div>
            <div class="info">
                <div class="small"> Email </div>
                <p><%=email%></p>
            </div>
            <div class="actions">
                <button class="btn btn-logout">Logout</button>
            </div>
        </div>
    """
    className: "view-user-index"
    render: ()->
        (user = new User).fetch().then =>
            html = @tmpl(user.toJSON())
            @$el.html(html)
        .fail ->
            App.router.navigate("login",{trigger:yes})


module.exports = ProfileView
