const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.post('/gerar-pix', async (req, res) => {
    try {
        const { amount, email, description } = req.body;
        const payment = new Payment(client);
        const result = await payment.create({
            body: {
                transaction_amount: Number(amount),
                description: description,
                payment_method_id: 'pix',
                payer: { email: email }
            }
        });
        
        res.json({
            payment_id: result.id,
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Falha ao gerar o PIX' });
    }
});

app.get('/status-pix/:id', async (req, res) => {
    try {
        const payment = new Payment(client);
        const result = await payment.get({ id: req.params.id });
        res.json({ status: result.status }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Falha ao verificar status' });
    }
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor ONLINE!');
});
