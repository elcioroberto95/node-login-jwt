const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
module.exports = (app) => {
  app.get('/', (req, res) => {
    return res.status(200).json({
      message: "OK!"
    })
  })
  //private route
  app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;
    //check if user exists;
    const user = await User.findById(id, '-password');
    if (!user) {
      res.status(404).json({
        message: "Usuario não encontrado",
      })
    }
    res.status(200).json({
      user
    })
  })
  function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Acesso não autorizado",
      })
    }


    try {
      const secret = process.env.SECRET
      jwt.verify(token, secret);
      next();
    }
    catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Houve um erro durante o processamento. Por favor, tente novamente mais tarde!",
        error: error,
      })
    }
  }
  //rota de cadastro
  app.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name) {
      return res.status(422).json({
        message: "Nome é obrigatório"
      })
    }
    if (!email) {
      return res.status(422).json({
        message: "Email é obrigatório"
      })
    }

    if (!password) {
      return res.status(422).json({
        message: "Senha é obrigatório"
      })
    }


    //check if user exists 
    const userExists = await User.findOne({
      email: email
    })
    if (userExists) {
      res.status(422).json({
        message: "Por favor, utilize outro e-mail",
      })
    }

    //create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name, email, password: passwordHash
    })

    try {

      await user.save();
      res.status(200).json({
        message: "The user has been successfully saved"
      })
    }
    catch (error) {
      res.status(500).json({
        message: "Aconteceu um erro no servidor tente mais tarde",
        error: error,
      })
    }

  })
  //rota de login
  app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(422).json({
        message: "Email é obrigatório"
      })
    }
    if (!password) {
      return res.status(422).json({
        message: "Senha é obrigatório"
      })
    }

    const user = await User.findOne({
      email: email
    })
    if (!user) {
      res.status(404).json({
        message: "Usuario não encontrado",
      })
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      res.status(422).json({
        message: "Senha invalída"
      })
    }
    try {
      const secret = process.env.SECRET;
      const token = jwt.sign({
        id: user._id,
      },
        secret
      )

      res.status(200).json({
        message: "Autenticação realizada com sucesso",
        token,
        id: user._id,
      })

    } catch (error) {
      res.status(500).json({
        message: "Ocorreu um erro no servidor, tente novamente mais tarde.",
        error,
      })
    }

  })
}