"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavorecidosRepository = void 0;
class FavorecidosRepository {
    handleError(response, status, error) {
        response.status(status).json({ error: error.toString() });
    }
}
exports.FavorecidosRepository = FavorecidosRepository;
