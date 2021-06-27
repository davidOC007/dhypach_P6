const bcrypt = require('bcrypt');
const token = require('jsonwebtoken');
const maskEmail = require('nodejs-base64-encode');
const User = require('../models/user');

// Création d'un compte utilisateur
exports.signup = (req,res,next) => { 
    bcrypt.hash(req.body.password,10)
    .then(hash => {
        const user = new User ({
            email: maskEmail.encode(req.body.email, 'base64'),
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({message: "Le compte utilisateur a été créé !"}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
// Connexion à un compte utilisateur
exports.login = (req,res,next) => {
    User.findOne({email: maskEmail.encode(req.body.email, 'base64')})
    .then(user => {
        if(!user) {
            return res.status(401).json({message:"Le compte utilisateur n'a pas été trouvé !"});
        }
        bcrypt.compare(req.body.password,user.password)
        .then(valid => {
            if(!valid) {
                return res.status(401).json({message:"Mot de passe incorrect !"})
            }
            return res.status(200).json({
                userId: user._id,
                token: token.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};