const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Usuario = require("./model/user");
const bcrypt = require("bcrypt");
const createToken = require("./utils/token");
const auth = require("./middleware/auth");
const urlbd = "mongodb+srv://fabiotg:Ba123456@clustercliente.zbihk.mongodb.net/database?retryWrites=true&w=majority";
//Professor, mantive o endereço aqui porque esse usuário e senha são provisórios, depois da avaliação vou deletar.

mongoose.connect(urlbd, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Conectado ao DB.'))
.catch((e) => console.log('erro -> ',e))

const confCors = {
    origin: "*",
    optionSuccessStatus: 200
}

const app = express()

app.use(express.json())
app.use(cors())

app.post("/api/usuario/cadastrar", cors(confCors),(req,res)=>{
    const data = new Usuario(req.body)
    data.save().then((rs)=>{
        res.status(201).send({
            output:'O usuário foi inserido com sucesso',
            payload:rs
        })
    }).catch((erro)=>res.status(400).send({
        output:`erro -> ${erro}`
    }))
})

app.post("/api/usuario/login",(req,res)=>{
    const usuario = req.body.nome
    const senha = req.body.senha

    Usuario.findOne({nomeusuario:usuario},(error,rs)=>{
        if(!rs){
            return res.status(404).send({output:"Usuário inexistente"})
        }
        if(error){
             return res.status(400).send({output:"Usuário não encontrado"})
        }
        bcrypt.compare(senha,rs.senha,(error,same)=>{
            if(error){
                return res.status(400).send({output:"Erro de senha"})
            }

            if(!same){
                return res.status(400).send({output: "Senha incorreta"})
            }else{
                const token = createToken(rs._id,rs.nomeusuario)

                res.status(200).send({
                    out:"Usuário Logado",
                    payload:rs,
                    token:token
                })  
            }
        })
    })
})

app.put("/api/usuario/atualizar/:id", cors(confCors),auth,(req, res) => {
  
    if(req.body.senha){
        bcrypt.hash(req.body.senha,10,(erro,encr)=>{
            req.body.senha = encr
            Atualizar()
        })
    }else{
        Atualizar()
    }

    function Atualizar(){

        Usuario.findByIdAndUpdate(
            req.params.id, req.body,
            { new: true },
            (erro, rs) => {
                if (erro) {
                    return res.status(400).send({
                        output: "Erro ao Atualizar",
                        err:erro})
                } else {
                    res.status(200).send({
                        output: "Atualizado",
                        payload: rs
                    })
                }
            }
        )
    }
})

app.delete("/api/usuario/delete/:id", cors(confCors), (req, res) => {
    Usuario.findByIdAndDelete(
        req.params.id,
        (erro, rs) => {
            if (erro) {
                return res.status(400).send({
                    output: "Erro ao Deletar",
                    err:erro})
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


app.listen(3000, () => console.log('Rodando na porta 3000'));

