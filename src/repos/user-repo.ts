import data from '../data/user-db';
import { User } from '../models/user';
import { CrudRepository } from './crud-repo';
import Validator from '../util/validator';
import {
    WipError,
    ResourceNotFoundError,
    BadRequestError
} from '../errors/errors';

export class UserRepository implements CrudRepository<User> {

    private static instance: UserRepository;

    private constructor() {};

    static getInstance() {
        return !UserRepository.instance ? UserRepository.instance = new UserRepository() : UserRepository.instance;
    }
    
    getAll(): Promise<User[]> {
        return new Promise((resolve, reject) => {

            setTimeout( () => {
                let users = [];

                for(let user of data){
                    users.push({...user});
                }
                if(users.length === 0){
                    reject(new ResourceNotFoundError('No users found'));
                }
    
                resolve(users.map(this.removePassword));
            }, 1000);
           
        });
    }

    getById(id: number): Promise<User> {
        return new Promise((resolve, reject) => {
            
            if (!Validator.isValidId(id)) {
                reject(new BadRequestError());
            }

            setTimeout(() => {
                const user = {...data.find(user => user.id === id)};

                if (Object.keys(user).length === 0){
                    reject(new ResourceNotFoundError('ID does not exist'));
                    return;
                }

                resolve(this.removePassword(user));

            }, 1000);
        });

    }

    save(newUser: User): Promise<User> {
        return new Promise((resolve, reject) => {
            reject(new WipError());
        })

    }

    update(updatedUser: User): Promise<boolean> {
        return new Promise((resolve, reject) => {
            reject(new WipError());
        })

    }
    
    private removePassword(user: User): User {
        let u = {...user};
        delete u.password;
        return u;
    }
}