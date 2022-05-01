import { useEffect, useState } from 'react';
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useRouter } from 'next/router';
import { Header } from '../../components/Header';
import { getPrismicClient, PrismicPredicates } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const [readTimeInMinutes, setReadTimeInMinutes] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const wordsSize = post.data.content.reduce((acc, curr) => {
      const wordsNumberByContent = curr.body.reduce(
        (totalWordsLength, currentBody) => {
          const wordsLength: number = currentBody.text?.split(' ').length;

          return totalWordsLength + (wordsLength || 0);
        },
        0
      );

      return acc + wordsNumberByContent;
    }, 0);

    setReadTimeInMinutes(Math.ceil(wordsSize / 200));
  }, []);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>SpaceTraveling | {post.data.title}</title>
      </Head>
      <Header />

      <div className={styles.container}>
        <img
          className={styles.banner}
          src={post.data.banner.url}
          alt="Banner"
        />

        <main className={styles.blog}>
          <h1>{post.data.title}</h1>

          <div className={commonStyles.infoContainer}>
            <span>
              <FiCalendar />
              <p>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </p>
            </span>
            <span>
              <FiUser />
              <p>{post.data.author}</p>
            </span>
            <span>
              <FiClock />
              <p>{readTimeInMinutes} min</p>
            </span>
          </div>

          <div>
            {post.data.content.map(content => (
              <div className={styles.content} key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [PrismicPredicates.at('document.type', 'post')],
    {
      fetch: ['post.uid'],
      pageSize: 50,
    }
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const post = await prismic.getByUID('post', String(slug), {});

  return {
    props: { post },
    revalidate: 60 * 30,
  };
};
