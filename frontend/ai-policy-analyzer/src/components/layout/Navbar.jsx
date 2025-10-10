import { Link, useNavigate } from 'react-router-dom';
import { FileText, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('authToken');
    navigate('/auth');
  };

  return (
    <nav className="h-16 border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-elegant">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Policy Analyzer
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;