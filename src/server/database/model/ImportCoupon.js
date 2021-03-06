import { db, Book, Employee, ImportCouponDetail, Supplier, Price } from '../database';
import Promise from 'bluebird';
import moment from 'moment';
import Model from '../utils/Model';

class ImportCoupon extends Model {
    /**
     * @param {Supplier} supplier
     * @param {Employee} employee
     * @param {String} shipper
     * @param {Object[]} importCouponDetails
     */
    /**
     * @param {import('../../socket/utils/interface').Create} create
     */
    static async create(create) {
        const employee = create.authorize.staff;
        ImportCouponDetail.isRawValid(create.details);

        if (!Supplier.has(create.supplier) || !Employee.has(employee)) {
            throw `Nhân viên hoặc nhà cung cấp không tồn tại`;
        }
        if (typeof create.shipper !== 'string') throw 'Shipper phải là chuỗi';

        const importCoupon = await ImportCoupon.write({
            id: ImportCoupon.nextId,
            supplier: create.supplier,
            employee,
            create: new Date(),
            shipper: create.shipper,
        });

        await Promise.map(create.details, async importCouponDetail => {
            await ImportCouponDetail.write({
                id: ImportCouponDetail.nextId,
                importCoupon,
                book: Book.getById(importCouponDetail.bookId),
                count: importCouponDetail.count,
                price: importCouponDetail.price,
            });
        });

        return importCoupon;
    }

    /**
     * @param {import('../interface').queryImportCoupon} query
     * @return {Promise<Realm.Results<ImportCoupon>>}
     */
    static async queryImportCoupon(query) {
        let importCoupons = db.realm.objects('ImportCoupon');
        if (query.hasOwnProperty('employeeId')) {
            importCoupons = importCoupons.filtered('employee.id == $0', query.employeeId);
        }
        if (query.hasOwnProperty('supplierId')) {
            importCoupons = importCoupons.filtered('supplier.id == $0', query.supplierId);
        }
        if (query.hasOwnProperty('begin')) {
            const begin = moment(query.begin, 'DD-MM-YYYY').toDate();
            importCoupons = importCoupons.filtered('create >= $0', begin);
        }
        if (query.hasOwnProperty('end')) {
            const end = moment(query.end, 'DD-MM-YYYY').toDate();
            importCoupons = importCoupons.filtered('create >= $0', end);
        }
        return importCoupons;
    }

    get total() {
        return this.importCouponDetails
            .map(detail => detail.price * detail.count)
            .reduce((a, b) => a + b, 0);
    }

    get count() {
        return this.importCouponDetails
            .map(detail => detail.count)
            .reduce((a, b) => a + b, 0);
    }

    get json() {
        const o = this.object;
        o.supplierId = this.supplier.id;
        o.employeeId = this.employee.id;
        o.importCouponDetails = this.importCouponDetails.map(
            importCouponDetail => importCouponDetail.json,
        );
        return o;
    }

    notification(io) {
        io.emit('push', {
            name: ImportCoupon.schema.name,
            data: this.json,
        });

        this.importCouponDetails.forEach(importCouponDetail => {
            io.emit('update', {
                name: Book.schema.name,
                data: importCouponDetail.book.json,
            });
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

ImportCoupon.schema = {
    name: 'ImportCoupon',
    primaryKey: 'id',

    properties: {
        id: 'int',
        supplier: 'Supplier',
        employee: 'Employee',
        create: 'date',
        shipper: 'string',

        importCouponDetails: {
            type: 'linkingObjects',
            objectType: 'ImportCouponDetail',
            property: 'importCoupon',
        },
    },
};

ImportCoupon.permission = {
    user: [],
    employee: ['read', 'create'],
};

export default ImportCoupon;
