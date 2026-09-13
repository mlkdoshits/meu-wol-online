const express = require('express');
const cors = require('cors');
const wol = require('wake_on_lan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/wake', (req, res) => {
    const { mac, broadcast, port } = req.body;

    // O MAC continua sendo obrigatório por especificação do protocolo de hardware (WoL)
    if (!mac || !broadcast) {
        return res.status(400).json({ error: 'O Endereço MAC e o IP de Broadcast/DDNS são obrigatórios.' });
    }

    const targetPort = parseInt(port) || 9;

    // Dispara o pacote mágico usando o IP de Broadcast ou DDNS fornecido pelo usuário
    wol.wake(mac, { address: broadcast, port: targetPort }, (error) => {
        if (error) {
            console.error('Erro ao enviar o pacote:', error);
            return res.status(500).json({ error: 'Erro interno ao emitir o pacote de transmissão.' });
        }
        console.log(`Sucesso: Pacote enviado para MAC ${mac} via Broadcast/DDNS: ${broadcast}:${targetPort}`);
        return res.json({ success: true, message: 'Pacote de transmissão enviado!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
