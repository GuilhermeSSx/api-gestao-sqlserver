import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { pool } from '../../sqlserver';

class FavorecidosRepository {


    private handleError(response: Response, status: number, error: any) {
        response.status(status).json({ error: error.toString() });
    }

}

export { FavorecidosRepository };