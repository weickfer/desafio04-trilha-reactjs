import { FiCalendar, FiUser } from 'react-icons/fi';
import styles from './styles.module.scss';

export function Post(): JSX.Element {
  return (
    <a className={styles.container}>
      <h1>Como utilizar hooks</h1>
      <p>Pensando em sincronização em vez de ciclos de vida.</p>

      <div id="info">
        <span>
          <FiCalendar />
          <p>21 April 2022</p>
        </span>
        <span>
          <FiUser />
          <p>Weickmam Ferreira</p>
        </span>
      </div>
    </a>
  );
}
