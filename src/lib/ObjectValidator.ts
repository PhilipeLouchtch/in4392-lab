import { SimpleJobParameters } from '../job/SimpleJobRequest';
import * as _ from 'lodash';

type TypeName = "string" | "number" | 'object'

export type ValidationRules<T extends Object> = {
    [K in keyof T]: (Validator<T, K> | ValidationRules<T[K]>)[]
}

export type Validator<P, K extends keyof P> = (o: P, k: K, ...args: any[]) => string

export function type(t: TypeName) {
    return (o, p, pfx = '') => !(p in o) || typeof (o[p]) == t ? '' : `'${pfx}${p}' must be '${t}'`
}

export function required() {
    return (o, p, pfx = '') => (o && p in o) ? '' : `'${pfx}${p}' is required`
}

export function oneOf(strs: string[]) {
    return (o, p, pfx = '') => !(p in o) || strs.find(s => s === o[p]) ? '' : `'${pfx}${p}' must be one of ${strs.map(s => `"${s}"`).join('|')}`
}

export class ObjectValidator<T>{

    constructor(private readonly rules: ValidationRules<T>) {
        this._validate = this._validate.bind(this)
    }

    public validate(object: Partial<T>) {
        return this._validate(object, this.rules)
    }

    private _validate<T>(object: Partial<T>, rules: ValidationRules<T>, pfx = '') {
        const validate = this._validate
        return _.flatMap(rules, function <K extends keyof T>(rules, key) {
            return _.flatMap(rules,
                rule => rule instanceof Function ? [rule(object, key, pfx)] : validate(object[key], rule, key + '.').filter(m => m != "")
            )
        }).filter(m => m != "")
    }

}
