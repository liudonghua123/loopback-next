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
        where: Object.assign({}, inputFilter.where, constraint.where),
      });
    });

    it('applies a filter constraint with duplicate key in where object', () => {
      const constraint: Filter = {where: {x: 'z'}};
      const result = constrainFilter(inputFilter, constraint);
      expect(result).to.containEql({
        where: {and: [inputFilter.where, constraint.where]},
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
      expect(result).to.deepEqual(Object.assign({}, inputWhere, constraint));
    });

    it('enforces constraint with dup key', () => {
      const constraint = {y: 'z'};
      const result = constrainWhere(inputWhere, constraint);
      expect(result).to.deepEqual({
        and: [inputWhere, constraint],
      });
    });
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
