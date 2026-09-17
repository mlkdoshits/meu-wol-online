const express = require('express');
const wol = require('wake_on_lan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/wake', (req, res) => {
    const { mac, ip, subnet, port, secureon } = req.body;

    if (!mac) {
        return res.status(400).json({ success: false, message: 'O Endereço MAC é obrigatório.' });
    }

    // Montando as opções avançadas inspiradas na Depicus
    const options = {};
    
    if (ip) options.address = ip;
    if (subnet) options.subnet = subnet;
    if (port) options.port = parseInt(port, 10);
    if (secureon) options.password = secureon; // Senha do SecureON se configurada

    wol.wake(mac, options, (error) => {
        if (error) {
            console.error(`Erro ao enviar WoL para ${mac}:`, error);
            return res.status(500).json({ success: false, message: 'Falha ao enviar o pacote Wake on LAN.' });
        } else {
            console.log(`Pacote Wake on LAN enviado com sucesso para ${mac}`);
            return res.json({ 
                success: true, 
                message: `Pacote mágico enviado com sucesso para o MAC ${mac}!` 
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor Wake on LAN rodando na porta ${PORT}`);
});
