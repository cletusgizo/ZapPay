ZapPay is payment gateway built on StarkNet, designed to revolutionize payments by 
enabling instant crypto to fiat conversions, ZapPay allows users to pay with cryptocurrencies 
such as StarkNet tokens, while merchants receive fiat currency starting with Naira in their bank accounts 
seamlessly and without intermediaries. With a vision for global scalability, 
ZapPay aims to bridge the gap between cryptocurrency and traditional finance, offering a fast, 
cost effective, and user friendly payment solution.



🚀 Running Locally
To run Zap locally, follow these steps:

git clone https://github.com/cletusgizo/ZapPay.git
cd ZapPay
npm install
npm run dev

Don't forget to fill in the necessary variables in the .env.local file 
according to the template provided in .env.example.

Then, visit http://localhost:8080 to start converting crypto to fiat.

📚 How It Works
Zappay streamlines the conversion process through a simple flow:

Create Order: User creates an recieve payment address ZapPay interface.
Aggregate: ZapPay uses the Autoswap-SDK to swap starknet Token to stablecoin instantly
Fulfill: While ZapPay disburses funds to the recipient's local bank account or mobile 
money wallet via connections to payment service providers (PSP).## 👥 Contributing

----------------------------------------------------------------------------------

## 📜 License

This project is licensed under the MIT License.
