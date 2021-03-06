import Promise from 'bluebird';
import { db, Book, Employee, OrderCouponDetail, Supplier } from '../database';
import moment from 'moment';
import Model from '../utils/Model';

class OrderCoupon extends Model {
    /**
     * const orderCouponDetails = [
     *     { bookId: 1517213, count: 1 },
     *     { bookId: 1517213, count: 1 },
     * ];
     * @param {import('../../socket/utils/interface').Create} create
     */
    static async create(create) {
        const employee = create.authorize.staff;

        OrderCouponDetail.isRawValid(create.details);
        if (!Supplier.has(create.supplier) || !Employee.has(employee)) {
            throw `Nhân viên hoặc nhà cung cấp không tồn tại`;
        }
        const orderCoupon = await OrderCoupon.write({
            id: OrderCoupon.nextId,
            supplier: create.supplier,
            employee: employee,
            create: new Date(),
        });
        await Promise.map(create.details, orderCouponDetail => {
            OrderCouponDetail.write({
                id: OrderCouponDetail.nextId,
                orderCoupon: orderCoupon,
                book: Book.getById(orderCouponDetail.bookId),
                count: orderCouponDetail.count,
            });
        });
        return orderCoupon;
    }

    /**
     * @param {import('../interface').QueryOrderCoupon} query
     * @return {Promise<Realm.Results<OrderCoupon>>}
     */
    static async queryOrderCoupon(query) {
        let orderCoupons = db.realm.objects('OrderCoupon');
        if (query.hasOwnProperty('employeeId')) {
            orderCoupons = orderCoupons.filtered('employee.id == $0', query.employeeId);
        }
        if (query.hasOwnProperty('supplierId')) {
            orderCoupons = orderCoupons.filtered('supplier.id == $0', query.supplierId);
        }
        if (query.hasOwnProperty('begin')) {
            const begin = moment(query.begin, 'DD-MM-YYYY').toDate();
            orderCoupons = orderCoupons.filtered('create >= $0', begin);
        }
        if (query.hasOwnProperty('end')) {
            const end = moment(query.end, 'DD-MM-YYYY').toDate();
            orderCoupons = orderCoupons.filtered('create >= $0', end);
        }
        return orderCoupons;
    }

    get json() {
        const o = this.object;
        o.supplierId = this.supplier.id;
        o.employeeId = this.employee.id;
        o.orderCouponDetails = this.orderCouponDetails.map(
            orderCouponDetail => orderCouponDetail.json,
        );
        return o;
    }

    notification(io) {
        io.emit('push', {
            name: OrderCoupon.schema.name,
            data: this.json,
        });
        io.emit('update', {
            name: Supplier.schema.name,
            data: this.supplier.json,
        });
        io.emit('update', {
            name: Employee.schema.name,
            data: this.employee.json,
        });
    }
}

OrderCoupon.schema = {
    name: 'OrderCoupon',
    primaryKey: 'id',

    properties: {
        id: 'int',
        supplier: 'Supplier',
        employee: 'Employee',
        create: 'date',

        orderCouponDetails: {
            type: 'linkingObjects',
            objectType: 'OrderCouponDetail',
            property: 'orderCoupon',
        },
    },
};

OrderCoupon.permission = {
    user: [],
    employee: ['read', 'create'],
};

export default OrderCoupon;
