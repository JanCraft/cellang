import { PeekableStream } from './PeekableStream.js';

export class Parser {
    constructor(toks, stop_at) {
        if (toks.iter) this.tokens = toks.clone();
        else this.tokens = new PeekableStream(toks);
        this.stop_at = stop_at;
    }

    fail_if_at_end(stop_at) {
        if (this.tokens.next.done)
            throw new SyntaxError(`Hit EOF - expected '${stop_at}'.`);
    }

    parameters_list() {
        if (this.tokens.next.value[0] != ":")
            return [];
        this.tokens.move_next();
        const typ = this.tokens.next.value[0];
        if (typ != "(")
            throw new SyntaxError("':' must be followed by '(' in a function.");
        this.tokens.move_next();
        const ret = this.multi_exprs(",", ")")
        for (const param of ret)
            if (param[0] != "symbol") {
                throw new SyntaxError(
                    "Only symbols are allowed in function parameter lists."
                    + " Found: " + param + "."
                )
            }
        return ret
    }

    multi_exprs(sep, end) {
        const ret = [];
        this.fail_if_at_end(end);
        let typ = this.tokens.next.value[0];
        if (typ == end)
            this.tokens.move_next();
        else {
            const arg_parser = new Parser(this.tokens, [sep, end]);
            while (typ != end) {
                const p = arg_parser.next_expr();
                if (p)
                    ret.push(p);
                typ = this.tokens.next.value[0];
                this.tokens.move_next();
                this.fail_if_at_end(end);
            }
        }
        return ret
    }

    next_expr(prev) {
        this.fail_if_at_end(';');
        const [typ, value] = this.tokens.next.value;
        if (this.stop_at.indexOf(typ) != -1)
            return prev;
        this.tokens.move_next();
        if (!prev && ["number", "string", "symbol"].indexOf(typ) != -1)
            return this.next_expr([typ, value]);
        else if (typ == 'operation') {
            const nxt = this.next_expr();
            return this.next_expr([
                "operation", value, prev, nxt
            ]);
        } else if (typ == '(') {
            const args = this.multi_exprs(",", ")");
            return this.next_expr(['call', prev, args]);
        } else if (typ == '{') {
            const params = this.parameters_list();
            const body = this.multi_exprs(";", "}");
            return this.next_expr(["function", params, body]);
        } else if (typ == '=') {
            if (prev[0] != "symbol")
                throw new SyntaxError("You can only assing to a symbol");
            const nxt = this.next_expr();
            return this.next_expr([
                "assignment",
                prev, nxt
            ]);
        } else
            throw new SyntaxError(`Unexpected token - type '${typ}', value '${value}'`);
    }

    static all_expr(parser) {
        const out = [];
        while (!parser.tokens.next.done) {
            const p = parser.next_expr(undefined);
            if (p)
                out.push(p);
            parser.tokens.move_next();
        }
        return out;
    }
}