import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import hhtpPublicacion from '../controllers/publicacion.js';

const router = Router();

router.get("/all", [
    // validarJWT
], hhtpPublicacion.getPublicaciones);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], hhtpPublicacion.getPublicacionById);

router.get("/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], hhtpPublicacion.getPublicacionesByIdUser);

router.get("/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], hhtpPublicacion.getPublicacionesByDateRange);

router.post("/add", [
    // validarJWT,
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').not().isEmpty(),
    validarCampos,
], hhtpPublicacion.postAddPublicacion);

router.put("/editar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').isMongoId(),
    validarCampos,
], hhtpPublicacion.putUpdatePublicacion);

router.put("/activar/:id", [
    // validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], hhtpPublicacion.putActivarPublicacion);

router.put("/desactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], hhtpPublicacion.putInactivarPublicacion);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], hhtpPublicacion.deletePublicacion);

export default router;