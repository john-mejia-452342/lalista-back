import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import nodeMailer from 'nodemailer';
import { generarJWT } from '../middlewares/validar-jwt.js';
import helpersGeneral from '../helpers/generales.js';

let codigoEnviado = {};

function generarCodigo() {
    let numAleatorio = Math.floor(1000 + Math.random() * 100000);
    let num = numAleatorio.toString().padStart(6, '0');
    let fechaCreacion = new Date();

    codigoEnviado = {codigo: num, fechaCreacion};

    return num;
}

const hhtpUser = {

    //Obtener todos los usuarios
    getUsers: async (req, res) => {
        try {
            const users = await User.find();
            if (!users) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const usersFormat = users.map((element) => {
                delete element._doc.password;
                return element
            });
            res.json(usersFormat);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Obtener un usuario por su id
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = await User.findById(id);
            if (!userId) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const userFormat = userId.map((element) => {
                delete element._doc.password;
                return element
            });
            res.json(userFormat);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Obtener un usuario por su correo
    getUserByCorreo: async (req, res) => {
        try {
            const { correo } = req.params;
            const userCorreo = await User.findOne(correo);
            if (!userCorreo) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const userFormat = userCorreo.map((element) => {
                delete element._doc.password;
                return element
            });
            res.json(userFormat);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Registro de usuario
    postUserRegistro: async (req, res) => {
        try {
            const { nombre, correo, password, rol, metodoDonacion } = req.body;
            const user = new User({ nombre, correo, password, rol, metodoDonacion });
            if (user.password) {
                const salt = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(password, salt);
                
            }
            await user.save();
            delete user._doc.password;
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Login de usuario
    postLogin: async (req, res) => {
        try {
            const { correo, password } = req.body;
            const user = await User.findOne({ correo });
            if (!user) {
                return res.status(400).json({ error: "Correo/Password incorrectos" });
            };
            const roles = ['admin', 'user'];
            if (!roles.includes(user.rol)) {
                return res.status(400).json({ error: helpersGeneral.errores.noAutorizado });
            };
            if (user.estado === 0) {
                return res.status(400).json({ error: "Usuario Inactivo" });
            };
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: "Correo/Password incorrectos" });
            };
            const token = await generarJWT(user.id);
            delete user._doc.password;
            res.json({ user, token });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Codigo Recuperacion de contraseña
    codigoRecuperacion: async (req, res) => {
        try {
            const { correo } = req.params;
            const codigo = generarCodigo();

            const transporter = nodeMailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.userEmail,
                    pass: process.env.password,
                },
            });

            const mailOptions = {
                from: process.env.userEmail,
                to: correo,
                subject: 'Recuperación de contraseña',
                text: `Su código de recuperación es: ${codigo}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        success: false,
                        error: 'Error al enviar el correo',
                    });
                }else {
                    console.log('Correo enviado: ' + info.response);
                    res.json({ 
                        success: true,
                        message: 'Correo enviado exitosamente' 
                    });
                }
            });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Verificar Codigo Recuperacion de contraseña
    confirmarCodigo: async (req, res) => {
        try {
            const { codigo } = req.params;
            if (!codigoEnviado) {
                res.status(400).json({ error: 'No se ha solicitado un código de recuperación' });
            }

            const {codigo: codigoGuardado, fechaCreacion} = codigoEnviado;
            const tiempoExpiracion = 30;

            const tiempoActual = new Date();
            const tiempoTranscurrido = tiempoActual - new Date(fechaCreacion);
            const tiempoMinutos = Math.round(tiempoTranscurrido / (1000 * 60));

            if (tiempoMinutos > tiempoExpiracion) {
                res.status(400).json({ error: 'El código ha expirado' });
            }

            if (codigo === codigoGuardado) {
                res.json({ message: 'Código correcto' });
            }

            res.status(400).json({ error: 'Código incorrecto' });
        } catch (error) {
            return res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Establecer nueva Contraseña
    nuevaPassword: async (req, res) => {
        try {
            const { codigo, password } = req.body;

            const {codigo: codigoGuardado, fechaCreacion} = codigoEnviado;
            const tiempoExpiracion = 30;

            const tiempoActual = new Date();
            const tiempoTranscurrido = tiempoActual - new Date(fechaCreacion);
            const tiempoMinutos = Math.round(tiempoTranscurrido / (1000 * 60));

            if (tiempoMinutos > tiempoExpiracion) {
                res.status(400).json({ error: 'El código ha expirado' });
            }

            if (codigo === codigoGuardado) {
                codigoEnviado = {};
                const usuario = req.UserUpdate;

                const salt = bcrypt.genSaltSync();
                const newPasswordHash = bcrypt.hashSync(password, salt);

                await User.findByIdAndUpdate(usuario.id, { password: newPasswordHash }, { new: true });

                return res.status(200).json({ message: 'Contraseña actualizada' });
            }

            res.status(400).json({ error: 'Código incorrecto' });
        } catch (error) {
            return res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Cambio de contraseña
    putCambioPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { password, newPassword } = req.body;
            const usuario = await User.findById(id);

            if (!usuario) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };

            const passwordAnterior = usuario.password;

            const validPassword = bcrypt.compareSync(
                String(password), 
                String(passwordAnterior)
            );

            if (!validPassword) {
                return res.status(400).json({ error: "Contraseña actual incorrecta" });
            };

            const salt = bcrypt.genSaltSync();
            const newPasswordHash = bcrypt.hashSync(newPassword, salt);

            await User.findByIdAndUpdate(id, { password: newPasswordHash }, new { new: true });

            return res.status(200).json({ message: "Contraseña actualizada" });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Editar Usuario
    putUserUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, correo, rol, metodoDonacion } = req.body;
            const user = await User.findByIdAndUpdate(id, { nombre, correo, rol, metodoDonacion }, { new: true });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Activar Usuario
    putActivarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    //Inactivar Usuario
    putInactivarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error});
        }
    },

    // Eliminar Usuario
    deleteUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            await User.findByIdAndDelete(id);
            res.json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default hhtpUser;