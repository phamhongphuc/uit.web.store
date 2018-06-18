import { Supplier, Employee } from '../../database/database';
/**
 *
 * @param {Express.Application} app
 * @param {SocketIO.Server} io
 * @param {Realm} realm
 */
export default function(app, io, realm) {
    app.post('/api/supplier/create', async (req, res) => {
        Employee.getBySessionId(req.sessionID);

        const supplier = await Supplier.create(realm, req.body);

        io.emit('update', 'supplier');
        res.send(supplier.json);
    });

    app.post('/api/supplier/edit', async (req, res) => {
        Employee.getBySessionId(req.sessionID);

        const supplier = Supplier.getById(realm, req.body.supplierId);
        await supplier.update(realm, req.body.data);

        io.emit('update', 'supplier');
        res.send(supplier.json);
    });
}