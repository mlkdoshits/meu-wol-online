const express = require('express');
const cors = require('cors');
const wol = require('wake_on_lan');
const dns = require('dns');

const app = express();
const PORT = process.env.PORT || 3000;

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
    const { mac, ddns, port } = req.body;

    if (!mac || !ddns) {
        return res.status(400).json({ error: 'O Endereço MAC e o DDNS são obrigatórios.' });
    }

    const targetPort = parseInt(port) || 9;

    try {
        const ipAlvo = await resolverDNS(ddns);
        console.log(`DNS Resolvido: ${ddns} -> IP Público ${ipAlvo}`);

        wol.wake(mac, { address: ipAlvo, port: targetPort }, (error) => {
            if (error) {
                console.error('Erro no envio do pacote:', error);
                return res.status(500).json({ error: 'Erro interno ao emitir o pacote.' });
            }
            console.log(`Sucesso: Pacote enviado para MAC ${mac} no IP ${ipAlvo}:${targetPort}`);
            return res.json({ success: true, message: 'Pacote disparado com sucesso!' });
        });

    } catch (dnsError) {
        console.error('Falha ao resolver o domínio DDNS:', dnsError);
        return res.status(400).json({ error: 'Não foi possível encontrar o IP desse DDNS. Verifique o endereço.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
