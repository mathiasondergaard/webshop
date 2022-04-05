const db = require('../index');
const logger = require('../../utils/logger.js');
const OrderItem = db.orderItem;

const moduleName = 'orderItem.repository.js -';

exports.create = async (orderItem, orderId) => {
    try {
        const _orderItem = await OrderItem.create({
            name: orderItem.name,
            totalPrice: orderItem.totalPrice,
            quantity: orderItem.quantity,
            product: orderItem.product,
            orderId: orderId,
        });

        if (!_orderItem) {
            logger.info(`${moduleName} create orderItem no response from db`);
            return;
        }

        return _orderItem.get({ plain: true });

    } catch (err) {
        logger.error(`${moduleName} unexpected error on create orderItem ${JSON.stringify(err)}`);
        return;
    }
};

exports.findAllByOrderId = async (orderId) => {
    try {
        const orderItems = await OrderItem.findAll({
            where: {
                orderId: orderId
            }
        });

        if (!orderItems) {
            logger.info(`${moduleName} no orderItems present in db`);
            return;
        }

        const converted = orderItems.map(orderItem => orderItem.get({ plain: true }));
        return converted;

    } catch (err) {
        logger.error(`${moduleName} unexpected error on findAll items ${JSON.stringify(err)}`);
        return;
    }
};

exports.findById = async (id) => {
    try {
        const orderItem = await OrderItem.findByPk(id);

        if (!orderItem) {
            logger.info(`${moduleName} orderItem ${id} not present in db`);
            return;
        }

        logger.info(`${moduleName} retrieved orderItem by id: ${id} | ${JSON.stringify(orderItem)}`);
        return orderItem.get({ plain: true });

    } catch (err) {
        logger.error(`${moduleName} unexpected error on find orderItem by id ${JSON.stringify(err)}`);
        return;
    }
};

exports.deleteByOrderId = async (orderId) => {
    try {
        const deletedorderItem = await OrderItem.destroy({
            where: {
                orderId: orderId
            }
        });

        if (deletedorderItem !== 1) {
            logger.info(`${moduleName} orderItem and orderItemItems to delete not found id: ${id}`);
            return;
        }

        logger.info(`${moduleName} delete orderItem success, id: ${id}`);
        return { message: 'orderItem deleted successfully' };

    } catch (err) {
        logger.error(`${moduleName} unexpected error on delete orderItem: ${JSON.stringify(err)}`);
        return;
    }
};

exports.delete = async (id) => {
    try {
        const deletedorderItem = await OrderItem.destroy({
            where: {
                id: id
            }
        });

        if (deletedorderItem !== 1) {
            logger.info(`${moduleName} orderItem and orderItemItems to delete not found id: ${id}`);
            return;
        }

        logger.info(`${moduleName} delete orderItem success, id: ${id}`);
        return { message: 'orderItem deleted successfully' };

    } catch (err) {
        logger.error(`${moduleName} unexpected error on delete orderItem: ${JSON.stringify(err)}`);
        return;
    }
};