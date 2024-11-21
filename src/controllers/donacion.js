import Donacion from '../models/donacion.js';
import helpersGeneral from '../helpers/generales.js';

const httpDonacion = {
    //Obtener todos los donaciones
    getDonaciones: async (req, res) => {
        try {
            const donaciones = await Donacion.find().populate('idUser', 'nombre email');
            if (!donaciones) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(donaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener donaciones por su id
    getDonacionById: async (req, res) => {
        try {
            const { id } = req.params;
            const donacionId = await Donacion.findById(id).populate('idUser', 'nombre email');
            if (!donacionId) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(donacionId);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener donaciones por el id del Usuario
    getDonacionByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const donaciones = await Donacion.find({ idUser: idUser }).populate('idUser', 'nombre email');
            if (!donaciones || donaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(donaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener donaciones por rango de fechas
    getDonacionesByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            const donaciones = await Donacion.find({
                fecha: {
                    $gte: start,
                    $lte: end
                }
            }).populate('idUser', 'nombre email');
            if (!donaciones || donaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(donaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar un nuevo donacion
    postAddDonacion: async (req, res) => {
        try {
            const { idUser, monto, mensaje, comprobante, estado } = req.body;
            const nuevaDonacion = new Donacion({
                idUser,
                monto,
                mensaje,
                comprobante,
                estado
            });
            const donacionGuardada = await nuevaDonacion.save();
            res.status(201).json(donacionGuardada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar un Donacion
    putUpdateDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            const { monto, mensaje, comprobante } = req.body;
            const userId = req.user._id;
            const userRole = req.user.rol;

            const donacion = await Donacion.findById(id);

            if (!donacion) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }

            if (donacion.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta donación' });
            }

            const donacionActualizada = await Donacion.findByIdAndUpdate(
                id,
                { monto, mensaje, comprobante },
                { new: true }
            );

            res.json(donacionActualizada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar Donacion
    putActivarDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            const donacion = await Donacion.findByIdAndUpdate(id, { estado: 'Aceptada' }, { new: true });
            res.json(donacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Donacion
    putInactivarDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            const donacion = await Donacion.findByIdAndUpdate(id, { estado: 'Denegada' }, { new: true });
            res.json(donacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Donacion
    deleteDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            await Donacion.findByIdAndDelete(id);
            res.json({ message: 'Donacion eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpDonacion;