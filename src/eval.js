import { Env } from './env.js';

export class Eval {
    eval_expr(expr, env) {
        const typ = expr[0];
        if (typ == 'number') return ['number', parseFloat(expr[1])]
        else if (typ == 'string') return ['string', expr[1]]
        else if (typ == 'none') return ['none', null]
        else if (typ == 'operation') return this._operation(expr, env)
        else if (typ == 'symbol') {
            const name = expr[1];
            const ret = env.get(name);
            if (ret) return ret;
            else throw new EvalError(`Unknown symbol '${name}'`)
        } else if (typ == 'assignment') {
            const varname = expr[1][1];
            const val = this.eval_expr(expr[2], env);
            env.set(varname, val);
            return val;
        } else if (typ == 'call') return this._function_call(expr, env)
        else if (typ == 'function') {
            return ['function', expr[1], expr[2], new Env(env)];
        } else throw new EvalError(`Unknown expression of type '${typ}'`);
    }

    call_function(expr, env, args=[]) {
        return this._function_call([
            'call',
            expr,
            args
        ], env);
    }

    _function_call(expr, env) {
        const fn = this.eval_expr(expr[1], env);
        const args = [];
        for (const a of expr[2]) args.push(this.eval_expr(a, env));
        if (fn[0] == 'function') {
            const params = fn[1];
            this.fail_if_wrong_number_of_args(expr[2], params);
            const body = fn[2];
            const fn_env = fn[3];
            const new_env = new Env(fn_env);
            for (let i = 0; i < params.length; i++) {
                new_env.set(params[i][1], args[i]);
            }
            return this.eval_list(body, new_env);
        } else if (fn[0] == 'native') {
            return fn[1](args, env, this);
        } else throw new EvalError(`Object of type '${fn[0]}' is not callable`);
    }

    fail_if_wrong_number_of_args(a, b) {
        if (a.length != b.length)
            throw new EvalError("Invalid number of arguments");
    }

    _operation(expr, env) {
        const arg1 = this.eval_expr(expr[2], env);
        const arg2 = this.eval_expr(expr[3], env);
        if (expr[1] == '+') return ['number', arg1[1] + arg2[1]]
        else if (expr[1] == '-') return ['number', arg1[1] - arg2[1]]
        else if (expr[1] == '*') return ['number', arg1[1] * arg2[1]]
        else if (expr[1] == '/') return ['number', arg1[1] / arg2[1]]
        else throw new EvalError(`Unknown operator '${expr[1]}'`)
    }

    eval_list(exprs, env) {
        let lr = undefined;
        for (const expr of exprs) lr = this.eval_expr(expr, env);
        return lr;
    }
}