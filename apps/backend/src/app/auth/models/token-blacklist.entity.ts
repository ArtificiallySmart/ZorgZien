import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { add } from 'date-fns';

@Entity()
export class TokenBlacklistEntity {
  @PrimaryColumn()
  token: string;

  @Column()
  expires: Date;

  @BeforeInsert()
  setExpires() {
    this.expires = add(new Date(Date.now()), {
      days: +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_DAYS,
    });
  }
}
