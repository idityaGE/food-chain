import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export async function hash(plain: string) {
  try {
    const hash = await bcrypt.hash(plain, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error("Failed to hash password");
  }
}

export async function verifyHash(plain: string, hash: string) {
  try {
    return await bcrypt.compare(plain, hash);
  } catch (error) {
    throw new Error("Failed to verify password");
  }
}
