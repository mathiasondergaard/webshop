const db = require('../index');
const logger = require('../../utils/logger.js');
const OrderItem = db.orderItem;
const Order = db.order;

const moduleName = 'order.repository.js -';

exports.create = async (order) => {
    try {
        const _order = await Order.create({
            number: order.number,
            status: order.description,
            name: order.name,
            address: order.address,
            zip: order.zip,
            totalPrice: order.totalPrice,
            user: order.user,
        });

        if (!_order) {
            logger.info(`${moduleName} create order no response from db`);
            return;
        }

        return _order.get({ plain: true });

    } catch (err) {
        logger.error(`${moduleName} unexpected error on create order ${JSON.stringify(err)}`);
        return;
    }
};

exports.findAll = async () => {
    try {
        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                as: 'orderItems',
                attributes: ['id', 'name', 'totalPrice', 'quantity']
            }],
            raw: true,
            nested: true,
        });

        if (!orders) {
            logger.info(`${moduleName} no orders present in db`);
            return;
        }

        const converted = orders.map(order => order.get({ plain: true }));
        return converted;

    } catch (err) {
        logger.error(`${moduleName} unexpected error on findAll items ${JSON.stringify(err)}`);
        return;
    }
};

exports.update = async (id, order) => {
    try {
        const _order = await Order.update({
            number: order.number,
            status: order.description,
            name: order.name,
            address: order.address,
            zip: order.zip,
            totalPrice: order.totalPrice,
            user: order.user,
        }, {
            where: {
                id: id
            }
        });
        
        if (!_order) {
            logger.error(`${moduleName} order to update not found id: ${id}`);
            return;
        }

        logger.info(`${moduleName} updated order id ${id}: ${JSON.stringify(order)}`);
        return _order.get({ plain: true });

    } catch (err) {
        logger.error(`${moduleName} order update error: ${JSON.stringify(err)}`);
        return;
    }
};

exports.findById = async (id) => {
    try {
        const order = await Order.findByPk(id, {
            include: [{
                model: OrderItem,
                as: 'orderItems',
                attributes: ['id', 'name', 'totalPrice', 'quantity']
            }],
            raw: true,
            nested: true,
        });

        if (!order) {
            logger.info(`${moduleName} order ${id} not present in db`);
            return;
        }

        logger.info(`${moduleName} retrieved order by id: ${id} | ${JSON.stringify(order)}`);
        return order.get({ plain: true });

    } catch (err) {
        logger.error(`${moduleName} unexpected error on find order by id ${JSON.stringify(err)}`);
        return;
    }
};

exports.findAllByUser = async (user) => {
    try {
        const orders = await Order.findAll({
            where: {
                user: user
            },
            include: [{
                model: OrderItem,
                as: 'orderItems',
                attributes: ['id', 'name', 'totalPrice', 'quantity']
            }],
            raw: true,
            nested: true,
        });

        if (!orders) {
            logger.info(`${moduleName} order ${id} not present in db`);
            return;
        }

        logger.info(`${moduleName} retrieved orders by user: ${user}`);
        const converted = orders.map(order => order.get({ plain: true }));
        return converted;

    } catch (err) {
        logger.error(`${moduleName} unexpected error on find order by id ${JSON.stringify(err)}`);
        return;
    }
};

exports.delete = async (id) => {
    try {
        const deletedOrder = await Order.destroy({
            where: {
                id: id
            }
        });

        if (deletedOrder !== 1) {
            logger.info(`${moduleName} order and orderItems to delete not found id: ${id}`);
            return;
        }

        logger.info(`${moduleName} delete order success, id: ${id}`);
        return { message: 'order deleted successfully' };

    } catch (err) {
        logger.error(`${moduleName} unexpected error on delete order: ${JSON.stringify(err)}`);
        return;
    }
};