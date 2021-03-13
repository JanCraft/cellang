export class Env {
    constructor(parent, stdin, stdout, stderr) {
        this.stdin = stdin;
        this.stdout = stdout;
        this.stderr = stderr;
        this.parent = parent;
        if (parent) {
            this.stdin = parent.stdin;
            this.stdout = parent.stdout;
            this.stderr = parent.stderr;
        }
        this.items = {};
    }

    get(name) {
        if (name in this.items) {
            return this.items[name];
        } else if (this.parent) {
            return this.parent.get(name);
        } else {
            return null;
        }
    }

    set(name, value) {
        this.items[name] = value;
    }

    contains(name) {
        return name in this.items;
    }

    toString() {
        let ret = "";
        for (k in this.items)
            ret += `${k}=${this.items[k]}\n`;
        ret += ".\n" + this.parent?.toString();
        return ret;
    }
}