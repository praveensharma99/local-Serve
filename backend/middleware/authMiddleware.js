const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Header se token nikalna (Bearer token)
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // 2. Token verify karo (Jo SECRET tumne login ke waqt use kiya tha)
        // const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. User ka data request mein dalo taaki controller use use kar sake (req.user.id)
        req.user = decoded;

        next(); // Agle step (Controller) par jao
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = authMiddleware; // <-- Export as a function