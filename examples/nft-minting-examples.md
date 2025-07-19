# NFT Minting Examples

## Basic NFT Minting with Collection

Use this format to mint an NFT into an existing collection:

```
Mint NFT called "Ethereal Sword #001" with description "A mystical blade forged in the ethereal plane with ancient runes" and image https://coral-decisive-bug-514.mypinata.cloud/ipfs/bafkreiatc3hqxqjyj2gtxlwfbgkj5h55bvxpk5t3vjuxf724mjylzk4zye in collection su1RvRxWvWGQdn9nFak5tj1LvXJqZZaTWFJfXqWbSS4
```

## NFT with Attributes/Traits

```
Create NFT named "Fire Elemental Staff" with symbol "FES", description "A powerful staff imbued with fire magic and ancient enchantments", image https://coral-decisive-bug-514.mypinata.cloud/ipfs/bafkreiatc3hqxqjyj2gtxlwfbgkj5h55bvxpk5t3vjuxf724mjylzk4zye, collection address [REPLACE_WITH_YOUR_COLLECTION_ADDRESS], and attributes: trait_type "Element" value "Fire", trait_type "Rarity" value "Legendary", trait_type "Power Level" value "95"
```

## Simple NFT Mint

```
Mint an NFT called "Dragon Egg #001" with collection [REPLACE_WITH_YOUR_COLLECTION_ADDRESS] and image https://coral-decisive-bug-514.mypinata.cloud/ipfs/bafkreiatc3hqxqjyj2gtxlwfbgkj5h55bvxpk5t3vjuxf724mjylzk4zye
```

## NFT without Collection (Standalone)

```
Create NFT named "Standalone Artifact" with description "An independent magical artifact" and image https://coral-decisive-bug-514.mypinata.cloud/ipfs/bafkreiatc3hqxqjyj2gtxlwfbgkj5h55bvxpk5t3vjuxf724mjylzk4zye
```

## Steps to Mint NFT with Collection:

1. **First, create a collection** using collection creation prompts
2. **Copy the collection address** from the success message
3. **Replace `[REPLACE_WITH_YOUR_COLLECTION_ADDRESS]`** with your actual collection address
4. **Use the mint prompt** in the chat interface

## Example Collection Addresses (for reference):
- Format: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU` (44 characters, Base58)
- Always use the exact collection address returned after collection creation

## Supported Image Formats:
- IPFS URLs: `https://ipfs.io/ipfs/...`
- Arweave URLs: `https://arweave.net/...`
- HTTP/HTTPS URLs: `https://example.com/image.png`
- Pinata IPFS: `https://coral-decisive-bug-514.mypinata.cloud/ipfs/...`

## Supported Attributes Format:
```
attributes: trait_type "Category" value "Weapon", trait_type "Rarity" value "Epic", trait_type "Level" value "50"
```
