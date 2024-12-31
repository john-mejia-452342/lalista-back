import Lista from '../models/lista.js';
import User from '../models/user.js';
import helpersGeneral from '../helpers/generales.js';

const httpLista = {
    //Obtener todas los listas
    getListas: async (req, res) => {
        try {
            const listas = await Lista.find();
            if (!listas) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(listas);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener listas por su id
    getListaById: async (req, res) => {
        try {
            const { id } = req.params;
            const ListaId = await Lista.findById(id);
            if (!ListaId) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(ListaId);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista por el id de usuario
    getListaByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;   
            const lista = await Lista.find({ idUser: idUser });
            if (!lista || lista.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista por tipo
    getListaByTipo: async (req, res) => {
        try {
            const { tipo } = req.params;
            const lista = await Lista.find({ tipo: tipo });
            if (!lista || lista.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista por rango de fechas
    getListaByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const listas = await Lista.find({
                createAT: { 
                    $gte: start, 
                    $lte: end 
                }
            });
            if (listas.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron listas en el rango de fechas.'
                });
            }
            res.json(listas);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar un nuevo lista
    postAddLista: async (req, res) => {
        try {
            const { idUser, tipo } = req.body;
            const nuevaLista = new Lista({
                idUser,
                tipo
            });
            const listaGuardado = await nuevaLista.save();
            res.status(201).json({listaGuardado, notificacionGuardada});
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar una lista
    putUpdateLista: async (req, res) => {
        try {
            const { id } = req.params;
            const { tipo, idUser } = req.body;
            const user = await User.findById(idUser);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const userId = user._id.toString();
            const userRole = user.rol;
            const lista = await Lista.findById(id);
            if (!lista) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (lista.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar este lista' });
            }
            const listaActualizado = await lista.findByIdAndUpdate(
                id,
                { tipo, idUser },
                { new: true }
            );
            res.json(listaActualizado);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar lista
    putActivarLista: async (req, res) => {
        try {
            const { id } = req.params;
            const lista = await Lista.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar lista
    putInactivarLista: async (req, res) => {
        try {
            const { id } = req.params;
            const lista = await Lista.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar lista
    deleteLista: async (req, res) => {
        try {
            const { id } = req.params;
            await Lista.findByIdAndDelete(id);
            res.json({ message: 'lista eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpLista;