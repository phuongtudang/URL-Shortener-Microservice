var express = require("express");
var app = express();
var mongoose = require("mongoose");
var shortid = require("shortid");
var validUrl = require("valid-url");
var urlSchema = new mongoose.Schema({
                    original_url: {type: String, required: true},
                    short_id: {type: String, required: true},
                    short_url: {type: String, required: true}
                });
var Url = mongoose.model("Url", urlSchema);

app.set("view engine", "ejs");

mongoose.connect("mongodb://phuong:phuong@ds145220.mlab.com:45220/url-shortener-microservice", function (err, db) {
    if (err) {
        console.log("Unable to connect to server", err);
    } else {
        console.log("Connected to server");
    }
});

app.get("/", function(req,res){
    res.render("index");
});


app.get('/new/:url(*)', function(req, res) {
    var params = req.params.url;
    var root = req.get('host');
    
    if (!validUrl.isUri(params)){
        console.log('Not an URL');
        return res.json({error: "URL invalid"});
    } else {
        console.log('Its a URL');
        var shortCode = shortid.generate();
        Url.create({
            original_url: params,
            short_id: shortCode,
            short_url: root +"/"+ shortCode
        }, function(err, created){
            if(err){
                console.log(err);
            } else{
                res.json({
                    original_url: created.original_url,
                    short_url: 'https://' + created.short_url
                });
            }
        });
    }
});


app.get('/:shorturl', function(req, res){
    console.log(req.params.shorturl);
    Url.findOne({short_id: req.params.shorturl}, function(err, foundUrl){
        if(err){
            console.log(err);
            res.send("Can't redirect!");
        } if(foundUrl === null){
            console.log('No results found');
            res.send('No url found!')
        } else{
            res.redirect(foundUrl.original_url);
        }
    });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server is runnning!!");
})