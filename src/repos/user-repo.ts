import { User } from '../models/user';
import { CrudRepository } from './crud-repo';
import { InternalServerError } from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapUserResultSet } from '../util/result-set-mapper';

export class UserRepository implements CrudRepository<User> {

    baseQuery = `
    select
        u.id,
        u.username,
        u.password,
        u.first_name,
        u.last_name,
        ur.name as role_id
    from users u
    join user_roles ur
    on u.role_id = ur.id
    `;
    
    async getAll(): Promise<User[]> {

            let client: PoolClient;
            try { 
                client = await connectionPool.connect();
                let sql = `${this.baseQuery} order by u.id`;
                let rs = await client.query(sql);
                return rs.rows;
            } catch (e) {
                throw new InternalServerError();
            } finally {
                client && client.release();
            }
           
        };

    async getById(id: number): Promise<User> {
        
        let client: PoolClient;
        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where u.id = $1`;
            let rs = await client.query(sql, [id]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

    async getbyCredentials(un: string, pw: string) {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where u.username = $1 and u.password = $2`
            let rs = await client.query(sql, [un, pw]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    async save(newUser: User): Promise<User> {
        //WIP!
        let client: PoolClient;
        
            try { 
                client = await connectionPool.connect();
                let roleId = (await client.query('select id from user_roles where name = $1', [newUser.role])).rows[0].id;
                let sql = `
                insert into users (username, password, first_name, last_name, role_id) values
                ($1, $2, $3, $4, 3)
                `;
                console.log('made it 2')
                let rs = await client.query(sql, [newUser.username, newUser.password, newUser.firstname, newUser.lastname, roleId]);
                console.log('made it here 3')
                newUser.id = rs.rows[0].id;
                console.log('here we are!')
                return newUser;

            } catch (e) {
                console.log('this happened.');
                throw new InternalServerError();
            } finally {
                client && client.release();
            }

    }

    async update(updatedUser: User): Promise<boolean> {
        //WIP!
        let client: PoolClient;
            try { 
                client = await connectionPool.connect();
                let sql = `${this.baseQuery}`;
                let rs = await client.query(sql);
                return true;
            } catch (e) {
                throw new InternalServerError();
            } finally {
                client && client.release();
            }

    }

    async checkUsername(username: string): Promise<boolean> {
        
        let client: PoolClient;
        try {
            client = await connectionPool.connect();
            let sql = `select * from users u where username = '${username}'`;
            let rs = await client.query(sql);
            if (!rs.rows[0]) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            throw e;
        } finally {
            client && client.release();
        }
    }
}
