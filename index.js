const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const Usuario = require("./model/user")
const bcrypt = require("bcrypt")
const createToken = require("./utils/token")
const auth = require("./middleware/auth")
const urlbd = "connection string";

mongoose.connect(urlbd, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Conectado ao DB...'))
.catch((e) => console.log('erro -> ',e))

const confCors = {
    origin: "*",
    optionSuccessStatus: 200
}

const app = express()

app.use(express.json())
app.use(cors())

app.post("/api/user/cadastrar", cors(confCors),(req,res)=>{
    const data = new Usuario(req.body)
    data.save().then((rs)=>{
        res.status(201).send({
            out:'O usuário foi inserido com sucesso',
            payload:rs
        })
    }).catch((erro)=>res.status(400).send({
        out:`erro -> ${erro}`
    }))
})

app.post("/api/user/login",(req,res)=>{
    const usuario = req.body.nome
    const senha = req.body.senha

    Usuario.findOne({nomeusuario:usuario},(error,rs)=>{
        if(!rs){
            return res.status(404).send({out:"Usuário inexistente"})
        }
        if(error){
             return res.status(400).send({out:"Usuário não encontrado"})
        }
        bcrypt.compare(senha,rs.senha,(error,same)=>{
            if(error){
                return res.status(400).send({out:"Erro de senha"})
            }

            if(!same){
                return res.status(400).send({out: "Senha incorreta"})
            }else{
                const token = createToken(rs._id,rs.nomeusuario)

                res.status(200).send({
                    out:"Usuário logado",
                    payload:rs,
                    token:token
                })  
            }
        })
    })
})

app.put("/api/user/atualizar/:id", cors(confCors),auth,(req, res) => {
  
    // Se enviar a senha na requisição ela será criptografada
    if(req.body.senha){
        bcrypt.hash(req.body.senha,10,(erro,encrypt)=>{
            req.body.senha = encrypt
            Atualizar()
        })
    }else{
        Atualizar()
    }

    function Atualizar(){

        Usuario.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
            (erro, rs) => {
                if (erro) {
                    return res.status(400).send({
                        output: "Erro ao Atualizar",
                        error: erro
                    })
                } else {
                    res.status(200).send({
                        output: "Atualizafo",
                        payload: rs
                    })
                }
            }
        )
    }
})

app.delete("/api/user/delete/:id", cors(confCors), (req, res) => {
    Usuario.findByIdAndDelete(
        req.params.id,
        (erro, rs) => {
            if (erro) {
                return res.status(400).send({
                    output: "Erro ao Deletar",
                    error: erro
                })
            } else {
                res.status(204).send({
                    output: "Deletou"
                })
            }
        }
    )
})

app.use((req, res) => {
    res.type("application/json")
    res.status(404).send({
        output: "Rota Inexistente"
    })
})


app.listen(4000, () => console.log('Rodando na porta 4000'))

