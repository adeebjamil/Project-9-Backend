import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(req: any, createUserDto: any): Promise<any>;
    findAll(req: any): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        balance: any;
        kyc_status: any;
        is_suspended: any;
        created_at: any;
    }[]>;
    findOne(req: any, id: string): Promise<any>;
    update(req: any, id: string, updateDto: any): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        balance: any;
        kyc_status: any;
        created_at: any;
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    suspend(req: any, id: string, body: {
        suspended: boolean;
    }): Promise<{
        id: any;
        username: any;
        is_suspended: any;
    }>;
}
