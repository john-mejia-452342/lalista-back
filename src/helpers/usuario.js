import User from "../models/user.js";
import helpersGeneral from "./generales.js";

function validarClave(clave) {
    const vali = /^(?=.[A-Z])(?=.[a-z])(?=.\d.\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if (!vali.test(clave)) {
        throw new Error("La contraseña no cumple con los requisitos");
    }
    return true;
}

async function existeCorreo(correo, req) {
    const existe = await User.findOne({
        correo: await helpersGeneral.quitarTildes(correo.toLowerCase()),
    });

    if (!existe && req.req.method === "GET") {
        throw new Error('El correo no se encuentra registrado');
    }

    if (existe) {
        if (req.req.method === "PUT" && req.req.body._id != existe._id) {
            throw new Error('Ya existe ese correo en la base de datos');
        } else if (req.req.method === "POST") {
            throw new Error('Ya existe ese correo en la base de datos');
        }
    }

    req.req.UserUpdate = existe;
}

const helpersUsuario = {
    existeId: async (id, req) => {
        const existe = await User.findById(id);

        if (!existe) {
            throw new Error('El usuario no esta registrado');
        }
        if (!existe.estado) {
            throw new Error(`El usuario ${ existe.nombres } esta inactivo`);
        }

        req.req.UserUpdate = existe;
    },

    desactivarAdmin: async (id, req) => {
        const rol = req.req.UserUpdate.rol;

        if (rol == "admin") {
            const usuarios = await User.find({ rol: "admin" });
            if (usuarios.length <= 1)
                throw new Error('No se pueden desactivar todos los admin');
        }
    },

    desactivarLogeado: async (id, req) => {
        const idLogeado = req.req.usuario._id;
        console.log(idLogeado);

        if (idLogeado == id) {
            throw new Error('No puedes desactivarte a ti mismo');
        }
    },

    existeIdentificacion: async (identificacion, req) => {
        const existe = await User.findOne({
            $text: { $search: identificacion },
        });

        if (existe) {
            if (req.req.method === "PUT" && req.req.body._id != existe._id) {
                throw new Error('Ya existe esa identificación en la base de datos');
            } else if (req.req.method === "POST") {
                throw new Error('Ya existe esa identificación en la base de datos');
            }
        }

        req.req.UserUpdate = existe;
    },

    existeTelefono: async (telefono, req) => {
        const rol = req.req.body.rol;
        const existe = await User.findOne({ $text: { $search: telefono }, rol });

        if (existe) {
            if (req.req.method === "PUT" && req.req.body._id != existe._id) {
                throw new Error('Ya existe ese teléfono en la base de datos');
            } else if (req.req.method === "POST") {
                throw new Error('Ya existe ese teléfono en la base de datos');
            }
        }

        req.req.UserUpdate = existe;
    },

    existeCorreo: async (correo, req) => {
        const existe = await User.findOne({
            correo: await helpersGeneral.quitarTildes(correo.toLowerCase()),
        });

        if (!existe && req.req.method === "GET") {
            throw new Error('El correo no se encuentra registrado');
        }

        if (existe) {
            if (req.req.method === "PUT" && req.req.body._id != existe._id) {
                throw new Error('Ya existe ese correo en la base de datos');
            } else if (req.req.method === "POST") {
                throw new Error('Ya existe ese correo en la base de datos');
            }
        }

        req.req.UserUpdate = existe;
    },

    existeCorreoNewPass: async (correo, req) => {
        const existe = await User.findOne({ correo });

        if (!existe) {
            throw new Error('El correo no se encuentra registrado');
        }

        req.req.UserUpdate = existe;
    },

    validarClave: async (clave, req) => {
        const vali = /^(?=.[A-Z])(?=.[a-z])(?=.\d.\d)(?=.*[@#$%^&+=!]).{8,}$/;
        if (!vali.test(clave)) {
            throw new Error("La contraseña no cumple con los requisitos");
        }
        return true;
    },

};
export default helpersUsuario;