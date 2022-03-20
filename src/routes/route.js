const express = require('express');
const router = express.Router();
const AuthorController=require("../controller/AuthorController")
const BlogController = require("../controller/BlogController")
const AuthenAuth = require("../middleware/AuthenAuth")
// router.get("/test-me", middileware.authentication,middileware.authorise,function (req, res) {
//     res.send("My first ever api!")
// })

//  Phase-1 router handler and route path

router.post("/createauthor",AuthorController.createAuthor) 

router.post("/login",AuthorController.loginAuthor)



router.post("/createblog",AuthenAuth,BlogController.createBlog)

router.get("/blogs",AuthenAuth,BlogController.getblogs)

router.put("/updateblog/:blogId",AuthenAuth, BlogController.updateBlog)

router.delete("/deleteblog/:blogId",AuthenAuth,BlogController.deleteBlog)

router.delete("/deletebyQuery",AuthenAuth,BlogController.deleteQuery)



module.exports = router;