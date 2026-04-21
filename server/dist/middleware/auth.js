import { supabase } from '../lib/supabase.js';
export const requireAuth = async (req, res, next) => {
    if (!supabase) {
        return res.status(500).json({ error: 'Server authentication service not configured.' });
    }
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user)
            return res.status(401).json({ error: 'Invalid token' });
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Authentication check failed.' });
    }
};
