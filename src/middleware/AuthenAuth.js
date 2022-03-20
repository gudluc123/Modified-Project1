const jwt = require('jsonwebtoken')

const AuthenAuth = async function (req, res ,next){
try{
const token = req.header['x-api-key']
if (!token) return res.status(403).send({msg:"missing authentication"})


const decodedtoken = jwt.verify(token,'rahul-secret-key')
if (!decodedtoken) return res.status(403).send({msg:"invalid authentication"})

req.authorId = decodedtoken.authorId
next()
}catch (err){
    res.status(500).send({status:false,msg:err.message})
}





}
module.exports =AuthenAuth