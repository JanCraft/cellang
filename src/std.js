import { PeekableStream } from './PeekableStream.js';
import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
import { Eval } from './eval.js';
import { Env } from './env.js';

const te = new TextEncoder();
const td = new TextDecoder('utf-8');

const NONE = ['none', null];

const stdenv = new Env(undefined, Deno.stdin, Deno.stdout, Deno.stderr);
stdenv.set("None", ['none', null]);
stdenv.set("true", ['number', 1]);
stdenv.set("false", ['number', 0]);
stdenv.set("print", ['native', (args, env, parser) => {
    if (args.length != 1) return NONE;

    Deno.stdout.writeSync(te.encode(parser.eval_expr(args[0])[1] + '\n'));
    return NONE;
}]);
stdenv.set("native", ['native', (args, env, parser) => {
    eval(parser.eval_expr(args[0])[1]);
    
    return NONE;
}]);
stdenv.set("equals", ['native', (args, env, parser) => {
    return ['number', parser.eval_expr(args[0])[1] == parser.eval_expr(args[1])[1] ? 1 : 0];
}]);
stdenv.set("less_than", ['native', (args, env, parser) => {
    return ['number', parser.eval_expr(args[0])[1] < parser.eval_expr(args[1])[1] ? 1 : 0];
}]);
stdenv.set("greater_than", ['native', (args, env, parser) => {
    return ['number', parser.eval_expr(args[0])[1] > parser.eval_expr(args[1])[1] ? 1 : 0];
}]);
stdenv.set("not", ['native', (args, env, parser) => {
    return ['number', 1 - parser.eval_expr(args[0])[1]];
}]);
stdenv.set("if", ['native', (args, env, parser) => {
    const val = parser.eval_expr(args[0])[1];
    
    if (val == 1) {
        if (args[1]) {
            return parser.call_function(args[1], env);
        }
    } else {
        if (args[2]) {
            return parser.call_function(args[2], env);
        }
    }
}]);
stdenv.set("concat", ['native', (args, env, parser) => {
    return ['string', parser.eval_expr(args[0])[1] + parser.eval_expr(args[1])[1]];
}]);
stdenv.set("import", ['native', (args, env, parser) => {
    const dta = Deno.readFileSync(parser.eval_expr(args[0])[1]);
    const cnt = td.decode(dta);

    const lexr = new Lexer();
    const toks = lexr.lex(new PeekableStream(cnt));

    const prsr = new Parser(toks, ";");
    const ast = Parser.all_expr(prsr);

    const evl = new Eval();
    evl.eval_list(ast, env);

    return NONE;
}]);

export { stdenv };