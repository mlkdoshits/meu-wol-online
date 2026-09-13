const express = require('express');
const cors = require('cors');
const wol = require('node-wol');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/wake', (req, res) => {
    const { address, broadcast, port } = req.body;

    if (!address || !broadcast) {
        return res.status(400).json({ error: 'DDNS e IP de Broadcast são obrigatórios.' });
    }

    // Configura o pacote para usar o DDNS externamente e mirar no Broadcast configurado
    const options = {
        address: address, 
        port: port || 9
    };

    // Envia o pacote direcionado ao endereço de IP de Broadcast fornecido
    wol.wake(broadcast, options, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Falha ao enviar o pacote via Broadcast.' });
        }
        return res.json({ success: true, message: `Pacote enviado para o broadcast ${broadcast} via ${address}!` });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
