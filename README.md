# Nopewallet

Nopewallet is a simple, secure, open-source, multi-chain cryptocurrency wallet built with **Next.js**, **Shadcn/UI**, and **Node.js**.  
All private keys are encrypted and stored locally in the browser, ensuring full client-side custody. Nopewallet supports **Solana**, **Ethereum**, **BNB Smart Chain**, **Tron**, **Polygon**, and **Bitcoin**, and is fully extensible with custom tokens and data sources. Website: [https://nopewallet.com](https://nopewallet.com)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Security](#security)
- [Data & Privacy](#data--privacy)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Purpose](#purpose)
- [Contribution](#contribution)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

- **Client-side key storage:** WebAuthn biometric unlock and AES-GCM encryption.
- **Multi-chain support:** Solana, Ethereum, BNB, Tron, Polygon, Bitcoin.
- **Native and token transactions:** Send and receive native coins and EVM tokens.
- **Custom token support:** Add your own ERC-20 contracts.
- **Real-time market data:** Powered by Paynope.

---

## Architecture

Nopewallet is designed as a modular, minimal, and fully client-side application:

- **Unlock Component:**  
  Decrypts the encrypted vault in `localStorage`.  
  WebAuthn or password fallback.

- **Accounts Component:**  
  Displays addresses and balances for all supported chains.  
  Supports exporting/importing encrypted vault backups.

- **Send Component:**  
  Sends native coins or EVM tokens.  
  Supports dynamic token loading from a database or custom contract list.

- **Backup and Recovery Component:**  
  Move wallets between the browsers.  
  Export `localStorage` data into a password protected downloadable JSON file.  
  Import the `localStorage` data to recover your wallets.  
  

**Tech Stack:**

- Next.js for UI and routing
- Shadcn/UI for accessible and consistent components
- Node.js for optional backend services (token registry, custom APIs)
- TypeScript for type safety
- TailwindCSS for styling

---

## Security

- **100% client-side encryption:** Keys never leave the browser.
- **Hardware-backed WebAuthn:** Optional biometric unlock.
- **AES-GCM vault encryption:** Strong, modern symmetric encryption.
- **PBKDF2 password fallback:** Derives a strong key from user password.
- **Zero telemetry:** No server collects sensitive data.
- **Encrypted backups:** Export and restore securely without exposing private keys.

---

## Data & Privacy

- Nopewallet does **not** transmit any sensitive information.
- Real-time price charts and market data are powered by **Paynope**:
  - The wallet pulls data from the Paynope endpoint only.
  - You can replace the data source with your own API if desired.
  - No personal or wallet data is ever sent to Paynope or any third party.

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/nopewallet/nopewallet.git
   cd nopewallet
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Get an Infura API key**  
   To send EVM coins (Ethereum, Polygon, BNB, etc.), you need an Infura API key.  
   - Visit [MetaMask Infura](https://developer.metamask.io/) to obtain your API key.
   - Set the key in your environment variables as `INFURA_API_KEY`.
   - Feel free to use Paynope.com Balance and History endpoints (for now till we require a free API key)

4. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view in the browser.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## Usage

- Open the wallet in a browser.
- Unlock with WebAuthn or password.
- Add or generate addresses for any supported chain.
- Send/receive coins and tokens.
- (Optional) Connect your own data source for market prices and charts.
- Backup encrypted vault locally for safekeeping.

---

## Purpose 
**Why we built Nopewallet?** Lack of Easy to Integrate Nextjs Multi-chain Wallet  
We are working on [Paynope](https://paynope.com/), a crypto payment gateway, and found it challenging to find a simple, secure, and open-source web wallet that we could easily integrate into our platform. Most existing wallets were either too complex, had backend dependencies, or lacked transparency. This motivated us to create Nopewallet, a wallet that meets our needs and can be used by others as well. We have open-sourced the project to contribute to the community and promote secure, user-controlled asset management.

---

## Contribution

Contributions are welcome!

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/my-feature
   ```
5. **Open a Pull Request**

**Please ensure:**

- Code is formatted using Prettier
- TypeScript type safety is maintained
- No sensitive keys or credentials are committed

---

## Roadmap

- [x] Multi-chain wallet (Solana, Ethereum, BNB, Tron, Polygon, Bitcoin)
- [x] Client-side encryption & WebAuthn unlock
- [x] ERC-20 token support
- [x] Sending ETH, BNB, SOL, TRX, MATIC
- [x] QR Code reader to send crypto
- [x] Real-time charts and prices (Paynope integration)
- [ ] Sending Bitcoin
- [ ] Browser extension version
- [ ] Additional chain integrations (e.g., Avalanche)
- [ ] Mobile-optimized interface
- [ ] Hardware wallet support

---

## License

MIT License © 2025 Paynope Team

