// File: /Users/macbook/Downloads/cashapp-mvp/features/bitcoin/convert-usd-btc.js

/**
 * Converts USD to BTC based on the provided exchange rate.
 * @param {number} usdAmount - The amount in USD to convert.
 * @param {number} exchangeRate - The current exchange rate (1 BTC = X USD).
 * @returns {number} - The equivalent amount in BTC.
 */
function convertUsdToBtc(usdAmount, exchangeRate) {
    if (usdAmount <= 0 || exchangeRate <= 0) {
        throw new Error('Invalid input: USD amount and exchange rate must be greater than zero.');
    }
    return usdAmount / exchangeRate;
}

// Example usage
try {
    const usdAmount = 1000; // Example USD amount
    const exchangeRate = 50000; // Example exchange rate (1 BTC = 50,000 USD)
    const btcAmount = convertUsdToBtc(usdAmount, exchangeRate);
    console.log(`$${usdAmount} is equivalent to ${btcAmount} BTC at an exchange rate of ${exchangeRate} USD/BTC.`);
} catch (error) {
    console.error(error.message);
}

module.exports = convertUsdToBtc;