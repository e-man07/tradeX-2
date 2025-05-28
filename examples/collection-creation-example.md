# NFT Collection Creation Examples

## Basic Collection Creation Prompt

```
Create an NFT collection named "Cosmic Explorers" with symbol "CSMX" and description "A collection of cosmic explorers traversing the galaxy" with image https://ipfs.io/ipfs/QmXyNMhV8bQFp6wzoVpkz3NUCRuLYrP2Uc4dCZBfhHjPNQ"
```

## Advanced Collection Creation with Royalties

```
Create NFT collection called "Ethereal Artifacts" with symbol "EART", description "Mystical artifacts from the ethereal plane with magical properties", royalty 7.5%, and image https://coral-decisive-bug-514.mypinata.cloud/ipfs/bafkreiatc3hqxqjyj2gtxlwfbgkj5h55bvxpk5t3vjuxf724mjylzk4zye"
```

## Collection with Creator Attribution

```
Create a collection named "Futuristic Cities" with symbol "FCTY" and description "Architectural marvels of tomorrow's megacities" with image https://arweave.net/vNQVdJ5lnD61H4Nnv1GBtL8m4woUh0X1ex-6JgQQl2A and creators: address 5YNmS1R9nNSD1nEPaoZGMGNGwVLPf1FQKUGJE6v3dtUa with percentage 70, address 3v1RLAJeZPXjtN1T5SD8tCDf9jnbx1DEcJ99EBxGXFsL with percentage 30
```

## Recommended Image Hosting Services

When creating NFT collections, you should host your images on permanent storage solutions:

- **IPFS**: Use services like Pinata, NFT.Storage, or Infura to pin your content
- **Arweave**: A permanent, decentralized file storage solution
- **Cloudinary/ImgBB**: For testing purposes only (not recommended for production)

## Image Requirements

- Recommended formats: PNG, JPEG, GIF
- Recommended size: At least 1000x1000 pixels
- Max file size: 10MB

## Collection Naming Best Practices

- **Name**: Should be unique and descriptive (max 32 characters)
- **Symbol**: 3-5 uppercase characters that represent your collection
- **Description**: Clear explanation of what your collection represents
- **Royalties**: Optional, specified as a percentage (e.g., 5% = 500 basis points)

## Important Notes

1. Collection creation requires a small amount of SOL for transaction fees
2. The wallet creating the collection becomes the update authority by default
3. Collection symbols must be unique on-chain for your wallet
4. Royalties are set at the collection level and apply to all NFTs in the collection
```

## Example Response Format

```json
{
  "collectionAddress": "8JnNWJ41xgzJT1j8sTVQH6GVBUmJgGS7uxcA7XB5NiZZ",
  "signature": "4SLyAGbG3n19dSJc2xN5vA8995Wd8rZYXnqLohJSWZZXhvMPiQZrUvk3kWFo3H5DNz8TeEcJxEKmUU3ymFxQPefu"
}
```
```
https://coral-decisive-bug-514.mypinata.cloud/ipfs/bafkreiatc3hqxqjyj2gtxlwfbgkj5h55bvxpk5t3vjuxf724mjylzk4zye

```