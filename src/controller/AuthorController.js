const AuthorModel = require("../models/AuthorModel");
const jwt = require("jsonwebtoken");
const res = require("express/lib/response");


// all types of validation occuring here

const isValid = function (value){
if (typeof value === 'undefined' || typeof value === null) return false

if (typeof value ==='string' && typeof value.trim().length === 0) return false
return true

}
const isValidtitle = function(title){
    return ["Mr","Mrs","Miss"].indexOf(title) !==-1
}

const isValidrequestbody = function(data){
    return Object.keys(data).length > 0
}

const createAuthor = async function (req,res){
    try {
    let data = req.body;
    if (!isValidrequestbody(data))  return res.status(400).send({status:false,msg:"invalid credential"})


const {fname,lname,title,email,password} = data;  // it is simple destructuting of object

// validation of each field
if(!isValid(fname)) return res.status(400).send({status:false,msg:"fname is required"})

if(!isValid(lname)) return res.status(400).send({status:false,msg:"lname is required"})
if (!isValid(title)) return res.status(400).send({status:false,msg:"title is required"})
if (!isValid(title)) return res.status(400).send({status:false,msg:"title should be in enum"})
if (!isValid(email)) return res.status(400).send({status:false,msg:"email is required"})
if (!isValid(password)) return res.status(400).send({status:false,msg:"password is required"})

const isEmailAlreadyUsed = await AuthorModel.findOne({email})

if(isEmailAlreadyUsed) return res.status(400).send({status:false,msg:"email is alredy used"})

const authorData ={fname,lname,title,email,password}
const newauthor = await AuthorModel.create(authorData)
res.status(201).send({status:true,msg:"data created successfully",data:authorData})

} catch (err){
    res.status(500).send({status:false,msg:err.message})
}
}

// login controller

const loginAuthor = async function (req, res) {
try {
let data = req.body

if (!isValidrequestbody(data)) return res.status(400).send({msg:"data is required in body"})

const {email,password} = data;
// further validation of data fields

if (!isValid(email)) return res.status(400).send({status:false,msg:"email is require in request body"})

if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) return res.status(400).send({status:false,msg:"this fiels is required for checking email address"})

if (!isValid(password)) return res.status(400).send({status:false,msg:"password is required in body"})

const author = await AuthorModel.findOne({email,password})
if (!author) return  res.status(401).send({status:false,msg:"invalid crendential"})

const token = jwt.sign({
    authorId:author._id},
    "rahul-secret-key"
) 

res.header("x-api-key", token)

res.status(200).send({status:true,msg:"successfully logged in", data:{token}})

} catch (err){
    res.status(400).send({status:false, msg:"err.message"})
}



}

module.exports = {
    createAuthor,
    loginAuthor
}