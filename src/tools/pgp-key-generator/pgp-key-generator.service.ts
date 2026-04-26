export interface PgpKeyPair {
  publicKey: string
  privateKey: string
  revocationCertificate: string
}

export type PgpKeyType =
  | { algorithm: 'ecc'; curve: 'curve25519' | 'p256' | 'p384' | 'p521' }
  | { algorithm: 'rsa'; rsaBits: 2048 | 3072 | 4096 };

export interface GenerateKeyPairInput {
  name: string
  email: string
  passphrase?: string
  keyType: PgpKeyType
}

async function loadOpenpgp() {
  return await import('openpgp');
}

export async function generateKeyPair({ name, email, passphrase, keyType }: GenerateKeyPairInput): Promise<PgpKeyPair> {
  const openpgp = await loadOpenpgp();

  const opts: any = {
    userIDs: [{ name, email }],
    format: 'armored' as const,
  };

  if (keyType.algorithm === 'rsa') {
    opts.type = 'rsa';
    opts.rsaBits = keyType.rsaBits;
  }
  else {
    opts.type = 'ecc';
    opts.curve = keyType.curve;
  }

  if (passphrase) {
    opts.passphrase = passphrase;
  }

  const { publicKey, privateKey, revocationCertificate } = await openpgp.generateKey(opts);
  return { publicKey, privateKey, revocationCertificate };
}

export async function encryptMessage({ message, publicKeyArmored }: { message: string; publicKeyArmored: string }): Promise<string> {
  const openpgp = await loadOpenpgp();
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ text: message }),
    encryptionKeys: publicKey,
  });
  return encrypted as string;
}

export async function decryptMessage({
  armoredMessage,
  privateKeyArmored,
  passphrase,
}: { armoredMessage: string; privateKeyArmored: string; passphrase?: string }): Promise<string> {
  const openpgp = await loadOpenpgp();
  let privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
  if (!privateKey.isDecrypted()) {
    if (!passphrase) {
      throw new Error('Private key is encrypted — passphrase required.');
    }
    privateKey = await openpgp.decryptKey({ privateKey, passphrase });
  }
  const message = await openpgp.readMessage({ armoredMessage });
  const { data } = await openpgp.decrypt({ message, decryptionKeys: privateKey });
  return data as string;
}
