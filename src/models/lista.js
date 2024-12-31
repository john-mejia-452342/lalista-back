import mongoose from 'mongoose';

const listaSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: Number, default: 1 }
});

export default mongoose.model('Lista', listaSchema);