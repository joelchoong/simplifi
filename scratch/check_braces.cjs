const fs = require('fs');
const content = fs.readFileSync('/Users/joel/Documents/AntiGravity/simplifi/src/features/financial-records/my-tax/presentation/MyTaxView.tsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        if (char === '{' || char === '(' || char === '[') {
            stack.push({ char, line: i + 1, col: j + 1 });
        } else if (char === '}' || char === ')' || char === ']') {
            let last = stack.pop();
            if (!last) {
                console.log(`Unmatched ${char} at ${i + 1}:${j + 1}`);
                continue;
            }
            if ((char === '}' && last.char !== '{') ||
                (char === ')' && last.char !== '(') ||
                (char === ']' && last.char !== '[')) {
                console.log(`Mismatched ${char} at ${i + 1}:${j + 1}, expected closer for ${last.char} from ${last.line}:${last.col}`);
            }
        }
    }
}

if (stack.length > 0) {
    console.log("Unclosed tokens:");
    stack.forEach(t => console.log(`${t.char} from ${t.line}:${t.col}`));
} else {
    console.log("All tokens matched.");
}
