import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {

    // Hash og salt password
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    // Valider password ved login
    // bcrypt.compare() sammenligner det indtastede password med det hash, der er gemt i databasen
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
