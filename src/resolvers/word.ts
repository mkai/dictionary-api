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
class LookupResult {
  @Field()
  word: Word;

  @Field()
  translatedWord: Word;
}

@Resolver(Word)
export class WordResolver {
  @Query(() => [LookupResult])
  async lookup(@Arg('input') lookupInput: LookupInput): Promise<LookupResult[]> {
    const { fromLanguage, toLanguage, searchString } = lookupInput;
    console.log(fromLanguage, toLanguage, searchString);

    const word = new Word();
    Object.assign(word, {
      id: 'id',
      text: 'cabinet',
      languageId: '1',
      language: {
        id: 'id',
        code: 'eng',
      },
    });

    const translatedWord = new Word();
    Object.assign(translatedWord, {
      id: 'id',
      text: 'Schrank',
      languageId: '2',
      language: {
        id: 'id',
        code: 'deu',
      },
    });

    return [{ word, translatedWord }];
  }
}
