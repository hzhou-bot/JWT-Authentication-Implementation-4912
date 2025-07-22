import { Base64 } from 'js-base64';

const JWT_SECRET = 'your-secret-key-change-in-production';

// Simple JWT implementation for browser
export const generateToken = (userId) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  const encodedHeader = Base64.encodeURI(JSON.stringify(header));
  const encodedPayload = Base64.encodeURI(JSON.stringify(payload));
  
  // Simple signature (not cryptographically secure - for demo purposes)
  const signature = Base64.encodeURI(JWT_SECRET + encodedHeader + encodedPayload);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, expired: false, userId: null };
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = Base64.encodeURI(JWT_SECRET + encodedHeader + encodedPayload);
    if (signature !== expectedSignature) {
      return { valid: false, expired: false, userId: null };
    }
    
    const payload = JSON.parse(Base64.decode(encodedPayload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, expired: false, userId: null };
    }
    
    return { valid: true, expired: false, userId: payload.id };
  } catch (error) {
    return { valid: false, expired: false, userId: null };
  }
};

// Simple password hashing (not secure - for demo purposes)
export const hashPassword = async (password) => {
  // In a real app, use a proper hashing library or handle this server-side
  return Base64.encode(password + 'salt');
};

// Compare password with hash
export const comparePasswords = async (password, hashedPassword) => {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
};