// SHARED. Values are lowercase because users.role in the database is lowercase ('donor', ...).
export enum Role {
  ADMIN = 'admin',
  DONOR = 'donor',
  RECEIVER = 'receiver',
  VOLUNTEER = 'volunteer',
}

/** Shape of request.user after JwtStrategy.validate() */
export interface AuthUser {
  id: string; // users.id is a string such as 'DONOR001'
  role: Role;
}
