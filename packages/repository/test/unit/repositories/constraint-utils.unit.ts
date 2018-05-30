// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {
  FilterBuilder,
  Filter,
  Fields,
  Where,
  WhereBuilder,
} from '../../../src/query';
import {AnyObject} from 'loopback-datasource-juggler';
import {
  constrainFilter,
  constrainWhere,
} from '../../../src/repositories/constraint-utils';

describe('constraint utility functions', () => {
  let originalFilter: Filter = {};
  let originalWhere: Where = {};
  const constraint: AnyObject = givenAWhereConstraint();

  before(() => {
    originalFilter = givenAFilter({a: true}, {x: 'x'}, 5);
    originalWhere = givenAWhere();
  });
  context('constrainFilter', () => {
    it('applies a where constraint', () => {
      const result = constrainFilter(originalFilter, constraint);
      expect(result).to.deepEqual({
        fields: {a: true},
        limit: 5,
        where: {x: 'x', id: '5'},
      });
    });
    it('applies a filter constraint with where object', () => {
      const validFilterConstraint = givenAFilter(
        undefined,
        {id: '10'},
        undefined,
      );
      const result = constrainFilter(originalFilter, validFilterConstraint);
      expect(result).to.deepEqual({
        fields: {a: true},
        limit: 5,
        where: {x: 'x', id: '10'},
      });
    });

    it('applies a filter constraint with duplicate key in where object', () => {
      const filterWithDuplicateWhereKey = givenAFilter(
        undefined,
        {x: 'z'},
        undefined,
      );
      const result = constrainFilter(
        originalFilter,
        filterWithDuplicateWhereKey,
      );
      expect(result).to.deepEqual({
        fields: {a: true},
        limit: 5,
        where: {and: [{x: 'x'}, {x: 'z'}]},
      });
    });

    it('does not apply filter constraint with unsupported fields', () => {
      const invalidFilterConstraint = givenAFilter(
        {b: false},
        {name: 'John'},
        undefined,
      );
      expect(() => {
        constrainFilter(originalFilter, invalidFilterConstraint);
      }).to.throw(/not implemented/);
    });
  });
  context('constrainWhere', () => {
    it('enforces a constraint', () => {
      const result = constrainWhere(originalWhere, constraint);
      expect(result).to.deepEqual({
        x: 'x',
        y: 'y',
        id: '5',
      });
    });
  });

  context('constrainDataObject', () => {
    it('constrain a single data object', () => {});
    it('constrain array of data objects', () => {});
  });

  /*---------------HELPERS----------------*/
  function givenAFilter(fields?: Fields, where?: Where, limit?: number) {
    const builder = new FilterBuilder();
    if (fields) builder.fields(fields);
    if (where) builder.where(where);
    if (limit) builder.limit(limit);
    return builder.build();
  }
  function givenAWhereConstraint() {
    return {id: '5'};
  }
  function givenAWhere() {
    return new WhereBuilder()
      .eq('x', 'x')
      .eq('y', 'y')
      .build();
  }
});
