import { TransactionRepository } from "../repos/transaction-repo";
import { ResourceNotFoundError, BadRequestError, ResourcePersistenceError, InsuficentFundsError } from "../errors/errors";
import { Transaction } from "../models/transaction";
import { isValidId, isEmptyObject, isValidObject, isPropertyOf } from "../util/validator";

export class TransactionService {
    constructor (private transactionRepo: TransactionRepository) {
        this.transactionRepo = transactionRepo;
    }

    /**
     * Gets all transactions in database
     * Admin role required.
     */
    async getAllTransactions(): Promise<Transaction[]> {
        try {
            let transactions = await this.transactionRepo.getAll();

            if (transactions.length === 0) {
                throw new ResourceNotFoundError();
            }

            return transactions;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Used to get a specific transaction of id given
     * @param id {number} id of transaction
     */
    async getTransactionById(id: number): Promise<Transaction> {
        try {
            if (!isValidId(id)) {
                throw new BadRequestError();
            }

            let transaction = await this.transactionRepo.getById(id);

            if (isEmptyObject(transaction)) {
                throw new ResourceNotFoundError();
            }

            return transaction;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Used to create a new transaction 
     * Will update account balance after transaction is "approved"
     * @param newTransaction {Transaction} new transaction
     */
    async addNewTransaction(newTransaction: Transaction): Promise<Transaction> {

        if (!isValidObject(newTransaction)) {
            throw new BadRequestError();
        }

        let accountExists = await this.checkAccountExists(newTransaction.accountId);

        if (!accountExists) {
            throw new ResourcePersistenceError('No account exists with provided accountId.');
        }

        let accountBalance = await this.checkAccountBalance(newTransaction.accountId);

        let balanceAfterTransaction = accountBalance + newTransaction.amount;

        if (balanceAfterTransaction < 0) {
            throw new InsuficentFundsError();
        }

        const persistedTransaction = await this.transactionRepo.save(newTransaction);

        return persistedTransaction;
    }

    // /**
    // /* NOT IMPLEMENTED
    //  * Will search transaction table for given queryObj you send as param
    //  * @param queryObj {any}
    //  */
    // async getTransactionByUniqueKey(queryObj: any): Promise<Transaction> { 

    //     try {

    //         let queryKeys = Object.keys(queryObj);

    //         if(!queryKeys.every(key => isPropertyOf(key, Transaction))) {
    //             throw new BadRequestError();
    //         }

    //         // only supports single param searches (for now)
    //         let key = queryKeys[0];
    //         let val = queryObj[key];

    //         // if they are searching for an transaction by id, reuse the logic we already have
    //         if (key === 'id') {
    //             return await this.getTransactionById(+val);
    //         }

    //         // if(!isValidStrings(val)) {
    //         //     throw new BadRequestError();
    //         // }
            

    //         // have to change wording to work with db
    //         if (key === 'accountId') {
    //             key = 'account_id';
    //         }

    //         let transaction = await this.transactionRepo.getTransactionByUniqueKey(key, val);
           
    //         if (isEmptyObject(transaction)) {
    //             throw new ResourceNotFoundError();
    //         }
    //         return transaction;

    //     } catch (e) {
    //         throw e;
    //     }
    // }
    
    /**
     * Checks to see if the account actually exists in the database.
     * @param accountId {number} account id
     */
    async checkAccountExists(accountId: number): Promise<boolean> {
        let result = await this.transactionRepo.checkAccountExists(accountId);
        if (isEmptyObject(result)) {
            console.log(`No account found with id ${accountId}. Try again.`);
            return false;
        } else {
            console.log(`Account exists with id ${accountId}. Proceed.`);
            return true;
        }
    }

    /**
     * Gets the current balance of account
     * @param accountId {nubmer} account id
     */
    async checkAccountBalance(accountId: number): Promise<number> {
        try {
            let balance = await this.transactionRepo.getAccountBalance(accountId);
            return balance;
        } catch (e) {
            console.log(`Something went wrong...`);
            throw e;
        }

    }
}