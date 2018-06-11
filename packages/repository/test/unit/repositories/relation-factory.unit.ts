import {
  hasManyRepositoryFactory,
  juggler,
  DefaultCrudRepository,
  Entity,
  HasManyDefinition,
  RelationType,
  ModelDefinition,
} from '../../../src';
import * as RelationFactoryNamespace from '../../../src/repositories/relation.repository'; // needed to spy on the factory function
import {sinon} from '@loopback/testlab';

describe('hasManyRepositoryFactory', () => {
  let meta: HasManyDefinition;
  let targetRepo: DefaultCrudRepository<Entity, number>;
  let db: juggler.DataSource;

  before(givenDataSource);
  before(givenOrderRepository);

  context('DefaultHasManyEntityCrudRepository', () => {
    it('', () => {
      meta = {
        type: RelationType.hasMany,
        modelFrom: class FromModel extends Entity {},
        keyTo: 'customerId',
        keyFrom: 'id',
      };

      const spy = sinon.spy(
        RelationFactoryNamespace,
        'DefaultHasManyEntityCrudRepository',
      );

      hasManyRepositoryFactory(4, meta, targetRepo);

      sinon.assert.calledWithNew(spy);
      sinon.assert.calledWith(spy, targetRepo, {customerId: 4});
    });
  });

  function givenDataSource() {
    db = new juggler.DataSource({connector: 'memory'});
  }

  function givenOrderRepository() {
    targetRepo = new DefaultCrudRepository(
      class TargetModel extends Entity {
        static definition = new ModelDefinition({
          name: 'TargetName',
          properties: {
            id: {type: 'string', id: true},
          },
        });
      },
      db,
    );
  }
});
