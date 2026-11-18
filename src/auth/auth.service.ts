import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { Repository } from 'typeorm';
import { LocalUser } from '../food-listing/entities/local-user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { DevRegisterDto } from './dto/dev-register.dto.js';
const scrypt = promisify(scryptCallback);
@Injectable()
export class AuthService {
  constructor(@InjectRepository(LocalUser) private readonly users: Repository<LocalUser>, private readonly jwt: JwtService, private readonly config: ConfigService) {}
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }
  private async validPassword(password: string, stored: string): Promise<boolean> {
    if (!stored.startsWith('scrypt$')) { const a=Buffer.from(password), b=Buffer.from(stored); return a.length===b.length && timingSafeEqual(a,b); }
    const [,salt,expectedHex]=stored.split('$'); if(!salt||!expectedHex)return false;
    const actual=(await scrypt(password,salt,64)) as Buffer, expected=Buffer.from(expectedHex,'hex');
    return actual.length===expected.length && timingSafeEqual(actual,expected);
  }
  async register(dto: RegisterDto) {
    const email=dto.email.trim().toLowerCase();
    if(await this.users.findOne({where:{email}})) throw new ConflictException('Email is already registered');
    const user=this.users.create({id:randomBytes(5).toString('hex').toUpperCase(),name:dto.name.trim(),email,password:await this.hashPassword(dto.password),role:(dto.role??'RECEIVER').toUpperCase(),isVerified:false,age:null,address:null,isBangladeshi:true,gender:null});
    try { await this.users.save(user); } catch(error) { if((error as {driverError?:{code?:string}})?.driverError?.code==='23505') throw new ConflictException('Email is already registered'); throw error; }
    return this.issueToken(user);
  }
  async registerDev(dto: DevRegisterDto) {
    if(this.config.get('NODE_ENV')==='production') throw new UnauthorizedException('Development account creation is disabled');
    const email=dto.email.trim().toLowerCase();
    if(await this.users.findOne({where:{email}})) throw new ConflictException('Email is already registered');
    const user=this.users.create({id:randomBytes(5).toString('hex').toUpperCase(),name:dto.name.trim(),email,password:await this.hashPassword(dto.password),role:dto.role.toUpperCase(),isVerified:true,age:null,address:null,isBangladeshi:true,gender:null});
    try { await this.users.save(user); } catch(error) { if((error as {driverError?:{code?:string}})?.driverError?.code==='23505') throw new ConflictException('Email is already registered'); throw error; }
    return this.issueToken(user);
  }
  async login(dto: LoginDto) {
    const user=await this.users.createQueryBuilder('user').addSelect('user.password').where('LOWER(user.email)=LOWER(:email)',{email:dto.email.trim()}).getOne();
    if(!user?.password || !(await this.validPassword(dto.password,user.password))) throw new UnauthorizedException('Invalid email or password');
    if(!user.password.startsWith('scrypt$')) { user.password=await this.hashPassword(dto.password); await this.users.save(user); }
    return this.issueToken(user);
  }
  private async issueToken(user: LocalUser) {
    const role=user.role.toUpperCase();
    return {access_token:await this.jwt.signAsync({sub:user.id,id:user.id,role}),token_type:'Bearer',user:{id:user.id,name:user.name,email:user.email,role,isVerified:user.isVerified}};
  }
}
