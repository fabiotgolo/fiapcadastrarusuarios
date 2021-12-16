const jwt = require("jsonwebtoken")
const settings = require("../config/config")

const auth = (req,res,next)=>{
    const token_gerado = req.headers.token

    if(!token_gerado){
        return res.status(401).send({out: "usuário não autenticado"})
    }

    jwt.verify(token_gerado,settings.jwt_key,(erro,dados)=>{
        if(erro){
            return res.status(401).send({out: `token inválido -> ${erro}`})
        }

        req.content = {
            id:dados.id,
            user: dados.user
        }
        return next()
    })

}
module.exports = auth