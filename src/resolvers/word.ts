import { Length } from 'class-validator';
import { Resolver, Query, InputType, Field, Arg, ObjectType } from 'type-graphql';
import { getConnection } from 'typeorm';
import { Word } from '../entities/Word';

const LOOKUP_QUERY = `
  with words_in_request_language as (
    select *
    from word
    where language_id = (
        select id from language
        where code = $1 -- 1: from language
    )
  ), words_matching_search as (
    select *
    from words_in_request_language
    where text like $3 || '%' -- 3: search string
  ), words_with_translation_ids as (
    select words.*, translations.*
    from words_matching_search as words
    inner join word_translates_to_word as translations
    on (words.id in (translations.word1_id, translations.word2_id))
  ), words_with_translations as (
    select distinct on (translated.id) words.language_id as language_id,
                                      words.text as word,
                                      translated.language_id as translation_language_id,
                                      translated.text as translation
    from words_with_translation_ids words
    inner join word as translated
    on (translated.id in (words.word1_id, words.word2_id)
        and words.language_id != translated.language_id
        and translated.language_id = (select id from language where code = $2)) -- 2: target language
  ), results_with_languages as (
    select words.word,
          (select code
          from language
          where id = words.language_id) as language,
          words.translation,
          (select code
          from language
          where id = words.translation_language_id) as translation_language
    from words_with_translations words
  ), results_by_relevance as (
    select results.*,
          (similarity(results.word, $3)) as relevance -- 3: search string
    from results_with_languages results
    order by relevance desc
  )
  select * from results_by_relevance
  limit $4 -- 4: max results
`;

interface TranslationResultRow {
  word: string;
  language: string;
  translation: string;
  translation_language: string;
}

async function lookupTranslations(
  fromLanguage: string,
  toLanguage: string,
  searchString: string,
  maxResults = 20
): Promise<TranslationResultRow[]> {
  const params = [fromLanguage, toLanguage, searchString, maxResults];
  return getConnection().query(LOOKUP_QUERY, params);
}

function makeLookupResult(result: TranslationResultRow): LookupResult {
  const word = new Word();
  Object.assign(word, {
    id: 'id',
    text: result.word,
    languageId: '1',
    language: {
      id: 'id',
      code: result.language,
    },
  });

  const translatedWord = new Word();
  Object.assign(translatedWord, {
    id: 'id',
    text: result.translation,
    languageId: '1',
    language: {
      id: 'id',
      code: result.translation_language,
    },
  });

  return { word, translatedWord };
}

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

  @Field({ nullable: true })
  maxResults?: number;
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
    const { fromLanguage, toLanguage, searchString, maxResults } = lookupInput;

    const results = await lookupTranslations(fromLanguage, toLanguage, searchString, maxResults);

    return results.map(makeLookupResult);
  }
}
