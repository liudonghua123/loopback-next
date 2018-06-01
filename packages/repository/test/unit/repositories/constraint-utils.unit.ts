// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {FilterBuilder, Filter, Where, WhereBuilder} from '../../../src/query';
import {
  constrainFilter,
  constrainWhere,
} from '../../../src/repositories/constraint-utils';
import {DataObject} from '../../../src/common-types';
import {Entity} from '../../../src/model';

describe('constraint utility functions', () => {
  let inputFilter: Filter = {};
  let inputWhere: Where = {};

  before(() => {
    inputFilter = givenAFilter();
    inputWhere = givenAWhere();
  });
  context('constrainFilter', () => {
    it('applies a where constraint', () => {
      const constraint = {id: '5'};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: Object.assign({}, inputFilter.where, constraint),
      });
    });
    it('applies a filter constraint with where object', () => {
      const constraint: Filter = {where: {id: '10'}};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: {x: 'x', id: '10'},
      });
    });

    it('applies a filter constraint with duplicate key in where object', () => {
      const constraint: Filter = {where: {x: 'z'}};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: {and: [{x: 'x'}, {x: 'z'}]},
      });
    });

    it('does not apply filter constraint with unsupported fields', () => {
      const constraint: Filter = {
        fields: {b: false},
        where: {name: 'John'},
      };
      expect(() => {
        constrainFilter(inputFilter, constraint);
      }).to.throw(/not implemented/);
    });
  });
  context('constrainWhere', () => {
    it('enforces a constraint', () => {
      const constraint = {id: '5'};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.deepEqual({
        x: 'x',
        y: 'y',
        id: '5',
      });
    });

    it('enforces constraint with dup key', () => {
      const constraint = {y: 'z'};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.deepEqual({
        and: [{x: 'x', y: 'y'}, {y: 'z'}],
      });
    });
  });

  context('constrainDataObject', () => {
    it('constrain a single data object', () => {});
    it('constrain array of data objects', () => {});
  });

  /*---------------HELPERS----------------*/
  function givenAFilter() {
    return new FilterBuilder()
      .fields({a: true})
      .where({x: 'x'})
      .limit(5)
      .build();
  }
  function givenAWhere() {
    return new WhereBuilder()
      .eq('x', 'x')
      .eq('y', 'y')
      .build();
  }
});
