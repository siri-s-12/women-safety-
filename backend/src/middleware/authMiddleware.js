const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
        }

        // Check if it's a mock token (for development/testing without MongoDB)
        if (token.startsWith('mock-token-') || token.startsWith('test-token-')) {
            req.user = { 
                userId: 'mock-user-123', 
                email: 'test@example.com',
                isMockUser: true 
            };
            next();
        } else {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { userId: decoded.userId, email: decoded.email };
            next();
        }
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = { verifyToken };
