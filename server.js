const express = require('express');
const cors = require('cors');
const wol = require('wake_on_lan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/wake', (req, res) => {
    const { mac, host, port } = req.body;

    if (!mac || !host) {
        return res.status(400).json({ error: 'MAC e DDNS são obrigatórios.' });
    }

    const targetPort = parseInt(port) || 9;

    wol.wake(mac, { address: host, port: targetPort }, (error) => {
        if (error) {
            console.error('Erro ao enviar pacote UDP:', error);
            return res.status(500).json({ error: 'Erro interno ao emitir o pacote.' });
        }
        console.log(`Pacote enviado com sucesso para ${mac} via ${host}:${targetPort}`);
        return res.json({ success: true, message: 'Pacote mágico enviado!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
