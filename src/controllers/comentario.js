import Comentario from '../models/comentario.js';
import User from '../models/user.js';
import Notificacion from '../models/notificacion.js';
import helpersGeneral from '../helpers/generales.js';

const httpComentario = {
    //Obtener todos los comentarios
    getComentarios: async (req, res) => {
        try {
            const comentarios = await Comentario.find();
            if (!comentarios) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(comentarios);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener comentarios por su id
    getComentarioById: async (req, res) => {
        try {
            const { id } = req.params;
            const comentarioId = await Comentario.findById(id);
            if (!comentarioId) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(comentarioId);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Comentarios por el id de la Publicacion
    getComentarioByIdPublicacion: async (req, res) => {
        try {
            const { idPublicacion } = req.params;   
            const comentario = await Comentario.find({ idPublicacion: idPublicacion });
            if (!comentario || comentario.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(comentario);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Comentarios por el id del Usuario
    getComentariosByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const comentarios = await Comentario.find({ idUser: idUser });
            if (!comentarios || comentarios.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(comentarios);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener comentarios por rango de fechas
    getComentarioByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const comentarios = await Comentario.find({
                createAT: { 
                    $gte: start, 
                    $lte: end 
                }
            });
            if (comentarios.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron comentarios en el rango de fechas.'
                });
            }
            res.json(comentarios);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar un nuevo comentario
    postAddComentario: async (req, res) => {
        try {
            const { idPublicacion, idUser, contenido } = req.body;
            const nuevoComentario = new Comentario({
                idPublicacion,
                idUser,
                contenido
            });
            const nuevaNotificacion = new Notificacion({
                idUser,
                idComentario: nuevoComentario._id,
                tipo: 'comentario',
                mensaje: 'Nuevo comentario en una publicacion'
            });
            const notificacionGuardada = await nuevaNotificacion.save();
            const comentarioGuardado = await nuevoComentario.save();
            res.status(201).json({comentarioGuardado, notificacionGuardada});
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar un comentario
    putUpdateComentario: async (req, res) => {
        try {
            const { id } = req.params;
            const { contenido, idUser } = req.body;
            const user = await User.findById(idUser);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const userId = user._id.toString();
            const userRole = user.rol;
            const comentario = await Comentario.findById(id);
            if (!comentario) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (comentario.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
            }
            const comentarioActualizado = await Comentario.findByIdAndUpdate(
                id,
                { contenido },
                { new: true }
            );
            res.json(comentarioActualizado);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar Comentario
    putActivarComentario: async (req, res) => {
        try {
            const { id } = req.params;
            const comentario = await Comentario.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(comentario);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Comentario
    putInactivarComentario: async (req, res) => {
        try {
            const { id } = req.params;
            const comentario = await Comentario.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(comentario);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Comentario
    deleteComentario: async (req, res) => {
        try {
            const { id } = req.params;
            await Comentario.findByIdAndDelete(id);
            res.json({ message: 'Comentario eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpComentario;