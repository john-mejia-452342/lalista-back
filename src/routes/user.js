import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import httpUser from '../controllers/user.js';
import helpersUsuario from '../helpers/usuario.js';

const router = Router();

router.get("/all", [
    validarJWT
], httpUser.getUsers);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], httpUser.getUserById);

router.get("/email/:correo", [
    validarJWT,
    check('correo', 'Correo requerido').not().isEmpty(),
    check('correo', 'Correo requerido').isEmail(),
    validarCampos
], httpUser.getUserByCorreo);

router.post("/registro", [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('rol', 'El rol es obligatorio').not().isEmpty(),
    check('metodoDonacion', 'El metodo de donacion es obligatorio').not().isEmpty(),
    validarCampos,
], httpUser.postUserRegistro);

router.post("/login", [
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos,
], httpUser.postLogin);

router.get("/sendCode/:correo", [
    check('correo', 'Correo requerido').not().isEmpty(),
    check('correo', 'Correo requerido').isEmail(),
    validarCampos
], httpUser.codigoRecuperacion);

router.get("/confirmar-codigo/:codigo", [
    check('codigo', 'Codigo requerido').not().isEmpty(),
    validarCampos
], httpUser.confirmarCodigo);

router.put("/cambio-password", [
    check('correo', 'Correo requerido').not().isEmpty(),
    check('correo', 'Correo requerido').isEmail(),
    check('correo').custom(helpersUsuario.existeCorreoNewPass),
    check('codigo', 'Codigo requerido').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('password', 'La contraseña debe tener al menos 1 mayuscula, 1 minuscula, 2 números y un caracter especial.'
    ).custom(helpersUsuario.validarClave),
    validarCampos,
], httpUser.nuevaPassword);

router.put("/cambio-password/:id", [
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('nuevaPassword', 'La nueva contraseña es obligatoria').not().isEmpty(),
    check('nuevaPassword', 'La nueva contraseña debe tener al menos 1 mayuscula, 1 minuscula, 2 números y un caracter especial.'
    ).custom(helpersUsuario.validarClave),
    validarCampos,
], httpUser.putCambioPassword);

router.put("/editar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('correo', 'El correo es obligatorio').isEmail(),
    check('metodoDonacion', 'El metodo de donacion es obligatorio').not().isEmpty(),
    validarCampos,
], httpUser.putUserUpdate);

router.put("/activar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpUser.putActivarUsuario);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpUser.putInactivarUsuario);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpUser.deleteUsuario);

export default router;