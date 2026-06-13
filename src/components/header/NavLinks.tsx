import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { BookOpen, ExternalLink } from 'lucide-react';

const LINKS = [
  { key: 'home', href: ROUTES.HOME },
  { key: 'newsUpdates', href: ROUTES.ACHIEVEMENTS },
];

interface NavLink {
  key: string;
  href: string;
  external?: boolean;
  sameTab?: boolean;
  button?: 'outlined' | 'filled';
  icon?: boolean;
}

const BUTTON_LINKS: NavLink[] = [
  { key: 'sabbathSchool', href: 'https://sabbath-school.adventech.io/kin', external: true, button: 'outlined', icon: true },
  { key: 'visitUnion', href: 'https://www.rumadventist.org/', sameTab: true, button: 'filled', icon: true },
];

export default function NavLinks() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <ul className="hidden md:flex items-center gap-6 xl:gap-8">
      {LINKS.map((link) => (
        <li key={link.key}>
          <Link
            to={link.href}
              className={cn(
              'text-[15px] font-medium transition-colors',
              pathname === link.href
                ? 'text-[#0D47A1] dark:text-sda-gold'
                : 'text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold'
            )}
          >
            {t('nav.' + link.key)}
          </Link>
        </li>
      ))}
      {BUTTON_LINKS.map((link) => (
        <li key={link.key}>
          {link.button === 'outlined' ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-[15px] font-semibold text-[#0D47A1] bg-white border-2 border-[#0D47A1] rounded-lg hover:bg-[#0D47A1] hover:text-white transition-all duration-200"
            >
              {link.icon && <BookOpen size={16} />}
              {t('nav.' + link.key)}
            </a>
          ) : (
            <a
              href={link.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[15px] font-semibold text-white bg-[#0D47A1] rounded-lg shadow-sm hover:bg-[#0B2E78] transition-all duration-200"
            >
              {link.icon && <ExternalLink size={16} />}
              {t('nav.' + link.key)}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
