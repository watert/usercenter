var User, assert;

assert = function(val, msg) {
  if (!val) {
    throw "Err:" + msg;
  }
};

User = App.User;

describe("User Actions", function() {
  var userData;
  userData = {
    name: "xxxx1",
    email: "xx@asd.com",
    password: "xxx"
  };
  it("should has user module", function() {
    console.log(User);
    return assert(App.User);
  });
  it("should register", function() {
    return User.register(userData).then(function(user) {
      return assert(user.id, "register");
    });
  });
  it("should login", function() {
    return User.login(userData).then(function(user) {
      return assert(user.id, "login fail");
    });
  });
  it("should logout", function() {
    return User.post("logout");
  });
  it("should get profile", function() {
    return User.login(userData).then(function() {
      return User.profile().then(function(user) {
        assert(user.id, "login fail");
        return assert(user.get("emailHash"), "has email hash");
      });
    });
  });
  it("should update profile", function() {
    return User.profile().then(function(user) {
      return user.save({
        name: "xxxx2"
      }).then(function() {
        return assert(user.get("name") === "xxxx2", "update name");
      });
    });
  });
  return it("should remove user", function() {
    return User.profile().then(function(user) {
      return user.destroy();
    });
  });
});
