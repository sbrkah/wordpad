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

// Normalize INT Length in array -> string
export function nilia(arrayOfInt){
    try{
        const normalized = [];
        const len = String(Math.max(...arrayOfInt)).length;
        arrayOfInt.forEach(el => {
            normalized.push('&nbsp;'.repeat(len - String(el).length) + String(el));
        });

        return normalized;
    }
    catch(e){
        
    }
}

export function isOnTop(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

export const findScoreIndex = (scores, x) => scores.findIndex(score => score >= x);