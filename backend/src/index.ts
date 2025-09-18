import express from 'express';
import { prisma } from './db';
import { RegisterUserSchema } from './types/user';
import contractPromise, { provider, address } from './utils/contract';
import { hash } from './utils/hash';
import { getRandomWallet } from './utils/wallet';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/register', async (req, res) => {
  const { success, data } = RegisterUserSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Invalid schema" });
  }

  try {

    const wallet = getRandomWallet();
    if (!wallet) {
      return res.status(500).json({ error: "Failed to generate wallet" });
    }

    const hashedPassword = await hash(data.password);
    if (!hashedPassword) {
      return res.status(500).json({ error: "Failed to hash password" });
    }

    const dataHash = await hash(JSON.stringify(data));
    if (!dataHash) {
      return res.status(500).json({ error: "Failed to hash data" });
    }

    const contract = await contractPromise

    const tx = await contract.registerStakeholder(
      wallet.address,
      1,
      data.name,
      dataHash,
      {
        nonce: await provider.getTransactionCount(address)
      }
    )
    await tx.wait();

    const user = await prisma.stakeholder.create({
      data: {
        name: data.name,
        walletAddress: wallet.privateKey,
        password: hashedPassword,
        email: data.email,
        role: data.role,
        phone: data.phone,
        profileImage: data.profileImage,
        businessName: data.businessName,
        location: data.location,
      }
    })

    return res.status(200).json({
      success: true,
      message: "User Register",
      txHash: tx.signature
    })

  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});