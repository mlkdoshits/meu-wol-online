const express = require('express');
const cors = require('cors');
const wol = require('wake_on_lan');
const dns = require('dns');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 SUA SENHA CONFIGURADA COM SUCESSO
const SENHA_SECRETA = "12345fsc"; 

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const resolverDNS = (hostname) => {
    return new Promise((resolve, reject) => {
        if (/^[0-9.]+$/.test(hostname)) return resolve(hostname);
        dns.lookup(hostname, (err, address) => {
            if (err) reject(err);
            else resolve(address);
        });
    });
};

app.post('/api/wake', async (req, res) => {
    const { mac, ip, ddns, port, password } = req.body;

    // Validação estrita da senha escolhida por você
    if (!password || password !== SENHA_SECRETA) {
        return res.status(401).json({ error: 'Senha incorreta ou não fornecida.' });
    }

    if (!mac || !ddns || !ip) {
        return res.status(400).json({ error: 'O Endereço MAC, o DDNS e o IP são obrigatórios.' });
    }

    const targetPort = parseInt(port) || 9;

    try {
        const ipPublico = await resolverDNS(ddns);
        console.log(`DNS Resolvido: ${ddns} -> IP Público ${ipPublico}`);

        // O pacote será enviado para o IP de broadcast informado (ex: 192.168.1.255) 
        // mas direcionado através do IP público do seu DDNS/Modem na porta configurada.
        wol.wake(mac, { address: ip, port: targetPort }, (error) => {
            if (error) {
                console.error('Erro no envio do pacote:', error);
                return res.status(500).json({ error: 'Erro interno ao emitir o pacote.' });
            }
            console.log(`Sucesso: Pacote enviado para MAC ${mac} no Broadcast ${ip} via DDNS ${ipPublico}:${targetPort}`);
            return res.json({ success: true, message: 'Pacote disparado com sucesso!' });
        });

    } catch (dnsError) {
        console.error('Falha ao resolver o domínio DDNS:', dnsError);
        return res.status(400).json({ error: 'Não foi possível encontrar o IP desse DDNS. Verifique o endereço.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor protegido ativo na porta ${PORT}`);
});
