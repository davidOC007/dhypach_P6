const Sauce = require('../models/sauce');
const fs = require('fs');

// Création d'une Sauce
exports.createSauce = (req,res,next) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    const sauce = new Sauce({
        ...sauceObjet,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    if (!req.body.errorMessage) {
        sauce.save()
        .then(() => { 
            res.status(201).json({ message: "La sauce a été créée !" }); 
        })
        .catch((error) => {
            if (error.message.indexOf("to be unique") > -1) {
                res.status(400).json({ message: "La sauce existe déjà!"});
                fs.unlink(`images/${req.file.filename}`, () => {
                    console.log("La requête n'est pas valide")
                });
            }
        res.status(500).json({message:error});
        })
    }
};

// Récupération de toutes les sauces
exports.allSauces = (req,res,next) => {
    Sauce.find()
    .then(sauces => {
        res.status(200).json(sauces);
    })
    .catch(error => {
        res.status(400).json({ message: error });
    });
};

// Récupération d'une seule sauce
exports.oneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        res.status(200).json(sauce);
    })
    .catch( error => {
        res.status(404).json({ error: error });
    });
};

// Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "La sauce a été supprimée !"}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

// Modification d'un like/dislike
exports.modifyLike = (req, res, next) => {
    switch (req.body.like) {
        case 0:
          Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
              if (sauce.usersLiked.find(user => user === req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id }, {
                  $inc: { likes: -1 },
                  $pull: { usersLiked: req.body.userId },
                  _id: req.params.id
                })
                  .then(() => { res.status(201).json({ message: "changement validé !" }); })
                  .catch((error) => { res.status(400).json({ error: error }); });
    
              } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                Sauce.updateOne({ _id: req.params.id }, {
                  $inc: { dislikes: -1 },
                  $pull: { usersDisliked: req.body.userId },
                  _id: req.params.id
                })
                  .then(() => { res.status(201).json({ message: "changement validé !" }); })
                  .catch((error) => { res.status(400).json({ error: error }); });
              }
            })
            .catch((error) => { res.status(404).json({ error: error }); });
          break;
        case 1:
          Sauce.updateOne({ _id: req.params.id }, {
            $inc: { likes: 1 },
            $push: { usersLiked: req.body.userId },
            _id: req.params.id
          })
            .then(() => { res.status(201).json({ message: "like ajouté !" }); })
            .catch((error) => { res.status(400).json({ error: error }); });
          break;
        case -1:
          Sauce.updateOne({ _id: req.params.id }, {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
            _id: req.params.id
          })
            .then(() => { res.status(201).json({ message: "dislike ajouté !" }); })
            .catch((error) => { res.status(400).json({ error: error }); });
          break;
        default:
          console.error("error");
      }
    };

// Modification d'une sauce
exports.modifySauce = (req, res, next) => {
    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {});
            })
            .catch(error => res.status(500).json({ error }));
    }
    const sauceObject = req.file ?
        {    
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'La sauce a été modifiée!'}))
            .catch(error => res.status(400).json({ error }));
};