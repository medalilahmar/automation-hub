module.exports = (req, res, next) => {
  const { body } = req;
  for (let key in body) {
    if (body[key] === undefined || body[key] === null) {
      return res.status(400).json({ message: `Le champ ${key} est requis` });
    }
  }
  next();
};