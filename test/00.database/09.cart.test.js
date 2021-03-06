import { assert } from 'chai';
import { filename, itname } from '../utils/utils';
import database, { Cart } from '../../src/server/database/database';

describe(filename(__filename), function() {
    this.timeout(1000000);

    it(itname('Cart.create()', 'Tạo giỏ hàng'), async function() {
        const realm = await database();
        const user = realm.objects('User')[0];

        const cartDetails = [{ id: 580112, count: 2 }, { id: 750578, count: 1 }];
        const cart = await Cart.create(realm, user, cartDetails);
        assert.equal(cart.owner.name, 'Phạm Hồng Phúc');
    });
});
