import Reaccion from '../models/reaccion.js';
import helpersGeneral from '../helpers/generales.js';

const httpReaccion = {
    //Obtener todos las Reacciones
    getReacciones: async (req, res) => {
        try {
            const reacciones = await Reaccion.find();
            if (!reacciones) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(reacciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener reacciones por su id
    getReaccionById: async (req, res) => {
        try {
            const { id } = req.params;
            const reaccion = await Reaccion.findById(id);
            if (!reaccion) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(reaccion);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Reacciones por el id de la Publicacion
    getReaccionByIdPublicacion: async (req, res) => {
        try {
            const { idPublicacion } = req.params;
            const reaccion = await Reaccion.find({ idPublicacion: idPublicacion });
            if (!reaccion || reaccion.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(reaccion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Reacciones por el id del Usuario
    getReaccionesByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const reacciones = await Reaccion.find({ idUser: idUser });
            if (!reacciones || reacciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(reacciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener reacciones por rango de fechas
    getReaccionesByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const reacciones = await Reaccion.find({
                fecha: {
                    $gte: start,
                    $lte: end
                }
            });
            if (!reacciones || reacciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(reacciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar una nueva reaccion
    postAddReaccion: async (req, res) => {
        try {
            const { idPublicacion, idComentario, idUser, tipo } = req.body;
            const nuevaReaccion = new Reaccion({
                idPublicacion,
                idComentario,
                idUser,
                tipo
            });
            const reaccionGuardada = await nuevaReaccion.save();
            res.status(201).json(reaccionGuardada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar una reaccion
    putUpdateReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            const { tipo } = req.body;
            const userId = req.user._id; 
            const userRole = req.user.rol; 
            const reaccion = await Reaccion.findById(id);
            if (!reaccion) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (reaccion.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta reacción' });
            }
            const reaccionActualizada = await Reaccion.findByIdAndUpdate(
                id,
                { tipo },
                { new: true }
            );
            res.json(reaccionActualizada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar Reaccion
    putActivarReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            const reaccion = await Reaccion.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(reaccion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Reaccion
    putInactivarReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            const reaccion = await Reaccion.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(reaccion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Reaccion
    deleteReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            await Reaccion.findByIdAndDelete(id);
            res.json({ message: 'Reaccion eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpReaccion;