/**
 * Client-side mnemonic utilities
 */

const BIP39_WORDLIST_SIZE = 2048;

export function isValidMnemonicWord(word: string): boolean {
  return /^[a-z]{3,}$/.test(word.toLowerCase());
}

export function formatMnemonicWords(words: string[]): string {
  return words.join(' ');
}

export function parseMnemonicInput(input: string): string[] {
  return input.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0);
}
