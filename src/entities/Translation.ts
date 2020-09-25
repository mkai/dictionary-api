import { Entity, Column, PrimaryGeneratedColumn, Unique, Index, BaseEntity } from 'typeorm';

@Entity({ name: 'word_translates_to_word' })
@Unique(['word1Id', 'word2Id'])
export class Translation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid', { name: 'word1_id' })
  word1Id: string;

  @Index()
  @Column('uuid', { name: 'word2_id' })
  word2Id: string;
}
