# Deploying To Vercel Hobby Tier

I did not realize this at the time of recording, but the full project is too large for Vercel's hobby plan. That is one of the drawbacks of having such a large course project, is there can be limitations for free hosting. If you deploy to the hobby plan, you may see the following message:

```
Error: The Edge Function "middleware" size is 1.01 MB and your plan size limit is 1 MB. Learn More: https://vercel.link/edge-function-size
```

One solution that we found is to remove the `bcrypt-ts-edge` package and use the built-in web crypto API to hash passwords. There are quite a few changes that we need to make, so you can follow along if you want to be able to deploy to the free teir of Vercel.

## Set Encryption Key

We need to first set an encryption key in the `.env` file. Add the following:

```
ENCRYPTION_KEY=anysecretkey
```

You can change it to what you would like.

Make sure you add this to your Vercel environment variables as well.

## Create the Encryption File

Create a new file at `lib/encrypt.ts` and add the following:

```ts
const encoder = new TextEncoder();
const key = new TextEncoder().encode(process.env.ENCRYPTION_KEY); // Retrieve key from env var

// Hash function with key-based encryption
export const hash = async (plainPassword: string): Promise<string> => {
  const passwordData = encoder.encode(plainPassword);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign', 'verify']
  );

  const hashBuffer = await crypto.subtle.sign('HMAC', cryptoKey, passwordData);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Compare function using key from env var
export const compare = async (
  plainPassword: string,
  encryptedPassword: string
): Promise<boolean> => {
  const hashedPassword = await hash(plainPassword);
  return hashedPassword === encryptedPassword;
};
```

We are first getting the encryption key from the `.env` file and encoding it into a "Uint8Array". This is a binary format that's needed for cryptographic operations like we're doing here.

We then create a function that takes in the plain password. We then encode it and use the `crypto.subtle.importKey` functio, which takes the raw encryption key and prepares it for use with the **Web Crypto API**. In this case, the key is used for the **HMAC algorithm with SHA-256 hashing**.

The `crypto.subtle.sign` function generates an HMAC using the SHA-256 hash function. The result is a Buffer (binary data), which is converted into a hexadecimal string for storage or comparison.

The compare function hashes the input password and checks if the resulting hash matches the stored (already hashed) password.

This implementation ensures secure password hashing using the HMAC algorithm and makes it easy to verify passwords without storing them in plain text.

## Remove The Bcrypt TS Edge Package

We can remove the bcrypt package by running the following command:

```bash
npm uninstall bcrypt-ts-edge --legacy-peer-deps
```

This will break the site for now.

## Use New Encryption

We need to use this new encryption file in a few places. First being the `signUpUser` function in the user actions file.

Open up the `lib/actions/user.actions` file and remove the import for bcrypt and add an import for the new file:


Remove this:

```ts
import { hashSync } from 'bcrypt-ts-edge';
```

And add this:

```ts
import { hash } from '../encrypt';
```

Go to the `signUpUser` function and remove this line:

```ts
 user.password = hashSync(user.password, 10);
```

And add this line:

```ts
user.password = await hash(user.password);
```

## Update the Auth.ts File

We also need to add the new function in the `authorize` function int the auth file.

Open the `auth.ts` file and remove the bcrypt import and add the new `compare` import:

```ts
import { compare } from './lib/encrypt';
```

Now replace this line:

```ts
    const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
```

With this:

```ts
 const isMatch = await compare(
            credentials.password as string,
            user.password
          );
```

## Sample Data & Seeder

We also need to remove the hashing from the sample data and the seed file.

Open the `db/sample-data.ts` and remove the `hashSync` import and usage. Just use a plain text password for the users. We will do the hashing in the seed file itself instead.

Open the `db/seed.ts` file and import the `hash` function:

```ts
import { hash } from '@/lib/encrypt';
```

Replace this line:

```ts
 await prisma.user.createMany({ data: sampleData.users });
```

With this code:

```ts
const users = [];
for (let i = 0; i < sampleData.users.length; i++) {
  users.push({
    ...sampleData.users[i],
    password: await hash(sampleData.users[i].password),
  });
  console.log(
    sampleData.users[i].password,
    await hash(sampleData.users[i].password)
  );
}
await prisma.user.createMany({ data: users });
```

This will loop over the users and hash their passwords.

## Test it

Go ahead and register a new user. You should have no issues. It is just now using our custom encryption to do the same thing that bcrypt was doing.

Go ahead and try to push to github and then deploy and you should have no issues.