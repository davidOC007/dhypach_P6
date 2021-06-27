module.exports = (req,res,next) => {
    const inputSauce = /^[a-zA-Zéèàêûçàôëî.':,!\\s-]{2,1000}$/
    const pattern = new RegExp(inputSauce);
    if(pattern.test(req.body.password)) {
        next();
    } else {
        res.status(400).json({ message: "Veuillez vérifier le contenu de vos champs !"});
    }
}
