// app/api/solana/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  Keypair,
  Connection,
} from "@solana/web3.js";
import nacl from 'tweetnacl';
import * as bip39  from 'bip39';
import { derivePath } from 'ed25519-hd-key';

import web3 from '@solana/web3.js';


export async function POST(req: NextRequest) {
  try {
    const { mnemonic, to, amount, accountIndex = 2 } = await req.json();

    if (!mnemonic || !to || !amount) {
      return NextResponse.json(
        { error: "mnemonic, recipient, and amount are required" },
        { status: 400 }
      );
    }

    // --- Validate mnemonic ---
    if (!bip39.validateMnemonic(mnemonic)) {
      return NextResponse.json({ error: "Invalid mnemonic" }, { status: 400 });
    }
    console.log("Mnemonic is valid.", mnemonic);
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const solanaPath = "m/44'/501'/0'"; // Trust wallet compatible path 
    const derivedSeed = derivePath(solanaPath, seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(derivedSeed);
    const solAddress = keypair.publicKey.toBase58();

    const senderPubkey = keypair.publicKey.toBase58()
    console.log("Derived sender public key:", senderPubkey);

    // --- Connect to Solana ---
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

    // --- Check sender balance ---
    const balance = await connection.getBalance(new PublicKey(senderPubkey));
    console.log("Sender balance (lamports):", balance);
    if (balance === 0) {
      return NextResponse.json(
        { error: "Sender account has 0 SOL. Cannot send transaction." },
        { status: 400 }
      );
    }

    // --- Prepare transaction ---
    const recipientPubkey = new PublicKey(to);
    const lamports = Math.round(Number(amount) * 1e9); // 1 SOL = 1e9 lamports

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(senderPubkey),
        toPubkey: recipientPubkey,
        lamports,
      })
    );

    // --- Send and confirm ---
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
    console.log("Transaction confirmed with signature:", signature);

    return NextResponse.json({
      txid: signature,
      from: senderPubkey,
      to,
      amount,
      balance,
    });
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return NextResponse.json(
      { error: error.message || "Transaction failed" },
      { status: 500 }
    );
  }
}
