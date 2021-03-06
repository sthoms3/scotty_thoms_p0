import express from 'express';
import AppConfig from '../config/app';
import { adminGuard } from '../middleware/auth-middlware';

export const TransactionRouter = express.Router();

const transactionService = AppConfig.transactionService;

/**
 * Used to get all transactions
 * Admin role required.
 */
TransactionRouter.get('/', adminGuard, async (req, resp) => {
    try{
        let payload = await transactionService.getAllTransactions();
        resp.status(200).json(payload);
    } catch (e){
        resp.status(404).json(e);
    }
});

/**
 * Used to get transaction by id
 */
TransactionRouter.get('/:id', async (req, resp) => {
    const id = +req.params.id; 
    try { 
        let payload = await transactionService.getTransactionById(id);
        resp.status(200).json(payload);
    } catch (e) {
        resp.status(404).json(e);
    }
});

/**
 * Used to create a new transaction
 */
TransactionRouter.post('', async (req, resp) => {
    try {
        let newTransaction = await transactionService.addNewTransaction(req.body);
        return resp.status(204).json(newTransaction);
    } catch (e) {
        return resp.status(e.statusCode || 500).json(e);
    }
});