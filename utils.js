export function toCaseSensitive(str) {
  if (!str) return ""; // handle empty/null/undefined
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export async function importWords(inputFile) {
    try {
        const response = await fetch(inputFile);
        const text = await response.text();
        const words = text
            .split("\n")
            .map((word) => word.trim())
            .filter((word) => word.length > 3);
        return words;
    } catch (e) {
        console.log(e);
    }
}