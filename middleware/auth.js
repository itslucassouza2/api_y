const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const pemCert = fs.readFileSync(path.resolve("yiyigames.cer"));

const middlewareValidarJWT = async (req, res, next) => {
    if (!req.headers["authorization"]) return res.status(401).send();

    try {
        const [bearer, token] = req.headers["authorization"].split(" ");

        if (bearer !== "Bearer") {
            return res.status(401).send();
        }

        jwt.verify(token, pemCert, (err, userinfo) => {
            if (err) {
                console.error("jwt verify error: ", err);
                return res.status(403).end();
            }

            const sub = userinfo.sub;
            const [provider, userId] = sub.split("|");

            req.jwt = userinfo;
            req.user = {
                provider,
                userId
            };

            next();
        });
    } catch (err) {
        console.error(err);
        return res.status(403).send();
    }
};

module.exports = { middlewareValidarJWT };
