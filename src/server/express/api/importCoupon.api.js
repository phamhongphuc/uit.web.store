import { ImportCoupon, Supplier, Employee } from '../../database/database';

/**
 *
 * @param {Express.Application} app
 * @param {Realm} realm
 */
export default function(app, realm) {
    app.post('/api/importCoupon/create', async (req, res) => {
        const employee = Employee.getById(realm, Number(req.body.employeeId));
        const supplier = Supplier.getById(realm, Number(req.body.supplierId));
        const importCoupon = await ImportCoupon.create(
            realm,
            supplier,
            employee,
            req.body.shipper,
            req.body.importCouponDetails,
        );
        res.send(importCoupon.json);
    });

    app.get('/api/importCoupons', async (req, res) => {
        const importCoupons = await ImportCoupon.queryImportCoupon(realm, req.query);
        if (!importCoupons) {
            res.json({ error: 'Không tìm thấy' });
            return;
        }
        res.json(importCoupons.map(importCoupon => importCoupon.json));
    });
}
