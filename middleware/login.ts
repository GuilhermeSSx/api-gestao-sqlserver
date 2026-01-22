import { verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express'; // Tipos do Express

export function login(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({ message: 'Token está em falta.' });
    }

    // O header vem como "Bearer <token>", precisamos tirar a palavra "Bearer"
    const [, token] = authToken.split(" ");

    try {
        const decode = verify(token, process.env.SECRET as string);
        // @ts-ignore - ou estender a tipagem do Express
        req.user = decode;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido.' });
    }
}