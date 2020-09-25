import { Like } from 'typeorm';
import { Length } from 'class-validator';
import { Resolver, Query, InputType, Field, Arg, ObjectType } from 'type-graphql';
import { Word } from '../entities/Word';

@InputType()
class LookupInput {
  @Field()
  @Length(2, 100)
  searchString: string;

  @Field()
  @Length(3)
  fromLanguage: string;

  @Field()
  @Length(3)
  toLanguage: string;
}

@ObjectType()
class LookupResponse {
  @Field()
  query: string;

  @Field(() => [Word])
  results: Word[];
}

@Resolver(Word)
export class WordResolver {
  @Query(() => LookupResponse)
  async lookup(@Arg('input') lookupInput: LookupInput): Promise<LookupResponse> {
    const { inputLanguage, query } = lookupInput;
    const results = await Word.find({
      [inputLanguage]: Like(`${query}%`),
    });

    return { query, results };
  }
}
