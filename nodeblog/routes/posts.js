var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function(req, res, next){
    var posts = db.get('posts');
    posts.findById(req.params.id, function(err, post){
        res.render('show',{
        "post": post
        });
    });

});

router.get('/add', function(req, res, next){
    //get db categories
    var categories = db.get('categories');

    categories.find({},{},function(err, categories){
        res.render('addpost',{
        "title":"Add Post",
        "categories": categories,
        });
    });   
});

router.post('/add', function(req, res, next){
    //get form value    
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var date = new Date();

    //images
    if(req.files.mainimage){
        var mainimageOriginalname = req.files.mainimage.originalname;
        var mainImageName = req.files.mainimage.name;
        var mainImageMime = req.files.mainimage.mimeType;
        var mainImagePath = req.files.mainimage.path;
        var mainImageExt = req.files.mainimage.ext;
        var mainImageSize = req.files.mainimage.size;
    }else{
        var mainImageName = 'noimage.png';
    }
    //form validation
    req.checkBody('title', 'Title field is required').notEmpty();
    req.checkBody('body', 'Body field is required');

    //check erros
    var errors = req.validationErrors();
    if(errors){
        res.render('addpost',{
            "errors": errors,
            "title": title,
            "body":body
        });
    }else{
        var posts = db.get('posts');

        //submit to db
        posts.insert({
            "title":title,
            "body":body,
            "category":category,
            "date":date,
            "author":author,
            "mainimage":mainImageName
        }, function(err, post){
            if(err){
                res.send('There was an issue submitting the post');
            }else{
                req.flash('success', 'post submitted');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

router.post('/addcomment', function(req, res, next){
    //get form value    
    var name = req.body.name;
    var email = req.body.email;
    var body = req.body.body;
    var postid = req.body.postid;
    var commentdate = new Date();

    //form validation
    req.checkBody('name', 'name field is required').notEmpty();
    req.checkBody('body', 'Body field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();

    //check erros
    var errors = req.validationErrors();
    if(errors){
        var posts = posts.db.get('posts');
        posts.findById(postid, function(err, post){
                res.render('show',{
                "errors": errors,
                "post": post,
            });
        });      

    }else{
        var comment = {"name": name, "email": email, "body": body, "commentdate": commentdate}

        var posts = db.get('posts');

        //update
        posts.update({
            "_id":postid
            },
            {
                $push:{
                    "comments":comment
                },
                function(err, doc){
                    if(err){
                        throw err;
                    } else{
                        req.flash('success', 'Comment Added');
                        res.location('/posts/show/' + postid);
                        res.redirect('posts/show/' + postid);
                    }
                }
            }
        );
    }
});

module.exports = router;