var path = require("path");
var ghpages = require("gh-pages");
var build = path.join(__dirname, "../build");
ghpages.publish(build, function (err) {
  console.log("Publish Complete");
});
