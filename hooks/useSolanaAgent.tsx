"use client";

import { SolanaAgentKit } from "solana-agent-kit";
import { useWallet } from "./useWallet";
import {
  launchPumpFunToken,
  trade,
  transfer,
  mintCollectionNFT,
  deploy_collection,
} from "solana-agent-kit/dist/tools";
import { useBalance } from "./useBalance";
import { createContext, useContext } from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { TokenListProvider } from "@solana/spl-token-registry";
import bs58 from 'bs58';

import {
  Metaplex,
  keypairIdentity,
} from "@metaplex-foundation/js";

import { Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { mintTo, createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";


interface SwapData {
  from: string;
  to: string;
  amount: string;
}

interface TransferData {
  recipient: string;
  amount: string;
  token: string;
}

interface pumpFunTokenData {
  tokenName: string;
  tokenTicker: string;
  tokenDescription: string;
  tokenImage: any;
}

interface NFTMintData {
  name: string;
  description: string;
  image: any;
  collectionMint: string;
  symbol?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface CollectionData {
  name: string;
  symbol: string;
  description: string;
  image: string | File | Uint8Array;
  royaltyBasisPoints?: number;
  creators?: Array<{
    address: string;
    percentage: number;
  }>;
}

interface AgentContextProps {
  processSwap: (data: SwapData) => Promise<string>;
  processTransfer: (data: TransferData) => Promise<string>;
  processPumpFunToken: (
    data: pumpFunTokenData
  ) => Promise<{ signature: string; tokenAddress: string; metadataURI: any }>;
  processNFTMint: (data: NFTMintData) => Promise<{mint: PublicKey; metadata: PublicKey}>;
  processcreateCollection: (data: CollectionData) => Promise<{ collectionAddress: PublicKey; signature: string }>;

}

const AgentContext = createContext<AgentContextProps | null>(null);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { keyPair, secKey, isAuthenticated } = useWallet();
  const { tokens } = useBalance();

  // Do not initialize if the user is not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Get token mint details from wallet
  const getTokenMintDetails = (
    symbol: string,
    amount: string
  ): {
    mint: string;
    decimal: string;
  } | null => {
    const token = tokens.find((t) => t.symbol === symbol);
    if (!token) return null;

    const availableAmount = token.amount;

    const amountToSend =
      parseFloat(amount) * Math.pow(10, parseInt(token.decimal));
    const availableInNativeUnits =
      availableAmount * Math.pow(10, parseInt(token.decimal));

    if (amountToSend > availableInNativeUnits) {
      throw new Error(
        `Insufficient ${symbol} balance. You have ${availableAmount.toFixed(
          2
        )} ${symbol}.`
      );
    }

    return {
      mint: token.mint,
      decimal: token.decimal,
    };
  };

  // Find mint address from symbol
  async function findMintAddress(symbol: string) {
    const tokenListProvider = new TokenListProvider();
    const tokenList = await tokenListProvider.resolve();
    console.log("tokenlist", tokenList);
    const tokens = tokenList.filterByChainId(103).getList(); // Devnet chainId is 103
    const token = tokens.find((t) => t.symbol === symbol);
    return token ? token.address : null;
  }

  //Initialize agent
  const agent = new SolanaAgentKit(
    `${secKey}`,
    `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
    `${process.env.GEMINI_API_KEY}`,
  );

  // Initialze metaplex 
  const connection = new Connection(
    `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}` || clusterApiUrl('devnet')
  );
  
  const getMetaplex = () => {
    if (!keyPair) throw new Error("Keypair is not initialized.");
    
    // Use the built-in storage instead of bundlrStorage plugin
    return Metaplex.make(connection)
      .use(keypairIdentity(keyPair));
  }; 

  //send transaction
  const processTransfer = async (data: TransferData): Promise<string> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    const { recipient, amount, token } = data;

    try {
      if (token === "SOL") {
        const transferSignature = await transfer(
          agent,
          new PublicKey(recipient),
          Number(amount)
        );
        return transferSignature;
      } else {
        const mintDetails = getTokenMintDetails(token, amount);
        if (!mintDetails) {
          throw new Error("You don't have enough balance.");
        }
        const mintAddress = new PublicKey(mintDetails.mint);
        const reciever = new PublicKey(recipient);
        const Amount = Number(amount);

        // Transfer SPL tokens
        const transferSignature = await transfer(
          agent,
          reciever,
          Amount,
          mintAddress
        );

        return transferSignature;
      }
    } catch (error: any) {
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  };

  //swap transacion
  const processSwap = async (data: SwapData): Promise<string> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }
    const { from, to, amount } = data;

    // Handle SOL directly by providing the wrapped SOL mint address
    const fromMint =
      from === "SOL"
        ? { mint: "So11111111111111111111111111111111111111112", decimal: "9" }
        : getTokenMintDetails(from, amount);
    const toMint =
      to === "SOL"
        ? "So11111111111111111111111111111111111111112"
        : await findMintAddress(to);

    console.log(fromMint, toMint);

    if (!fromMint?.mint || !toMint) {
      throw new Error("You don't have enough balance.");
    }

    try {
      // Convert amount to smallest units using the decimals of the source token
      const amountInSmallestUnits = Math.round(
        parseFloat(amount) * Math.pow(10, parseInt(fromMint.decimal))
      );

      console.log("From Mint:", fromMint);
      console.log("To Mint:", toMint);
      console.log("Amount in Smallest Units:", amountInSmallestUnits);

      // Perform the trade
      const swapSignature = await trade(
        agent,
        new PublicKey(toMint),
        amountInSmallestUnits, // Pass adjusted amount here
        new PublicKey(fromMint.mint)
      );

      return swapSignature;
    } catch (error: any) {
      throw new Error(`Token swap failed: ${error.message}`);
    }
  };

  /**
   * Function for creating the token and minting it 
   * @param data 
   * @returns 
   */
  const processPumpFunToken = async (
    data: pumpFunTokenData
  ): Promise<{ signature: string; tokenAddress: string; metadataURI: any }> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    const { tokenName, tokenTicker, tokenDescription, tokenImage } = data;
    
    try {
      console.log("Starting token creation process with data:", {
        tokenName,
        tokenTicker,
        tokenDescription,
        hasImage: !!tokenImage,
      });
      
      // Try multiple RPC endpoints in case the primary one fails
      const rpcEndpoints = [
        `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
        'https://api.devnet.solana.com',
        'https://devnet.genesysgo.net'
      ];
      
      let connection;
      
      // Try each RPC endpoint until one works
      for (const endpoint of rpcEndpoints) {
        try {
          console.log(`Attempting with RPC endpoint: ${endpoint.split('?')[0]}`);
          connection = new Connection(endpoint, 'confirmed');
          
          // Check if the RPC is responsive
          await connection.getLatestBlockhash();
          console.log("Successfully connected to RPC");
          break;
        } catch (rpcError) {
          console.warn(`RPC endpoint ${endpoint.split('?')[0]} failed, trying next...`);
        }
      }
      
      if (!connection) {
        throw new Error("Failed to connect to any RPC endpoint. Please try again later.");
      }
      
      // Process image for IPFS
      let imageFile: File;
      try {
        if (typeof tokenImage === "string") {
          console.log("Fetching image from URL:", tokenImage.substring(0, 50) + "...");
          const imageResponse = await fetch(tokenImage);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
          }
          const imageBlob = await imageResponse.blob();
          imageFile = new File([imageBlob], "token_image.png", { type: imageResponse.headers.get('content-type') || "image/png" });
          console.log("Successfully converted image URL to File object");
        } else if (tokenImage instanceof File) {
          imageFile = tokenImage;
          console.log("Using provided File object for image");
        } else {
          throw new Error("Invalid image file format. Please provide a URL or File object.");
        }
      } catch (imageError: any) {
        console.error("Image processing error:", imageError);
        throw new Error(`Failed to process token image: ${imageError.message}`);
      }
      
      // Upload to IPFS
      console.log("Preparing to upload token metadata to IPFS");
      const formData = new FormData();
      formData.append("name", tokenName);
      formData.append("symbol", tokenTicker);
      formData.append("description", tokenDescription);
      formData.append("showName", "true");
      formData.append("file", imageFile);
      
      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token metadata upload failed:", errorData);
        throw new Error(`IPFS upload failed: ${errorData.error || response.statusText}`);
      }
      
      const ipfsData = await response.json();
      console.log("Token metadata uploaded to IPFS:", ipfsData);
      if (!ipfsData.metadataUri) {
        throw new Error("IPFS response did not include a metadata URI");
      }
      
      // Create token using direct SPL Token approach instead of Metaplex
      console.log("Creating token with SPL Token program...");
      const decimals = 9; // Standard decimals for new token
      
      try {
        // Create mint transaction
        console.log("Creating token mint...");
        const mintKeypair = Keypair.generate();
        
        console.log("Generated mint keypair:", mintKeypair.publicKey.toString());
        
        // FIX: Use imported token functions
        // Create the actual mint
        const mintTx = await createMint(
          connection,
          keyPair,             // Payer (from keypair)
          keyPair.publicKey,   // Mint authority
          keyPair.publicKey,   // Freeze authority (same as mint authority)
          decimals,
          mintKeypair
        );
        
        console.log("Token mint created with tx:", mintTx);
        
        // Wait for confirmation
        console.log("Waiting for token mint confirmation...");
        await connection.confirmTransaction(mintTx, 'confirmed');
        
        const tokenAddress = mintKeypair.publicKey.toString();
        console.log("Token created with address:", tokenAddress);
        
        // Create token account for the user
        console.log("Creating token account for the user...");
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          keyPair,
          mintKeypair.publicKey,
          keyPair.publicKey
        );
        
        console.log("Token account created:", tokenAccount.address.toString());
        
        // Define token supply - 1 billion tokens (with decimals)
        const supply = 1_000_000_000 * Math.pow(10, decimals);
        
        // Mint initial supply to the user's token account
        console.log("Minting initial supply...");
        const mintToTx = await mintTo(
          connection,
          keyPair,
          mintKeypair.publicKey,
          tokenAccount.address,
          keyPair.publicKey,
          supply
        );
        
        console.log("Initial supply minted with tx:", mintToTx);
        console.log("Waiting for mint confirmation...");
        await connection.confirmTransaction(mintToTx, 'confirmed');
        
        console.log("Token creation completed successfully");
        
        return {
          signature: mintToTx,
          tokenAddress: tokenAddress,
          metadataURI: ipfsData.metadataUri
        };
      } catch (tokenError: any) {
        console.error("Error during token creation:", tokenError);
        
        // Detailed error logging
        if (tokenError.logs) {
          console.error("Transaction logs:", tokenError.logs);
        }
        
        // Check specific error types
        if (tokenError.message && tokenError.message.includes("insufficient funds")) {
          throw new Error("Insufficient SOL to pay for the token creation. Please add more SOL to your wallet.");
        }
        
        throw new Error(`Token creation failed: ${tokenError.message}`);
      }
    } catch (error: any) {
      console.error("Error in processPumpFunToken:", error);
      throw new Error(`Token creation failed: ${error.message}`);
    }
  };
  
  /**
   * Function for creating the collection 
   * @param data 
   * @returns 
  */
 
  const processcreateCollection = async (
    data: CollectionData
  ): Promise<{ collectionAddress: PublicKey; signature: string }> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    try {
      console.log("Starting collection creation with data:", {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        hasImage: !!data.image,
        royaltyBasisPoints: data.royaltyBasisPoints,
      });
      
      // Try multiple RPC endpoints in case the primary one fails
      const rpcEndpoints = [
        `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
        'https://api.devnet.solana.com',
        'https://devnet.genesysgo.net'
      ];
      
      let connection;
      let metaplex;
      let mintKeypair = Keypair.generate();
      
      // Try each RPC endpoint until one works
      for (const endpoint of rpcEndpoints) {
        try {
          console.log(`Attempting with RPC endpoint: ${endpoint.split('?')[0]}`);
          connection = new Connection(endpoint, 'confirmed');
          
          // Check if the RPC is responsive
          await connection.getLatestBlockhash();
          
          metaplex = Metaplex.make(connection)
            .use(keypairIdentity(keyPair));
          
          console.log("Successfully connected to RPC");
          break;
        } catch (rpcError) {
          console.warn(`RPC endpoint ${endpoint.split('?')[0]} failed, trying next...`);
        }
      }
      
      if (!connection || !metaplex) {
        throw new Error("Failed to connect to any RPC endpoint. Please try again later.");
      }
      
      // Handle image processing (simplified for clarity)
      let imageFile: File;
      try {
        if (typeof data.image === "string") {
          const imageResponse = await fetch(data.image);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          const imageBlob = await imageResponse.blob();
          imageFile = new File([imageBlob], "collection_image.png", { 
            type: imageResponse.headers.get('content-type') || "image/png" 
          });
        } else if (data.image instanceof File) {
          imageFile = data.image;
        } else if (data.image instanceof Uint8Array) {
          imageFile = new File([data.image], "collection_image.png", { type: "image/png" });
        } else {
          throw new Error("Invalid image format");
        }
      } catch (imageError: any) {
        throw new Error(`Image processing failed: ${imageError.message}`);
      }

      // Upload to IPFS
      console.log("Uploading collection metadata to IPFS...");
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("symbol", data.symbol);
      formData.append("description", data.description);
      formData.append("file", imageFile);
      
      const ipfsResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });

      if (!ipfsResponse.ok) {
        const errorData = await ipfsResponse.json();
        throw new Error(`IPFS upload failed: ${errorData.error || ipfsResponse.statusText}`);
      }

      const ipfsData = await ipfsResponse.json();
      console.log("Metadata uploaded to IPFS:", ipfsData.metadataUri);
      
      // Set up creators array
      const creators = data.creators?.map(creator => ({
        address: new PublicKey(creator.address),
        share: creator.percentage,
        verified: creator.address === keyPair.publicKey.toString()
      })) || [{ address: keyPair.publicKey, share: 100, verified: true }];
      
      // SIMPLER APPROACH: Create collection with minimal options
      console.log("Creating collection with streamlined approach");
      try {
        // Initialize mint account first to ensure it exists
        console.log("Generating mint account:", mintKeypair.publicKey.toString());
        
        // Create the NFT with minimal options for better reliability
        const { nft, response: txResponse } = await metaplex.nfts().create({
          uri: ipfsData.metadataUri,
          name: data.name,
          symbol: data.symbol,
          sellerFeeBasisPoints: data.royaltyBasisPoints || 500,
          isCollection: true,
          creators: creators,
          useNewMint: mintKeypair,
        });
        
        console.log("Collection creation transaction sent:", txResponse.signature);
        
        // Wait for confirmations with timeout
        let confirmed = false;
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 30000));
        const confirmPromise = (async () => {
          try {
            await connection.confirmTransaction(txResponse.signature, 'confirmed');
            confirmed = true;
          } catch (e) {
            console.error("Confirmation error:", e);
          }
        })();
        
        await Promise.race([confirmPromise, timeoutPromise]);
        
        if (!confirmed) {
          console.warn("Transaction confirmation timed out, but transaction may still be successful");
        }
        
        console.log("Collection created with address:", nft.address.toString());
        
        // Introduce a small delay to allow indexing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          collectionAddress: nft.address,
          signature: txResponse.signature
        };
      } catch (nftError: any) {
        if (nftError.logs) {
          console.error("Transaction logs:", nftError.logs);
        }
        
        // Specific error handling
        if (nftError.message && nftError.message.includes("AccountNotFoundError")) {
          throw new Error("RPC node is having synchronization issues. Please try again in a few minutes.");
        } else if (nftError.message && nftError.message.includes("0x1")) {
          throw new Error("Transaction simulation failed. Please check your SOL balance.");
        } else {
          throw new Error(`Collection creation failed: ${nftError.message}`);
        }
      }
    } catch (error: any) {
      console.error("Error in processcreateCollection:", error);
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  };
    
/**
 * Function for minting the data 
 * @param data 
 * @returns 
 */
  const processNFTMint = async (
    data: NFTMintData
  ): Promise<{ mint: PublicKey; metadata: PublicKey }> => {
    if (!Keypair) {
      throw new Error("Keypair is not initialized.");
    }
  
    const { name, description, image, collectionMint, symbol, attributes } = data;
  
    try {
      console.log("Starting NFT minting process with data:", {
        name,
        description,
        hasImage: !!image,
        collectionMint,
        symbol: symbol || "NFT",
        hasAttributes: !!attributes && attributes.length > 0
      });
      
      const metaplex = getMetaplex();

      // Verify collection mint exists before proceeding
      let collectionExists = false;
      let collectionPublicKey: PublicKey | undefined = undefined;
      
      if (collectionMint) {
        try {
          // Validate the collection address format first
          if (!collectionMint.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
            throw new Error(`Invalid collection address format: ${collectionMint}`);
          }
          
          collectionPublicKey = new PublicKey(collectionMint);
          console.log("Verifying collection mint:", collectionMint);
          
          // Try to fetch the collection NFT to verify it exists
          // We'll try up to 3 times with increasing delays
          let retryCount = 0;
          let collectionNft = null;
          
          while (retryCount < 3 && !collectionNft) {
            try {
              collectionNft = await metaplex.nfts().findByMint({ 
                mintAddress: collectionPublicKey 
              });
              collectionExists = true;
              console.log("Collection verification successful - collection exists:", collectionNft.address.toString());
              break;
            } catch (retryError) {
              retryCount++;
              if (retryCount >= 3) {
                throw retryError;
              }
              console.log(`Collection fetch attempt ${retryCount} failed, retrying in ${retryCount * 1000}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
            }
          }
        } catch (collectionError) {
          console.error("Collection verification error:", collectionError);
          console.warn(`Will attempt to create NFT without collection verification for address: ${collectionMint}`);
          // We'll still try to create the NFT, but we'll skip the collection verification step
        }
      }
      
      // Convert image to File object for IPFS upload
      let imageFile: File;
      
      try {
        if (typeof image === "string") {
          console.log("Fetching image from URL:", image.substring(0, 50) + "...");
          const imageResponse = await fetch(image);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
          }
          const imageBlob = await imageResponse.blob();
          imageFile = new File([imageBlob], "nft_image.png", { type: imageResponse.headers.get('content-type') || "image/png" });
          console.log("Successfully converted image URL to File object");
        } else if (image instanceof File) {
          imageFile = image;
          console.log("Using provided File object for image");
        } else {
          throw new Error("Invalid image format - must be URL string or File object");
        }
      } catch (error) {
        const imageError = error as Error;
        console.error("Error processing NFT image:", imageError);
        throw new Error(`Failed to process NFT image: ${imageError.message || 'Unknown error occurred'}`);
      }

      // Create form data for IPFS upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("symbol", symbol || "NFT");
      formData.append("description", description);
      
      // Add attributes if provided
      if (attributes && attributes.length > 0) {
        console.log("Adding attributes to NFT metadata:", attributes);
        formData.append("attributes", JSON.stringify(attributes));
      }
      
      formData.append("file", imageFile);
      
      // Upload to IPFS
      console.log("Uploading NFT metadata and image to IPFS");
      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("NFT metadata upload failed:", errorData);
        throw new Error(`IPFS upload failed: ${errorData.error || response.statusText}`);
      }

      const ipfsData = await response.json();
      console.log("NFT metadata uploaded to IPFS:", ipfsData);
      
      if (!ipfsData.metadataUri) {
        throw new Error("IPFS response did not include a metadata URI");
      }

      // Create NFT using IPFS metadata
      console.log("Creating on-chain NFT with metadata:", ipfsData.metadataUri);
      try {
        // Create the NFT with or without collection reference based on our earlier verification
        const createNftOptions: any = {
          name: name,
          symbol: symbol || "NFT",
          uri: ipfsData.metadataUri,
          sellerFeeBasisPoints: 0,
          creators: [
            {
              address: keyPair?.publicKey,
              share: 100,
              verified: true,
            },
          ],
        };
        
        // Only include collection if we successfully verified it exists
        if (collectionExists && collectionPublicKey) {
          console.log("Including collection in NFT creation:", collectionPublicKey.toString());
          createNftOptions.collection = collectionPublicKey;
        } else if (collectionMint) {
          console.warn(`Skipping collection association due to verification failure: ${collectionMint}`);
        }
        
        // Create the NFT
        const { nft } = await metaplex.nfts().create(createNftOptions);
        
        console.log("NFT created successfully:", {
          address: nft.address.toString(),
          metadataAddress: nft.metadataAddress.toString(),
        });
        
        // Try to verify collection if it was included and verified
        if (collectionExists && collectionPublicKey) {
          try {
            console.log("Verifying NFT as part of collection:", collectionPublicKey.toString());
            await metaplex.nfts().verifyCollection({
              mintAddress: nft.address,
              collectionMintAddress: collectionPublicKey,
              isSizedCollection: true,
            });
            console.log("Collection verification successful - NFT added to collection");
          } catch (verifyError) {
            console.error("Failed to verify collection but NFT was created:", verifyError);
            console.warn("NFT was created but couldn't be verified as part of the collection");
          }
        }
        
        return {
          mint: nft.address,
          metadata: nft.metadataAddress,
        };
      } catch (nftError: any) {
        console.error("Error creating NFT:", nftError);
        if (nftError.logs) {
          console.error("Transaction logs:", nftError.logs);
        }
        
        // More detailed error message based on error type
        if (nftError.message && nftError.message.includes("AccountNotFoundError")) {
          throw new Error(`Failed to create NFT: The collection address does not exist. Please check that you're using the correct collection address and network.`);
        } else if (nftError.message && nftError.message.includes("insufficient funds")) {
          throw new Error(`Failed to create NFT: Insufficient SOL to pay for the transaction. Please add more SOL to your wallet.`);
        } else {
          throw new Error(`Failed to create NFT: ${nftError.message}`);
        }
      }
    } catch (error: any) {
      console.error("Error in processNFTMint:", error);
      throw new Error(error.message || "Failed to mint NFT");
    }
  };

  return (
    <AgentContext.Provider
      value={{ processSwap, processTransfer, processPumpFunToken, processNFTMint, processcreateCollection }}
    >
      {children}
    </AgentContext.Provider>
  );
};
  export const useSolanaAgent = () => {
    const context = useContext(AgentContext);
    if (!context)
      throw new Error("useSolanaAgent must be used within AgentProvider");
    return context;
  };
