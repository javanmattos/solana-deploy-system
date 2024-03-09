const web3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token")
const CrownTokenBot = require("node-telegram-bot-api")
const bs58 = require("bs58")
require("dotenv").config()

const botToken = process.env.TELEGRAM_BOT_TOKEN
const crownBot = new CrownTokenBot(botToken, { polling: true })

const commands = ["/start", "/deploytoken"]

const allowedUsers = ["raymanoos", "lekheydeter"]

const verifyUser = (username) => {
  if (allowedUsers.includes(username)) return true
  else return false
}

crownBot.onText(/\/start$/, (msg) => {
  const chatId = msg.chat.id
  const username = msg.from.username.toLowerCase()

  if (!verifyUser(username)) {
    crownBot.sendMessage(
      chatId,
      `Sorry @${username}, you're not authorized to use this bot. please contact the support team.`
    )
    return
  }

  crownBot.sendMessage(
    chatId,
    "Welcome to Crown Token Bot!\nI can help you deploy, create a market, snipe tokens.\n\nYou can control me by sending these commands:\n\n/start - start a bot\n/deploytoken - deploy a new token to the Solana network"
  )
})

crownBot.onText(/\/deploytoken$/, async (msg) => {
  const chatId = msg.chat.id
  const username = msg.from.username.toLowerCase()

  if (!verifyUser(username)) {
    crownBot.sendMessage(
      chatId,
      `Sorry @${username}, you're not authorized to use this bot. please contact the support team.`
    )
    return
  }

  const connection = new web3.Connection(
    web3.clusterApiUrl("devnet"),
    "confirmed"
  )

  // Use the owner's wallet private key
  // Ensure the private key is stored securely and accessed in a safe manner
  // For demonstration, it's accessed from an environment variable here
  const ownerPrivateKey = bs58.decode(process.env.OWNER_PRIVATE_KEY)
  const ownerKeypair = web3.Keypair.fromSecretKey(
    new Uint8Array(ownerPrivateKey)
  )
  console.log(`${ownerKeypair.publicKey.toString()}`)

  // Specify the token's decimal places
  const decimals = 9 // For example, 9 decimal places

  // Create the token mint
  crownBot.sendMessage(chatId, "Bot is deploying your token...")
  const tokenMint = await splToken.createMint(
    connection,
    ownerKeypair, // This keypair pays the fees for the transaction and is the mint authority
    ownerKeypair.publicKey, // Mint authority
    ownerKeypair.publicKey, // Freeze authority (null if you don't need one)
    decimals,
    splToken.TOKEN_PROGRAM_ID
  )

  crownBot.sendMessage(chatId, `Token deployed successfully. ${tokenMint}`)
})

crownBot.on("message", (msg) => {
  const chatId = msg.chat.id
  const username = msg.from.username.toLowerCase()

  console.log(`username: ${username}`)

  if (msg.text.startsWith("/")) {
    const command = msg.text.split(" ")[0]
    if (commands.includes(command)) return
    if (!verifyUser(username)) {
      crownBot.sendMessage(
        chatId,
        `Sorry @${username}, you're not authorized to use this bot. please contact the support team.`
      )
    } else {
      crownBot.sendMessage(chatId, "Error: Unrecognized command.")
    }
  }
})

crownBot.on("polling_error", (err) => console.log(err))

console.log("Bot has been started...")
