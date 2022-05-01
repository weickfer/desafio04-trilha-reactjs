import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export const PrismicPredicates = Prismic.Predicates;

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
  });

  return prismic;
}
