import crypto from 'crypto';
import { hashPassword, verifyPassword } from '@/lib/hash';

describe('Hash Utility Functions', () => {
    it('should hash a password and return a unique salt and hash', () => {
        const password = 'password123';
        const { hash, salt } = hashPassword(password);

        expect(hash).toBeDefined();
        expect(salt).toBeDefined();
        expect(hash).not.toBe(password);
        expect(salt).not.toBe(password);
    });

    it('should verify a password correctly with the correct hash and salt', () => {
        const password = 'password123';
        const { hash, salt } = hashPassword(password);

        const isValid = verifyPassword({ candidatePassword: password, salt, hash });
        expect(isValid).toBe(true);
    });

    it('should fail to verify a password with an incorrect hash', () => {
        const password = 'password123';
        const { hash, salt } = hashPassword(password);

        const isValid = verifyPassword({ candidatePassword: 'wrongpassword', salt, hash });
        expect(isValid).toBe(false);
    });

    it('should fail to verify a password with an incorrect salt', () => {
        const password = 'password123';
        const { hash } = hashPassword(password);
        const wrongSalt = crypto.randomBytes(16).toString('hex');

        const isValid = verifyPassword({ candidatePassword: password, salt: wrongSalt, hash });
        expect(isValid).toBe(false);
    });

    it('should generate different hashes for the same password with different salts', () => {
        const password = 'password123';
        const { hash: hash1, salt: salt1 } = hashPassword(password);
        const { hash: hash2, salt: salt2 } = hashPassword(password);

        expect(hash1).not.toBe(hash2);
        expect(salt1).not.toBe(salt2);
    });

    it('should generate the same hash for the same password and salt', () => {
        const password = 'password123';
        const { hash, salt } = hashPassword(password);
        const candidateHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        expect(candidateHash).toBe(hash);
    });

    it('should handle empty password input gracefully', () => {
        const password = '';
        const { hash, salt } = hashPassword(password);

        expect(hash).toBeDefined();
        expect(salt).toBeDefined();
    });

    it('should handle very long password input gracefully', () => {
        const password = 'a'.repeat(1000);
        const { hash, salt } = hashPassword(password);

        expect(hash).toBeDefined();
        expect(salt).toBeDefined();
    });
});