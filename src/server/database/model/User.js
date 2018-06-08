import { json } from '../business/Utils';

class User {
    static isValid(realm, user) {
        if (!user) {
            return false;
        }
        return realm.objects('User').filtered(`id == ${user.id}`)[0] !== undefined;
    }

    
    get allBills() {
        return this.carts.map(cart => cart.exportBill[0]);
    }
}

User.schema = {
    name: 'User',
    primaryKey: 'id',

    properties: {
        id: 'int',
        name: 'string',
        point: 'int',

        employee: {
            type: 'linkingObjects',
            objectType: 'Employee',
            property: 'user',
        },
        membershipCard: {
            type: 'linkingObjects',
            objectType: 'MembershipCard',
            property: 'owner',
        },
        carts: {
            type: 'linkingObjects',
            objectType: 'Cart',
            property: 'owner',
        },
    },
};

export default User;