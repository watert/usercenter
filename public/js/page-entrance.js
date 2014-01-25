(function() {
  require(["backbone.marionette"], function(BM) {
    console.log("backbone.marionette", BM);
    return $(".nav-tabs a").click(function() {
      return $(this).tab("show");
    });
  });

}).call(this);
