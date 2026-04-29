// backend/middleware/isAdmin.js

const isAdmin = (req, res, next) => {
    console.log("Logged in user data:", req.user);
    // Check karo ki req.user exist karta hai (authMiddleware se aata hai) 
    // aur uska role 'admin' hai ya nahi
    if (req.user && req.user.role === 'admin') {
        next(); // Agar admin hai toh aage badhne do
    } else {
        return res.status(403).json({ 
            success: false, 
            message: "Access Denied: Sirf Admin hi ye data dekh sakta hai!" 
        });
    }
};

module.exports = isAdmin;