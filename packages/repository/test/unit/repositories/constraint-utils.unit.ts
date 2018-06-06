// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {FilterBuilder, Filter, Where, WhereBuilder} from '../../../src/query';
import {
  constrainFilter,
  constrainWhere,
  constrainDataObject,
  constrainDataObjects,
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

  context('constrainDataObject', () => {
    it('constrain a single data object', () => {
      const input = givenADataObject();
      const constraint: Partial<Order> = {id: 2};
      const result = constrainDataObject(input, constraint);
      expect(result).to.containDeep(Object.assign({}, input, constraint));
    });
    it('constrain array of data objects', () => {
      const input = givenArrayOfDataObjects();
      const constraint: Partial<Order> = {id: 3};
      const result = constrainDataObjects(input, constraint);
      expect(result[0]).to.containDeep(Object.assign({}, input[0], constraint));
      expect(result[1]).to.containDeep(Object.assign({}, input[1], constraint));
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

  function givenADataObject(): DataObject<Order> {
    return new Order({id: 1, description: 'order 1'});
  }

  function givenArrayOfDataObjects(): DataObject<Order>[] {
    const order1 = new Order({id: 1, description: 'order 1'});
    const order2 = new Order({id: 2, description: 'order 2'});
    return [order1, order2];
  }

  class Order extends Entity {
    id: number;
    description: string;
    customerId: number;
  }
});
