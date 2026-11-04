import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookMarked, BookOpen, ExternalLink, Home, Newspaper } from 'lucide-react';

const LINKS = [
  { key: 'home', href: '/#top', icon: Home },
  { key: 'newsUpdates', href: '/#achievements', icon: Newspaper },
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
  { key: 'readBible', href: 'https://bibiliya.com/', external: true, button: 'filled', icon: true },
  { key: 'visitUnion', href: 'https://www.rumadventist.org/', sameTab: true, button: 'filled', icon: true },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToAchievements() {
  const el = document.getElementById('achievements');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const BUTTON_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  sabbathSchool: BookOpen,
  visitUnion: ExternalLink,
  readBible: BookMarked,
};

export default function NavLinks() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleScroll = (e: React.MouseEvent, scrollFn: () => void) => {
    if (pathname === '/') {
      e.preventDefault();
      scrollFn();
    } else {
      e.preventDefault();
      navigate('/');
      setTimeout(scrollFn, 150);
    }
  };

  return (
    <ul className="hidden md:flex items-center gap-4 lg:gap-5 xl:gap-7">
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <li key={link.key}>
            <a
              href={link.href}
              onClick={(e) =>
                handleScroll(e, link.key === 'home' ? scrollToTop : scrollToAchievements)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-semibold text-[#0D47A1] bg-white border border-[#0D47A1] rounded-lg hover:bg-[#0D47A1] hover:text-white transition-all duration-200 cursor-pointer"
            >
              {Icon && <Icon size={12} />}
              {t('nav.' + link.key)}
            </a>
          </li>
        );
      })}
      {BUTTON_LINKS.map((link) => {
        const BtnIcon = BUTTON_ICONS[link.key];
        return (
          <li key={link.key}>
            {link.button === 'outlined' ? (
              <a
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-semibold text-[#0D47A1] bg-white border border-[#0D47A1] rounded-lg hover:bg-[#0D47A1] hover:text-white transition-all duration-200"
              >
                {BtnIcon && <BtnIcon size={12} />}
                {t('nav.' + link.key)}
              </a>
            ) : (
              <a
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-semibold text-white bg-[#0D47A1] rounded-lg shadow-sm hover:bg-[#0B2E78] transition-all duration-200"
              >
                {BtnIcon && <BtnIcon size={12} />}
                {t('nav.' + link.key)}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
