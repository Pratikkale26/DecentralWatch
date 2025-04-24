import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { prismaClient } from "db/client";

const connection = new Connection("https://api.devnet.solana.com");
const secretKey = bs58.decode(process.env.PARENT_PRIVATE_KEY!);
const payer = Keypair.fromSecretKey(secretKey);

// Send SOL to validator
const sendSol = async (toAddress: string, amountInSol: number): Promise<string> => {
  const toPubkey = new PublicKey(toAddress);
  const lamports = amountInSol;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey,
      lamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
    commitment: "confirmed",
  });

  return signature;
};

// Payout loop
const payoutValidators = async () => {
  try {
    const validators = await prismaClient.validator.findMany({
      where: {
        pendingPayouts: {
          gt: 0,
        },
      },
    });

    console.log(`🔄 Found ${validators.length} validators with pending payouts.`);

    for (const validator of validators) {
      const { publicKey, pendingPayouts } = validator;

      try {
        console.log(`💸 Sending ${pendingPayouts / LAMPORTS_PER_SOL} SOL to ${publicKey}...`);

        const signature = await sendSol(publicKey, pendingPayouts);

        // Update DB after successful transaction
        await prismaClient.validator.update({
          where: { publicKey },
          data: { pendingPayouts: 0 },
        });

        console.log(`✅ Paid ${pendingPayouts / LAMPORTS_PER_SOL} SOL to ${publicKey} — Tx: ${signature}`);
      } catch (err) {
        console.error(`❌ Failed to pay ${publicKey}:`, err);
      }
    }

    console.log("✅ All payouts processed.");
  } catch (err) {
    console.error("Cron payout job failed:", err);
  }
};

// Run if script is called directly (for local testing)
if (require.main === module) {
  payoutValidators();
}

export { payoutValidators };
