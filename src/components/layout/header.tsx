import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="https://res.cloudinary.com/ddamgg8us/image/upload/v1740517648/Logo_Repost_xtlhqi.png"
            alt="Reepost"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold">Reepost</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/features" className="text-sm font-medium text-gray-700 hover:text-primary">
            Fonctionnalités
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-primary">
            Comment ça marche ?
          </Link>
          <Link to="/reviews" className="text-sm font-medium text-gray-700 hover:text-primary">
            Avis
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-primary">
            Prix
          </Link>
          <Link to="/blog" className="text-sm font-medium text-gray-700 hover:text-primary">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary">
            Connexion
          </Link>
          <Link to="/signup">
            <Button className="bg-black text-white hover:bg-black/90">
              Publier partout gratuitement
            </Button>
          </Link>
          <button className="flex items-center gap-2 text-sm font-medium">
            <img
              src="https://flagcdn.com/w20/fr.png"
              alt="French flag"
              className="w-5"
            />
            FR
          </button>
        </div>
      </div>
    </header>
  );
}