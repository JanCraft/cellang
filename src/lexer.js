function _scan(first_char, chars, allowed) {
    let ret = first_char;
    let p = chars.next.value;
    while (p && p.match(allowed)) {
        ret += chars.move_next().value;
        p = chars.next.value;
    }
    return ret;
}

function _scan_string(delim, chars) {
    let ret = "";
    while (chars.next.value != delim) {
        let c = chars.move_next()
        if (c.done)
            throw new SyntaxError("A string ran off the end of the program.")
        ret += c.value;
    }
    chars.move_next();
    return ret;
}

export class Lexer {
    lex(chars) {
        const out = [];
        function ret() {
            let arr = [];
            for (const arg of arguments) {
                arr.push(arg);
            }
            out.push(arr);
        }
        const IN = (a, b) => b.indexOf(a) != -1;

        while (!chars.next.done) {
            const c = chars.move_next().value;
            if (IN(c, " \r\n")) continue;
            else if (IN(c, "+-*/")) ret('operation', c);
            else if (IN(c, "(){},;=:")) ret(c, '');
            else if (IN(c, `'"`)) ret('string', _scan_string(c, chars));
            else if (c.match(/[.0-9]/)) ret('number', _scan(c, chars, /[.0-9]/))
            else if (c.match(/[_a-zA-Z0-9.]/)) ret('symbol', _scan(c, chars, /[_a-zA-Z0-9.]/))
            else throw new SyntaxError(`Unexpected token: (charcode ${c.charCodeAt(0)}) '${c}'`)
        }

        return out;
    }
}