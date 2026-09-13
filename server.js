const express = require('express');
const cors = require('cors');
const wol = require('node-wol');

const app = express();

// Configuração explícita de CORS para liberar o seu site do GitHub Pages
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Rota para testar se o servidor responde de forma limpa
app.get('/', (req, res) => {
    res.json({ status: "Servidor WoL ativo e operando perfeitamente!" });
});

app.post('/wake', (req, res) => {
    const { address, broadcast, port } = req.body;

    if (!address || !broadcast) {
        return res.status(400).json({ error: 'DDNS e IP de Broadcast são obrigatórios.' });
    }

    const options = {
        address: address,
        port: port || 9
    };

    wol.wake(broadcast, options, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Falha ao enviar o pacote via Broadcast.' });
        }
        return res.json({ success: true, message: `Pacote enviado para o broadcast ${broadcast}!` });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
