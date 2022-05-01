import Link from 'next/link';
import styles from './styles.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <Link href="/">
        <a className={styles.content}>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
