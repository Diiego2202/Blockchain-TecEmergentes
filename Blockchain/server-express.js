const express = require('express');
const { Web3 } = require('web3');
const { abi, networks } = require('./build/contracts/Certificates.json')

const app = express();
const port = 3000;

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

const provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
const web3 = new Web3(provider);

const networkId = "5777";
const contratoAddress = networks[networkId]?.address;

if (!contratoAddress) {
    throw new Error(`Contrato não implantado na rede especificada (networkId: ${networkId}).`);
}

const contrato = new web3.eth.Contract(abi, contratoAddress);

function stringifyBigInt(obj) {
    return JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        )
    );
}

app.get('/certificates', async (req, res) => {
    try {
        const certificate_ids = await contrato.methods.getAll_CertificateIds().call();
        const certificates = await Promise.all(
            certificate_ids.map(async (id) => {
                const certificate = await contrato.methods.get_Certificate(id).call();
                return {
                    id: certificate[0].toString(),
                    name: certificate[1],
                    course: certificate[2],
                    issue_date: certificate[3],
                    isValid: certificate[4]        
                };
            })
        );
        res.json(certificates);
    } catch (error) {
        console.error("ERRO!! Não foi possível listar os certificados: ", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/certificates/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const certificate = await contrato.methods.get_Certificate(id).call();
        const result = stringifyBigInt({
            id: certificate[0],
            name: certificate[1],
            course: certificate[2],
            issue_date: certificate[3],
            valid: certificate[4]
        });
        res.json(result);
    } catch (error) {
        console.error("ERRO!! Não foi possível buscar o certificado: ", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/newcertificate', async (req, res) => {
    const { action, id, name, course, issue_date } = req.body;
    const accounts = await web3.eth.getAccounts();

    try {
        if (action === 'register') {
            await contrato.methods.Register_Certificate(id, name, course, issue_date).send({ from: accounts[0], gas: 500000 });
            res.json({ message: 'Certificado registrado com sucesso!' });
        } else if (action === 'get') {
            const certificate = await contrato.methods.get_Certificate(id).call();
            const result = stringifyBigInt({
                id: certificate[0],
                name: certificate[1],
                course: certificate[2],
                issue_date: certificate[3],
                valid: certificate[4]
            });
            res.json(result);
        } else if (action === 'revoke') {
            await contrato.methods.Revoke_Certificate(id).send({ from: accounts[0], gas: 500000 });
            res.json({ message: 'Certificado revogado com sucesso!!' });
        } else {
            res.status(400).json({ error: 'Ação inválida!' });
        }
    } catch (error) {
        console.error("ERRO!! Ação não executada: ", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});