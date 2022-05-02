import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleLoadMorePosts = async (): Promise<void> => {
    if (!nextPage) return;

    const buffer = await fetch(nextPage);
    const response: PostPagination = await buffer.json();

    setPosts(oldPosts => [...oldPosts, ...response.results]);
    setNextPage(response.next_page);
  };

  return (
    <>
      <Head>
        <title>SpaceTraveling | Posts Explorer</title>
      </Head>
      <Header />

      <main className={styles.container}>
        <section className={styles.postsList}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post} key={post.uid}>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div id="info" className={commonStyles.infoContainer}>
                  <span>
                    <FiCalendar />
                    <p>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                  </span>
                  <span>
                    <FiUser />
                    <p>{post.data.author}</p>
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </section>

        {nextPage && (
          <div className={styles.loadMorePosts}>
            <button type="button" onClick={handleLoadMorePosts}>
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
  });

  const posts = postsResponse.results.map<Post>(({ data, ...post }) => ({
    uid: post.uid,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      author: data.author,
    },
    first_publication_date: post.first_publication_date,
  }));

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  console.log(postsPagination);

  return {
    props: { postsPagination },
    revalidate: 10 * 60, // 10 minutes
  };
};
