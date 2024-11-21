import Publicacion from '../models/publicacion.js';
import Reaccion from '../models/reaccion.js';
import Comentario from '../models/comentario.js';
import helpersGeneral from '../helpers/generales.js';

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
        try {z
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

    //Obtener publicaciones por su id
    getPublicacionById: async (req, res) => {
        try {
            const { id } = req.params;
            const publicacionID = await Publicacion.findById(id);
            if (!publicacionID) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const publicacionesConDetalles = await Promise.all(publicacionID.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener publicaciones por el id del usuario
    getPublicacionesByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const publicaciones = await Publicacion.find({ userId: idUser });
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
            const publicaciones = await Publicacion.find({
                fecha: {
                    $gte: start,
                    $lte: end
                }
            });
            if (!publicaciones || publicaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const publicacionesConDetalles = await Promise.all(publicaciones.map(obtenerDetallesPublicacion));
            res.json(publicacionesConDetalles);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
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
            const { titulo, contenido, imagen, estado } = req.body;
            const userId = req.user._id;
            const userRole = req.user.rol;
            const publicacion = await Publicacion.findById(id);
            if (!publicacion) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (publicacion.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta publicación' });
            }
            const publicacionActualizada = await Publicacion.findByIdAndUpdate(
                id,
                { titulo, contenido, imagen, estado },
                { new: true }
            );
            res.json(publicacionActualizada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
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