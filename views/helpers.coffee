_ = require("underscore")
path = require("path")
fs = require("fs")
ejs = require("ejs")
renderTemplate = (filename, data)->
    filePath = path.join(__dirname,filename)
    file = fs.readFileSync(filePath, 'utf8')
    tmpl = ejs.compile(file, cache:yes, filename:"indexview")
    return tmpl(data)
renderPage = (req,res)->
    # return res.json(req.url)
    data = _.pick(req,"baseUrl")
    _.extend(data, {title:"Common Auth"})
    html = renderTemplate("../views/indexview.ejs",data)
    res.type("html").send(html)

module.exports = {renderPage, renderTemplate}
