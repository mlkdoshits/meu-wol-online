const express = require('express');
const cors = require('cors');
const wol = require('node-wol');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/wake', (req, res) => {
    const { address, mac, port } = req.body;

    if (!address || !mac) {
        return res.status(400).json({ error: 'Endereço e MAC são obrigatórios.' });
    }

    const options = {
        address: address,
        port: port || 9
    };

    wol.wake(mac, options, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Falha ao enviar o pacote WoL.' });
        }
        return res.json({ success: true, message: `Pacote enviado para ${mac}!` });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
