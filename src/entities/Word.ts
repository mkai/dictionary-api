import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Unique,
  ManyToOne,
  Index,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import { Language } from './Language';

@ObjectType()
@Entity()
@Unique(['languageId', 'text'])
export class Word extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index()
  @Column('text')
  text: string;

  @Column('uuid', { name: 'language_id' })
  languageId: string;

  @Field()
  @ManyToOne(() => Language)
  language: Language;
}
