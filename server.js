const express = require('express');
const wol = require('wake_on_lan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Defina a senha de acesso protegida aqui ou via variável de ambiente
const ACCESS_PASSWORD = process.env.WOL_PASSWORD || 'sua_senha_segura';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/wake', (req, res) => {
    const { mac, ip, password } = req.body;

    // Validação da senha
    if (!password || password !== ACCESS_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Senha incorreta!' });
    }

    if (!mac) {
        return res.status(400).json({ success: false, error: 'Endereço MAC não informado.' });
    }

    // Configuração do Wake on LAN
    // Se o IP/Broadcast não for informado, usa o broadcast global por padrão
    const options = {
        address: ip && ip.trim() !== '' ? ip.trim() : '255.255.255.255',
        port: 9 // Porta padrão WoL
    };

    console.log(`Enviando pacote Mágico para MAC: ${mac} via endereço/broadcast: ${options.address}`);

    wol.wake(mac, options, (error) => {
        if (error) {
            console.error('Erro ao enviar WoL:', error);
            return res.status(500).json({ success: false, error: 'Falha ao enviar o pacote mágico: ' + error.message });
        } else {
            console.log('Pacote mágico enviado com sucesso!');
            return res.json({ success: true, message: 'Pacote mágico disparado com sucesso!' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
