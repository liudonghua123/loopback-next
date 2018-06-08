// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ParameterObject, isReferenceObject} from '@loopback/openapi-v3-types';
import {Validator} from './validator';
import * as debugModule from 'debug';
import {HttpErrorMessage} from '../';

const debug = debugModule('loopback:rest:coercion');

/**
 * Coerce the http raw data to a JavaScript type data of a parameter
 * according to its OpenAPI schema specification.
 *
 * @param data The raw data get from http request
 * @param schema The parameter's schema defined in OpenAPI specification
 */
export function coerceParameter(data: string, spec: ParameterObject) {
  const schema = spec.schema;
  if (!schema || isReferenceObject(schema)) {
    debug(
      'The parameter with schema %s is not coerced since schema' +
        'dereferrence is not supported yet.',
      schema,
    );
    return data;
  }
  let coercedResult;
  coercedResult = data;
  const OAIType = getOAIPrimitiveType(schema.type, schema.format);
  const validator = new Validator({parameterSpec: spec});

  validator.validateParamBeforeCoercion(data);

  switch (OAIType) {
    case 'byte':
      coercedResult = Buffer.from(data, 'base64');
      break;
    case 'date':
      coercedResult = new Date(data);
      break;
    case 'float':
    case 'double':
      coercedResult = parseFloat(data);
      break;
    case 'number':
      coercedResult = data ? Number(data) : undefined;
      if (coercedResult === undefined) break;
      if (isNaN(coercedResult))
        throw HttpErrorMessage.invalidData(data, spec.name);
      break;
    case 'long':
      coercedResult = Number(data);
      break;
    case 'integer':
      coercedResult = parseInt(data);
      break;
    case 'boolean':
      coercedResult = isTrue(data) ? true : isFalse(data) ? false : undefined;
      break;
    case 'string':
    case 'password':
    // serialize will be supported in next PR
    case 'serialize':
    default:
      break;
  }
  return coercedResult;
}

/**
 * A set of truthy values. A data in this set will be coerced to `true`.
 *
 * @param data The raw data get from http request
 * @returns The corresponding coerced boolean type
 */
function isTrue(data: string): boolean {
  return ['true', '1'].includes(data);
}

/**
 * A set of falsy values. A data in this set will be coerced to `false`.
 * @param data The raw data get from http request
 * @returns The corresponding coerced boolean type
 */
function isFalse(data: string): boolean {
  return ['false', '0'].includes(data);
}

/**
 * Return the corresponding OpenAPI data type given an OpenAPI schema
 *
 * @param type The type in an OpenAPI schema specification
 * @param format The format in an OpenAPI schema specification
 */
function getOAIPrimitiveType(type?: string, format?: string) {
  // serizlize will be supported in next PR
  if (type === 'object' || type === 'array') return 'serialize';
  if (type === 'string') {
    switch (format) {
      case 'byte':
        return 'byte';
      case 'binary':
        return 'binary';
      case 'date':
        return 'date';
      case 'date-time':
        return 'date-time';
      case 'password':
        return 'password';
      default:
        return 'string';
    }
  }
  if (type === 'boolean') return 'boolean';
  if (type === 'number')
    return format === 'float'
      ? 'float'
      : format === 'double'
        ? 'double'
        : 'number';
  if (type === 'integer') return format === 'int64' ? 'long' : 'integer';
}
