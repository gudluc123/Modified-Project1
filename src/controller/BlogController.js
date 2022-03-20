const { default: mongoose } = require("mongoose");
const AuthorModel = require("../models/AuthorModel");
const blogmodel = require("../models/blogmodel");


const isValid = function (value){
    if (typeof value === 'undefined' || typeof value === null) return false
    
    if (typeof value ==='string' && typeof value.trim().length === 0) return false
    return true
    
    }
    const isValidrequestbody = function(data){
        return Object.keys(data).length > 0
    }

    const isValidObjectId = function(ObjectId){
        return mongoose.Types.ObjectId.isValid(ObjectId)
    }

    const createBlog = async function (req,res){
    try{
    let data = req.body
    if(!isValidrequestbody(data)) return res.status(400).send({status:false,msg:"blog is required in body"})

    const {title,body,authorId,tags,category,subcategory,isPublished} = data;
    if(!isValid(title)) return res.status(400).send({status:false,msg:"title is required"})

    if(!isValid(body)) return res.status(400).send({status:false,msg:"body is required"})

    if (!isValid(authorId)) return res.status(400).send({status:false,msg:"authorId is required"})

    if(!isValidObjectId(authorId)) return res.status(400).send({status:false,msg:`${authorId} is not a valid authorId`})

    if (!isValid(category))  return res.status(400).send({status:false,msg:"category is required"})

    if (!isValid(subcategory)) return res.status(400).send({status:false,msg:"subcategory is required"})


    const blogData = {
        title,
        body,
        authorId,
        category,
        isPublished:isPublished?true:false,
        publishedAt:isPublished?new Date():null
    }

    const newBlog = await blogmodel.create(blogData)
    res.status(201).send({status:false,msg:"new blog created",data:newBlog})

    } catch (err){
        res.status(500).send({status:false,msg:"err.message"})
    }



    }

    const getblogs = async function(req,res){
        try{
        const filterQuery ={isDeleted:false, deletedAt:null,isPublished:true}
        const QueryParam= req.query

        if(isValidrequestbody(QueryParam)){
            const {authorId,tags,subcategory,category} = QueryParam

            if (isValid(authorId) && isValidObjectId(authorId)) {
                filterQuery["authorId"] = authorId
            }

            if (isValid(category)) {
                filterQuery["category"] = category.trim()
            }
            if (isValid(tags)){
                const tagsArr = tags.trim().split(',').map(tag => tag.trim())
                filterQuery["tags"] = {$all:tagsArr}
            }
            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcat => tag.trim())
                filterQuery["subcategory"] = {$all:subcatArr}
            }
        }
        
        const blogs = await blogmodel.find(filterQuery)

        if (Array.isArray(blogs) && blogs.length ===0){
            res.status(404).send({status:false,msg:"blogs not found"})
        }
        res.status(200).send({status:false,msg:"blogs not found",data:blogs})
        } catch (err){
            res.status(500).send({status:false,msg:err.message})
        }
    }

    const updateBlog = async function(req, res){
    try{
    const requestbody = req.body
    const params = req.params
    const blogId = params.blogId
    const authorId = req.authorId
    
    if (!isValidObjectId(blogId)) return res.status(400).send({status:false,msg:`${blogId} is not a valid blogId`})

    if (!isValidObjectId(authorId)) return res.status(400).send({status:false,msg:`${authorId} is not a valid authorId`})

    const blog = await blogmodel.findOne({_id:blogId,isDeleted:false,deletedAt:null})

    if(!blog) return res.status(404).send({status:false,msg:"blog not found"})
    if (blog.authorId.tostring()!== authorId) return res.status(401).send({status:false,msg:"blog is not matched"})

    if (!isValidrequestbody(requestbody)) return res.status(200).send({status:false,msg:"no parameter passed",data:blog})
    

    const {title,body,category,subcategory,tags,isPublished} = requestbody

    const updateDatablog = {}

    if (isValid(title)){
        if (!Object.prototype.hasOwnProperty.call(updateBlog,'$set'))updateBlog['$set'] ={}
        updateBlog['$set']['title']= title
    }
    if (isValid(body)){
        if (!Object.prototype.hasOwnProperty.call(updateBlog,'$set'))updateBlog['$set'] ={}
        updateBlog['$set']['body']= body
    }

    if (isValid(category)) {
        if (!Object.prototype.hasOwnProperty.call(updateBlog,'$set'))updateBlog['$set'] ={}
        updateBlog['$set']['category']= category
    }
    if (isPublished !== undefined){
        if (!Object.prototype.hasOwnProperty.call(updateBlog,'$set'))updateBlog['$set'] ={}
        updateBlog['$set']['isPublished']= isPublished
        updateBlog['$set']['deletedAt']= isPublished?new Date():null
        

    }

    if (tags){
        if (!Object.prototype.hasOwnProperty.call(updateBlog,'$addToSet'))updateBlog['$addToSet']={}
        if (Array.isArray(tags)){
            updateBlog['$addToSet']['tags']= {$each:[...tags]}
        }
    }
    if (subcategory){
        if (!Object.prototype.hasOwnProperty.call(updateBlog,'$addToSet'))updateBlog['$addToSet']={}
        if (Array.isArray(tags)){
            updateBlog['$addToSet']['subcategory']= {$each:[...subcategory]}
    }
    if (typeof subcategory === 'string'){
        updateBlog['$addToSet']['subcategory'] = subcategory
    }
}
     const updatedBlog = await blogmodel.findOneAndUpdate({_id:blogId},updateBlog,{new:true})

     res.status(200).send({status:true,msg:"successfully updated",data:updatedBlog})

    } catch(err){
        res.status(500).send({status:false,msg:"err.message"})
    }


    }


    const deleteBlog = async function (req, res){
        try{
            const params = req.params
            const blogId = params.blogId
            const authorId = req.authorId

            if (!isValidObjectId(blogId)) return res.status(400).send({status:false,msg:`${blogId} is not a valid blogId`})

            if (!isValidObjectId(authorId)) return res.status(400).send({status:false,msg:`${authorId} is not a valid authorId`})
        
            const blog = await blogmodel.findOne({_id:blogId,isDeleted:false,deletedAt:null})

            if(!blog) return res.status(404).send({status:false,msg:"blog not found"})
            if (blog.authorId.tostring()!== authorId) return res.status(401).send({status:false,msg:"blog is not matched"})

        const deletedBlog = await blogmodel.findOneAndUpdate({_id:blogId},{$set:{isDeleted:true,deletedAt:new Date()}})
        res.status(200).send({status:true,msg:"successfuly deleted",data:deletedBlog})
        } catch (err){
            res.status(500).send({status:false,msg:err.message})
        }
    }

    const deleteQuery = async function(req,res){
        try{

        const filterQuery = {isDeleted:false,deletedAt:null}
        const QueryParam = req.query
        const authorIdfromtoken = req.authorId
        
        if (!isValidObjectId(authorIdfromtoken)) return res.status(400).send({status:true,msg:"bad request"})


        if (!isValidrequestbody(QueryParam)) return res.status(500).send({status:false,msg:"no any query params found"})
        
        const {authorId,category,tags,subcategory,isPublished} = QueryParam

        if (isValid(authorId)&& isValidObjectId(authorId)){
            filterQuery['authorId'] = authorId
        }

        if (isValid(category)){
            filterQuery['category'] = category.trim()
        }
        if (isValid(isPublished)){
            filterQuery['isPublished'] = isPublished
        }

        if (isValid(tags)){
            const tagsArr = tags.trim().split(',').map(tag => tag.trim())
            filterQuery["tags"] = {$all:tagsArr}
        }
        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcat => tag.trim())
            filterQuery["subcategory"] = {$all:subcatArr}
        }

        const blogs = await blogmodel.find(filterQuery)
         
        if(Array.isArray(blogs)&& blogs.length ===0){
            res.status(404).send({msg:"no blog found"})
        }
        const idOfBlogToDelete = blogs.map(blog=>{
            if(blog.authorId.tostring=== authorIdfromtoken)  return blog._id
        })

        if(idOfBlogToDelete.length ===0) return res.status(404).send({msg:'no blog found'})
         
        const deleteData = await blogmodel.updateMany({_id:{$in:idOfBlogToDelete}},{$set:{isDeleted:true,deletedAt:new Date()}})
        
        res.status(200).send({status:true,msg:"blog deleted successfully"})

        }catch(err){
            res.status(500).send({status:true,msg:"err.message"})
        }
    }

    module.exports= {
        
        createBlog,
        getblogs,
        updateBlog,
        deleteBlog,
        deleteQuery

    }