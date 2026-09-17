const express = require('express');
const wol = require('wake_on_lan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/wake', (req, res) => {
    const { mac, ip, port, secureon } = req.body;

    if (!mac) {
        return res.status(400).json({ success: false, message: 'O Endereço MAC é obrigatório.' });
    }

    // Configurando apenas o que foi informado (MAC + IP/DDNS e Porta opcional)
    const options = {};
    
    if (ip) {
        options.address = ip; // Aceita IP local da máquina ou endereço DDNS
    }
    
    if (port) {
        options.port = parseInt(port, 10);
    }

    if (secureon) {
        options.password = secureon;
    }

    wol.wake(mac, options, (error) => {
        if (error) {
            console.error(`Erro ao enviar WoL para o MAC ${mac} no destino ${ip || 'padrão'}:`, error);
            return res.status(500).json({ success: false, message: 'Falha ao enviar o pacote Wake on LAN.' });
        } else {
            console.log(`Pacote Wake on LAN enviado com sucesso para o MAC ${mac} usando o destino ${ip || 'padrão'}`);
            return res.json({ 
                success: true, 
                message: `Pacote enviado com sucesso para ${mac}!` 
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
