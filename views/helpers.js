var _, ejs, fs, path, renderPage, renderTemplate;

_ = require("underscore");

path = require("path");

fs = require("fs");

ejs = require("ejs");

renderTemplate = function(filename, data) {
  var file, filePath, tmpl;
  filePath = path.join(__dirname, filename);
  file = fs.readFileSync(filePath, 'utf8');
  tmpl = ejs.compile(file, {
    cache: true,
    filename: "indexview"
  });
  return tmpl(data);
};

renderPage = function(req, res) {
  var data, html;
  data = _.pick(req, "baseUrl");
  _.extend(data, {
    title: "Common Auth"
  });
  html = renderTemplate("../views/indexview.ejs", data);
  return res.type("html").send(html);
};

module.exports = {
  renderPage: renderPage,
  renderTemplate: renderTemplate
};
