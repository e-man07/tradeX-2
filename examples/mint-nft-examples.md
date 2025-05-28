# Minting NFTs Into Collections - Examples

## Basic NFT Minting Prompt

Use this format to mint an NFT into your collection:

```
Mint NFT named "Cosmic Explorer #1" with description "The first explorer in our cosmic series" in collection YOUR_COLLECTION_ADDRESS with image https://i.imgur.com/XpRY3ax.jpg
```

Replace `YOUR_COLLECTION_ADDRESS` with your own collection address.

## NFT Minting With Attributes

```
Mint NFT named "Ethereal Artifact #42" with description "A rare artifact with magical properties" in collection YOUR_COLLECTION_ADDRESS with image https://i.imgur.com/UR6lVf7.png with attributes rarity:legendary, power:90, element:fire
```

## NFT Minting With Symbol

```
Create NFT named "Pixel Warrior #7" with symbol "PXW" and description "A mighty pixel warrior ready for battle" in collection YOUR_COLLECTION_ADDRESS with image https://i.imgur.com/mzSCa0M.png
```

## Reliable Test Images

To minimize errors, we recommend using these pre-tested images:

| Image Description | URL for Copy-Pasting |
|-------------------|----------------------|
| Space Explorer    | `https://i.imgur.com/XpRY3ax.jpg` |
| Magical Artifact  | `https://i.imgur.com/UR6lVf7.png` |
| Pixel Character   | `https://i.imgur.com/mzSCa0M.png` |
| Galaxy Scene      | `https://i.imgur.com/8lQwrSB.jpg` |
| Abstract Art      | `https://i.imgur.com/0PbRTBP.jpg` |

## Important Tips

1. **Wait after collection creation**: Wait at least 30 seconds after creating your collection before minting NFTs into it
2. **Copy the exact collection address**: Always copy the full address without any typos
3. **Keep your prompt simple**: Avoid overly complex descriptions or attributes
4. **Have enough SOL**: Each NFT mint requires a small amount of SOL for transaction fees

## Troubleshooting

If you encounter errors when minting an NFT into your collection:

1. Verify the collection address exists by checking it on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
2. Try using one of our reliable test images above
3. Wait longer after collection creation (try 1-2 minutes)
4. Try creating a simpler NFT without attributes first

## Example Response Format

When successful, the NFT minting will return:

```json
{
  "mint": "6XU36wCxWobLx5Rtsb58CaGhWYo3rsxAzJQcp6y6uq8V",
  "metadata": "9tK7NArPZSPCDYWm3zTnzpNXzY4acfhkDKEAEGEgxLtW"
}
```

The `mint` address is your new NFT's address on Solana.
