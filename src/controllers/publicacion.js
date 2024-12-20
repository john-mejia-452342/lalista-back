import Publicacion from '../models/publicacion.js';
import Reaccion from '../models/reaccion.js';
import Comentario from '../models/comentario.js';
import User from '../models/user.js';
import helpersGeneral from '../helpers/generales.js';
import { get } from 'mongoose';

const obtenerDetallesPublicacion = async (publicacion) => {
    const comentarios = await Comentario.find({ idPublicacion: publicacion._id }).populate('idUser', 'nombre');
    const reacciones = await Reaccion.find({ idPublicacion: publicacion._id }).populate('idUser', 'nombre');
    const comentariosConReacciones = await Promise.all(comentarios.map(async (comentario) => {
        const reaccionesComentario = await Reaccion.find({ idComentario: comentario._id }).populate('idUser', 'nombre');
        return {
            ...comentario.toObject(),
            reacciones: reaccionesComentario,
            contadorReacciones: reaccionesComentario.length
        };
    }));
    return {
        ...publicacion.toObject(),
        comentarios: comentariosConReacciones,
        reacciones,
        contadorReacciones: reacciones.length
    };
};

const httpPublicacion = {
    // Obtener todas las publicaciones
    getPublicaciones: async (req, res) => {
        try {
            const publicaciones = await Publicacion.find().populate('idUser', 'nombre');
            if (!publicaciones || publicaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener todas las publicaciones activas
    getPublicacionesActivas: async (req, res) => {
        try {
            const publicaciones = await Publicacion.find({ estado: 'Activa' }).populate('idUser', 'nombre');
            if (!publicaciones || publicaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

     // Obtener todas las publicaciones Pendientes
    getPublicacionesPendientes: async (req, res) => {
        try {
            const publicaciones = await Publicacion.find({ estado: 'Pendiente' }).populate('idUser', 'nombre');
            if (!publicaciones || publicaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener publicaciones por su id
    getPublicacionById: async (req, res) => {
        try {
            const { id } = req.params;
            const publicacionID = await Publicacion.findById(id);
            if (!publicacionID) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const publicacionConDetalles = await obtenerDetallesPublicacion(publicacionID);
            res.json(publicacionConDetalles);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener publicaciones por el id del usuario
    getPublicacionesByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;  
            const publicaciones = await Publicacion.find({ idUser: idUser });
            if (!publicaciones || publicaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener publicaciones por rango de fechas
    getPublicacionesByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const publicaciones = await Publicacion.find({
                createAT: { 
                    $gte: start, 
                    $lte: end 
                }
            });
            if (publicaciones.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron publicaciones en el rango de fechas.'
                });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            console.error('Error completo:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    getPublicacionesByTipo: async (req, res) => {
        try {
            const { tipo } = req.params;
            const publicaciones = await Publicacion.find({ tipo: tipo });
            if (publicaciones.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron publicaciones con el tipo especificado.'
                });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    },

    // Agregar una nueva publicación
    postAddPublicacion: async (req, res) => {
        try {
            const { titulo, contenido, imagen, idUser } = req.body;

            const nuevaPublicacion = new Publicacion({
                titulo,
                contenido,
                imagen,
                idUser,
            });
            const publicacionGuardada = await nuevaPublicacion.save();
            res.json(publicacionGuardada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar una publicación
    putUpdatePublicacion: async (req, res) => {
        try {
            const { id } = req.params;
            const { titulo, contenido, imagen, idUser } = req.body;
            const user = await User.findById(idUser);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const userId = user._id.toString();
            const userRole = user.rol;
            const publicacion = await Publicacion.findById(id);
            if (!publicacion) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (publicacion.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta publicación' });
            }
            const publicacionActualizada = await Publicacion.findByIdAndUpdate(
                id,
                { titulo, contenido, imagen },
                { new: true }
            );
            res.json(publicacionActualizada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, detalleError: error.message });
        }
    },

    //Activar Publicacion
    putActivarPublicacion: async (req, res) => {
        try {
            const { id } = req.params;
            const publicacion = await Publicacion.findByIdAndUpdate(id, { estado: 'Activa' }, { new: true });
            res.json(publicacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Publicacion
    putInactivarPublicacion: async (req, res) => {
        try {
            const { id } = req.params;
            const publicacion = await Publicacion.findByIdAndUpdate(id, { estado: 'Rechazada' }, { new: true });
            res.json(publicacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Publicacion
    deletePublicacion: async (req, res) => {
        try {
            const { id } = req.params;
            await Publicacion.findByIdAndDelete(id);
            res.json({ message: 'Publicacion eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpPublicacion;