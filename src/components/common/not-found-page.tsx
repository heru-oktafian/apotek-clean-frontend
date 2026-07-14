import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

/**
 * NotFoundPage — shown when a route doesn't exist.
 * Matches the app's green pharmacy aesthetic.
 */
export function NotFoundPage() {
  return (
    <div className="not-found-page">
      {/* Background decoration */}
      <div className="not-found-page__bg">
        <div className="not-found-page__bg-circle not-found-page__bg-circle--1" />
        <div className="not-found-page__bg-circle not-found-page__bg-circle--2" />
      </div>

      {/* Content */}
      <div className="not-found-page__content">
        {/* 404 badge */}
        <div className="not-found-page__badge">
          <Search size={20} />
        </div>

        {/* Heading */}
        <h1 className="not-found-page__code">404</h1>
        <h2 className="not-found-page__title">Halaman Tidak Ditemukan</h2>
        <p className="not-found-page__desc">
          Maaf, halaman yang kamu cari tidak tersedia atau mungkin telah dipindahkan.
          Pastikan URL yang kamu masukkan sudah benar.
        </p>

        {/* Actions */}
        <div className="not-found-page__actions">
          <button
            type="button"
            className="not-found-page__btn not-found-page__btn--primary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <Link
            to="/dashboard"
            className="not-found-page__btn not-found-page__btn--secondary"
          >
            <Home size={16} />
            Ke Dashboard
          </Link>
        </div>

        {/* Divider */}
        <div className="not-found-page__divider" />

        {/* Path info */}
        <p className="not-found-page__path">
          Tidak menemukan yang kamu cari?{' '}
          <span className="not-found-page__contact">
            Hubungi administrator sistem.
          </span>
        </p>
      </div>
    </div>
  );
}
