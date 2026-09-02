import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import getSiteMetadata from '@core/hooks/useSiteMetadata';
import { useTheme, Theme } from '../../hooks/useTheme';
import styles from './style.module.css';

const Header = () => {
  const { logo, navLinks } = getSiteMetadata();
  const { theme, setTheme } = useTheme();

  const icons: Record<Theme, ReactElement> = {
    dark: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 22 23"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.7519 15.0137C20.597 15.4956 19.3296 15.7617 18 15.7617C12.6152 15.7617 8.25 11.3965 8.25 6.01171C8.25 4.68211 8.51614 3.41468 8.99806 2.25977C5.47566 3.72957 3 7.20653 3 11.2617C3 16.6465 7.36522 21.0117 12.75 21.0117C16.8052 21.0117 20.2821 18.536 21.7519 15.0137Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    light: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3.00464V5.25464M18.364 5.64068L16.773 7.23167M21 12.0046H18.75M18.364 18.3686L16.773 16.7776M12 18.7546V21.0046M7.22703 16.7776L5.63604 18.3686M5.25 12.0046H3M7.22703 7.23167L5.63604 5.64068M15.75 12.0046C15.75 14.0757 14.0711 15.7546 12 15.7546C9.92893 15.7546 8.25 14.0757 8.25 12.0046C8.25 9.93357 9.92893 8.25464 12 8.25464C14.0711 8.25464 15.75 9.93357 15.75 12.0046Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

  const handleToggle = () => {
    setTheme(nextTheme);
  };

  return (
    <>
      <nav className="mx-auto flex w-full items-center justify-between px-4 pt-6 sm:px-6 sm:pt-10 lg:px-16">
        <div>
          <Link to="/" className="shrink-0">
            <picture>
              <img
                className="h-10 w-10 rounded-full shadow-sm transition-transform hover:scale-105 sm:h-12 sm:w-12 md:h-16 md:w-16"
                alt="logo"
                src={logo}
              />
            </picture>
          </Link>
        </div>
        <div className="flex items-center gap-2 text-[var(--color-brand)] sm:gap-3">
          <div className="flex h-10 items-center gap-1 rounded-full border border-[var(--color-hr)] bg-[var(--color-background)] px-3.5 shadow-sm backdrop-blur-md">
            {navLinks.map((n) =>
              n.url.startsWith('http') ? (
                <a
                  key={n.url}
                  href={n.url}
                  className="rounded-full px-2.5 py-1 text-sm font-semibold text-[var(--color-brand)] transition-all hover:bg-white/20 dark:hover:bg-white/10"
                >
                  {n.name}
                </a>
              ) : (
                <Link
                  key={n.url}
                  to={n.url}
                  className="rounded-full px-2.5 py-1 text-sm font-semibold text-[var(--color-brand)] transition-all hover:bg-white/20 dark:hover:bg-white/10"
                >
                  {n.name}
                </Link>
              )
            )}
          </div>
          <button
            type="button"
            onClick={handleToggle}
            className={`${styles.themeButton} ${styles.themeButtonActive} text-[var(--color-brand)]`}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
          >
            <div className={styles.iconWrapper}>{icons[theme]}</div>
          </button>
        </div>
      </nav>
    </>
  );
};
export default Header;
