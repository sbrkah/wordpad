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

export async function importSets(inputFile, need_restructuring = false) {
    try {
        const response = await fetch(inputFile);
        const text = await response.text();
        const result = JSON.parse(text);
        if(need_restructuring){
            const restructured_result = result.sets.map((set, index) => {
                return {
                    set: set,
                    hash: result.hashes[index]
                };
            });
            return restructured_result;
        }
        return result;
    } catch (e) {
        console.log(e);
    }
}

export function stringifyDate(date){
    let _date = new Date(date);
    let _day = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    let _month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    return `${_day[_date.getDay()]}, ${_date.getDate()} ${_month[_date.getMonth()]} ${_date.getFullYear()}`
}