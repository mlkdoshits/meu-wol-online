const express = require('express');
const cors = require('cors');
const wol = require('wake_on_lan');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/wake', (req, res) => {
    const { mac, ddns, broadcast, port } = req.body;

    // Validação dos parâmetros obrigatórios
    if (!mac || !ddns) {
        return res.status(400).json({ error: 'O Endereço MAC e o DDNS são obrigatórios para envio externo.' });
    }

    const targetPort = parseInt(port) || 9;

    // Na nuvem (Render), enviamos o pacote para o DDNS público.
    // O IP de broadcast interno serve como referência de configuração da sua rede doméstica.
    wol.wake(mac, { address: ddns, port: targetPort }, (error) => {
        if (error) {
            console.error('Erro no envio do pacote:', error);
            return res.status(500).json({ error: 'Erro interno ao emitir o pacote.' });
        }
        console.log(`Sucesso: Pacote enviado para MAC ${mac} via DDNS ${ddns}:${targetPort} (Foco na rede: ${broadcast || 'Não informada'})`);
        return res.json({ success: true, message: 'Pacote disparado com sucesso!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
