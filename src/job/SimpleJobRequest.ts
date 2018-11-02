import { JobRequest } from './JobRequest';
import { ObjectValidator, ValidationRules, type, required, oneOf } from '../lib/ObjectValidator';

export type SimpleJobResult = string

export interface SimpleJobParameters {
    strategy: "AlwaysOne" | "StaticProportional",
    messagesPerLambda?: number,
}

export const simpleJobRequestValidationRules: ValidationRules<SimpleJobParameters> = {
    strategy: [required(), oneOf(['AlwaysOne', 'StaticProportional'])],
    messagesPerLambda: [type('number')]
}

export class SimpleJobRequest extends JobRequest<SimpleJobParameters> {

    public decodeParameters() {
        const params = JSON.parse(this.parameters.param)
        const val = new ObjectValidator<SimpleJobParameters>(simpleJobRequestValidationRules)
        const errors = val.validate(params)
        if(errors.length > 0)
            throw new Error(errors)
        return params
    }

}
